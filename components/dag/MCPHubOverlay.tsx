'use client';

import { motion } from 'framer-motion';
import { useAgentStore } from '@/lib/store/agent-store';

interface MCPHubOverlayProps {
  isVisible: boolean;
}

const GOV_APIS = [
  { label: '정부24 API', protocol: 'REST', color: 'emerald' },
  { label: '행정정보공동이용', protocol: 'A2A', color: 'blue' },
  { label: '마이데이터', protocol: 'REST', color: 'emerald' },
];

export function MCPHubOverlay({ isVisible }: MCPHubOverlayProps) {
  const agents = useAgentStore(s => s.agents);
  const apiAgentRunning =
    agents.api.status === 'running' || agents.api.status === 'thinking';

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Central MCP HUB node */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative"
        >
          {/* Glow ring */}
          <div className="absolute -inset-4 rounded-full bg-indigo-500/20 blur-xl" />
          {/* Pulsing ring when API agent active */}
          {apiAgentRunning && (
            <motion.div
              className="absolute -inset-2 rounded-full border border-indigo-400/40"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          {/* Hub node */}
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 border-2 border-indigo-400/50 flex flex-col items-center justify-center shadow-2xl shadow-indigo-500/30">
            <span className="text-2xl">🔗</span>
            <span className="text-xs font-bold text-white mt-1">MCP HUB</span>
          </div>
        </motion.div>
      </div>

      {/* Connection lines with protocol labels */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        {/* All-Pass → MCP HUB (MCP protocol) */}
        <line
          x1="15%" y1="30%"
          x2="45%" y2="50%"
          stroke="rgba(99,102,241,0.4)"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <text x="23%" y="37%" fill="rgba(148,163,184,0.8)" fontSize="11" fontWeight="600">MCP</text>

        {/* MCP HUB → 정부24 API */}
        <line
          x1="55%" y1="50%"
          x2="83%" y2="25%"
          stroke="rgba(16,185,129,0.4)"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <text x="71%" y="33%" fill="rgba(148,163,184,0.8)" fontSize="11" fontWeight="600">REST</text>

        {/* MCP HUB → 행정정보공동이용 */}
        <line
          x1="55%" y1="50%"
          x2="83%" y2="50%"
          stroke="rgba(59,130,246,0.4)"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <text x="71%" y="47%" fill="rgba(148,163,184,0.8)" fontSize="11" fontWeight="600">A2A</text>

        {/* MCP HUB → 마이데이터 */}
        <line
          x1="55%" y1="50%"
          x2="83%" y2="75%"
          stroke="rgba(16,185,129,0.4)"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        <text x="71%" y="67%" fill="rgba(148,163,184,0.8)" fontSize="11" fontWeight="600">REST</text>

        {/* Animated data packets when API agent is active */}
        {apiAgentRunning && (
          <>
            <circle r="4" fill="#6366f1" opacity="0.9">
              <animateMotion dur="1.8s" repeatCount="indefinite" path="M 100,150 L 280,250" />
            </circle>
            <circle r="4" fill="#10b981" opacity="0.9">
              <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.6s" path="M 350,250 L 530,125" />
            </circle>
            <circle r="4" fill="#3b82f6" opacity="0.9">
              <animateMotion dur="1.8s" repeatCount="indefinite" begin="1.2s" path="M 350,250 L 530,250" />
            </circle>
          </>
        )}
      </svg>

      {/* Government API labels — right side */}
      <div className="absolute right-4 top-[15%] flex flex-col gap-3">
        {GOV_APIS.map((api, i) => (
          <motion.div
            key={api.label}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              api.color === 'emerald'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}
          >
            {api.label}
          </motion.div>
        ))}
      </div>

      {/* All-Pass label — left side */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="absolute left-4 top-[25%] px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs font-medium text-indigo-400"
      >
        All-Pass 에이전트
      </motion.div>

      {/* Status badge when API agent active */}
      {apiAgentRunning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-medium text-indigo-300"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          API 라우팅 중
        </motion.div>
      )}
    </div>
  );
}
