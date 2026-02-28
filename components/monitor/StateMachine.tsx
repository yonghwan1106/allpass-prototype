'use client';

import { motion } from 'framer-motion';
import { useAgentStore } from '@/lib/store/agent-store';
import { WorkflowState } from '@/lib/agents/types';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAIN_STATES: { state: WorkflowState; label: string; icon: string }[] = [
  { state: 'INIT', label: '초기화', icon: '⚙️' },
  { state: 'PLANNING', label: '계획 수립', icon: '📋' },
  { state: 'EXECUTING', label: '실행 중', icon: '⚡' },
  { state: 'VALIDATING', label: '검증', icon: '✅' },
  { state: 'COMPLETED', label: '완료', icon: '🎉' },
];

const BRANCH_STATES: { state: WorkflowState; label: string; color: string }[] = [
  { state: 'RETRY', label: '재시도', color: '#f59e0b' },
  { state: 'HUMAN_REVIEW', label: '인간 검토', color: '#8b5cf6' },
];

const STATE_ORDER: WorkflowState[] = ['INIT', 'PLANNING', 'EXECUTING', 'VALIDATING', 'COMPLETED'];

function stateIndex(s: WorkflowState) {
  return STATE_ORDER.indexOf(s);
}

export function StateMachine() {
  const workflowState = useAgentStore((s) => s.workflowState);
  const currentIdx = stateIndex(workflowState);

  const isBranch = workflowState === 'RETRY' || workflowState === 'HUMAN_REVIEW';

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="flex items-center gap-0">
        {MAIN_STATES.map((item, i) => {
          const isDone = currentIdx > i && !isBranch;
          const isCurrent = workflowState === item.state;

          return (
            <div key={item.state} className="flex items-center">
              {/* State node */}
              <div className="flex flex-col items-center gap-1 relative">
                <motion.div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-500',
                    isDone
                      ? 'bg-green-500 border-green-500'
                      : isCurrent
                        ? 'bg-blue-600 border-blue-600'
                        : 'bg-gray-100 border-gray-200'
                  )}
                  animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={isCurrent ? { duration: 1.2, repeat: Infinity } : {}}
                >
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <span className={cn('text-xs', isCurrent ? 'text-white' : 'text-gray-400')}>
                      {item.icon}
                    </span>
                  )}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-blue-400"
                      animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                <span className={cn(
                  'text-xs whitespace-nowrap',
                  isCurrent ? 'text-blue-600 font-semibold' : isDone ? 'text-green-600' : 'text-gray-400'
                )}>
                  {item.label}
                </span>
              </div>

              {/* Connector line */}
              {i < MAIN_STATES.length - 1 && (
                <div className="w-12 h-0.5 mx-1 mb-5 relative bg-gray-200 overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-green-400"
                    initial={{ width: '0%' }}
                    animate={{ width: isDone ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Branch states */}
        <div className="ml-4 flex items-center gap-2">
          {BRANCH_STATES.map((branch) => (
            <div
              key={branch.state}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all duration-300',
                workflowState === branch.state
                  ? 'font-semibold shadow-md'
                  : 'opacity-40 border-gray-200 text-gray-400'
              )}
              style={
                workflowState === branch.state
                  ? { backgroundColor: branch.color + '20', borderColor: branch.color, color: branch.color }
                  : {}
              }
            >
              <span>{branch.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
