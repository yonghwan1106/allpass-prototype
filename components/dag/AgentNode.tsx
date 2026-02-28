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
  pending: 'bg-gray-50 border-dashed border-gray-300 text-gray-500',
  running: 'bg-blue-50 border-blue-400 text-blue-800',
  completed: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
};

function StatusIcon({ status }: { status: DAGNode['status'] }) {
  if (status === 'completed') return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
  if (status === 'error') return <XCircle className="w-3.5 h-3.5 text-red-500" />;
  if (status === 'running') return null;
  return <Clock className="w-3.5 h-3.5 text-gray-400" />;
}

export const AgentNode = memo(function AgentNode({ data }: NodeProps) {
  const d = data as AgentNodeData;
  const config = AGENT_CONFIGS[d.agentId];
  const isRunning = d.status === 'running';

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} className="!bg-gray-300 !border-gray-400 !w-2 !h-2" />

      {/* Glow ring when running */}
      {isRunning && (
        <motion.div
          className="absolute -inset-1 rounded-xl"
          style={{ backgroundColor: config.color + '30' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div
        className={cn(
          'relative rounded-xl border-2 px-3 py-2.5 w-44 shadow-sm transition-all duration-300',
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
        <p className="text-xs opacity-70 leading-tight line-clamp-2">{d.description}</p>

        {/* Duration */}
        {d.status === 'completed' && d.duration != null && (
          <div className="mt-1.5 text-xs font-medium text-green-600">
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

      <Handle type="source" position={Position.Right} className="!bg-gray-300 !border-gray-400 !w-2 !h-2" />
    </div>
  );
});
