import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize GoogleGenAI
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // Supabase Admin Client
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // API Route: Delete User (Admin Only)
  app.delete("/api/admin/users/:userId", async (req, res) => {
    const { userId } = req.params;
    
    try {
      if (!supabaseServiceKey || supabaseServiceKey === "YOUR_SUPABASE_SERVICE_ROLE_KEY") {
        return res.status(500).json({ error: "La SUPABASE_SERVICE_ROLE_KEY no está configurada en las variables de entorno de AI Studio." });
      }

      console.log(`[Admin API] Intentando eliminar usuario: ${userId}`);

      // 1. Borrar de Auth (esto debería disparar el borrado en cascada si está configurado)
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error("[Admin API] Error al borrar de Auth:", authError);
        // Si el error es que el usuario no existe en Auth, intentamos borrar el perfil de todos modos
        if (authError.status !== 404) {
          return res.status(400).json({ error: authError.message });
        }
      }

      // 2. Borrar explícitamente de la tabla pública 'users' por si acaso
      const { error: dbError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);

      if (dbError) {
        console.warn("[Admin API] Error en tabla pública:", dbError);
      }

      res.json({ message: "Usuario eliminado correctamente." });
    } catch (err: any) {
      console.error("[Admin API] Error crítico:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Reset Password Directly (Using Master Key Verification)
  app.post("/api/auth/reset-password", async (req, res) => {
    const { username, newPassword, masterKey } = req.body;
    
    try {
      if (!username || !newPassword || !masterKey) {
        return res.status(400).json({ error: "Faltan datos obligatorios (usuario, contraseña y llave)." });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
      }

      if (!supabaseServiceKey || supabaseServiceKey === "YOUR_SUPABASE_SERVICE_ROLE_KEY" || !supabaseUrl) {
        return res.status(500).json({ error: "Las variables de entorno de Supabase no están correctamente configuradas en el servidor." });
      }

      // 1. Get the actual Master Key from the DB stored on 'admin' user profile
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('users')
        .select('pack_currencies')
        .ilike('username', 'admin')
        .maybeSingle();

      const dbMasterKey = (adminData?.pack_currencies as any)?.masterTeacherKey || "DOCENTE-2026";

      // 2. Verify the masterKey matches (case insensitive + trimmed)
      const suppliedKey = masterKey.trim().toUpperCase();
      const actualKey = dbMasterKey.trim().toUpperCase();

      if (suppliedKey !== actualKey) {
        return res.status(403).json({ error: "Llave de Verificación incorrecta. Solicítala a un Maestro o Administrador." });
      }

      // 3. Find the user id for the supplied username
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, role')
        .ilike('username', username)
        .maybeSingle();

      if (userError || !userData) {
        return res.status(404).json({ error: "El usuario ingresado no existe en el sistema." });
      }

      const userId = userData.id;

      // 4. Update password via Supabase Auth Admin interface
      const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (resetError) {
        console.error("[Reset API] Error actualizando contraseña en Auth:", resetError);
        return res.status(400).json({ error: resetError.message });
      }

      console.log(`[Reset API] Contraseña actualizada exitosamente para el usuario: ${username}`);
      res.json({ success: true, message: "Contraseña actualizada correctamente de forma directa." });
    } catch (err: any) {
      console.error("[Reset API] Error crítico:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route: Create User (Admin Only)
  app.post("/api/admin/users", async (req, res) => {
    const { email, password, username, role, grade, assignedGroups } = req.body;
    
    try {
      if (!supabaseServiceKey || supabaseServiceKey === "YOUR_SUPABASE_SERVICE_ROLE_KEY") {
        return res.status(500).json({ error: "La SUPABASE_SERVICE_ROLE_KEY no está configurada." });
      }

      // 1. Crear en Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username, role }
      });

      if (authError) throw authError;

      // 2. Crear perfil en tabla 'users'
      const { error: dbError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          username,
          role,
          grade: grade || '1',
          assigned_groups: assignedGroups || [],
          tokens: 0,
          streak: 0
        });

      if (dbError) {
        // Si falla la DB, intentamos limpiar el usuario de Auth creado
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw dbError;
      }

      res.status(201).json({ user: authData.user });
    } catch (err: any) {
      console.error("[Admin API] Error creando usuario:", err);
      res.status(400).json({ error: err.message });
    }
  });

  // API Route: Generate Challenge with AI using Gemini
  app.post("/api/challenges/generate-ai", async (req, res) => {
    const { subjectId, topicName, idea } = req.body;

    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "La variable GEMINI_API_KEY no está configurada en los Secretos del servidor." });
      }

      if (!subjectId || !topicName) {
        return res.status(400).json({ error: "La materia (subjectId) y el tema son requeridos." });
      }

      console.log(`[Gemini API] Generando desafío para materia: ${subjectId}, tema: ${topicName}`);

      const isEnglishSubject = subjectId.toLowerCase().startsWith("ing_");
      const englishRule = isEnglishSubject
        ? `\n\nIMPORTANTE: ESTA MATERIA ES DE INGLÉS. Por lo tanto, el título, la descripción ('description') y las instrucciones detalladas del protocolo ('instructions') DEBEN estar escritas en español (es decir, la explicación de qué hacer y cómo subir la evidencia va en español). Únicamente el desafío en sí (la pregunta a resolver, el vocabulario examinado o el texto lúdico a traducir) debe estar redactado en inglés. Esto asegura que el alumno entienda perfectamente las indicaciones en español pero sea evaluado en inglés.`
        : "";

      const prompt = `Como diseñador instruccional de la plataforma escolar de cartas coleccionables "Card Academy", genera un desafío pedagógico único de nivel secundaria (grado de 1ero a 3ero de secundaria), dinámico y didáctico para los estudiantes.

Materia (ID): "${subjectId}"
Tema/Contenido principal: "${topicName}"
Idea del profesor / Contexto especial a incluir: "${idea || "Ninguna idea en particular, crea algo de alto impacto educativo"}"

Instrucciones para generar el desafío:
1. El desafío debe ser creativo, retador y enfocado en que los alumnos ejerciten su pensamiento crítico, apliquen conceptos en el mundo real, o justifiquen su respuesta.
2. Integra referencias lúdicas si encaja (por ejemplo, el folclor o memes locales sanos de "La Jacobo", "Culiacán", "6-7", "el perro culichi", "el alucín", etc., para mantener el espíritu alegre de las cartas coleccionables).
3. Determina si es un 'Quiz' (de opción múltiple con 4 opciones rápidas y 1 correcta) o un 'Exercise' (un ejercicio práctico o de redacción que requiere enviar evidencia).
4. Elige un título emocionante para el desafío y una descripción cautivante.
5. El valor de reward.tokens (monedas/medallas) sugeridos para el desafío: Easy=25, Medium=50, Hard=150.${englishRule}`;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres un redactor e instructor pedagógico especializado en gamificación escolar de secundaria mexicana de 12 a 15 años.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "El título creativo del desafío, motivador e integrado con la cultura escolar." },
              description: { type: Type.STRING, description: "Una breve descripción de 1-2 oraciones que invite al alumno a completarlo de forma divertida." },
              instructions: { type: Type.STRING, description: "Instrucciones paso a paso detalladas de lo que el alumno debe hacer, analizar, resolver o redactar como evidencia." },
              difficulty: { type: Type.STRING, description: "La dificultad calculada basada en el contenido del tema: 'Easy', 'Medium' o 'Hard'." },
              type: { type: Type.STRING, description: "'Quiz' si es de opción múltiple con 4 opciones rápidas, o 'Exercise' si requiere respuesta redactada y evidencia." },
              quizOptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Si es tipo 'Quiz', proporciona exactamente un arreglo de 4 opciones de respuesta donde solo una es correcta. Si es 'Exercise', entrega un arreglo vacío."
              },
              quizAnswer: {
                type: Type.INTEGER,
                description: "Si es 'Quiz', indica el índice de base cero (0, 1, 2, o 3) de la respuesta correcta. Si es 'Exercise', pon -1."
              },
              evidenceRequired: {
                type: Type.BOOLEAN,
                description: "Verdadero (true) si requiere que el alumno redacte o suba una evidencia práctica, falso (false) si es un quiz directo."
              },
              tokensReward: {
                type: Type.INTEGER,
                description: "Medallas/Monedas de recompensa recomendadas para el desafío: Easy=25, Medium=50, Hard=150."
              }
            },
            required: ["title", "description", "instructions", "difficulty", "type", "evidenceRequired", "tokensReward"]
          }
        }
      });

      const jsonText = geminiResponse.text?.trim() || "{}";
      const challengeObj = JSON.parse(jsonText);

      res.json({ success: true, challenge: challengeObj });
    } catch (err: any) {
      console.error("[Gemini API Error] Error al generar desafío:", err);
      res.status(500).json({ error: "No se pudo generar el desafío con IA. Revisa tu conexión de red o la configuración de tu GEMINI_API_KEY." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
