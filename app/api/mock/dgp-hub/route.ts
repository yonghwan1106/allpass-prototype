import { callGovernmentAPI } from '@/lib/mock/government-apis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  const body = await request.json() as { apiType?: string; params?: Record<string, unknown> };
  const { apiType, params } = body;

  if (!apiType || typeof apiType !== 'string') {
    return new Response(JSON.stringify({ error: 'apiType이 필요합니다.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Add realistic delay for demo purposes
  const delayMs = 300 + Math.floor(Math.random() * 700);
  await delay(delayMs);

  try {
    const result = await callGovernmentAPI(apiType, params ?? {});

    return new Response(
      JSON.stringify({
        success: true,
        apiType,
        responseTime: delayMs,
        data: result,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
