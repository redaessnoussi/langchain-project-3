"""
RAG pipeline — Qdrant vector store + retrieval.

Responsibilities:
  - get_vector_store()       → returns the Qdrant vector store (lazy singleton)
  - ingest_documents()       → chunk + embed + upsert a list of LangChain Documents
  - ingest_huggingface_dataset() → load an IT-ticket HuggingFace dataset and ingest it
  - search_knowledge_base()  → semantic search, returns top-k formatted results
"""

from __future__ import annotations

import logging
import urllib3
from typing import Optional

from langchain_core.documents import Document

# Suppress InsecureRequestWarning from corporate SSL proxy environments.
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
from langchain_openai import OpenAIEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Embeddings & splitter (module-level singletons — created once)
# ---------------------------------------------------------------------------
embeddings = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=settings.openai_api_key,
)

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100,
)

# ---------------------------------------------------------------------------
# Qdrant client + collection bootstrap
# ---------------------------------------------------------------------------
_qdrant_client: Optional[QdrantClient] = None
_vector_store: Optional[QdrantVectorStore] = None

VECTOR_SIZE = 1536  # text-embedding-3-small output dimension


def _get_client() -> QdrantClient:
    global _qdrant_client
    if _qdrant_client is None:
        _qdrant_client = QdrantClient(url=settings.qdrant_url)
        _ensure_collection(_qdrant_client)
    return _qdrant_client


def _ensure_collection(client: QdrantClient) -> None:
    """Create the Qdrant collection if it does not exist yet."""
    existing = {c.name for c in client.get_collections().collections}
    if settings.qdrant_collection not in existing:
        client.create_collection(
            collection_name=settings.qdrant_collection,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        )
        logger.info("Created Qdrant collection '%s'", settings.qdrant_collection)


def get_vector_store() -> QdrantVectorStore:
    global _vector_store
    if _vector_store is None:
        client = _get_client()
        _vector_store = QdrantVectorStore(
            client=client,
            collection_name=settings.qdrant_collection,
            embedding=embeddings,
        )
    return _vector_store


# ---------------------------------------------------------------------------
# Ingestion helpers
# ---------------------------------------------------------------------------

def ingest_documents(documents: list[Document]) -> int:
    """
    Chunk, embed and upsert a list of LangChain Documents into Qdrant.
    Returns the number of chunks stored.
    """
    chunks = splitter.split_documents(documents)
    if not chunks:
        return 0
    vs = get_vector_store()
    vs.add_documents(chunks)
    logger.info("Ingested %d chunks into Qdrant", len(chunks))
    return len(chunks)


def ingest_huggingface_dataset(dataset_name: str, max_rows: int = 27_602) -> int:
    """
    Load the locally cached DataFrame and ingest it into Qdrant.
    The dataset is downloaded once and cached as parquet; no API calls at ingest-time.
    """
    from app.data.dataset import get_df

    logger.info("Ingesting '%s' from local DataFrame (max %d rows)...", dataset_name, max_rows)

    df = get_df()
    if max_rows < len(df):
        df = df.head(max_rows)

    def _clean(val: object) -> str:
        s = str(val) if val is not None else ""
        return "" if s.strip().lower() in ("nan", "none", "nat", "") else s.strip()

    documents: list[Document] = []
    for _, row in df.iterrows():
        parts = [
            _clean(row.get(f, ""))
            for f in ("short_description", "content", "close_notes", "issue/request")
            if _clean(row.get(f, ""))
        ]
        if not parts:
            continue
        metadata = {
            "ticket_number": _clean(row.get("number", "")),
            "category": _clean(row.get("category", "")),
            "subcategory": _clean(row.get("subcategory", "")),
            "system": _clean(row.get("software/system", "")),
            "type": _clean(row.get("type", "")),
            "source": dataset_name,
        }
        documents.append(Document(page_content="\n".join(parts), metadata=metadata))

    total_chunks = ingest_documents(documents)
    logger.info("Ingestion complete: %d total chunks stored", total_chunks)
    return total_chunks


# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------

def search_knowledge_base(query: str, k: int = 5) -> str:
    """
    Semantic search over the Qdrant collection.
    Returns a formatted string of the top-k results ready for the LLM.
    """
    vs = get_vector_store()
    results = vs.similarity_search(query, k=k)

    if not results:
        return "No relevant information found in the knowledge base."

    lines = [f"Found {len(results)} relevant ticket(s) from the knowledge base:\n"]
    for i, doc in enumerate(results, 1):
        m = doc.metadata
        lines.append(
            f"[{i}] Ticket {m.get('ticket_number', 'N/A')} "
            f"| {m.get('category', '')} › {m.get('subcategory', '')} "
            f"| System: {m.get('system', 'N/A')}\n"
            f"{doc.page_content[:600]}\n"
        )

    return "\n".join(lines)
