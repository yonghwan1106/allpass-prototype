'use client';

import { memo } from 'react';
import { EdgeProps, getBezierPath, useNodes } from '@xyflow/react';
import { DAGNode } from '@/lib/agents/types';
import { AgentNodeData } from './AgentNode';

export const AnimatedEdge = memo(function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
}: EdgeProps) {
  const nodes = useNodes();

  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);
  const sourceStatus = (sourceNode?.data as AgentNodeData)?.status as DAGNode['status'] | undefined;
  const targetStatus = (targetNode?.data as AgentNodeData)?.status as DAGNode['status'] | undefined;

  const isActive = sourceStatus === 'completed' && targetStatus === 'running';
  const isDone = sourceStatus === 'completed' && targetStatus === 'completed';

  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });

  let stroke = '#334155';
  if (isDone) stroke = '#10b981';
  else if (isActive) stroke = '#3b82f6';

  const animationId = `flow-${id}`;

  return (
    <>
      <defs>
        {isActive && (
          <style>{`
            @keyframes ${animationId} {
              from { stroke-dashoffset: 24; }
              to { stroke-dashoffset: 0; }
            }
          `}</style>
        )}
      </defs>

      {/* Base path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={stroke}
        strokeWidth={isActive || isDone ? 2.5 : 1.5}
        strokeDasharray={isActive ? '6 3' : undefined}
        style={isActive ? { animation: `${animationId} 0.5s linear infinite` } : undefined}
        className="transition-all duration-500"
      />

      {/* Particle dot moving along path */}
      {isActive && (
        <circle r="5" fill="#3b82f6" fillOpacity="0.9">
          <animateMotion
            dur="1.2s"
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}

      {isDone && (
        <circle r="4" fill="#10b981" fillOpacity="0.9">
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={edgePath}
          />
        </circle>
      )}
    </>
  );
});
