require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB = path.join(__dirname, "db.json");
const GEMINI_KEY = process.env.GEMINI_API_KEY;

// Evergreen model names — Google keeps these pointing at the latest stable version
const GEMINI_MODELS = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest"
];

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* ---------- tiny JSON db ---------- */
const read = () => JSON.parse(fs.readFileSync(DB, "utf8"));
const write = (data) => fs.writeFileSync(DB, JSON.stringify(data, null, 2));

/* ---------- Gemini helper with automatic fallback ---------- */
async function askGemini(prompt) {
  if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY missing on server");

  let lastError = "Unknown error";

  for (const model of GEMINI_MODELS) {
    try {
      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await res.json();

      if (!res.ok) {
        lastError = data?.error?.message || `${model} failed`;
        continue; // try next model
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastError = `Empty response from ${model}`;
        continue;
      }

      return text.trim();
    } catch (err) {
      lastError = err.message;
    }
  }

  throw new Error(lastError);
}

/* =====================================================
   FEED — /api/posts
   ===================================================== */

app.get("/api/posts", (req, res) => {
  const db = read();
  const posts = (db.posts || []).slice().sort((a, b) => b.createdAt - a.createdAt);
  res.json(posts);
});

app.post("/api/posts", (req, res) => {
  const db = read();
  if (!db.posts) db.posts = [];

  const {
    type, author, authorId,
    text, title, subject, imageUrl, options
  } = req.body;

  if (!type || !author) {
    return res.status(400).json({ error: "type and author required" });
  }

  const post = {
    id: Date.now().toString(),
    type,
    author,
    authorId: authorId || null,
    text: text || "",
    title: title || "",
    subject: subject || "",
    imageUrl: imageUrl || "",
    options: Array.isArray(options)
      ? options.map((o) => ({ text: o, votes: 0 }))
      : [],
    voters: [],
    votes: 0,
    votersUp: [],
    answers: [],
    createdAt: Date.now()
  };

  db.posts.push(post);
  write(db);
  res.json(post);
});

/* upvote / downvote a message or question */
app.post("/api/posts/:id/vote", (req, res) => {
  const db = read();
  const p = (db.posts || []).find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });

  const { uid, delta } = req.body;
  const deltaNum = delta === -1 ? -1 : 1;

  if (deltaNum === 1 && uid) {
    if (p.votersUp.includes(uid)) {
      p.votersUp = p.votersUp.filter((x) => x !== uid);
      p.votes -= 1;
    } else {
      p.votersUp.push(uid);
      p.votes += 1;
    }
  } else {
    p.votes += deltaNum;
  }

  write(db);
  res.json(p);
});

/* answer a question */
app.post("/api/posts/:id/answer", (req, res) => {
  const db = read();
  const p = (db.posts || []).find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  if (p.type !== "question") {
    return res.status(400).json({ error: "Not a question post" });
  }

  const answer = {
    id: Date.now().toString(),
    author: req.body.author || "Anonymous",
    authorId: req.body.authorId || null,
    body: req.body.body || "",
    createdAt: Date.now()
  };
  p.answers.push(answer);
  write(db);
  res.json(answer);
});

/* vote on a poll option */
app.post("/api/posts/:id/poll-vote", (req, res) => {
  const db = read();
  const p = (db.posts || []).find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "Not found" });
  if (p.type !== "poll") {
    return res.status(400).json({ error: "Not a poll" });
  }

  const { uid, optionIndex } = req.body;
  if (!uid) return res.status(400).json({ error: "uid required" });
  if (p.voters.includes(uid)) {
    return res.status(400).json({ error: "You already voted" });
  }
  if (!p.options[optionIndex]) {
    return res.status(400).json({ error: "Invalid option" });
  }

  p.options[optionIndex].votes += 1;
  p.voters.push(uid);
  write(db);
  res.json(p);
});

/* =====================================================
   AI — /api/ai/*
   ===================================================== */

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: "messages required" });
    }

    const convo = messages
      .map((m) => `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}`)
      .join("\n");

    const prompt =
      "You are a friendly study assistant for secondary school students. " +
      "Answer clearly and simply. If asked to solve a problem, show the steps.\n\n" +
      convo +
      "\nAssistant:";

    const reply = await askGemini(prompt);
    res.json({ reply });
  } catch (err) {
    console.error("AI CHAT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ai/summarize", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: "Text too short to summarize" });
    }

    const prompt =
      "Summarize the following study notes for a secondary school student. " +
      "Use short bullet points. Keep it clear and easy to revise from.\n\n" +
      text;

    const summary = await askGemini(prompt);
    res.json({ summary });
  } catch (err) {
    console.error("AI SUMMARIZE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ai/flashcards", async (req, res) => {
  try {
    const { summary } = req.body;
    if (!summary) return res.status(400).json({ error: "summary required" });

    const prompt =
      "Based on the study notes below, create 8 flashcards. " +
      "Return ONLY a JSON array. No explanation. No markdown fences. " +
      'Format: [{"front":"...","back":"..."}, ...]\n\n' +
      "Notes:\n" +
      summary;

    const raw = await askGemini(prompt);
    const clean = raw.replace(/```json|```/g, "").trim();

    let cards;
    try {
      cards = JSON.parse(clean);
    } catch {
      return res.status(500).json({ error: "AI returned invalid JSON", raw });
    }
    res.json({ cards });
  } catch (err) {
    console.error("AI FLASHCARDS ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ai/quiz", async (req, res) => {
  try {
    const { summary } = req.body;
    if (!summary) return res.status(400).json({ error: "summary required" });

    const prompt =
      "Based on the study notes below, create 5 multiple-choice questions. " +
      "Return ONLY a JSON array. No explanation. No markdown fences. " +
      'Format: [{"question":"...","options":["A","B","C","D"],"answerIndex":0}, ...]\n\n' +
      "Notes:\n" +
      summary;

    const raw = await askGemini(prompt);
    const clean = raw.replace(/```json|```/g, "").trim();

    let questions;
    try {
      questions = JSON.parse(clean);
    } catch {
      return res.status(500).json({ error: "AI returned invalid JSON", raw });
    }
    res.json({ questions });
  } catch (err) {
    console.error("AI QUIZ ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* =====================================================
   SERVE BUILT REACT APP (production / Render)
   ===================================================== */
const clientBuildPath = path.join(__dirname, "..", "client", "dist");
const clientIndex = path.join(clientBuildPath, "index.html");

console.log("Looking for client build at:", clientBuildPath);
console.log("Exists?", fs.existsSync(clientBuildPath));
console.log("Index exists?", fs.existsSync(clientIndex));

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
}

// SPA fallback — always responds, never 404s on /
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found" });
  }
  if (fs.existsSync(clientIndex)) {
    return res.sendFile(clientIndex, (err) => {
      if (err) next();
    });
  }
  res
    .status(500)
    .send(
      "Client build not found. Expected at: " +
        clientIndex +
        " — did the build step run?"
    );
});

/* ---------- start ---------- */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});