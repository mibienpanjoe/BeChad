/**
 * Generate an embedding vector for a text query using OpenAI.
 *
 * @param {string} text - The text to embed
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<number[]>} 1536-dimension embedding vector
 */
export async function generateEmbedding(text, apiKey) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI Embeddings API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}
