import type { DAGPlan, ScenarioId } from '@/lib/agents/types';

const IS_SIMULATION = !process.env.ANTHROPIC_API_KEY;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => delay(300 + Math.random() * 500);

export async function runPlannerAgent(
  intent: string,
  category: string,
  scenarioId?: ScenarioId
): Promise<DAGPlan> {
  // Use pre-defined DAG for known scenarios
  if (scenarioId) {
    try {
      const scenarioData = await import(`@/data/scenarios/${scenarioId}.json`);
      const dag = (scenarioData.default as { dag?: DAGPlan }).dag;
      if (dag) {
        await randomDelay();
        return dag;
      }
    } catch {
      // fallback to dynamic generation
    }
  }

  // Try to load by category
  const categoryToScenario: Record<string, ScenarioId> = {
    restaurant: 'restaurant',
    relocation: 'relocation',
    welfare: 'welfare',
  };
  const mappedScenario = categoryToScenario[category];
  if (mappedScenario) {
    try {
      const scenarioData = await import(`@/data/scenarios/${mappedScenario}.json`);
      const dag = (scenarioData.default as { dag?: DAGPlan }).dag;
      if (dag) {
        await randomDelay();
        return dag;
      }
    } catch {
      // fallback to dynamic generation
    }
  }

  if (IS_SIMULATION) {
    await randomDelay();
    return buildDefaultDAG(intent);
  }

  // Real LLM mode — generate DAG dynamically
  const { generateText } = await import('ai');
  const { anthropic } = await import('@ai-sdk/anthropic');

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5'),
    system: `당신은 All-Pass 민원 처리 시스템의 플래너 에이전트입니다.
민원을 처리하기 위한 DAG(방향성 비순환 그래프) 실행 계획을 JSON으로 생성합니다.
에이전트 종류: master, planner, legal, document, api, validator, scheduler
응답은 반드시 다음 형식의 JSON이어야 합니다:
{
  "id": "dag-xxx",
  "title": "...",
  "nodes": [{"id":"n1","label":"...","agentId":"...","status":"pending","description":"...","dependencies":[]}],
  "edges": [{"id":"e1","source":"n1","target":"n2"}]
}`,
    prompt: `다음 민원에 대한 DAG 실행 계획을 생성하세요.\n의도: ${intent}\n카테고리: ${category}`,
  });

  try {
    return JSON.parse(text) as DAGPlan;
  } catch {
    return buildDefaultDAG(intent);
  }
}

function buildDefaultDAG(intent: string): DAGPlan {
  return {
    id: `dag-${Date.now()}`,
    title: intent,
    nodes: [
      {
        id: 'n1',
        label: '법령 검색',
        agentId: 'legal',
        status: 'pending',
        description: `${intent} 관련 법령 검색`,
        dependencies: [],
      },
      {
        id: 'n2',
        label: '서류 안내',
        agentId: 'document',
        status: 'pending',
        description: `${intent} 필요 서류 안내`,
        dependencies: ['n1'],
      },
      {
        id: 'n3',
        label: '결과 검증',
        agentId: 'validator',
        status: 'pending',
        description: '결과 교차 검증',
        dependencies: ['n2'],
      },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
    ],
  };
}
