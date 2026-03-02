import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";

// ── Config ──────────────────────────────────────────────────────────────────
const PDF_PATH = path.resolve(
  __dirname,
  "../data/The Way Of The Superior Man.pdf",
);

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

// ── Validate env vars ───────────────────────────────────────────────────────
const requiredEnv = ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_KEY"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("📄 Loading PDF...");
  const loader = new PDFLoader(PDF_PATH, {
    splitPages: true,
  });
  const rawDocs = await loader.load();
  console.log(`   Loaded ${rawDocs.length} pages`);

  // Split into chunks
  console.log("✂️  Splitting into chunks...");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  const docs = await splitter.splitDocuments(rawDocs);
  console.log(`   Created ${docs.length} chunks`);

  // Add metadata
  docs.forEach((doc, i) => {
    doc.metadata = {
      ...doc.metadata,
      chunkIndex: i,
      source: "The Way Of The Superior Man",
    };
  });

  // Initialize clients
  console.log("🔗 Connecting to Supabase & OpenAI...");
  const supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
  );

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Embed & store in batches
  console.log("🚀 Generating embeddings & storing in Supabase...");
  const BATCH_SIZE = 50;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    await SupabaseVectorStore.fromDocuments(batch, embeddings, {
      client: supabaseClient,
      tableName: "documents",
      queryName: "match_documents",
    });
    console.log(
      `   ✅ Stored batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(docs.length / BATCH_SIZE)} (${Math.min(i + BATCH_SIZE, docs.length)}/${docs.length} chunks)`,
    );
  }

  console.log(
    `\n🎉 Done! ${docs.length} chunks embedded and stored in Supabase.`,
  );
}

main().catch((err) => {
  console.error("❌ Ingestion failed:", err);
  process.exit(1);
});
