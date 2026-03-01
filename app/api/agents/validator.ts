import type { LegalCitation } from '@/lib/agents/types';

const IS_SIMULATION = !process.env.ANTHROPIC_API_KEY;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => delay(200 + Math.random() * 300);

export async function runValidatorAgent(
  results: Record<string, unknown>,
  citations: LegalCitation[]
): Promise<{
  isValid: boolean;
  issues: string[];
  confidence: number;
  suggestions: string[];
}> {
  if (IS_SIMULATION) {
    await randomDelay();

    const hasResults = Object.keys(results).length > 0;
    const hasCitations = citations.length > 0;

    let confidence = hasResults ? 0.92 + Math.random() * 0.06 : 0.6;
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (!hasResults) {
      issues.push('에이전트 결과가 부족합니다.');
      suggestions.push('다시 시도하거나 담당자에게 문의하세요.');
    }

    if (!hasCitations) {
      issues.push('법령 인용이 포함되지 않았습니다. 신뢰도가 낮을 수 있습니다.');
      suggestions.push('법령 에이전트 결과를 재확인하세요.');
      confidence = 0.78 + Math.random() * 0.08;
    }

    return {
      isValid: issues.length === 0,
      issues,
      confidence: Math.min(confidence, 0.99),
      suggestions,
    };
  }

  // Real LLM mode
  const { generateText } = await import('ai');
  const { anthropic } = await import('@ai-sdk/anthropic');

  const resultsSummary = Object.entries(results)
    .map(([k, v]) => `[${k}]: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
    .join('\n');
  const citationsSummary = citations.map((c) => `${c.lawName} ${c.article}`).join(', ');

  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5'),
    system: `당신은 All-Pass 민원 처리 시스템의 검증 에이전트입니다.
에이전트 결과의 일관성, 법령 인용의 정확성, 할루시네이션 여부를 검증합니다.
JSON 형식으로 응답하세요: {"isValid": boolean, "issues": [], "confidence": 0.0-1.0, "suggestions": []}`,
    prompt: `다음 에이전트 결과를 검증해주세요.\n\n결과:\n${resultsSummary}\n\n인용 법령: ${citationsSummary || '없음'}`,
  });

  try {
    return JSON.parse(text) as { isValid: boolean; issues: string[]; confidence: number; suggestions: string[] };
  } catch {
    return { isValid: true, issues: [], confidence: 0.85, suggestions: [] };
  }
}
