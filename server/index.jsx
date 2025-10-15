// Node + Express minimal
import express from "express";
import fetch from "node-fetch"; // o usa openai SDK
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  try {
    // Ejemplo con OpenAI completions (ajusta a API que useis)
    const systemPrompt = "Eres un asistente contextual de Team Bingo. Responde conciso y útil.";
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: message }
    ];

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // usa el modelo que prefieras
        messages,
        max_tokens: 300
      })
    });
    const json = await openaiRes.json();
    const reply = json.choices?.[0]?.message?.content ?? "Lo siento, no tengo respuesta en este momento.";
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "error server" });
  }
});

app.listen(3001, () => console.log("Chat API running on :3001"));
