import { useState, useRef } from "react"
import {
  RiUploadCloud2Line,
  RiDatabase2Line,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiRobot2Line,
  RiSearchLine,
  RiLightbulbLine,
} from "@remixicon/react"

const COLLECTIONS = [
  {
    name: "IT Call Center Tickets",
    source: "HuggingFace · KameronB/synthetic-it-callcenter-tickets",
    documents: 27602,
    chunks: 82806,
    status: "Ready",
    lastUpdated: "2024-08-10",
    model: "text-embedding-3-small",
  },
]

const HOW_IT_WORKS = [
  {
    icon: RiUploadCloud2Line,
    title: "1. Add a document",
    desc: "Upload a PDF, TXT, or connect a HuggingFace dataset. Each text is split into small chunks.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: RiSearchLine,
    title: "2. Embed & store",
    desc: "Each chunk is converted into a vector (numbers representing meaning) and stored in Qdrant.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: RiRobot2Line,
    title: "3. AI uses it",
    desc: "When you ask a question in the chat, the AI searches Qdrant for the most relevant chunks and builds its answer from them — not from guesses.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
]

export default function Knowledge() {
  const [dragging, setDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [ingestStatus, setIngestStatus] = useState<string | null>(null)
  const [ingestLoading, setIngestLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setUploadedFile(file.name)
    setUploading(true)
    setUploadError(null)
    const form = new FormData()
    form.append("file", file)
    try {
      const res = await fetch("http://localhost:8000/documents/upload", {
        method: "POST",
        body: form,
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Upload failed")
      }
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleIngestDataset = async () => {
    setIngestLoading(true)
    setIngestStatus(null)
    try {
      const res = await fetch("http://localhost:8000/documents/ingest-dataset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset_name: "KameronB/synthetic-it-callcenter-tickets",
          max_rows: 27602,
        }),
      })
      if (!res.ok) throw new Error("Failed to start ingestion")
      setIngestStatus("Ingestion started in the background — this may take a few minutes.")
    } catch (e: unknown) {
      setIngestStatus(e instanceof Error ? e.message : "Failed to start ingestion")
    } finally {
      setIngestLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the documents and datasets the AI assistant uses to answer questions.
        </p>
      </div>

      {/* How it works banner */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <RiLightbulbLine className="size-4 text-amber-500" />
          <h2 className="font-medium">How it works</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="flex gap-3">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`size-5 ${color}`} />
              </div>
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground border-t border-border pt-4">
          <strong>Example:</strong> A user types <em>"VPN keeps disconnecting after Windows update"</em> → the AI searches Qdrant →
          finds 5 resolved tickets with the same pattern → replies with the exact steps that fixed it in those past cases.
        </p>
      </div>

      {/* Upload zone */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="font-medium">Upload a Document</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add internal IT runbooks, policies, or manuals. Supported formats: <strong>PDF</strong>, <strong>TXT</strong>.
            Files are chunked, embedded, and stored in Qdrant automatically.
          </p>
        </div>

        <div
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 transition-colors cursor-pointer ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/40 hover:bg-muted/20"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt"
            onChange={handleFileSelect}
          />
          <RiUploadCloud2Line className={`size-10 mb-3 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
          <p className="font-medium text-sm">Drop a file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Max file size: 50 MB · PDF or TXT</p>
        </div>

        {uploadedFile && (
          <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${uploadError ? "border-destructive/30 bg-destructive/5" : "border-border bg-muted/30"}`}>
            <RiFileTextLine className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm flex-1 truncate">{uploadedFile}</span>
            {uploading ? (
              <span className="text-xs text-muted-foreground animate-pulse">Processing…</span>
            ) : uploadError ? (
              <span className="text-xs text-destructive">{uploadError}</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <RiCheckboxCircleLine className="size-3.5" />
                Indexed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Indexed collections */}
      <div className="space-y-4">
        <div>
          <h2 className="font-medium">Indexed Collections</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vector collections currently stored in Qdrant (local Docker).
          </p>
        </div>

        {COLLECTIONS.map((col) => (
          <div key={col.name} className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 shrink-0">
                  <RiDatabase2Line className="size-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">{col.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{col.source}</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500 shrink-0">
                <RiCheckboxCircleLine className="size-3.5" />
                {col.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Documents" value={col.documents.toLocaleString()} />
              <Stat label="Chunks" value={col.chunks.toLocaleString()} />
              <Stat label="Embed Model" value={col.model} />
              <Stat
                label="Last Updated"
                value={col.lastUpdated}
                icon={<RiTimeLine className="size-3.5 text-muted-foreground" />}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Ingest from HuggingFace */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="font-medium">Ingest from Hugging Face Dataset</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Load a public dataset directly into Qdrant. Ingestion runs in the background — the server will
            process all rows without blocking the UI.
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            defaultValue="KameronB/synthetic-it-callcenter-tickets"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring placeholder:text-muted-foreground"
            placeholder="e.g. username/dataset-name"
            readOnly
          />
          <button
            onClick={handleIngestDataset}
            disabled={ingestLoading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {ingestLoading ? "Starting…" : "Ingest"}
          </button>
        </div>
        {ingestStatus && (
          <p className="text-xs text-muted-foreground">{ingestStatus}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Calls <code className="bg-muted px-1 rounded">POST /documents/ingest-dataset</code> on the backend.
          Make sure Qdrant Docker is running: <code className="bg-muted px-1 rounded">docker run -p 6333:6333 qdrant/qdrant</code>
        </p>
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-lg bg-muted/40 px-4 py-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="flex items-center gap-1 text-sm font-medium">
        {icon}
        {value}
      </p>
    </div>
  )
}
