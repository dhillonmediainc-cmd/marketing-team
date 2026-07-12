import type { ReactNode } from "react";

export function PageHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Card({ title, sub, children }: { title?: string; sub?: string; children: ReactNode }) {
  return (
    <div className="card">
      {title && (
        <div className="card-title">
          {title} {sub && <span className="card-sub">— {sub}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Tile({
  label,
  value,
  hint,
  good,
}: {
  label: string;
  value: string;
  hint?: string;
  good?: boolean;
}) {
  return (
    <div className="tile">
      <div className="label">{label}</div>
      <div className={`value${good ? " good" : ""}`}>{value}</div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}
