import type { LegalCitation } from '@/lib/agents/types';

const IS_SIMULATION = !process.env.ANTHROPIC_API_KEY;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => delay(400 + Math.random() * 600);

interface LegalChunk {
  id: string;
  law: string;
  article: string;
  title: string;
  content: string;
  keywords: string[];
  relatedArticles: string[];
}

interface LegalData {
  title: string;
  chunks: LegalChunk[];
}

function safeRequireLegal(name: string): LegalData {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`@/data/legal/${name}.json`) as LegalData;
  } catch {
    return { title: '', chunks: [] };
  }
}

async function searchLegalData(query: string): Promise<LegalCitation[]> {
  const keywords = query.toLowerCase().split(/[\s,]+/).filter(Boolean);

  const dataFiles = [
    'food-sanitation',
    'building-act',
    'resident-registration',
    'civil-affairs',
    'e-government',
    'privacy-protection',
    'employment-insurance',
  ];

  const citations: LegalCitation[] = [];

  for (const name of dataFiles) {
    try {
      const data = safeRequireLegal(name);
      if (!data.chunks) continue;

      for (const chunk of data.chunks) {
        const score = keywords.filter(
          (kw) =>
            chunk.keywords?.some((ak) => ak.includes(kw) || kw.includes(ak)) ||
            chunk.content?.toLowerCase().includes(kw) ||
            chunk.article?.toLowerCase().includes(kw)
        ).length;

        if (score > 0) {
          citations.push({
            lawName: data.title || chunk.law,
            article: chunk.article,
            content: chunk.content,
            relevance: score >= 2 ? '높음' : '보통',
          });
        }
      }
    } catch {
      // skip unavailable data files
    }
  }

  // Sort by relevance and return top 3
  return citations.slice(0, 3);
}

export async function runLegalAgent(
  query: string,
  context?: Record<string, unknown>
): Promise<{
  analysis: string;
  citations: LegalCitation[];
  isCompliant: boolean;
  risks: string[];
}> {
  void context;

  const citations = await searchLegalData(query);

  if (IS_SIMULATION) {
    await randomDelay();

    const queryLower = query.toLowerCase();
    let analysis = '';
    let risks: string[] = [];

    if (queryLower.includes('식당') || queryLower.includes('음식') || queryLower.includes('영업허가') || queryLower.includes('식품')) {
      analysis =
        '식품위생법 제36조(시설기준), 제37조(영업허가), 제41조(식품위생교육) 분석 완료. 영업신고 전 위생교육 이수 필수. 조리장·화장실 시설기준 충족 확인 필요.';
      risks = ['위생교육 미이수 시 영업신고 불가', '조리장 시설기준 미충족 시 과태료'];
    } else if (queryLower.includes('전입') || queryLower.includes('이사')) {
      analysis =
        '주민등록법 제10조: 전입 14일 이내 신고 의무. 세대주 대리 신고 가능. 파생민원 6종 자동 연계 처리.';
      risks = ['14일 초과 시 과태료 5만원'];
    } else if (queryLower.includes('실업') || queryLower.includes('실직') || queryLower.includes('고용보험')) {
      analysis =
        '고용보험법 제40조(구직급여 수급요건): 이직 전 18개월 내 180일 이상 가입. 비자발적 이직(해고·권고사직) 시 수급 가능. 12개월 이내 신청 필수.';
      risks = ['이직 후 12개월 초과 시 수급자격 소멸'];
    } else {
      analysis = `"${query}"에 관련된 법령 조문을 검색하였습니다. ${citations.length}건의 관련 조문이 확인되었습니다.`;
      risks = [];
    }

    return { analysis, citations, isCompliant: true, risks };
  }

  // Real LLM mode
  const { generateText } = await import('ai');
  const { anthropic } = await import('@ai-sdk/anthropic');

  const citationContext = citations
    .map((c) => `[${c.lawName} ${c.article}] ${c.content}`)
    .join('\n\n');

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    system: `당신은 All-Pass 민원 처리 시스템의 법령 에이전트입니다.
주어진 민원 내용과 관련 법조문을 분석하여 규제 적합성과 주의사항을 한국어로 간결하게 설명합니다.`,
    prompt: `민원 내용: ${query}\n\n관련 법조문:\n${citationContext || '직접 검색 결과 없음'}\n\n위 내용을 분석하여 규제 적합성과 주의사항을 설명해주세요.`,
  });

  return {
    analysis: text,
    citations,
    isCompliant: true,
    risks: [],
  };
}
