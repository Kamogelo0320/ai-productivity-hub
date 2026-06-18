import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { MessageSquare, RotateCcw, Send, Square, Sparkle } from "lucide-react";
import { toast } from "sonner";
import { loadChat, saveChat, resetChat } from "@/lib/chat-storage";
import { addHistory } from "@/lib/history";
import { Shimmer } from "@/components/ai-elements/shimmer";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat · Synapse" },
      { name: "description", content: "Conversational AI assistant for workplace tasks." },
    ],
  }),
  component: ChatPage,
});

const suggestions = [
  "Write a project update email.",
  "Summarize these meeting notes.",
  "Plan my workday.",
  "Explain a business concept.",
  "Help me prepare for a presentation.",
];

function ChatPage() {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);

  useEffect(() => {
    setInitial(loadChat());
  }, []);

  if (!initial) {
    return (
      <div className="px-6 py-10 text-sm text-text-muted">Loading conversation…</div>
    );
  }

  return <ChatInner initial={initial} />;
}

function ChatInner({ initial }: { initial: UIMessage[] }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, setMessages, error } = useChat({
    id: "synapse-main",
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (err) => toast.error(err.message || "Chat request failed"),
    onFinish: ({ message }) => {
      const text = getText(message);
      if (text) {
        addHistory({
          feature: "chat",
          title: text.slice(0, 80),
          input: "",
          output: text,
        });
      }
    },
  });

  // Persist on every change
  useEffect(() => {
    saveChat(messages);
  }, [messages]);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  // Focus textarea
  useEffect(() => {
    textareaRef.current?.focus();
  }, [status]);

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value || isLoading) return;
    setInput("");
    await sendMessage({ text: value });
  };

  const newConversation = () => {
    if (isLoading) return;
    setMessages([]);
    resetChat();
    toast.success("Started a new conversation");
  };

  const empty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
            <MessageSquare className="size-4" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold">AI Chat Assistant</h1>
            <p className="text-xs text-text-muted">Single ongoing conversation · saved in your browser</p>
          </div>
        </div>
        <button
          type="button"
          onClick={newConversation}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-text-muted hover:text-foreground"
        >
          <RotateCcw className="size-3.5" /> New conversation
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {empty ? (
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Sparkle className="size-6" />
            </div>
            <h2 className="font-display text-xl font-bold">How can I help today?</h2>
            <p className="mt-1 text-sm text-text-muted">Try one of these prompts to get started.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSubmit(s)}
                  className="rounded-lg border border-border bg-surface px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-surface-hover"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {status === "submitted" && (
              <Shimmer className="text-sm">Thinking…</Shimmer>
            )}
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive-foreground">
                {error.message}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="border-t border-border bg-background p-3 sm:p-4"
      >
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-surface p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask Synapse anything…"
            rows={1}
            className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-text-muted focus:outline-none"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={() => stop()}
              className="grid size-9 place-items-center rounded-lg bg-destructive text-destructive-foreground hover:opacity-90"
              aria-label="Stop"
            >
              <Square className="size-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="size-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = getText(message);
  if (!text) return null;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full">
      <article className="prose prose-invert prose-sm max-w-none prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
        <ReactMarkdown>{text}</ReactMarkdown>
      </article>
    </div>
  );
}

function getText(m: UIMessage): string {
  return m.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { text: string }).text)
    .join("");
}
