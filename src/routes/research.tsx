import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { AIOutputCard } from "@/components/AIOutputCard";
import { researchTopic } from "@/lib/ai.functions";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant · Synapse" },
      { name: "description", content: "Get a structured workplace brief on any topic." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (topic.trim().length < 3) {
      toast.error("Enter a topic or question.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const { text } = await researchTopic({ data: { topic } });
      setOutput(text);
      addHistory({
        feature: "research",
        title: topic.slice(0, 80),
        input: topic,
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
        title="AI Research Assistant"
        description="Ask anything work-related — get an overview, insights, and next steps."
        icon={<Search className="size-5" />}
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Topic or question
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={4}
            placeholder="e.g. What are the trade-offs of moving from a quarterly to a monthly OKR cycle?"
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
              {loading ? "Researching…" : "Research"}
            </button>
            <button
              type="button"
              onClick={() => {
                setTopic("");
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
          title="Research Brief"
          downloadName="synapse-research.txt"
          onRegenerate={submit}
          onClear={() => setOutput("")}
        />
      </div>
    </PageContainer>
  );
}
