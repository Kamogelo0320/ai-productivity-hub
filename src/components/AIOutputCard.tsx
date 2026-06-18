import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Download, Pencil, RotateCcw, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Shimmer } from "./ai-elements/shimmer";

type Props = {
  loading?: boolean;
  output: string;
  onRegenerate?: () => void;
  onClear?: () => void;
  downloadName?: string;
  title?: string;
};

export function AIOutputCard({
  loading,
  output,
  onRegenerate,
  onClear,
  downloadName = "synapse-output.txt",
  title = "AI Output",
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(output);

  useEffect(() => {
    setDraft(output);
    setEditing(false);
  }, [output]);

  const copy = async () => {
    await navigator.clipboard.writeText(editing ? draft : output);
    toast.success("Copied to clipboard");
  };

  const download = () => {
    const blob = new Blob([editing ? draft : output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    document.body.append(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <Shimmer className="text-base">Generating response…</Shimmer>
      </div>
    );
  }

  if (!output) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
        <h3 className="font-display text-sm font-bold">{title}</h3>
        <div className="flex flex-wrap items-center gap-1">
          <ActionBtn icon={editing ? Check : Pencil} label={editing ? "Done" : "Edit"} onClick={() => setEditing((e) => !e)} />
          <ActionBtn icon={Copy} label="Copy" onClick={copy} />
          <ActionBtn icon={Download} label="Download" onClick={download} />
          {onRegenerate && (
            <ActionBtn icon={RotateCcw} label="Regenerate" onClick={onRegenerate} />
          )}
          {onClear && <ActionBtn icon={X} label="Clear" onClick={onClear} />}
        </div>
      </div>

      <div className="p-5">
        {editing ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[300px] w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ) : (
          <article className="prose prose-invert prose-sm max-w-none prose-headings:font-display prose-headings:tracking-tight prose-h2:text-base prose-h2:mt-5 prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
            <ReactMarkdown>{output}</ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
    >
      <Icon className="size-3.5" /> {label}
    </button>
  );
}
