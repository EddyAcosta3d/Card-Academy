import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
