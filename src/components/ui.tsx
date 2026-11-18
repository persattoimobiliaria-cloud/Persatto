import type { ReactNode } from 'react';

export function Ring({ value, size = 76, label }: { value: number; size?: number; label?: ReactNode }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-bg" strokeWidth={8} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-fg" strokeWidth={8} fill="none"
          strokeDasharray={c} strokeDashoffset={c - (v / 100) * c} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div className="ring-label">{label ?? `${Math.round(v)}%`}</div>
    </div>
  );
}

export function Bar({ value, tone }: { value: number; tone?: 'ok' | 'warn' | 'bad' }) {
  const v = Math.max(0, Math.min(100, value));
  const t = tone ?? (v >= 80 ? 'ok' : v >= 50 ? 'warn' : 'bad');
  return (
    <div className="bar">
      <div className={`bar-fill ${t}`} style={{ width: `${v}%` }} />
    </div>
  );
}

export function Section({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="section">
      <div className="section-head">
        <h3>{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

export const tone = (v: number) => (v >= 80 ? 'ok' : v >= 50 ? 'warn' : 'bad');

export function copy(text: string) {
  navigator.clipboard?.writeText(text).catch(() => undefined);
}
