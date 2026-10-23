"use client";
import { useId } from "react";

interface Props { data: number[]; height?: number; stroke?: string; fill?: boolean; className?: string; grid?: boolean }

/** Dependency-free SVG line/area chart. Path updates every tick; CSS transition keeps it smooth. */
export default function LiveChart({ data, height = 220, stroke = "#E6C36A", fill = true, className = "", grid = true }: Props) {
  const id = useId().replace(/:/g, "");
  const W = 600;
  if (data.length < 2) return <div className={className} style={{ height }} aria-hidden />;
  const min = Math.min(...data), max = Math.max(...data), pad = (max - min) * 0.12 || 1;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => height - ((v - (min - pad)) / (max - min + pad * 2)) * height;
  const line = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${height} L0 ${height} Z`;
  const last = data[data.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className={className} style={{ height }} role="img" aria-label="Live telemetry chart">
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity=".32" />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {grid && [0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={height * f} y2={height * f} stroke="rgba(255,255,255,.06)" strokeDasharray="3 6" />)}
      {fill && <path d={area} fill={`url(#g${id})`} />}
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={W} cy={y(last)} r="4" fill={stroke} />
      <circle cx={W} cy={y(last)} r="10" fill={stroke} opacity=".25" className="animate-pulseDot" />
    </svg>
  );
}

export function Bars({ values, color = "#E6C36A", height = 90 }: { values: number[]; color?: string; height?: number }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }} aria-hidden>
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-sm transition-all duration-700 ease-out" style={{ height: `${(v / max) * 100}%`, background: `linear-gradient(${color}, ${color}33)` }} />
      ))}
    </div>
  );
}
