import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageSquare,
  History as HistoryIcon,
  ArrowRight,
  Sparkle,
} from "lucide-react";
import { useFeatureCounts, useHistory } from "@/lib/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Synapse" },
      {
        name: "description",
        content: "Your AI workplace productivity overview, quick actions, and recent activity.",
      },
    ],
  }),
  component: Dashboard,
});

const features = [
  {
    to: "/email",
    label: "Smart Email",
    desc: "Draft polished workplace emails in seconds.",
    icon: Mail,
    accent: "text-primary",
  },
  {
    to: "/meetings",
    label: "Meeting Notes",
    desc: "Turn raw notes into summaries and action items.",
    icon: FileText,
    accent: "text-success",
  },
  {
    to: "/tasks",
    label: "Task Planner",
    desc: "Prioritize and schedule your day with AI.",
    icon: ListChecks,
    accent: "text-warning",
  },
  {
    to: "/research",
    label: "Research",
    desc: "Get a structured brief on any workplace topic.",
    icon: Search,
    accent: "text-primary",
  },
  {
    to: "/chat",
    label: "AI Chat",
    desc: "Conversational assistant for everything else.",
    icon: MessageSquare,
    accent: "text-success",
  },
] as const;

function Dashboard() {
  const counts = useFeatureCounts();
  const recent = useHistory().slice(0, 5);

  const stats = [
    { label: "Emails Generated", value: counts.email },
    { label: "Meetings Summarized", value: counts.meetings },
    { label: "Tasks Planned", value: counts.tasks },
    { label: "Research Sessions", value: counts.research },
    { label: "AI Chats", value: counts.chat },
  ];

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-muted">
          <Sparkle className="size-3 text-primary" /> Welcome back
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Good to see you, Alex.</h1>
        <p className="mt-1 text-text-muted">
          Synapse is ready to help with emails, summaries, planning, and research.
        </p>
      </section>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/30"
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              {s.label}
            </div>
            <div className="mt-1 font-display text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <section className="mb-10">
        <h2 className="mb-4 font-display text-lg font-bold">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.to}
                to={f.to}
                className="group flex flex-col items-start rounded-2xl border border-border bg-surface p-6 text-left transition-all hover:bg-surface-hover"
              >
                <div className={`mb-4 grid size-10 place-items-center rounded-lg bg-background ${f.accent}`}>
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display font-bold">{f.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">{f.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open <ArrowRight className="size-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent activity */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent Activity</h2>
          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="size-3" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
            <HistoryIcon className="mb-3 size-6 text-text-muted" />
            <p className="text-sm font-medium">No activity yet</p>
            <p className="mt-1 text-xs text-text-muted">
              Use a tool above to start building your history.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            {recent.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="size-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-[11px] text-text-muted">
                      {featureLabel(item.feature)} ·{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Link
                  to="/history"
                  className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-text-muted hover:text-foreground"
                >
                  Open
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function featureLabel(f: string) {
  return (
    {
      email: "Smart Email",
      meetings: "Meeting Notes",
      tasks: "Task Planner",
      research: "Research",
      chat: "AI Chat",
    } as Record<string, string>
  )[f] ?? f;
}
