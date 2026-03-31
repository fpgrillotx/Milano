import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from 'url';
import app from "./src/backend/app.ts";
import { supabase } from "./src/supabase.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const PORT = 3000;

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

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    if (supabase) {
      try {
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) {
          console.error("Erro ao conectar ao Supabase:", error.message);
        } else {
          console.log("Conectado com sucesso ao Supabase");
        }
      } catch (err: any) {
        console.error("Falha na conexão com Supabase:", err.message);
      }
    } else {
      console.log("Usando SQLite local (Supabase não configurado)");
    }
  });
}

startServer();
