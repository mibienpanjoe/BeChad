import { generateEmbedding } from "./embedding.js";
import { retrieveDocuments } from "./retrieval.js";
import { buildMessages } from "./prompt.js";
import { generateResponse } from "./generation.js";

// ── CORS Headers ────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

// ── Chat Handler ────────────────────────────────────────────────────────────
async function handleChat(request, env) {
  // Parse request body
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { query } = body;
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return jsonResponse({ error: "Missing or empty 'query' field" }, 400);
  }

  // 1. Generate embedding for the user query
  const queryEmbedding = await generateEmbedding(query, env.OPENAI_API_KEY);

  // 2. Retrieve relevant document chunks
  const chunks = await retrieveDocuments(
    queryEmbedding,
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY
  );

  if (!chunks || chunks.length === 0) {
    return jsonResponse({
      response:
        "I couldn't find relevant information for your question. Try rephrasing or asking something else.",
    });
  }

  // 3. Build prompt with context
  const messages = buildMessages(chunks, query);

  // 4. Generate response
  const responseText = await generateResponse(messages, env.OPENAI_API_KEY);

  return jsonResponse({ response: responseText });
}

// ── Worker Entry Point ──────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // Route: POST /api/chat
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        return await handleChat(request, env);
      } catch (error) {
        console.error("Chat handler error:", error);
        return jsonResponse(
          { error: "Failed to generate response. Please try again." },
          500
        );
      }
    }

    // 404 for everything else
    return jsonResponse({ error: "Not found" }, 404);
  },
};
