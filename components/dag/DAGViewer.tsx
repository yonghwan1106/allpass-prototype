'use client';

import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  Node,
  Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAgentStore } from '@/lib/store/agent-store';
import { DAGNode, DAGEdge, AGENT_CONFIGS } from '@/lib/agents/types';
import { AgentNode, AgentNodeData } from './AgentNode';
import { AnimatedEdge } from './AnimatedEdge';
import { GitFork } from 'lucide-react';

const nodeTypes: NodeTypes = { agentNode: AgentNode };
const edgeTypes: EdgeTypes = { animatedEdge: AnimatedEdge };

/** Topological sort → assign level per node */
function assignLevels(nodes: DAGNode[], edges: DAGEdge[]): Map<string, number> {
  const levels = new Map<string, number>();
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  for (const n of nodes) {
    inDegree.set(n.id, 0);
    adjList.set(n.id, []);
  }
  for (const e of edges) {
    adjList.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) {
      queue.push(id);
      levels.set(id, 0);
    }
  }

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const currLevel = levels.get(curr) ?? 0;
    for (const next of adjList.get(curr) ?? []) {
      const nextLevel = Math.max(levels.get(next) ?? 0, currLevel + 1);
      levels.set(next, nextLevel);
      inDegree.set(next, (inDegree.get(next) ?? 1) - 1);
      if ((inDegree.get(next) ?? 0) === 0) queue.push(next);
    }
  }

  return levels;
}

function buildFlowElements(
  dagNodes: DAGNode[],
  dagEdges: DAGEdge[]
): { nodes: Node[]; edges: Edge[] } {
  const levels = assignLevels(dagNodes, dagEdges);
  const levelGroups = new Map<number, string[]>();

  for (const [id, level] of levels) {
    if (!levelGroups.has(level)) levelGroups.set(level, []);
    levelGroups.get(level)!.push(id);
  }

  const X_STEP = 220;
  const Y_STEP = 110;
  const positions = new Map<string, { x: number; y: number }>();

  for (const [level, ids] of levelGroups) {
    const totalH = (ids.length - 1) * Y_STEP;
    ids.forEach((id, i) => {
      positions.set(id, {
        x: level * X_STEP + 40,
        y: i * Y_STEP - totalH / 2 + 200,
      });
    });
  }

  const nodes: Node[] = dagNodes.map((n) => {
    const pos = positions.get(n.id) ?? { x: 0, y: 0 };
    const data: AgentNodeData = {
      agentId: n.agentId,
      label: n.label,
      description: n.description,
      status: n.status,
      duration: n.duration,
      result: n.result,
    };
    return {
      id: n.id,
      type: 'agentNode',
      position: pos,
      data,
    };
  });

  const edges: Edge[] = dagEdges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'animatedEdge',
    label: e.label,
    animated: false,
  }));

  return { nodes, edges };
}

export function DAGViewer() {
  const dag = useAgentStore((s) => s.dag);

  const { nodes, edges } = useMemo(() => {
    if (!dag) return { nodes: [], edges: [] };
    return buildFlowElements(dag.nodes, dag.edges);
  }, [dag]);

  if (!dag) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[color:var(--ap-bg-deep)] text-slate-500">
        <GitFork className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-sm font-medium">DAG 워크플로우</p>
        <p className="text-xs mt-1 opacity-70">민원을 입력하면 실행 계획이 시각화됩니다</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.4}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1e293b" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const d = n.data as AgentNodeData;
            const config = AGENT_CONFIGS[d.agentId];
            return config?.color ?? '#6366f1';
          }}
          maskColor="rgba(5,10,24,0.8)"
          className="!border !border-[color:var(--ap-border)] !rounded-lg !bg-[color:var(--ap-bg-panel)]"
        />
      </ReactFlow>
    </div>
  );
}
