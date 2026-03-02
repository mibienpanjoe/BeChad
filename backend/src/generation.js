/**
 * Generate a chat response using OpenAI Chat Completion.
 *
 * @param {Array<{role: string, content: string}>} messages - The messages array
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<string>} The assistant's response text
 */
export async function generateResponse(messages, apiKey) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI Chat API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
