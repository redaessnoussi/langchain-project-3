import { useState, useRef, useEffect } from "react"
import {
  RiChat3Line,
  RiCloseLine,
  RiSendPlaneLine,
  RiRobot2Line,
} from "@remixicon/react"
import { sendChatMessage } from "@/services/api"
import type { ChatMessage } from "@/services/api"

export default function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your IT support AI. Ask me about any IT issue and I'll search our knowledge base of 27,602 resolved tickets to help.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const updated: ChatMessage[] = [...messages, { role: "user", content: text }]
    setMessages(updated)
    setInput("")
    setLoading(true)

    try {
      const reply = await sendChatMessage(updated)
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, the backend is unreachable. Make sure the server is running." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary">
              <RiRobot2Line className="size-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">IT Assistant</p>
              <p className="text-xs text-muted-foreground">
                RAG · GPT-4o-mini · Qdrant
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close chat"
            >
              <RiCloseLine className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm text-muted-foreground">
                  Searching knowledge base…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 border-t border-border p-3">
            <textarea
              className="flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring placeholder:text-muted-foreground"
              placeholder="Describe an IT issue…"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-40 transition-colors"
              aria-label="Send message"
            >
              <RiSendPlaneLine className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle bubble */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/80 transition-all"
        aria-label={open ? "Close chat" : "Open IT Assistant"}
      >
        {open ? (
          <RiCloseLine className="size-6" />
        ) : (
          <RiChat3Line className="size-6" />
        )}
      </button>
    </div>
  )
}
