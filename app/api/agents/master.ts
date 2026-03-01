import type { AgentId, LegalCitation, MetricsUpdateEvent, ScenarioId } from '@/lib/agents/types';

const IS_SIMULATION = !process.env.ANTHROPIC_API_KEY;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => delay(200 + Math.random() * 400);

export async function runMasterAgent(
  input: string,
  context?: Record<string, unknown>
): Promise<{
  intent: string;
  category: string;
  complexity: 'simple' | 'complex' | 'multi';
  requiredAgents: AgentId[];
  summary: string;
}> {
  void context;

  if (IS_SIMULATION) {
    await randomDelay();

    const lower = input.toLowerCase();

    if (lower.includes('식당') || lower.includes('음식') || lower.includes('파스타') || lower.includes('영업허가') || lower.includes('창업')) {
      return {
        intent: '음식점 영업허가 및 창업 절차 안내',
        category: 'restaurant',
        complexity: 'complex',
        requiredAgents: ['legal', 'document', 'api', 'scheduler', 'validator'],
        summary: '식당 창업을 위한 영업허가, 건축물 확인, 위생교육 일정 통합 처리',
      };
    }

    if (lower.includes('전입') || lower.includes('이사') || lower.includes('이사')) {
      return {
        intent: '전입신고 및 연계 파생민원 일괄 처리',
        category: 'relocation',
        complexity: 'multi',
        requiredAgents: ['legal', 'document', 'api', 'validator'],
        summary: '전입신고 및 건강보험·자동차등록 등 파생민원 6종 자동 연계',
      };
    }

    if (lower.includes('실업') || lower.includes('실직') || lower.includes('잘렸') || lower.includes('고용보험') || lower.includes('복지')) {
      return {
        intent: '실직 후 실업급여 신청 및 긴급 복지 지원 안내',
        category: 'welfare',
        complexity: 'complex',
        requiredAgents: ['legal', 'document', 'api', 'validator'],
        summary: '갑작스러운 실직 상황에서 실업급여 신청 절차 및 연계 복지 혜택 안내',
      };
    }

    return {
      intent: '일반 민원 처리',
      category: 'general',
      complexity: 'simple',
      requiredAgents: ['legal', 'document', 'validator'],
      summary: `"${input.slice(0, 30)}..." 관련 민원 처리`,
    };
  }

  // Real LLM mode
  const { generateText } = await import('ai');
  const { anthropic } = await import('@ai-sdk/anthropic');

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    system: `당신은 All-Pass 민원 처리 시스템의 마스터 에이전트입니다.
사용자 입력을 분석하여 의도, 카테고리, 복잡도, 필요 에이전트를 파악합니다.
반드시 JSON 형식으로 응답하세요:
{"intent":"...","category":"restaurant|relocation|welfare|general","complexity":"simple|complex|multi","requiredAgents":["legal","document","api","validator","scheduler"],"summary":"..."}`,
    prompt: `다음 민원을 분석하세요: "${input}"`,
  });

  try {
    return JSON.parse(text) as {
      intent: string;
      category: string;
      complexity: 'simple' | 'complex' | 'multi';
      requiredAgents: AgentId[];
      summary: string;
    };
  } catch {
    return {
      intent: input.slice(0, 50),
      category: 'general',
      complexity: 'simple',
      requiredAgents: ['legal', 'document', 'validator'],
      summary: text.slice(0, 100),
    };
  }
}

export async function synthesizeResponse(
  results: Record<string, string>,
  citations: LegalCitation[],
  metrics: MetricsUpdateEvent['data'],
  scenarioId?: ScenarioId
): Promise<string> {
  if (IS_SIMULATION) {
    await randomDelay();

    // Load scenario-specific final response if available
    if (scenarioId) {
      try {
        const scenarioData = await import(`@/data/scenarios/${scenarioId}.json`);
        const simResponses = (scenarioData.default as { simulatedResponses?: { final?: string } }).simulatedResponses;
        if (simResponses?.final) {
          return simResponses.final;
        }
      } catch {
        // fallback to generic
      }
    }

    const resultValues = Object.values(results).filter(Boolean).join('\n');
    const citationList = citations.map((c) => `- ${c.lawName} ${c.article}`).join('\n');
    return `처리가 완료되었습니다.\n\n**처리 결과 요약**\n${resultValues.slice(0, 300)}\n\n**관련 법령**\n${citationList || '없음'}\n\n**처리 시간**: ${(metrics.totalTime / 1000).toFixed(1)}초`;
  }

  // Real LLM mode
  const { generateText } = await import('ai');
  const { anthropic } = await import('@ai-sdk/anthropic');

  const resultsSummary = Object.entries(results)
    .map(([k, v]) => `[${k}]: ${v}`)
    .join('\n\n');
  const citationSummary = citations
    .map((c) => `${c.lawName} ${c.article}: ${c.content.slice(0, 80)}`)
    .join('\n');

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    system: `당신은 All-Pass 민원 처리 시스템의 마스터 에이전트입니다.
여러 전문 에이전트의 결과를 종합하여 시민이 이해하기 쉬운 최종 응답을 생성합니다.
마크다운 형식으로 친절하고 명확하게 작성하세요.`,
    prompt: `다음 에이전트 결과를 종합하여 최종 안내문을 작성해주세요.\n\n에이전트 결과:\n${resultsSummary}\n\n관련 법령:\n${citationSummary || '없음'}\n\n처리 시간: ${(metrics.totalTime / 1000).toFixed(1)}초`,
  });

  return text;
}
