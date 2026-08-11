import type { LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/60 mb-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-bold tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
