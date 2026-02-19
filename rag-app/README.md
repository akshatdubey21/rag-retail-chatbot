# 📄 RAG Chat Bot — Chat with Retail PDFs

A production-ready **Retrieval-Augmented Generation (RAG)** web application that lets users upload retail PDF documents and ask natural-language questions about them. Answers are grounded strictly in the document content.

---

## Architecture

```
User uploads PDF
      │
      ▼
  Extract text (PyPDF)
      │
      ▼
  Split into chunks (LangChain RecursiveCharacterTextSplitter)
      │
      ▼
  Generate embeddings (sentence-transformers/all-MiniLM-L6-v2)
      │
      ▼
  Store in FAISS vector index (local disk)
      │
      ▼
  User sends question
      │
      ▼
  Retrieve top-k relevant chunks (FAISS similarity search)
      │
      ▼
  Build prompt with context + question
      │
      ▼
  Generate answer (google/flan-t5-base via HuggingFace transformers)
      │
      ▼
  Return answer + source references to frontend
```

---

## Tech Stack

| Layer     | Technology                                          |
| --------- | --------------------------------------------------- |
| Frontend  | React 18, Vite, Tailwind CSS, Axios                 |
| Backend   | Python 3.10+, FastAPI, LangChain                    |
| Vector DB | FAISS (local storage)                               |
| Embedding | HuggingFace `sentence-transformers/all-MiniLM-L6-v2`|
| LLM       | HuggingFace `google/flan-t5-base` (100 % free, local) |

---

## Project Structure

```
rag-app/
├── backend/
│   ├── main.py              # FastAPI app & endpoints
│   ├── rag_pipeline.py       # Orchestrates ingest → retrieve → generate
│   ├── pdf_loader.py         # PDF text extraction & chunking
│   ├── vector_store.py       # FAISS index management
│   ├── llm.py                # HuggingFace LLM wrapper
│   ├── config.py             # Settings from .env
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── services/api.js
│       ├── styles/index.css
│       └── components/
│           ├── Chat.jsx
│           ├── Message.jsx
│           ├── Upload.jsx
│           └── Sidebar.jsx
├── data/                     # Created at runtime
├── .env
└── README.md
```

---

## Prerequisites

- **Python 3.10+** (with `pip`)
- **Node.js 18+** (with `npm`)
- **Git** (optional)

> ⚠️ No paid API keys are required. Everything runs locally using free HuggingFace models.

---

## 🚀 Getting Started

### 1. Clone / open the project

```bash
cd rag-app
```

---

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

The API will be available at **http://localhost:8000**.  
Interactive docs at **http://localhost:8000/docs**.

> **First startup** will download the embedding model (~80 MB) and the LLM (~900 MB).  
> Subsequent starts are instant.

---

### 3. Frontend Setup

Open a **new terminal**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Usage

1. **Upload a PDF** — Click the "Upload PDF" button in the sidebar and select a retail PDF.
2. **Wait for processing** — The backend extracts text, chunks it, generates embeddings, and stores them in FAISS.
3. **Ask questions** — Type a question in the chat input and press Enter (or click the send button).
4. **View answers** — The AI responds with an answer derived strictly from the uploaded documents, along with source references (filename + page number).

---

## API Endpoints

| Method | Path      | Description                       |
| ------ | --------- | --------------------------------- |
| GET    | `/health` | Health check + uploaded file list |
| POST   | `/upload` | Upload a PDF (multipart/form-data)|
| POST   | `/chat`   | Send a question, get an answer    |

### Example — Upload

```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@retail_report.pdf"
```

### Example — Chat

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What were the total sales in Q3?"}'
```

---

## Environment Variables (`.env`)

| Variable         | Default                                      | Description                  |
| ---------------- | -------------------------------------------- | ---------------------------- |
| `HF_MODEL_NAME`  | `google/flan-t5-base`                        | HuggingFace generation model |
| `EMBEDDING_MODEL` | `sentence-transformers/all-MiniLM-L6-v2`    | Sentence-transformer model   |
| `CHUNK_SIZE`      | `500`                                        | Characters per text chunk    |
| `CHUNK_OVERLAP`   | `50`                                         | Overlap between chunks       |
| `FAISS_INDEX_PATH`| `data/faiss_index`                           | FAISS index directory        |
| `UPLOAD_DIR`      | `data/uploads`                               | Uploaded PDF storage         |
| `MAX_NEW_TOKENS`  | `512`                                        | Max tokens per LLM response  |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `torch` install fails | Use `pip install torch --index-url https://download.pytorch.org/whl/cpu` for CPU-only |
| CORS errors in browser | Make sure the backend is running on port 8000 |
| Slow first response | Models are downloaded on first run; subsequent starts are fast |
| Out of memory | Use `google/flan-t5-base` (default) instead of larger models |

---

## License

MIT
