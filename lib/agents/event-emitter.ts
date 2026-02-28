import type {
  SSEEvent,
  SSEEventType,
  AgentId,
  DAGPlan,
  DAGNode,
  LegalCitationEvent,
  PIIMaskingEvent,
  APICallEvent,
  MetricsUpdateEvent,
  WorkflowState,
} from '@/lib/agents/types';

export class AgentEventEmitter {
  private encoder: TextEncoder;
  private controller: ReadableStreamDefaultController | null;

  constructor() {
    this.encoder = new TextEncoder();
    this.controller = null;
  }

  createStream(): ReadableStream {
    return new ReadableStream({
      start: (controller) => {
        this.controller = controller;
      },
      cancel: () => {
        this.controller = null;
      },
    });
  }

  emit(event: SSEEvent): void {
    if (!this.controller) return;
    try {
      const data = `data: ${JSON.stringify(event)}\n\n`;
      this.controller.enqueue(this.encoder.encode(data));
    } catch {
      // controller may have been closed
    }
  }

  private makeEvent(type: SSEEventType, data: Record<string, unknown>): SSEEvent {
    return { type, timestamp: Date.now(), data };
  }

  emitAgentStart(agentId: AgentId, task: string): void {
    this.emit(this.makeEvent('agent_start', { agentId, task }));
  }

  emitAgentThinking(agentId: AgentId, thought: string): void {
    this.emit(this.makeEvent('agent_thinking', { agentId, thought }));
  }

  emitAgentResult(agentId: AgentId, result: string, duration: number): void {
    this.emit(this.makeEvent('agent_result', { agentId, result, duration }));
  }

  emitDAGUpdate(dag: DAGPlan): void {
    this.emit(this.makeEvent('dag_update', { dag }));
  }

  emitDAGNodeUpdate(
    nodeId: string,
    status: DAGNode['status'],
    result?: string,
    duration?: number
  ): void {
    this.emit(this.makeEvent('dag_node_update', { nodeId, status, result, duration }));
  }

  emitLegalCitation(citation: LegalCitationEvent['data']): void {
    this.emit(this.makeEvent('legal_citation', citation as unknown as Record<string, unknown>));
  }

  emitPIIMasking(data: PIIMaskingEvent['data']): void {
    this.emit(this.makeEvent('pii_masking', data as unknown as Record<string, unknown>));
  }

  emitAPICall(data: APICallEvent['data']): void {
    this.emit(this.makeEvent('api_call', data as unknown as Record<string, unknown>));
  }

  emitWorkflowState(state: WorkflowState): void {
    this.emit(this.makeEvent('workflow_state', { state }));
  }

  emitMessage(content: string): void {
    this.emit(this.makeEvent('message', { content }));
  }

  emitMetrics(metrics: MetricsUpdateEvent['data']): void {
    this.emit(this.makeEvent('metrics_update', metrics as unknown as Record<string, unknown>));
  }

  emitComplete(): void {
    this.emit(this.makeEvent('complete', {}));
  }

  close(): void {
    if (!this.controller) return;
    try {
      this.controller.close();
    } catch {
      // already closed
    }
    this.controller = null;
  }
}
