import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { useSettings } from "@/lib/settings";
import { clearHistory } from "@/lib/history";
import { resetChat } from "@/lib/chat-storage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Synapse" },
      { name: "description", content: "Customize Synapse preferences and manage your data." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, update } = useSettings();

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Customize how Synapse looks and behaves."
        icon={<SettingsIcon className="size-5" />}
      />

      <div className="space-y-4">
        <Section title="Appearance">
          <Row label="Theme" desc="Switch between dark and light interface.">
            <select
              value={settings.theme}
              onChange={(e) => update({ theme: e.target.value as "dark" | "light" })}
              className={selectCls}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </Row>
        </Section>

        <Section title="AI Behaviour">
          <Row label="Response style" desc="How verbose AI responses should be.">
            <select
              value={settings.responseStyle}
              onChange={(e) =>
                update({ responseStyle: e.target.value as "concise" | "balanced" | "detailed" })
              }
              className={selectCls}
            >
              <option value="concise">Concise</option>
              <option value="balanced">Balanced</option>
              <option value="detailed">Detailed</option>
            </select>
          </Row>
          <Row
            label="Privacy mode"
            desc="Avoid sending personally identifying details when possible."
          >
            <Toggle
              checked={settings.privacyMode}
              onChange={(v) => update({ privacyMode: v })}
            />
          </Row>
        </Section>

        <Section title="Notifications">
          <Row label="Enable notifications" desc="Show success and error toasts in the app.">
            <Toggle
              checked={settings.notifications}
              onChange={(v) => update({ notifications: v })}
            />
          </Row>
        </Section>

        <Section title="Data">
          <Row label="Clear history" desc="Delete all stored AI outputs from this browser.">
            <button
              type="button"
              onClick={() => {
                clearHistory();
                toast.success("History cleared");
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-text-muted hover:text-destructive"
            >
              <Trash2 className="size-3.5" /> Clear history
            </button>
          </Row>
          <Row label="Reset chat" desc="Start a brand-new conversation in AI Chat.">
            <button
              type="button"
              onClick={() => {
                resetChat();
                toast.success("Chat reset");
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-text-muted hover:text-destructive"
            >
              <Trash2 className="size-3.5" /> Reset chat
            </button>
          </Row>
        </Section>

        <Section title="About">
          <div className="space-y-2 text-sm text-text-muted">
            <p>
              <span className="font-semibold text-foreground">Synapse</span> v1.0 — AI Workplace
              Productivity Assistant.
            </p>
            <p>
              AI-generated content may contain inaccuracies. You remain responsible for final
              workplace decisions. Avoid sharing sensitive information unnecessarily.
            </p>
          </div>
        </Section>
      </div>
    </PageContainer>
  );
}

const selectCls =
  "rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="border-b border-border px-5 py-3">
        <h2 className="font-display text-sm font-bold">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function Row({
  label,
  desc,
  children,
}: {
  label: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-text-muted">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-surface-hover"
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-background transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
