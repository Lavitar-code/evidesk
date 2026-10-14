import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  eyebrow?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  eyebrow = "Workspace",
}: PageHeaderProps) {
  return (
    <header className="topbar">
      <div className="topbar-copy">
        <p className="topbar-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {actions ? <div className="topbar-actions">{actions}</div> : null}
    </header>
  );
}