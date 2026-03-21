'use client';

import { useRef, useEffect } from 'react';
import { useAgentStore } from '@/lib/store/agent-store';
import { AGENT_CONFIGS, AgentId, SSEEvent } from '@/lib/agents/types';
import { ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AuditPhase = 'Input' | 'Reasoning' | 'Output' | 'Validation' | 'Error' | 'System';

interface AuditEntry {
  id: string;
  timestamp: number;
  agentId?: AgentId;
  phase: AuditPhase;
  summary: string;
  detail: string;
  eventType: string;
}

const PHASE_STYLES: Record<AuditPhase, { badge: string; dot: string }> = {
  Input:      { badge: 'bg-sky-500/15 text-sky-300 border-sky-500/25',      dot: 'bg-sky-400' },
  Reasoning:  { badge: 'bg-violet-500/15 text-violet-300 border-violet-500/25', dot: 'bg-violet-400' },
  Output:     { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25', dot: 'bg-emerald-400' },
  Validation: { badge: 'bg-amber-500/15 text-amber-300 border-amber-500/25',  dot: 'bg-amber-400' },
  Error:      { badge: 'bg-red-500/15 text-red-300 border-red-500/25',       dot: 'bg-red-400' },
  System:     { badge: 'bg-slate-500/15 text-slate-400 border-slate-500/25', dot: 'bg-slate-500' },
};

function toAuditEntry(event: SSEEvent, index: number): AuditEntry {
  const d = event.data as Record<string, unknown>;

  switch (event.type) {
    case 'agent_start':
      return {
        id: `${index}`,
        timestamp: event.timestamp,
        agentId: d.agentId as AgentId,
        phase: 'Input',
        summary: '작업 수신',
        detail: String(d.task ?? ''),
        eventType: event.type,
      };
    case 'agent_thinking':
      return {
        id: `${index}`,
        timestamp: event.timestamp,
        agentId: d.agentId as AgentId,
        phase: 'Reasoning',
        summary: '추론 중',
        detail: String(d.thought ?? '').slice(0, 120),
        eventType: event.type,
      };
    case 'agent_result':
      return {
        id: `${index}`,
        timestamp: event.timestamp,
        agentId: d.agentId as AgentId,
        phase: 'Output',
        summary: `결과 생성 (${d.duration as number}ms)`,
        detail: String(d.result ?? '').slice(0, 120),
        eventType: event.type,
      };
    case 'agent_error':
      return {
        id: `${index}`,
        timestamp: event.timestamp,
        agentId: d.agentId as AgentId,
        phase: 'Error',
        summary: '오류 발생',
        detail: String(d.error ?? '처리 중 오류가 감지되었습니다'),
        eventType: event.type,
      };
    case 'workflow_state':
      return {
        id: `${index}`,
        timestamp: event.timestamp,
        phase: 'Validation',
        summary: `워크플로우 전환 → ${d.state as string}`,
        detail: `상태 머신 전이: ${d.state as string}`,
        eventType: event.type,
      };
    case 'pii_masking':
      return {
        id: `${index}`,
        timestamp: event.timestamp,
        phase: 'Validation',
        summary: `PII 마스킹 (${(d.detectedTypes as string[])?.join(', ')})`,
        detail: `감지된 개인정보 유형: ${(d.detectedTypes as string[])?.join(', ')}`,
        eventType: event.type,
      };
    case 'legal_citation':
      return {
        id: `${index}`,
        timestamp: event.timestamp,
        phase: 'Output',
        summary: `법령 인용: ${d.lawName as string}`,
        detail: `${d.lawName as string} ${d.article as string}`,
        eventType: event.type,
      };
    case 'api_call':
      return {
        id: `${index}`,
        timestamp: event.timestamp,
        phase: 'Output',
        summary: `API 호출: ${d.method as string} ${d.endpoint as string}`,
        detail: `응답 코드: ${d.status as number} | 응답시간: ${d.responseTime as number}ms`,
        eventType: event.type,
      };
    default:
      return {
        id: `${index}`,
        timestamp: event.timestamp,
        phase: 'System',
        summary: event.type,
        detail: '',
        eventType: event.type,
      };
  }
}

const ADMIN_INFO_ITEMS = [
  { document: '주민등록초본', source: '행정안전부', icon: '📋' },
  { document: '건축물대장', source: '국토교통부', icon: '🏗️' },
  { document: '위생교육이수증', source: '식품의약품안전처', icon: '📜' },
  { document: '소방시설점검표', source: '소방청', icon: '🚒' },
  { document: '사업자등록증', source: '국세청', icon: '💼' },
];

export function AuditTrail() {
  const { eventLog, apiCalls } = useAgentStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const entries: AuditEntry[] = eventLog.map((e, i) => toAuditEntry(e, i));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div className="flex flex-col h-full bg-ap-deep">
      <div className="cmd-panel-header">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-slate-300">AI Audit Trail</h3>
        {entries.length > 0 && (
          <span className="ml-auto text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-2 py-0.5 font-medium">
            {entries.length}건
          </span>
        )}
      </div>

      {apiCalls.length > 0 && (
        <div className="px-3 py-3 border-b border-ap-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center">
              <FileCheck className="w-3 h-3 text-emerald-400" />
            </div>
            <h4 className="text-xs font-semibold text-emerald-400">행정정보공동이용</h4>
            <span className="text-[10px] text-slate-500 ml-auto">서류 제출 불필요</span>
          </div>
          <div className="space-y-2">
            {ADMIN_INFO_ITEMS.map((item, i) => (
              <motion.div
                key={item.document}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
              >
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-[10px]">{item.icon}</span>
                  <span className="text-xs text-slate-300 truncate">{item.document}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">→</span>
                  <span className="text-[10px] text-emerald-400 font-medium whitespace-nowrap">{item.source}</span>
                </div>
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              </motion.div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 ml-1">
            전자정부법 제36조에 따라 행정정보의 공동이용으로 서류 제출을 대체합니다
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-slate-600">
            <ShieldCheck className="w-6 h-6 mb-1 opacity-30" />
            <p className="text-xs">민원 처리를 시작하면 감사 기록이 표시됩니다</p>
          </div>
        ) : (
          <div className="relative px-3 py-2">
            {/* Timeline line */}
            <div className="absolute left-[28px] top-2 bottom-2 w-px bg-ap-border" />

            <AnimatePresence initial={false}>
              {entries.map((entry, i) => {
                const config = entry.agentId ? AGENT_CONFIGS[entry.agentId] : null;
                const phase = PHASE_STYLES[entry.phase];
                const time = new Date(entry.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i === entries.length - 1 ? 0.05 : 0 }}
                    className="relative flex gap-3 mb-3 pl-2"
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 shrink-0 flex items-center justify-center w-5 h-5 mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${phase.dot}`} />
                    </div>

                    {/* Card */}
                    <div className="flex-1 min-w-0 bg-ap-card border border-ap-border rounded-lg p-2.5 space-y-1.5">
                      {/* Row 1: time + phase badge + agent badge */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-600 font-mono shrink-0">{time}</span>

                        {/* Phase badge */}
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${phase.badge}`}>
                          {entry.phase}
                        </span>

                        {/* Agent badge */}
                        {config && (
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: config.color + '1a',
                              color: config.color,
                            }}
                          >
                            {config.icon} {config.nameKo.replace(' 에이전트', '')}
                          </span>
                        )}
                      </div>

                      {/* Row 2: summary */}
                      <p className="text-xs text-slate-300 font-medium leading-snug">
                        {entry.summary}
                      </p>

                      {/* Row 3: detail (if any) */}
                      {entry.detail && (
                        <p className="text-[11px] text-slate-500 leading-relaxed break-words">
                          {entry.detail}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}
