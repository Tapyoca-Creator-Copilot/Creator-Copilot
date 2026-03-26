import "dotenv/config";

import { createServer } from "node:http";
import { Readable } from "node:stream";

import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";

const port = Number(process.env.PORT || 8787);
const modelName = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
const frontendUrl = process.env.FRONTEND_URL;

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (!origin) return;

  const allowedOrigins = new Set(
    [frontendUrl, "http://localhost:5173", "http://localhost:4173"].filter(Boolean),
  );

  if (!allowedOrigins.has(origin)) return;

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (url.pathname === "/api/chat" || url.pathname === "/health") {
      setCorsHeaders(req, res);
      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }
    }

    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Hello from Gemini chat API!");
      return;
    }

    if (req.method === "GET" && url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ok: true,
          service: "ai-server",
          model: modelName,
        }),
      );
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/chat") {
      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" }));
        return;
      }

      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const bodyText = Buffer.concat(chunks).toString("utf8");
      let body;
      try {
        body = bodyText ? JSON.parse(bodyText) : {};
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }

      const { messages } = body;

      const result = streamText({
        model: google(modelName),
        messages: await convertToModelMessages(messages ?? []),
      });

      const response = result.toUIMessageStreamResponse();

      const headers = Object.fromEntries(response.headers.entries());
      res.writeHead(response.status, headers);

      if (!response.body) {
        res.end();
        return;
      }

      Readable.fromWeb(response.body).pipe(res);
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: String(err?.message ?? err),
        model: modelName,
      }),
    );
  }
});

server.on("error", (err) => {
  if (err?.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Stop the other process or set PORT in .env to a free port.`,
    );
    process.exit(1);
  }

  console.error(err);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`Gemini chat API listening on http://localhost:${port}`);
  console.log(`POST http://localhost:${port}/api/chat`);
});
