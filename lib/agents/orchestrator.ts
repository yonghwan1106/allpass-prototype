import type { ScenarioId, LegalCitation, MetricsUpdateEvent } from '@/lib/agents/types';
import type { AgentEventEmitter } from '@/lib/agents/event-emitter';
import { DAGExecutor } from '@/lib/agents/dag-executor';
import { runMasterAgent, synthesizeResponse } from '@/app/api/agents/master';
import { runPlannerAgent } from '@/app/api/agents/planner';
import { runLegalAgent } from '@/app/api/agents/legal';

const MAX_RETRIES = 3;

function maskPII(text: string): { masked: string; detectedTypes: string[] } {
  const detectedTypes: string[] = [];
  let masked = text;

  // Korean resident registration number: 000000-0000000
  if (/\d{6}-\d{7}/.test(masked)) {
    masked = masked.replace(/\d{6}-\d{7}/g, '******-*******');
    detectedTypes.push('주민등록번호');
  }

  // Phone numbers
  if (/01[016789]-?\d{3,4}-?\d{4}/.test(masked)) {
    masked = masked.replace(/01[016789]-?\d{3,4}-?\d{4}/g, '010-****-****');
    detectedTypes.push('전화번호');
  }

  // Korean address — mask building number
  if (/\d+번지|\d+-\d+/.test(masked)) {
    masked = masked.replace(/(\d+번지|\d+-\d+)/g, (m) => m.replace(/\d/g, '*'));
    detectedTypes.push('상세주소');
  }

  return { masked, detectedTypes };
}

export class Orchestrator {
  private emitter: AgentEventEmitter;
  private scenarioId: ScenarioId | null;
  private citations: LegalCitation[] = [];
  private metrics: MetricsUpdateEvent['data'] = {
    totalTime: 0,
    agentCalls: 0,
    apiCalls: 0,
    legalCitations: 0,
    documentsGenerated: 0,
    timeReduction: 0,
  };

  constructor(emitter: AgentEventEmitter) {
    this.emitter = emitter;
    this.scenarioId = null;
  }

  async processMessage(userMessage: string, scenarioId?: ScenarioId): Promise<void> {
    this.scenarioId = scenarioId ?? null;
    const startTime = Date.now();
    let retryCount = 0;

    while (retryCount <= MAX_RETRIES) {
      try {
        await this.run(userMessage, startTime);
        return;
      } catch (err) {
        retryCount++;
        if (retryCount > MAX_RETRIES) {
          this.emitter.emitWorkflowState('HUMAN_REVIEW');
          this.emitter.emitMessage(
            '처리 중 오류가 발생했습니다. 담당자에게 연결 중입니다. 잠시만 기다려주세요.'
          );
          this.emitter.emitComplete();
          this.emitter.close();
          return;
        }
        this.emitter.emitWorkflowState('RETRY');
        this.emitter.emitMessage(`재시도 중입니다... (${retryCount}/${MAX_RETRIES})`);
        console.error('Orchestrator error, retrying:', err);
        await new Promise((r) => setTimeout(r, 1000 * retryCount));
      }
    }
  }

  private async run(userMessage: string, startTime: number): Promise<void> {
    // ── INIT: PII masking ──────────────────────────────────────────────────
    this.emitter.emitWorkflowState('INIT');
    this.emitter.emitAgentStart('master', 'PII 마스킹 및 입력 전처리');

    const { masked, detectedTypes } = maskPII(userMessage);
    if (detectedTypes.length > 0) {
      this.emitter.emitPIIMasking({
        original: userMessage,
        masked,
        detectedTypes,
      });
    }
    this.emitter.emitAgentResult('master', 'PII 마스킹 완료', Date.now() - startTime);

    // ── PLANNING ──────────────────────────────────────────────────────────
    this.emitter.emitWorkflowState('PLANNING');

    // MasterAgent: intent analysis
    this.emitter.emitAgentStart('master', '의도 분석 중...');
    this.emitter.emitAgentThinking('master', '사용자 요청의 민원 유형과 필요 에이전트를 파악합니다.');
    const intentResult = await runMasterAgent(masked);
    this.metrics.agentCalls++;
    this.emitter.emitAgentResult('master', intentResult.summary, Date.now() - startTime);

    // PlannerAgent: DAG creation
    this.emitter.emitAgentStart('planner', 'DAG 실행 계획 수립 중...');
    this.emitter.emitAgentThinking('planner', '복합 민원을 병렬 처리 가능한 DAG로 분해합니다.');
    const dag = await runPlannerAgent(intentResult.intent, intentResult.category, this.scenarioId ?? undefined);
    this.metrics.agentCalls++;
    this.emitter.emitDAGUpdate(dag);
    this.emitter.emitAgentResult('planner', `DAG 생성 완료: ${dag.nodes.length}개 노드`, Date.now() - startTime);

    // ── EXECUTING ─────────────────────────────────────────────────────────
    this.emitter.emitWorkflowState('EXECUTING');

    const executor = new DAGExecutor(this.emitter, dag);
    const nodeResults = await executor.execute();

    this.metrics.agentCalls += dag.nodes.length;
    this.metrics.apiCalls += dag.nodes.filter((n) => n.agentId === 'api').length;

    // Collect legal citations from legal agent results
    for (const [, result] of nodeResults.entries()) {
      if (result && result.length > 0) {
        // Run legal agent to collect citations if needed
        try {
          const legalRes = await runLegalAgent(intentResult.intent);
          for (const c of legalRes.citations) {
            this.citations.push(c);
            this.emitter.emitLegalCitation(c);
          }
          this.metrics.legalCitations += legalRes.citations.length;
        } catch {
          // non-fatal
        }
        break; // only once
      }
    }

    // ── VALIDATING ────────────────────────────────────────────────────────
    this.emitter.emitWorkflowState('VALIDATING');

    const totalTime = Date.now() - startTime;
    this.metrics.totalTime = totalTime;
    this.metrics.documentsGenerated = dag.nodes.filter((n) => n.agentId === 'document').length;
    // Traditional processing takes ~3 weeks; show time reduction estimate
    this.metrics.timeReduction = Math.round((1 - totalTime / (21 * 24 * 3600 * 1000)) * 100);

    // Synthesize final response — emit keepalive events to prevent stream timeout
    this.emitter.emitAgentStart('master', '최종 응답을 합성하고 있습니다...');
    this.emitter.emitAgentThinking('master', '에이전트 결과를 종합하여 최종 안내문을 작성합니다.');

    const resultsRecord = Object.fromEntries(
      Array.from(nodeResults.entries()).map(([k, v]) => [k, v])
    );

    // Start keepalive interval to prevent stream disconnect during LLM call
    const keepalive = setInterval(() => {
      this.emitter.emitAgentThinking('master', '응답 생성 중...');
    }, 3000);

    let finalResponse: string;
    try {
      finalResponse = await synthesizeResponse(
        resultsRecord,
        this.citations,
        this.metrics,
        this.scenarioId ?? undefined
      );
    } finally {
      clearInterval(keepalive);
    }

    this.emitter.emitAgentResult('master', '응답 합성 완료', Date.now() - startTime);

    // ── COMPLETED ─────────────────────────────────────────────────────────
    this.emitter.emitWorkflowState('COMPLETED');
    this.emitter.emitMetrics(this.metrics);
    this.emitter.emitMessage(finalResponse);
    this.emitter.emitComplete();
    this.emitter.close();
  }
}
