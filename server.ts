import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const NOTION_DB_ID = process.env.NOTION_DATABASE_ID!;

async function startServer() {
  const app = express();
  const PORT = 3001;

  app.use(express.json());

  // 記錄所有任務操作時長到 Notion（一位參與者一筆）
  app.post("/api/log-task", async (req, res) => {
    const { userId, date, task1_sec, task2_sec, task3_sec, task4_sec, task5_sec } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      await notion.pages.create({
        parent: { database_id: NOTION_DB_ID },
        properties: {
          "UserID": { title: [{ text: { content: userId } }] },
          "Date": { date: { start: date || new Date().toISOString().split("T")[0] } },
          "task1_sec": { number: task1_sec ?? null },
          "task2_sec": { number: task2_sec ?? null },
          "task3_sec": { number: task3_sec ?? null },
          "task4_sec": { number: task4_sec ?? null },
          "task5_sec": { number: task5_sec ?? null },
        },
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Notion Error:", error);
      res.status(500).json({ error: "Failed to log task to Notion" });
    }
  });

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API to parse natural language search query
  app.post("/api/parse-query", async (req, res) => {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Parse this furniture search query into structured filters: "${query}". 
        Available categories: mattress (床墊), sofas (沙發), chairs (椅子與餐椅), coffee-tables (茶几與邊桌), dining-tables (餐桌), lighting (燈具), desks (書桌與辦公), storage (衣櫃與收納), rugs (地毯), decor (家飾配件).
        
        Extract:
        1. categoryId (one of the above)
        2. priceRange (min and max)
        3. keywords (e.g., "wood", "small space", "firm")
        4. aiSummary (a human-readable description of what was filtered, e.g. "小空間 / 木紋 / 1500–3000")`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              categoryId: { type: Type.STRING },
              minPrice: { type: Type.NUMBER },
              maxPrice: { type: Type.NUMBER },
              keywords: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              aiSummary: { type: Type.STRING }
            },
            required: ["categoryId", "aiSummary"]
          }
        }
      });

      const result = JSON.parse(response.text);
      res.json(result);
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to parse query" });
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
