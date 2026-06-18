import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { AIOutputCard } from "@/components/AIOutputCard";
import { summarizeMeeting } from "@/lib/ai.functions";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer · Synapse" },
      { name: "description", content: "Turn raw meeting notes into clear summaries and action items." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (notes.trim().length < 20) {
      toast.error("Paste at least a paragraph of meeting notes.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const { text } = await summarizeMeeting({ data: { notes } });
      setOutput(text);
      addHistory({
        feature: "meetings",
        title: `Summary — ${notes.slice(0, 60).trim()}…`,
        input: notes,
        output: text,
      });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Meeting Notes Summarizer"
        description="Paste your raw notes — Synapse extracts the summary, decisions, and action items."
        icon={<FileText className="size-5" />}
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Meeting notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={12}
            placeholder="Paste the full meeting notes or transcript here…"
            className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              <Sparkles className="size-4" />
              {loading ? "Summarizing…" : "Summarize"}
            </button>
            <button
              type="button"
              onClick={() => {
                setNotes("");
                setOutput("");
              }}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-muted hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>

        <AIOutputCard
          loading={loading}
          output={output}
          title="Meeting Summary"
          downloadName="synapse-meeting-summary.txt"
          onRegenerate={submit}
          onClear={() => setOutput("")}
        />
      </div>
    </PageContainer>
  );
}
