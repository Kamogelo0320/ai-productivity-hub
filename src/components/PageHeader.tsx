import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start gap-4">
      {icon && (
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      </div>
    </div>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>;
}
