import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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
