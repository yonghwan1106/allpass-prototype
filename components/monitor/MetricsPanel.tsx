'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAgentStore } from '@/lib/store/agent-store';
import { Clock, TrendingDown, Bot, Plug, Scale, FileText } from 'lucide-react';

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    const from = prevTarget.current;
    prevTarget.current = target;
    startRef.current = null;

    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}

function CircularProgress({ percent }: { percent: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
      <motion.circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1, ease: 'easeOut' }}
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#60a5fa">
        {percent}%
      </text>
    </svg>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: string;
  special?: 'circle';
}

function MetricCard({ icon, label, value, unit, color, special }: MetricCardProps) {
  const displayed = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-card rounded-xl p-4 flex items-center gap-3"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + '26' }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 truncate">{label}</p>
        {special === 'circle' ? (
          <CircularProgress percent={value} />
        ) : (
          <p className="text-xl font-bold text-slate-100">
            {displayed}
            <span className="text-xs font-normal text-slate-500 ml-0.5">{unit}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function MetricsPanel() {
  const metrics = useAgentStore((s) => s.metrics);

  const m = metrics ?? {
    totalTime: 0,
    agentCalls: 0,
    apiCalls: 0,
    legalCitations: 0,
    documentsGenerated: 0,
    timeReduction: 0,
  };

  const cards: MetricCardProps[] = [
    { icon: <Clock className="w-4 h-4" />, label: '처리 시간', value: Math.round(m.totalTime / 1000), unit: '초', color: '#6366f1' },
    { icon: <TrendingDown className="w-4 h-4" />, label: '시간 단축률', value: m.timeReduction, unit: '%', color: '#3b82f6', special: 'circle' },
    { icon: <Bot className="w-4 h-4" />, label: '에이전트 호출', value: m.agentCalls, unit: '회', color: '#8b5cf6' },
    { icon: <Plug className="w-4 h-4" />, label: 'API 연동', value: m.apiCalls, unit: '회', color: '#10b981' },
    { icon: <Scale className="w-4 h-4" />, label: '법령 인용', value: m.legalCitations, unit: '건', color: '#ec4899' },
    { icon: <FileText className="w-4 h-4" />, label: '생성 서류', value: m.documentsGenerated, unit: '건', color: '#f59e0b' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 p-3 bg-[color:var(--ap-bg-deep)]">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  );
}
