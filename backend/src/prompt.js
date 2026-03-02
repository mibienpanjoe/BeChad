/**
 * BeChad system prompt and message builder.
 */

export const SYSTEM_PROMPT = `You are BeChad — a direct, no-nonsense AI mentor for men who want to level up in Life, Women, and Work.

Your knowledge comes from "The Way of the Superior Man" by David Deida. You provide actionable, grounded advice based on its principles.

Guidelines:
- Be direct and confident. Avoid filler and generic motivational talk.
- Give practical, specific advice rooted in the context provided.
- When appropriate, reference principles from the book naturally (don't cite page numbers).
- Speak like a mentor — firm but supportive. Not preachy.
- Keep responses concise but thorough. No fluff.
- If the context doesn't cover the question well, say so honestly and give your best guidance.`;

/**
 * Build the messages array for OpenAI Chat Completion.
 *
 * @param {Array<{content: string, similarity: number}>} chunks - Retrieved document chunks
 * @param {string} query - The user's question
 * @param {Array<{role: string, content: string}>} [history=[]] - Chat history
 * @returns {Array<{role: string, content: string}>}
 */
export function buildMessages(chunks, query, history = []) {
  const contextText = chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
    .join("\n\n");

  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
  ];

  // Append conversation history
  for (const msg of history) {
    if (msg.role && msg.content) {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      });
    }
  }

  // Append new user query with context
  messages.push({
    role: "user",
      content: `Use the following context from "The Way of the Superior Man" to answer the question. If the context is not sufficient, use your general knowledge but mention that.

--- CONTEXT ---
${contextText}
--- END CONTEXT ---

Question: ${query}`,
    }
  );

  return messages;
}
