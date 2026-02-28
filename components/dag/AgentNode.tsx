'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import { AGENT_CONFIGS, AgentId, DAGNode } from '@/lib/agents/types';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export interface AgentNodeData extends Record<string, unknown> {
  agentId: AgentId;
  label: string;
  description: string;
  status: DAGNode['status'];
  duration?: number;
  result?: string;
}

const statusStyles: Record<DAGNode['status'], string> = {
  pending: 'bg-slate-800/50 border-dashed border-slate-600/50 text-slate-400',
  running: 'bg-blue-950/60 border-blue-500/50 text-blue-200 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  completed: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.1)]',
  error: 'bg-rose-950/40 border-rose-500/40 text-rose-200',
};

function StatusIcon({ status }: { status: DAGNode['status'] }) {
  if (status === 'completed') return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
  if (status === 'error') return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
  if (status === 'running') return null;
  return <Clock className="w-3.5 h-3.5 text-slate-500" />;
}

export const AgentNode = memo(function AgentNode({ data }: NodeProps) {
  const d = data as AgentNodeData;
  const config = AGENT_CONFIGS[d.agentId];
  const isRunning = d.status === 'running';

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="!bg-slate-600 !border-slate-500 !w-2 !h-2" />

      {/* Glow ring when running */}
      {isRunning && (
        <motion.div
          className="absolute -inset-1 rounded-xl"
          style={{ backgroundColor: config.color + '26' }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div
        className={cn(
          'relative rounded-xl border-2 px-3 py-2.5 w-48 backdrop-blur-sm transition-all duration-300',
          statusStyles[d.status]
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base leading-none">{config.icon}</span>
          <span className="text-xs font-semibold truncate flex-1">{config.nameKo}</span>
          <StatusIcon status={d.status} />
        </div>

        {/* Task description */}
        <p className="text-xs opacity-60 leading-tight line-clamp-2">{d.description}</p>

        {/* Duration */}
        {d.status === 'completed' && d.duration != null && (
          <div className="mt-1.5 text-xs font-mono text-emerald-400">
            {d.duration}ms
          </div>
        )}

        {/* Running pulse bar */}
        {isRunning && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 rounded-full"
            style={{ backgroundColor: config.color }}
            initial={{ width: '0%' }}
            animate={{ width: ['0%', '100%', '0%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-slate-600 !border-slate-500 !w-2 !h-2" />
    </div>
  );
});
