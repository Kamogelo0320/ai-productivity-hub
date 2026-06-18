import { AlertTriangle } from "lucide-react";

export function ResponsibleAIBar() {
  return (
    <div className="mx-6 mb-6 mt-2 flex flex-col gap-2 rounded-lg border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-2 sm:items-center">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning sm:mt-0" />
        <p className="text-[11px] leading-relaxed text-text-muted">
          <span className="font-semibold text-foreground">Responsible AI:</span>{" "}
          AI-generated content may contain inaccuracies. Review and verify important workplace
          communications, decisions, and recommendations before use.
        </p>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
        v1.0 · Synapse
      </span>
    </div>
  );
}
