import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { AIOutputCard } from "@/components/AIOutputCard";
import { generateEmail } from "@/lib/ai.functions";
import { addHistory } from "@/lib/history";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator · Synapse" },
      { name: "description", content: "Draft professional workplace emails with AI." },
    ],
  }),
  component: EmailPage,
});

type Tone = "formal" | "friendly" | "persuasive" | "professional" | "apologetic";

function EmailPage() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!purpose.trim() || !recipient.trim() || !keyPoints.trim()) {
      toast.error("Fill in purpose, recipient, and key points.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const { text } = await generateEmail({
        data: { purpose, recipient, keyPoints, tone },
      });
      setOutput(text);
      addHistory({
        feature: "email",
        title: `Email to ${recipient}`,
        input: `Purpose: ${purpose}\nRecipient: ${recipient}\nTone: ${tone}\n\nKey points:\n${keyPoints}`,
        output: text,
      });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setPurpose("");
    setRecipient("");
    setKeyPoints("");
    setTone("professional");
    setOutput("");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Smart Email Generator"
        description="Generate polished workplace emails with the right tone."
        icon={<Mail className="size-5" />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-border bg-surface p-6">
          <Field label="Purpose">
            <input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Request a project status update"
              className={inputCls}
            />
          </Field>
          <Field label="Recipient">
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. Sarah, Head of Marketing"
              className={inputCls}
            />
          </Field>
          <Field label="Key points">
            <textarea
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="Bullet points or sentences. What must the email cover?"
              rows={6}
              className={`${inputCls} resize-y`}
            />
          </Field>
          <Field label="Tone">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className={inputCls}
            >
              <option value="formal">Formal</option>
              <option value="friendly">Friendly</option>
              <option value="persuasive">Persuasive</option>
              <option value="professional">Professional</option>
              <option value="apologetic">Apologetic</option>
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
              {loading ? "Generating…" : "Generate Email"}
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-muted hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>

        <div>
          <AIOutputCard
            loading={loading}
            output={output}
            title="Generated Email"
            downloadName="synapse-email.txt"
            onRegenerate={submit}
            onClear={() => setOutput("")}
          />
        </div>
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
