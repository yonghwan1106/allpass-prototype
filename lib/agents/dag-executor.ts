import type { DAGPlan, DAGNode, AgentId } from '@/lib/agents/types';
import type { AgentEventEmitter } from '@/lib/agents/event-emitter';
import { runLegalAgent } from '@/app/api/agents/legal';
import { runDocumentAgent } from '@/app/api/agents/document';
import { runAPIAgent } from '@/app/api/agents/api-agent';
import { runSchedulerAgent } from '@/app/api/agents/scheduler';
import { runValidatorAgent } from '@/app/api/agents/validator';

export class DAGExecutor {
  private results: Map<string, string> = new Map();
  private dag: DAGPlan;

  constructor(
    private emitter: AgentEventEmitter,
    dag: DAGPlan
  ) {
    this.dag = {
      ...dag,
      nodes: dag.nodes.map((n) => ({ ...n, status: 'pending' as const })),
    };
  }

  async execute(): Promise<Map<string, string>> {
    // Emit initial DAG state
    this.emitter.emitDAGUpdate(this.dag);

    while (true) {
      const ready = this.getReadyNodes();
      if (ready.length === 0) break;

      // Mark all ready nodes as running
      for (const node of ready) {
        this.setNodeStatus(node.id, 'running');
      }

      // Execute ready nodes in parallel
      await Promise.all(ready.map((node) => this.executeNode(node)));
    }

    return this.results;
  }

  private setNodeStatus(
    nodeId: string,
    status: DAGNode['status'],
    result?: string,
    duration?: number
  ): void {
    this.dag = {
      ...this.dag,
      nodes: this.dag.nodes.map((n) =>
        n.id === nodeId ? { ...n, status, ...(result !== undefined ? { result } : {}), ...(duration !== undefined ? { duration } : {}) } : n
      ),
    };
    this.emitter.emitDAGNodeUpdate(nodeId, status, result, duration);
    this.emitter.emitDAGUpdate(this.dag);
  }

  private async executeNode(node: DAGNode): Promise<void> {
    const start = Date.now();
    this.emitter.emitAgentStart(node.agentId, node.description);

    try {
      const result = await this.dispatchAgent(node);
      const duration = Date.now() - start;

      this.results.set(node.id, result);
      this.setNodeStatus(node.id, 'completed', result, duration);
      this.emitter.emitAgentResult(node.agentId, result, duration);
    } catch (err) {
      const duration = Date.now() - start;
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.results.set(node.id, errorMsg);
      this.setNodeStatus(node.id, 'error', errorMsg, duration);
    }
  }

  private async dispatchAgent(node: DAGNode): Promise<string> {
    const agentId: AgentId = node.agentId;
    const context = this.buildContext(node);

    switch (agentId) {
      case 'legal': {
        const res = await runLegalAgent(node.description, context);
        return res.analysis;
      }
      case 'document': {
        const res = await runDocumentAgent(node.description, context);
        return res.instructions;
      }
      case 'api': {
        const apiType = this.inferApiType(node);
        const res = await runAPIAgent(node.description, apiType, context);
        return JSON.stringify(res.response);
      }
      case 'scheduler': {
        const res = await runSchedulerAgent([node.description]);
        return res.estimatedTotal;
      }
      case 'validator': {
        const citations = context.citations as Array<{ lawName: string; article: string; content: string; relevance: string }> ?? [];
        const res = await runValidatorAgent(context, citations);
        return `검증 완료. 신뢰도 ${Math.round(res.confidence * 100)}%. ${res.issues.length === 0 ? '이슈 없음.' : res.issues.join(', ')}`;
      }
      case 'master':
      case 'planner':
      default: {
        // Master/Planner nodes in DAG act as coordinators — return summary
        await new Promise((r) => setTimeout(r, 500));
        return node.description + ' 완료';
      }
    }
  }

  private inferApiType(node: DAGNode): string {
    const label = node.label.toLowerCase() + ' ' + node.description.toLowerCase();
    if (label.includes('건축물')) return 'building_registry';
    if (label.includes('전입')) return 'resident_registration';
    if (label.includes('고용보험') || label.includes('실업')) return 'employment_insurance';
    if (label.includes('건강보험')) return 'health_insurance';
    if (label.includes('자동차')) return 'vehicle_registration';
    if (label.includes('위생교육') || label.includes('식품위생교육')) return 'food_education';
    if (label.includes('복지')) return 'welfare_benefits';
    return 'generic';
  }

  private buildContext(node: DAGNode): Record<string, unknown> {
    const ctx: Record<string, unknown> = { nodeId: node.id };
    // Include results of completed dependencies
    for (const depId of node.dependencies) {
      const depResult = this.results.get(depId);
      if (depResult) ctx[`dep_${depId}`] = depResult;
    }
    // Include all completed results for validator
    if (node.agentId === 'validator') {
      ctx.allResults = Object.fromEntries(this.results.entries());
    }
    return ctx;
  }

  private getReadyNodes(): DAGNode[] {
    return this.dag.nodes.filter((node) => {
      if (node.status !== 'pending') return false;
      return node.dependencies.every((depId) => {
        const dep = this.dag.nodes.find((n) => n.id === depId);
        return dep?.status === 'completed';
      });
    });
  }
}
