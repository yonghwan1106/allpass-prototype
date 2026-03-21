'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Heart, Home, Wallet, Users, AlertTriangle, CheckCircle, Scan } from 'lucide-react';
import { useAgentStore } from '@/lib/store/agent-store';
import type { CrisisCategory, CrisisLevel, CrisisSignal } from '@/lib/agents/types';

// ── Category config ────────────────────────────────────────────────────────

interface CategoryConfig {
  key: CrisisCategory;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
}

const CATEGORIES: CategoryConfig[] = [
  { key: 'employment', label: '고용', Icon: Briefcase, iconColor: 'text-blue-400' },
  { key: 'health',     label: '건강', Icon: Heart,     iconColor: 'text-rose-400' },
  { key: 'housing',    label: '주거', Icon: Home,      iconColor: 'text-amber-400' },
  { key: 'finance',    label: '재정', Icon: Wallet,    iconColor: 'text-emerald-400' },
  { key: 'family',     label: '가족', Icon: Users,     iconColor: 'text-purple-400' },
];

// ── Level helpers ──────────────────────────────────────────────────────────

const LEVEL_DOT: Record<CrisisLevel, string> = {
  normal:   'bg-emerald-500',
  caution:  'bg-yellow-500',
  warning:  'bg-orange-500',
  critical: 'bg-red-500',
};

const LEVEL_BADGE: Record<CrisisLevel, string> = {
  normal:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  caution:  'bg-yellow-500/10  text-yellow-400  border-yellow-500/20',
  warning:  'bg-orange-500/10  text-orange-400  border-orange-500/20',
  critical: 'bg-red-500/10     text-red-400     border-red-500/20',
};

const LEVEL_LABEL: Record<CrisisLevel, string> = {
  normal:   '정상',
  caution:  '주의',
  warning:  '경고',
  critical: '위험',
};

// ── Phase badge ────────────────────────────────────────────────────────────

function PhaseBadge({ phase }: { phase: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    idle:     { label: '대기',      cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
    scanning: { label: '스캔 중',   cls: 'bg-blue-500/10  text-blue-400  border-blue-500/20 animate-pulse' },
    detected: { label: '감지 완료', cls: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    matching: { label: '프로그램 매칭 중', cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse' },
    complete: { label: '분석 완료', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  };
  const c = config[phase] ?? config.idle;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.cls}`}>
      {c.label}
    </span>
  );
}

// ── Category card ──────────────────────────────────────────────────────────

function CategoryCard({
  config,
  signals,
  phase,
}: {
  config: CategoryConfig;
  signals: CrisisSignal[];
  phase: string;
}) {
  const { key, label, Icon, iconColor } = config;
  const categorySignals = signals.filter((s) => s.category === key);
  const topLevel: CrisisLevel =
    categorySignals.length === 0
      ? 'normal'
      : categorySignals.reduce<CrisisLevel>((max, s) => {
          const order: CrisisLevel[] = ['normal', 'caution', 'warning', 'critical'];
          return order.indexOf(s.level) > order.indexOf(max) ? s.level : max;
        }, 'normal');

  const isScanning = phase === 'scanning';
  const hasSignal = categorySignals.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: hasSignal ? '0 0 0 1px rgba(239,68,68,0.25)' : '0 0 0 0px transparent',
      }}
      className={`bg-ap-card rounded-lg p-2.5 border border-ap-border transition-colors ${
        hasSignal ? 'border-orange-500/30' : ''
      } ${isScanning ? 'animate-pulse' : ''}`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          <span className="text-xs font-medium text-slate-300">{label}</span>
        </div>
        <span className={`w-2 h-2 rounded-full shrink-0 ${LEVEL_DOT[topLevel]} ${isScanning ? 'animate-ping' : ''}`} />
      </div>

      {/* Signal list */}
      <AnimatePresence>
        {categorySignals.map((sig) => (
          <motion.div
            key={sig.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 overflow-hidden"
          >
            <div className="flex items-start justify-between gap-1">
              <div className="flex items-start gap-1 min-w-0">
                <AlertTriangle className="w-2.5 h-2.5 text-orange-400 mt-0.5 shrink-0" />
                <span className="text-[10px] text-slate-400 leading-tight truncate">{sig.label}</span>
              </div>
              <span className={`text-[9px] px-1 py-0.5 rounded border font-medium shrink-0 ${LEVEL_BADGE[sig.level]}`}>
                {LEVEL_LABEL[sig.level]}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Normal state label */}
      {categorySignals.length === 0 && !isScanning && (
        <div className="flex items-center gap-1">
          <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
          <span className="text-[10px] text-slate-600">이상 없음</span>
        </div>
      )}

      {/* Scanning state */}
      {isScanning && categorySignals.length === 0 && (
        <div className="flex items-center gap-1">
          <Scan className="w-2.5 h-2.5 text-blue-400 animate-spin" />
          <span className="text-[10px] text-slate-500">스캔 중...</span>
        </div>
      )}
    </motion.div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────

export function CrisisDetectionPanel() {
  const { crisisSignals, crisisPhase, crisisPrograms } = useAgentStore();

  const showPrograms = crisisPhase === 'matching' || crisisPhase === 'complete';

  return (
    <div className="flex flex-col h-full overflow-hidden bg-ap-panel">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-ap-border">
        <div className="flex items-center gap-1.5">
          <Scan className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300">선제적 위기 감지</span>
        </div>
        <PhaseBadge phase={crisisPhase} />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Category grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.key}
              config={cat}
              signals={crisisSignals}
              phase={crisisPhase}
            />
          ))}
        </div>

        {/* Matched welfare programs */}
        <AnimatePresence>
          {showPrograms && crisisPrograms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="space-y-1"
            >
              <div className="flex items-center gap-1.5 px-0.5">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  매칭된 복지 프로그램
                </span>
              </div>
              <div className="space-y-1">
                {crisisPrograms.map((program, i) => (
                  <motion.div
                    key={program.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-ap-card border border-ap-border rounded-lg px-2.5 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{program.name}</p>
                        <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                          {program.description}
                        </p>
                      </div>
                      {program.amount && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 whitespace-nowrap">
                          {program.amount}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Idle placeholder */}
        {crisisPhase === 'idle' && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Scan className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-xs text-slate-600">복지 시나리오 실행 시</p>
            <p className="text-xs text-slate-600">위기 신호를 자동으로 감지합니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
