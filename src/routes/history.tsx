import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { History as HistoryIcon, Trash2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { clearHistory, removeHistory, useHistory, type HistoryItem } from "@/lib/history";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History · Synapse" },
      { name: "description", content: "Browse and revisit your saved AI outputs." },
    ],
  }),
  component: HistoryPage,
});

const featureLabel: Record<string, string> = {
  email: "Smart Email",
  meetings: "Meeting Notes",
  tasks: "Task Planner",
  research: "Research",
  chat: "AI Chat",
};

function HistoryPage() {
  const items = useHistory();
  const [open, setOpen] = useState<HistoryItem | null>(null);

  return (
    <PageContainer>
      <div className="mb-6 flex items-end justify-between gap-4">
        <PageHeader
          title="History"
          description="Everything you've generated, saved locally in your browser."
          icon={<HistoryIcon className="size-5" />}
        />
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clearHistory();
              toast.success("History cleared");
            }}
            className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-text-muted hover:text-destructive"
          >
            <Trash2 className="size-3.5" /> Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center">
          <HistoryIcon className="mb-3 size-6 text-text-muted" />
          <p className="text-sm font-medium">No history yet</p>
          <p className="mt-1 text-xs text-text-muted">Use any AI tool to start building your history.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {items.map((item, i) => (
            <div
              key={item.id}
              className={`flex flex-wrap items-center gap-3 px-5 py-4 ${
                i > 0 ? "border-t border-border" : ""
              }`}
            >
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {featureLabel[item.feature] ?? item.feature}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-[11px] text-text-muted">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(item)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-text-muted hover:text-foreground"
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => {
                  removeHistory(item.id);
                  toast.success("Entry removed");
                }}
                aria-label="Delete"
                className="rounded-md border border-border bg-background p-1.5 text-text-muted hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {featureLabel[open.feature]}
                </p>
                <h3 className="truncate font-display text-base font-bold">{open.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-hover hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-5">
              <article className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{open.output}</ReactMarkdown>
              </article>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
