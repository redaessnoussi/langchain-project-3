import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from pydantic import BaseModel
from langchain_core.documents import Document
from app.ai.rag import ingest_documents, ingest_huggingface_dataset, get_vector_store

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class IngestResponse(BaseModel):
    message: str
    chunks_stored: int


class CollectionStats(BaseModel):
    collection: str
    total_vectors: int


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/upload", response_model=IngestResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF or plain-text file.
    The file is chunked, embedded and stored in Qdrant.
    """
    filename = file.filename or ""
    content_bytes = await file.read()

    if filename.lower().endswith(".pdf"):
        import io
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(content_bytes))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    elif filename.lower().endswith(".txt"):
        text = content_bytes.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(
            status_code=415,
            detail="Unsupported file type. Please upload a .pdf or .txt file.",
        )

    if not text.strip():
        raise HTTPException(status_code=400, detail="The uploaded file appears to be empty.")

    doc = Document(page_content=text, metadata={"source": filename})
    chunks = ingest_documents([doc])
    return IngestResponse(message=f"'{filename}' indexed successfully.", chunks_stored=chunks)


class DatasetRequest(BaseModel):
    dataset_name: str = "KameronB/synthetic-it-callcenter-tickets"
    max_rows: int = 27_602


@router.post("/ingest-dataset", response_model=IngestResponse)
async def ingest_dataset(body: DatasetRequest, background_tasks: BackgroundTasks):
    """
    Load a HuggingFace dataset and ingest it into Qdrant.
    Runs in the background so the HTTP response returns immediately.
    """
    background_tasks.add_task(_run_ingest, body.dataset_name, body.max_rows)
    return IngestResponse(
        message=f"Ingestion of '{body.dataset_name}' started in the background.",
        chunks_stored=0,
    )


def _run_ingest(dataset_name: str, max_rows: int) -> None:
    try:
        n = ingest_huggingface_dataset(dataset_name, max_rows)
        logger.info("Background ingestion complete: %d chunks stored", n)
    except Exception as e:
        logger.error("Background ingestion failed: %s", e)


@router.get("/stats", response_model=CollectionStats)
def collection_stats():
    """Return the number of vectors currently stored in Qdrant.
    Returns zeros gracefully when Qdrant is not running.
    """
    try:
        vs = get_vector_store()
        info = vs.client.get_collection(vs.collection_name)
        return CollectionStats(
            collection=vs.collection_name,
            total_vectors=info.points_count or 0,
        )
    except Exception as e:
        logger.warning("Qdrant unavailable for stats: %s", e)
        return CollectionStats(collection="it_tickets", total_vectors=0)
