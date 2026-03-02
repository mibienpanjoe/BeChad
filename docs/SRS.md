# BeChad — Software Requirements Specification (SRS)

**Version:** 1.0  
**Date:** March 2, 2026  
**Author:** BeChad Development Team

---

## 1. Introduction

### 1.1 Purpose

This document defines the software requirements for **BeChad**, a Retrieval-Augmented Generation (RAG) powered AI chatbot designed to provide men with actionable guidance across three core life domains: **Life**, **Women**, and **Work**. It serves as the authoritative reference for design, development, testing, and deployment.

### 1.2 Product Overview

BeChad is a conversational AI assistant that answers user questions by retrieving relevant context from a curated knowledge document and generating contextual, personalized responses using OpenAI's language models. The system is built with a clear separation between a **static frontend** (HTML + Tailwind CSS v4 + JS) and a **serverless backend** (Cloudflare Worker), communicating via a REST API.

### 1.3 Definitions & Acronyms

| Term                  | Definition                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| **RAG**               | Retrieval-Augmented Generation — a pattern that retrieves relevant documents before generating a response |
| **Embedding**         | A dense vector representation of text used for semantic similarity search                                 |
| **pgvector**          | A PostgreSQL extension for vector similarity search                                                       |
| **Cosine Similarity** | A metric measuring the cosine of the angle between two vectors; used to rank document relevance           |
| **Cloudflare Worker** | A serverless execution environment running at the edge                                                    |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                      USER                           │
│               (Browser / Mobile)                    │
└──────────────────────┬──────────────────────────────┘
                       │  HTTPS
                       ▼
┌─────────────────────────────────────────────────────┐
│             FRONTEND (Static Site)                  │
│         HTML5 + Tailwind CSS v4 + JS                │
│                                                     │
│  • Chat UI with message bubbles                     │
│  • Input bar + send button                          │
│  • Loading / typing indicators                      │
│  • Responsive layout                                │
└──────────────────────┬──────────────────────────────┘
                       │  fetch() — POST /api/chat
                       ▼
┌─────────────────────────────────────────────────────┐
│          BACKEND (Cloudflare Worker)                │
│               Node.js / Wrangler                    │
│                                                     │
│  1. Receive user query                              │
│  2. Generate query embedding (OpenAI)               │
│  3. Similarity search in Supabase (pgvector)        │
│  4. Build prompt: system + context + query          │
│  5. Call OpenAI Chat Completion                     │
│  6. Return response to frontend                    │
└────────┬───────────────────────────┬────────────────┘
         │                           │
         ▼                           ▼
┌──────────────────┐    ┌─────────────────────────────┐
│   OpenAI API     │    │   Supabase (pgvector DB)    │
│                  │    │                             │
│ • text-embedding │    │ • documents table           │
│   -3-small       │    │   - id (uuid)               │
│ • gpt-4o-mini    │    │   - content (text)          │
│   (chat)         │    │   - embedding (vector)      │
│                  │    │   - metadata (jsonb)         │
└──────────────────┘    │ • match_documents() fn      │
                        └─────────────────────────────┘
```

### 2.1 Data Ingestion Pipeline (One-time / Offline)

A separate Node.js script handles document ingestion:

1. **Load** the source PDF from `data/`
2. **Split** the document into text chunks using LangChain.js `RecursiveCharacterTextSplitter`
3. **Generate embeddings** for each chunk via OpenAI `text-embedding-3-small`
4. **Store** chunks + embeddings into the Supabase `documents` table

> This pipeline runs locally and is **not** part of the deployed application.

---

## 3. Suggested Project Structure

```
BeChad/
├── data/                          # Source document(s) for RAG
│   └── book.pdf
│
├── scripts/                       # Offline ingestion scripts
│   ├── ingest.js                  # Main ingestion pipeline
│   └── package.json               # Script dependencies
│
├── backend/                       # Cloudflare Worker (API)
│   ├── src/
│   │   ├── index.js               # Worker entry point & router
│   │   ├── embedding.js           # OpenAI embedding helper
│   │   ├── retrieval.js           # Supabase similarity search
│   │   ├── generation.js          # OpenAI chat completion
│   │   └── prompt.js              # System prompt & template
│   ├── wrangler.toml              # Cloudflare Worker config
│   └── package.json
│
├── frontend/                      # Static chat UI
│   ├── index.html                 # Main HTML page
│   ├── style.css                  # Tailwind CSS v4 styles
│   ├── app.js                     # Chat logic & API calls
│   └── assets/
│       └── logo.svg               # BeChad logo / branding
│
├── docs/
│   └── SRS.md                     # This document
│
├── .env.example                   # Template for environment variables
├── .gitignore
└── README.md
```

---

## 4. Functional Requirements

### 4.1 Chat Interface (Frontend)

| ID    | Requirement                                                            | Priority |
| ----- | ---------------------------------------------------------------------- | -------- |
| FR-01 | User can type a message and send it via button or Enter key            | High     |
| FR-02 | Chat displays user messages and bot responses in a conversation thread | High     |
| FR-03 | A loading/typing indicator is shown while awaiting a response          | High     |
| FR-04 | Chat history is maintained for the current session (in-memory)         | Medium   |
| FR-05 | The interface is fully responsive (mobile + desktop)                   | High     |
| FR-06 | Error states are displayed gracefully (network errors, API failures)   | Medium   |

### 4.2 Backend API (Cloudflare Worker)

| ID    | Requirement                                                                  | Priority |
| ----- | ---------------------------------------------------------------------------- | -------- |
| FR-07 | Expose a `POST /api/chat` endpoint accepting `{ "query": "..." }`            | High     |
| FR-08 | Generate an embedding for the user query using OpenAI                        | High     |
| FR-09 | Perform cosine similarity search against stored embeddings in Supabase       | High     |
| FR-10 | Retrieve the top-K most relevant chunks (default K=5)                        | High     |
| FR-11 | Construct a prompt with system instructions + retrieved context + user query | High     |
| FR-12 | Call OpenAI Chat Completion API and return the generated response            | High     |
| FR-13 | Return structured JSON responses: `{ "response": "..." }`                    | High     |
| FR-14 | Handle errors gracefully with appropriate HTTP status codes                  | Medium   |

### 4.3 Data Ingestion (Scripts)

| ID    | Requirement                                                     | Priority |
| ----- | --------------------------------------------------------------- | -------- |
| FR-15 | Load a PDF document from the `data/` directory                  | High     |
| FR-16 | Split the document into chunks (~1000 chars, 200 char overlap)  | High     |
| FR-17 | Generate embeddings for each chunk via OpenAI API               | High     |
| FR-18 | Store chunks and embeddings into the Supabase `documents` table | High     |

---

## 5. Non-Functional Requirements

| ID     | Requirement                                                                              | Category      |
| ------ | ---------------------------------------------------------------------------------------- | ------------- |
| NFR-01 | API response time < 5 seconds (p95)                                                      | Performance   |
| NFR-02 | All API keys stored as environment variables / Cloudflare secrets — never in client code | Security      |
| NFR-03 | CORS configured to allow only the frontend origin                                        | Security      |
| NFR-04 | Frontend works on latest Chrome, Firefox, Safari, Edge                                   | Compatibility |
| NFR-05 | Backend deployed as Cloudflare Worker for edge performance                               | Deployment    |
| NFR-06 | Frontend deployable as static files on any CDN or hosting                                | Deployment    |

---

## 6. Technology Stack

| Layer      | Technology                                     | Purpose                       |
| ---------- | ---------------------------------------------- | ----------------------------- |
| Frontend   | HTML5, Tailwind CSS v4, Vanilla JS             | Chat user interface           |
| Backend    | Cloudflare Workers (JS)                        | Serverless API                |
| Embeddings | OpenAI `text-embedding-3-small`                | Convert text → vectors        |
| LLM        | OpenAI `gpt-4o-mini`                           | Generate contextual responses |
| Vector DB  | Supabase + pgvector                            | Store & search embeddings     |
| Ingestion  | LangChain.js, Node.js                          | Document chunking & embedding |
| Deployment | Cloudflare (Worker), Static hosting (frontend) | Production hosting            |

---

## 7. API Specification

### `POST /api/chat`

**Request:**

```json
{
  "query": "How do I stay disciplined at work?"
}
```

**Response (200):**

```json
{
  "response": "Discipline at work starts with..."
}
```

**Error Response (500):**

```json
{
  "error": "Failed to generate response"
}
```

**Headers:**

- `Content-Type: application/json`
- CORS: Configured for allowed origins

---

## 8. Database Schema (Supabase)

### Table: `documents`

| Column      | Type                     | Description                                    |
| ----------- | ------------------------ | ---------------------------------------------- |
| `id`        | `uuid` (PK, default gen) | Unique identifier                              |
| `content`   | `text`                   | The text chunk                                 |
| `embedding` | `vector(1536)`           | OpenAI embedding vector                        |
| `metadata`  | `jsonb`                  | Optional metadata (page number, section, etc.) |

### Function: `match_documents`

```sql
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

---

## 9. Environment Variables

| Variable               | Used In          | Description                                |
| ---------------------- | ---------------- | ------------------------------------------ |
| `OPENAI_API_KEY`       | Backend, Scripts | OpenAI API authentication                  |
| `SUPABASE_URL`         | Backend, Scripts | Supabase project URL                       |
| `SUPABASE_SERVICE_KEY` | Scripts          | Supabase service role key (ingestion only) |
| `SUPABASE_ANON_KEY`    | Backend          | Supabase anonymous key (read-only access)  |

---

## 10. Development & Deployment Plan

### Phase 1 — Data Ingestion

1. Set up Supabase project with pgvector extension
2. Create `documents` table and `match_documents` function
3. Build and run the ingestion script (`scripts/ingest.js`)
4. Verify embeddings are stored correctly

### Phase 2 — Backend API

1. Scaffold Cloudflare Worker project (`backend/`)
2. Implement embedding generation, retrieval, and response generation
3. Test locally with `wrangler dev`
4. Deploy to Cloudflare Workers

### Phase 3 — Frontend

1. Build the chat interface (`frontend/`)
2. Connect to the backend API
3. Polish UI/UX, responsiveness, and error handling
4. Deploy frontend as static site

### Phase 4 — Integration & Polish

1. End-to-end testing
2. CORS and security hardening
3. Performance tuning (chunk size, top-K, prompt engineering)
4. Final deployment

---

## 11. Glossary

- **BeChad**: The product name — a chatbot empowering men to improve across Life, Women, and Work.
- **Chunk**: A segment of the source document, typically ~1000 characters, used as a retrieval unit.
- **Context Window**: The combined text (system prompt + retrieved chunks + user query) sent to the LLM.
- **Edge Deployment**: Running server-side code at CDN edge locations (via Cloudflare Workers) for low-latency responses.
