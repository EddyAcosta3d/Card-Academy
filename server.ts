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

  // Local fallbacks when Gemini is down, rate limited or 503-ing
  function getLocalFallbackChallenge(subjectId: string, topicName: string, idea?: string) {
    const isEnglish = subjectId.toLowerCase().includes("ing") || subjectId.toLowerCase().startsWith("ing_");
    
    if (isEnglish) {
      return {
        title: "🚀 El Gran Viaje de las Palabras",
        description: "¡Hola! Vamos a aprender palabras súper fáciles en inglés del tema: " + topicName + ". ¡Tú puedes!",
        instructions: "En tu cuaderno, escribe 3 veces la palabra en inglés que más te guste de este tema. Luego haz un dibujo sencillo de lo que significa. ¡Toma una foto de tu cuaderno y súbela aquí!",
        difficulty: "Easy",
        type: "Exercise",
        quizOptions: [],
        quizAnswer: -1,
        evidenceRequired: true,
        tokensReward: 25
      };
    }

    // General subjects
    const lowerSub = subjectId.toLowerCase();
    if (lowerSub.includes("mat") || lowerSub.includes("calculadora")) {
      return {
        title: "🧮 Desafío de Ventas de la Tiendita",
        description: "Aplica matemáticas sencillas del tema " + topicName + " como si fueras el cajero de la tiendita de tu colonia.",
        instructions: "Imagina que vendes 3 productos que cuestan 10, 15 y 5 pesos mexicanos. Si un cliente te paga con un billete de 50 pesos: ¿Cuánto cambio debes darle? Escribe la operación completa en tu cuaderno paso a paso con letra clara. ¡Sube una foto de tu libreta!",
        difficulty: "Easy",
        type: "Exercise",
        quizOptions: [],
        quizAnswer: -1,
        evidenceRequired: true,
        tokensReward: 25
      };
    }

    if (lowerSub.includes("bio") || lowerSub.includes("actividad")) {
      return {
        title: "🌱 Detective de Plantas y Árboles",
        description: "¡Fácil! Vamos a estudiar la vida de las plantas de tu casa o de tu calle para el tema: " + topicName + ".",
        instructions: "Busca una hoja caída en el suelo de tu patio o de la calle. Obsérvala con mucha atención. Dibuja esa hoja en tu libreta y señala con flechas sus partes con ayuda de tu libro de texto. Sube una foto de tu hermoso dibujo.",
        difficulty: "Easy",
        type: "Exercise",
        quizOptions: [],
        quizAnswer: -1,
        evidenceRequired: true,
        tokensReward: 25
      };
    }

    if (lowerSub.includes("his") || lowerSub.includes("globo")) {
      return {
        title: "⏳ Máquina del Tiempo Familiar",
        description: "Descubre cómo era el mundo hace muchos años según tu familia para el tema: " + topicName + ".",
        instructions: "Pregúntale a un familiar adulto (tu mamá, papá, abuelos o tíos) de qué tamaño eran las monedas o qué compraban con 1 peso cuando eran niños. Escribe en tu libreta en 3 renglones sencillos lo que te contaron. ¡Tómale foto!",
        difficulty: "Easy",
        type: "Exercise",
        quizOptions: [],
        quizAnswer: -1,
        evidenceRequired: true,
        tokensReward: 25
      };
    }

    // Default fallback for any other subject
    return {
      title: `🌟 Desafío Local: ${topicName}`,
      description: "Un desafío muy amigable para repasar lo aprendido sobre: " + topicName + ".",
      instructions: "Escribe con tus propias palabras en tu libreta una sola idea que recuerdes de tu clase sobre " + topicName + ". Usa una letra bonita y grande. ¡Sube una foto de tu libreta con tu respuesta!",
      difficulty: "Easy",
      type: "Exercise",
      quizOptions: [],
      quizAnswer: -1,
      evidenceRequired: true,
      tokensReward: 25
    };
  }

  function getLocalFallbackDaily() {
    const fallbacks = [
      {
        question: "¿Cuántos estados tiene la República Mexicana?",
        options: ["10 estados", "32 estados", "50 estados", "100 estados"],
        answer: 1
      },
      {
        question: "La luna es de color gris pero brilla en la noche por la luz de:",
        options: ["Las estrellas", "El sol", "Los faros de la Tierra", "Las nubes"],
        answer: 1
      },
      {
        question: "¿Cuál es el animal terrestre más rápido de todo el planeta?",
        options: ["El caballo blanco", "El guepardo o chita", "La tortuga gigante", "El perro culichi"],
        answer: 1
      },
      {
        question: "¿Qué color se obtiene al mezclar pintura de color azul con amarillo?",
        options: ["Rojo", "Verde", "Morado", "Naranja"],
        answer: 1
      }
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  function getLocalFallbackQuiz(subjectName: string, topicName: string) {
    const isEnglish = subjectName.toLowerCase().includes("inglés") || subjectName.toLowerCase().includes("english") || subjectName.toLowerCase().includes("ing_");

    if (isEnglish) {
      return {
        question: `Súper fácil: ¿Cómo se dice 'Hola' en inglés de manera amigable? (Para repasar "${topicName}")`,
        options: ["Good bye", "Hello", "Thank you", "Please"],
        answer: 1
      };
    }

    if (subjectName.toLowerCase().includes("mate") || subjectName.toLowerCase().includes("calculadora")) {
      return {
        question: `¿Cuánto es multiplicar 5 por 4? (Aritmética básica para "${topicName}")`,
        options: ["9", "15", "20", "25"],
        answer: 2
      };
    }

    if (subjectName.toLowerCase().includes("bio") || subjectName.toLowerCase().includes("ciencias") || subjectName.toLowerCase().includes("biología")) {
      return {
        question: `¿Qué necesitan todas las plantas verdes para fabricar su alimento con el sol? (Para "${topicName}")`,
        options: ["Agua y aire", "Plástico", "Luz de lámpara solamente", "Pintura verde"],
        answer: 0
      };
    }

    // Default subject fallback
    return {
      question: `Repaso sencillo de la materia ${subjectName}: ¿Por qué es importante estudiar el tema "${topicName}"?`,
      options: [
        "Para aprender cosas valiosas que nos ayudan en la vida real",
        "Para aburrirnos en casa",
        "No tiene ninguna importancia",
        "Para adivinar las respuestas en exámenes"
      ],
      answer: 0
    };
  }

  // API Route: Generate Challenge with AI using Gemini
  app.post("/api/challenges/generate-ai", async (req, res) => {
    const { subjectId, topicName, idea } = req.body;

    if (!subjectId || !topicName) {
      return res.status(400).json({ error: "La materia (subjectId) y el tema son requeridos." });
    }

    try {
      if (!process.env.GEMINI_API_KEY) {
        console.warn("[Gemini API] GEMINI_API_KEY no configurada. Usando fallback local.");
        const fallback = getLocalFallbackChallenge(subjectId, topicName, idea);
        return res.json({ success: true, challenge: fallback, isFallback: true });
      }

      console.log(`[Gemini API] Generando desafío para materia: ${subjectId}, tema: ${topicName}`);

      const isEnglishSubject = subjectId.toLowerCase().startsWith("ing_");
      const englishRule = isEnglishSubject
        ? `\n\nIMPORTANTE: ESTA MATERIA ES DE INGLÉS. Por lo tanto, el título, la descripción ('description') y las instrucciones detalladas del protocolo ('instructions') DEBEN estar escritas en español sumamente sencillo (es decir, la explicación de qué hacer y cómo subir la evidencia va en español). Únicamente el desafío en sí (la pregunta a resolver, el vocabulario examinado o el texto lúdico a traducir) debe estar redactado en inglés adaptado para nivel principiante absoluto. Esto asegura que el alumno entienda perfectamente las indicaciones en español pero sea evaluado en inglés.`
        : "";

      const prompt = `Como diseñador instruccional de la plataforma escolar de cartas coleccionables "Card Academy", genera un desafío pedagógico único de nivel secundaria (grado de 1ero a 3ero de secundaria), dinámico y didáctico para los estudiantes.

Materia (ID): "${subjectId}"
Tema/Contenido principal: "${topicName}"
Idea del profesor / Contexto especial a incluir: "${idea || "Ninguna idea en particular, crea algo de alto impacto educativo"}"

IMPORTANTE - Perfil de los alumnos de secundaria de bajos recursos y bajo nivel educativo (Rezago escolar severo):
1. El tono y lenguaje del título, descripción e instrucciones DEBEN ser sumamente sencillos, cortos, claros y libres de palabras sofisticadas, tecnicismos pesados o vocabulario abstracto. Explica todo usando palabras ultra sencillas de la vida diaria y un tono muy amigable y empático.
2. El desafío en sí debe ser sumamente amigable, invitando al alumno a realizar actividades prácticas en su hogar o cuaderno, que apliquen conceptos elementales del tema en su realidad inmediata (la tiendita de la esquina, el parque cercano, objetos domésticos, pláticas sencillas en familia).
3. Las instrucciones deben presentarse paso a paso, muy directas, usando términos de acción concretos (por ejemplo, "Escribe 3 renglones...", "Haz un dibujo de...", "Explica con tus propias palabras..."). No sobrecargues al alumno con lecturas complejas.
4. Integra referencias locales y lúdicas sanas si encaja para animarlos (folclor escolar o bromas sanas sencillas).
5. Determina si es un 'Quiz' (opciones rápidas de opción múltiple con 1 correcta) o un 'Exercise' (ejercicio práctico en cuaderno que requiere evidencia en foto).
6. reward.tokens sugeridos: Easy=25, Medium=50, Hard=150.${englishRule}`;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres un redactor y docente empático especializado en gamificación escolar de secundaria mexicana para alumnos de bajos recursos con bajo nivel educativo o rezago lector. Tu lenguaje es siempre directo, amigable, claro e inspirador.",
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
      console.warn("[Gemini API Error] Error al generar desafío, aplicando fallback local:", err);
      const fallback = getLocalFallbackChallenge(subjectId, topicName, idea);
      res.json({ success: true, challenge: fallback, isFallback: true });
    }
  });

  // API Route: Generate Daily Challenge with AI using Gemini (Trivia style)
  app.post("/api/challenges/generate-daily", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        console.warn("[Gemini API] GEMINI_API_KEY no configurada. Usando fallback diario local.");
        const fallback = getLocalFallbackDaily();
        return res.json({ success: true, challenge: fallback, isFallback: true });
      }

      console.log("[Gemini API] Generando desafío diario de cultura general...");

      const prompt = `Genera una pregunta de trivia o curiosidad de cultura general de opción múltiple muy interesante en español, diseñada especialmente para alumnos de secundaria de bajos recursos con bajo nivel educativo. 

Instrucciones de lenguaje y diseño:
1. El lenguaje debe ser extremadamente directo, sencillo, cercano y claro. Evita por completo tecnicismos, palabras rebuscadas, conceptos elevados o vocabulario avanzado.
2. La pregunta debe basarse en un tema cercano, ameno, de la vida cotidiana, historia o geografía básica de México, o curiosidades de la naturaleza y animales, para que no resulte frustrante.
3. Proporciona exactamente 4 opciones de respuesta cortas y simples en un arreglo.
4. Indica cuál de las opciones (índice 0, 1, 2 o 3) es la correcta.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres un redactor y docente empático especializado en la enseñanza a jóvenes de secundaria de escasos recursos y bajo nivel de lectura en México. Tu lenguaje es siempre muy simple, directo, claro y libre de tecnicismos complejos.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "La pregunta de trivia formulada en un español extremadamente sencillo y comprensible." },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "4 opciones simples y claras en formato de texto."
              },
              answer: { type: Type.INTEGER, description: "El índice basado en cero (0, 1, 2 o 3) de la opción correcta." }
            },
            required: ["question", "options", "answer"]
          }
        }
      });

      const data = JSON.parse(response.text?.trim() || "{}");
      res.json({ success: true, challenge: data });
    } catch (err: any) {
      console.warn("[Gemini API Error] Error al generar desafío diario. Aplicando fallback local:", err);
      const fallback = getLocalFallbackDaily();
      res.json({ success: true, challenge: fallback, isFallback: true });
    }
  });

  // API Route: Generate Quick AI Quiz for Subjects
  app.post("/api/challenges/generate-quiz", async (req, res) => {
    const { subjectName, topicName, grade } = req.body;

    if (!subjectName || !topicName) {
      return res.status(400).json({ error: "La materia (subjectName) y el tema son requeridos." });
    }

    try {
      if (!process.env.GEMINI_API_KEY) {
        console.warn("[Gemini API] GEMINI_API_KEY no configurada. Usando fallback de quiz local.");
        const fallback = getLocalFallbackQuiz(subjectName, topicName);
        return res.json({ success: true, quiz: fallback, isFallback: true });
      }

      console.log(`[Gemini API] Generando quiz rápido para materia: ${subjectName}, tema: ${topicName}`);

      const isEnglish =
        subjectName.toLowerCase().includes("inglés") ||
        subjectName.toLowerCase().includes("english");

      const subPrompt = isEnglish
        ? `Genera una pregunta de opción múltiple sobre la materia de inglés (Tema: "${topicName}") para estudiantes de secundaria de bajos recursos o bajo nivel educativo. Como es de Inglés, la pregunta en sí y las 4 opciones deben estar en inglés con vocabulario de nivel principiante absoluto, pero las explicaciones del contexto o instrucciones adicionales deben estar en un español extremadamente claro y simple.`
        : `Genera una pregunta de opción múltiple para estudiantes de secundaria de bajos recursos con bajo nivel educativo (grado ${grade || "1"}) sobre la materia "${subjectName}" y el tema "${topicName}".`;

      const prompt = `${subPrompt}

Pautas críticas de lenguaje para el alumno de bajos recursos y bajo nivel:
1. El lenguaje en español DEBE ser sumamente sencillo, directo y de fácil lectura. No uses explicaciones largas, abstractas o términos avanzados que los alumnos no entiendan.
2. Si es posible, asocia el tema con algo práctico del entorno inmediato y familiar del alumno (compras simples, objetos domésticos, animales, la naturaleza, actividades cotidianas).
3. Entrega exactamente 4 opciones cortas, claras y fáciles de comprender. Una de ellas debe ser la correcta y el resto distractores amigables no confusos.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Eres un dócil diseñador de evaluaciones empático y claro, que redacta exámenes súper sencillos y amigables para chicos de secundaria mexicana de sectores más vulnerables o bajo rezago escolar.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "La pregunta del quiz en un español (o inglés básico si es de inglés) de fácil comprensión." },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Exactamente 4 respuestas cortas e inductivas."
              },
              answer: { type: Type.INTEGER, description: "El índice basado en cero (0, 1, 2 o 3) de la opción correcta." }
            },
            required: ["question", "options", "answer"]
          }
        }
      });

      const data = JSON.parse(response.text?.trim() || "{}");
      res.json({ success: true, quiz: data });
    } catch (err: any) {
      console.warn("[Gemini API Error] Error al generar quiz. Aplicando fallback local:", err);
      const fallback = getLocalFallbackQuiz(subjectName, topicName);
      res.json({ success: true, quiz: fallback, isFallback: true });
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
