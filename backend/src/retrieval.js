/**
 * Retrieve the most relevant document chunks from Supabase via
 * the match_documents RPC function.
 *
 * @param {number[]} queryEmbedding - The query embedding vector
 * @param {string} supabaseUrl - Supabase project URL
 * @param {string} supabaseKey - Supabase anon/service key
 * @param {number} [matchCount=5] - Number of results to return
 * @param {number} [matchThreshold=0.5] - Minimum similarity threshold
 * @returns {Promise<Array<{content: string, similarity: number}>>}
 */
export async function retrieveDocuments(
  queryEmbedding,
  supabaseUrl,
  supabaseKey,
  matchCount = 3,
  matchThreshold = 0.6
) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/match_documents`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase RPC error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data;
}
