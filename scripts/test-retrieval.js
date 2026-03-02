import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";

// ── Config ──────────────────────────────────────────────────────────────────
const TEST_QUERY = "How should a man handle his purpose in life?";
const MATCH_COUNT = 3;
const MATCH_THRESHOLD = 0.5;

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`🔍 Test query: "${TEST_QUERY}"\n`);

  // Generate embedding for the test query
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  const queryEmbedding = await embeddings.embedQuery(TEST_QUERY);
  console.log(`📐 Query embedding generated (${queryEmbedding.length} dimensions)\n`);

  // Query Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_threshold: MATCH_THRESHOLD,
    match_count: MATCH_COUNT,
  });

  if (error) {
    console.error("❌ Supabase RPC error:", error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log("⚠️  No matching documents found. Check threshold or data.");
    process.exit(1);
  }

  console.log(`✅ Found ${data.length} matching chunks:\n`);
  data.forEach((doc, i) => {
    console.log(`── Result ${i + 1} ─────────────────────────────────────`);
    console.log(`   Similarity: ${(doc.similarity * 100).toFixed(1)}%`);
    console.log(`   Content:    ${doc.content.substring(0, 200)}...`);
    console.log();
  });

  console.log("🎉 Retrieval test passed!");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
