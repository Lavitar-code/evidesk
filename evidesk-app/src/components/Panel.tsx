import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, children, className = "" }: PanelProps) {
  const finalClassName = className ? `panel ${className}` : "panel";

  return (
    <div className={finalClassName}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}