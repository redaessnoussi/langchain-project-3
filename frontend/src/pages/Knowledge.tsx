import { useState, useRef } from "react"
import {
  RiUploadCloud2Line,
  RiDatabase2Line,
  RiFileTextLine,
  RiCheckboxCircleLine,
  RiTimeLine,
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

export default function Knowledge() {
  const [dragging, setDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) simulateUpload(file.name)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) simulateUpload(file.name)
  }

  const simulateUpload = async (name: string) => {
    setUploading(true)
    setUploadedFile(name)
    await new Promise((r) => setTimeout(r, 2000))
    setUploading(false)
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload documents or connect datasets to expand the AI assistant's knowledge.
        </p>
      </div>

      {/* Upload zone */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <h2 className="font-medium">Upload a Document</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Supported formats: PDF, TXT, DOCX — files will be chunked, embedded, and stored in Qdrant.
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
            accept=".pdf,.txt,.docx"
            onChange={handleFileSelect}
          />
          <RiUploadCloud2Line className={`size-10 mb-3 ${dragging ? "text-primary" : "text-muted-foreground"}`} />
          <p className="font-medium text-sm">Drop a file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Max file size: 50 MB</p>
        </div>

        {/* Upload status */}
        {uploadedFile && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <RiFileTextLine className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm flex-1 truncate">{uploadedFile}</span>
            {uploading ? (
              <span className="text-xs text-muted-foreground animate-pulse">Processing…</span>
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
            Vector collections currently stored in Qdrant.
          </p>
        </div>

        {COLLECTIONS.map((col) => (
          <div
            key={col.name}
            className="rounded-xl border border-border bg-card p-6 space-y-5"
          >
            {/* Collection header */}
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

            {/* Stats grid */}
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
            Load a public dataset directly into Qdrant — no file upload needed.
          </p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            defaultValue="KameronB/synthetic-it-callcenter-tickets"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring placeholder:text-muted-foreground"
            placeholder="e.g. username/dataset-name"
          />
          <button
            disabled
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50 cursor-not-allowed"
          >
            Ingest
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Backend integration coming soon — this will call <code className="bg-muted px-1 rounded">POST /documents/ingest-dataset</code>.
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
