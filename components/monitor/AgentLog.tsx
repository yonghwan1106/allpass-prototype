'use client';

import { useEffect, useRef, useState } from 'react';
import { useAgentStore } from '@/lib/store/agent-store';
import { AGENT_CONFIGS, AgentId, SSEEvent } from '@/lib/agents/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function getAgentFromEvent(event: SSEEvent): { agentId?: AgentId; message: string } {
  const d = event.data as Record<string, unknown>;
  switch (event.type) {
    case 'agent_start':
      return { agentId: d.agentId as AgentId, message: `시작: ${d.task as string}` };
    case 'agent_thinking':
      return { agentId: d.agentId as AgentId, message: `분석 중: ${d.thought as string}` };
    case 'agent_result':
      return { agentId: d.agentId as AgentId, message: `완료 (${d.duration as number}ms): ${(d.result as string).slice(0, 60)}...` };
    case 'agent_error':
      return { agentId: d.agentId as AgentId, message: `오류 발생` };
    case 'workflow_state':
      return { message: `워크플로우 상태: ${d.state as string}` };
    case 'dag_update':
      return { message: 'DAG 계획 생성됨' };
    case 'dag_node_update':
      return { message: `노드 ${d.nodeId as string} → ${d.status as string}` };
    case 'legal_citation':
      return { message: `법령 인용: ${d.lawName as string} ${d.article as string}` };
    case 'pii_masking':
      return { message: `PII 마스킹 처리 (${(d.detectedTypes as string[]).join(', ')})` };
    case 'api_call':
      return { message: `API 호출: ${d.method as string} ${d.endpoint as string} → ${d.status as number}` };
    case 'metrics_update':
      return { message: '메트릭 업데이트' };
    case 'complete':
      return { message: '처리 완료' };
    default:
      return { message: event.type };
  }
}

function TypingText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        clearInterval(interval);
        onDone?.();
      }
    }, 18);
    return () => clearInterval(interval);
  }, [text, onDone]);

  return <span>{displayed}</span>;
}

export function AgentLog() {
  const eventLog = useAgentStore((s) => s.eventLog);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [eventLog]);

  return (
    <div className="flex flex-col h-full bg-[color:var(--ap-bg-deep)]">
      <div className="cmd-panel-header">
        <Activity className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-slate-300">에이전트 활동 로그</h3>
        {eventLog.length > 0 && (
          <span className="ml-auto text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5 font-medium">
            {eventLog.length}
          </span>
        )}
      </div>

      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-3 space-y-1.5 terminal-log">
          {eventLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-slate-600">
              <Activity className="w-6 h-6 mb-1 opacity-30" />
              <p>활동 로그가 여기에 표시됩니다</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {eventLog.map((event, i) => {
                const { agentId, message } = getAgentFromEvent(event);
                const config = agentId ? AGENT_CONFIGS[agentId] : null;
                const time = new Date(event.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="terminal-log-entry flex items-start gap-2 py-0.5"
                  >
                    <span className="shrink-0 text-slate-600 text-[10px] pt-0.5 w-16">{time}</span>
                    {config && (
                      <span
                        className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: config.color + '1a', color: config.color }}
                      >
                        {config.icon} {config.nameKo.replace(' 에이전트', '')}
                      </span>
                    )}
                    <span className="text-slate-400 leading-relaxed">
                      {i === eventLog.length - 1 ? (
                        <TypingText text={message} />
                      ) : (
                        message
                      )}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
