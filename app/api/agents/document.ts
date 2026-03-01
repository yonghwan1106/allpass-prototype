import type { DocumentInfo } from '@/lib/agents/types';

const IS_SIMULATION = !process.env.ANTHROPIC_API_KEY;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => delay(300 + Math.random() * 500);

export async function runDocumentAgent(
  taskDescription: string,
  buildingInfo?: Record<string, unknown>
): Promise<{
  documents: DocumentInfo[];
  autoFillable: string[];
  instructions: string;
}> {
  void buildingInfo;

  if (IS_SIMULATION) {
    await randomDelay();

    const task = taskDescription.toLowerCase();
    let documents: DocumentInfo[] = [];
    let autoFillable: string[] = [];
    let instructions = '';

    if (task.includes('식당') || task.includes('음식') || task.includes('영업') || task.includes('식품')) {
      documents = [
        { name: '영업신고서', status: 'required' },
        { name: '건축물대장', status: 'auto-filled', source: '공공데이터포털' },
        { name: '임대차계약서', status: 'auto-filled', source: '마이데이터' },
        { name: '식품위생교육 이수증', status: 'required' },
        { name: '건강진단결과서(보건증)', status: 'required' },
      ];
      autoFillable = ['건축물대장', '임대차계약서'];
      instructions =
        '영업신고에 필요한 서류 5종 중 2종은 마이데이터 및 공공데이터로 자동완성됩니다. 위생교육 이수 후 구청 위생과에 제출하세요.';
    } else if (task.includes('전입') || task.includes('이사')) {
      documents = [
        { name: '전입신고서', status: 'auto-filled', source: '정부24' },
        { name: '신분증', status: 'required' },
        { name: '임대차계약서', status: 'auto-filled', source: '마이데이터' },
      ];
      autoFillable = ['전입신고서', '임대차계약서'];
      instructions =
        '전입신고는 정부24 온라인 또는 주민센터 방문으로 처리 가능합니다. 신분증 지참 필수.';
    } else if (task.includes('실업') || task.includes('실직') || task.includes('고용보험')) {
      documents = [
        { name: '이직확인서(회사 제출)', status: 'pending' },
        { name: '신분증', status: 'required' },
        { name: '통장사본', status: 'required' },
      ];
      autoFillable = [];
      instructions =
        '고용보험 가입 이력은 자동 확인됩니다. 이직확인서는 전 직장에서 고용센터로 직접 제출합니다. 고용센터 방문 전 워크넷 구직등록 필수.';
    } else {
      documents = [
        { name: '신청서', status: 'required' },
        { name: '신분증', status: 'required' },
      ];
      autoFillable = [];
      instructions = `${taskDescription}에 필요한 기본 서류입니다. 담당 기관에 문의하여 추가 서류를 확인하세요.`;
    }

    return { documents, autoFillable, instructions };
  }

  // Real LLM mode
  const { generateText } = await import('ai');
  const { anthropic } = await import('@ai-sdk/anthropic');

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5'),
    system: `당신은 All-Pass 민원 처리 시스템의 서류 에이전트입니다.
민원 처리에 필요한 서류 목록을 생성하고, 마이데이터로 자동완성 가능한 서류를 식별합니다.
응답은 JSON 형식으로 반환하세요: {"documents": [...], "autoFillable": [...], "instructions": "..."}`,
    prompt: `다음 민원에 필요한 서류 목록을 작성해주세요: ${taskDescription}`,
  });

  try {
    const parsed = JSON.parse(text) as { documents: DocumentInfo[]; autoFillable: string[]; instructions: string };
    return parsed;
  } catch {
    return {
      documents: [{ name: '신청서', status: 'required' }, { name: '신분증', status: 'required' }],
      autoFillable: [],
      instructions: text,
    };
  }
}
