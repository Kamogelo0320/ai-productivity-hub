import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ListChecks, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { AIOutputCard } from "@/components/AIOutputCard";
import { planTasks } from "@/lib/ai.functions";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner · Synapse" },
      { name: "description", content: "Turn your task list into a prioritized, scheduled plan." },
    ],
  }),
  component: TasksPage,
});

type Priority = "high" | "medium" | "low" | "mixed";

function TasksPage() {
  const [tasks, setTasks] = useState("");
  const [deadlines, setDeadlines] = useState("");
  const [priority, setPriority] = useState<Priority>("mixed");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (tasks.trim().length < 5) {
      toast.error("List at least one task.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const { text } = await planTasks({ data: { tasks, deadlines, priority } });
      setOutput(text);
      addHistory({
        feature: "tasks",
        title: `Plan — ${tasks.split("\n")[0]?.slice(0, 60) ?? "tasks"}`,
        input: `Tasks:\n${tasks}\n\nDeadlines:\n${deadlines}\n\nPriority: ${priority}`,
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
        title="AI Task Planner"
        description="Drop in your tasks. Get a daily schedule, weekly plan, and priority ranking."
        icon={<ListChecks className="size-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-border bg-surface p-6">
          <Field label="Tasks (one per line)">
            <textarea
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              rows={8}
              placeholder={"Finalize Q3 report\nReply to vendor proposal\nPrepare 15-min update for Friday"}
              className={`${inputCls} resize-y`}
            />
          </Field>
          <Field label="Deadlines (optional)">
            <textarea
              value={deadlines}
              onChange={(e) => setDeadlines(e.target.value)}
              rows={3}
              placeholder="Q3 report: Thu EOD. Vendor reply: by tomorrow."
              className={`${inputCls} resize-y`}
            />
          </Field>
          <Field label="Priority emphasis">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className={inputCls}
            >
              <option value="mixed">Mixed</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </Field>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              <Sparkles className="size-4" />
              {loading ? "Planning…" : "Generate Plan"}
            </button>
            <button
              type="button"
              onClick={() => {
                setTasks("");
                setDeadlines("");
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
          title="Your Plan"
          downloadName="synapse-plan.txt"
          onRegenerate={submit}
          onClear={() => setOutput("")}
        />
      </div>
    </PageContainer>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
