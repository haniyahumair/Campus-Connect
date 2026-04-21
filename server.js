import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import { ANTHROPIC_API_KEY } from "./scripts/config/env.js";

const app = express();
const PORT = 3001;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// handle preflight manually just in case cors misses it
app.options(/.*/, (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Origin, Accept"
  );
  res.sendStatus(204);
});

app.use(bodyParser.json());

app.post("/api/anthropic", async (req, res) => {
  const { messages, systemPrompt } = req.body;

  if (!messages || !Array.isArray(messages)) {
    console.error("bad messages payload:", messages);
    return res.status(400).json({ error: "messages must be an array" });
  }

  const payload = {
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages,
  };

  if (systemPrompt) payload.system = systemPrompt;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("anthropic api error:", errText);
      return res.status(response.status).send(errText);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("failed to call anthropic:", err);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`server up at http://localhost:${PORT}`);
});
