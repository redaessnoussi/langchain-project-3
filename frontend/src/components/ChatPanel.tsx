import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { sendChatMessage } from "@/services/api"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you?",
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

    const newUserMsg: Message = { role: "user", content: text }
    const updatedMessages = [...messages, newUserMsg]

    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    try {
      const reply = await sendChatMessage(updatedMessages) // pass full history
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
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
    <div className="flex h-[480px] flex-col overflow-hidden rounded-lg border border-border">
      {/* Message list */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
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
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2 border-t border-border bg-background p-3">
        <textarea
          className="max-h-[120px] min-h-[40px] flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none"
          rows={1}
          placeholder="Ask anything... (Enter to send)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()}>
          Send
        </Button>
      </div>
    </div>
  )
}
