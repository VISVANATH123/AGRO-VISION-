import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("agrovision.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_name TEXT,
    disease_name TEXT,
    severity TEXT,
    treatment TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/history", (req, res) => {
    try {
      const scans = db.prepare("SELECT * FROM scans ORDER BY created_at DESC").all();
      res.json(scans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.post("/api/scans", (req, res) => {
    const { crop_name, disease_name, severity, treatment, image_url } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO scans (crop_name, disease_name, severity, treatment, image_url)
        VALUES (?, ?, ?, ?, ?)
      `).run(crop_name, disease_name, severity, treatment, image_url);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save scan" });
    }
  });

  app.get("/api/stats", (req, res) => {
    try {
      const stats = db.prepare(`
        SELECT disease_name, COUNT(*) as count 
        FROM scans 
        GROUP BY disease_name 
        ORDER BY count DESC
      `).all();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
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
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
