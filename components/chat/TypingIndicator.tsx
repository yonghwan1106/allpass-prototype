'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '@/lib/store/agent-store';
import { AGENT_CONFIGS, AgentId } from '@/lib/agents/types';

export function TypingIndicator() {
  const agents = useAgentStore((s) => s.agents);

  const activeAgentId = (Object.keys(agents) as AgentId[]).find(
    (id) => agents[id].status === 'thinking' || agents[id].status === 'running'
  );

  const activeAgent = activeAgentId ? AGENT_CONFIGS[activeAgentId] : null;

  return (
    <AnimatePresence>
      {activeAgent && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 px-4 py-2"
        >
          {/* Agent avatar */}
          <div
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ backgroundColor: activeAgent.color + '26' }}
          >
            {activeAgent.icon}
          </div>

          <div className="flex items-center gap-2 bg-ap-card border border-ap-border rounded-2xl rounded-bl-sm px-4 py-3">
            {/* Bouncing dots */}
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-slate-500"
                  animate={{ y: [0, -6, 0], backgroundColor: ['#64748b', '#3b82f6', '#64748b'] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 ml-1">
              {activeAgent.icon} {activeAgent.nameKo}가 분석 중...
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
