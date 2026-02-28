// 법령 검색 유틸리티 - 키워드 기반 검색 (벡터 DB 없이 동작)

interface LegalChunk {
  id: string;
  law: string;
  article: string;
  title: string;
  content: string;
  keywords: string[];
  relatedArticles: string[];
}

interface LegalSearchResult {
  chunk: LegalChunk;
  score: number;
  matchedKeywords: string[];
}

// 법령 데이터 캐시
let legalDataCache: LegalChunk[] | null = null;

function safeRequire(path: string): { chunks: LegalChunk[] } {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(path) as { chunks: LegalChunk[] };
  } catch {
    return { chunks: [] };
  }
}

async function loadLegalData(): Promise<LegalChunk[]> {
  if (legalDataCache) return legalDataCache;

  const files = [
    'food-sanitation',
    'building-act',
    'resident-registration',
    'civil-affairs',
    'e-government',
    'privacy-protection',
  ];

  legalDataCache = files.flatMap((name) => {
    const mod = safeRequire(`@/data/legal/${name}.json`);
    return mod.chunks ?? [];
  });

  return legalDataCache;
}

function tokenize(text: string): string[] {
  return text
    .replace(/[^\w가-힣]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function calculateRelevance(chunk: LegalChunk, queryTokens: string[]): { score: number; matched: string[] } {
  const matched: string[] = [];
  let score = 0;

  for (const token of queryTokens) {
    // 키워드 매칭 (높은 가중치)
    if (chunk.keywords.some((k) => k.includes(token) || token.includes(k))) {
      score += 3;
      matched.push(token);
    }
    // 제목 매칭
    if (chunk.title.includes(token)) {
      score += 2;
      if (!matched.includes(token)) matched.push(token);
    }
    // 본문 매칭
    if (chunk.content.includes(token)) {
      score += 1;
      if (!matched.includes(token)) matched.push(token);
    }
  }

  return { score, matched };
}

export async function searchLegalDocs(
  query: string,
  topK: number = 5
): Promise<LegalSearchResult[]> {
  const chunks = await loadLegalData();
  const queryTokens = tokenize(query);

  const results: LegalSearchResult[] = chunks
    .map((chunk) => {
      const { score, matched } = calculateRelevance(chunk, queryTokens);
      return { chunk, score, matchedKeywords: matched };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return results;
}

export async function searchByLaw(
  lawName: string,
  article?: string
): Promise<LegalChunk[]> {
  const chunks = await loadLegalData();
  return chunks.filter((c) => {
    if (!c.law.includes(lawName)) return false;
    if (article && !c.article.includes(article)) return false;
    return true;
  });
}

export function formatCitation(chunk: LegalChunk): string {
  return `근거: ${chunk.law} ${chunk.article} (${chunk.title})`;
}
