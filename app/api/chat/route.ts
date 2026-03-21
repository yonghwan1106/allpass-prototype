import { Orchestrator } from '@/lib/agents/orchestrator';
import { AgentEventEmitter } from '@/lib/agents/event-emitter';
import { createReplayStream } from '@/lib/demo/replay';
import type { ScenarioId } from '@/lib/agents/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no',
};

export async function POST(request: Request) {
  const body = await request.json() as { message?: string; scenarioId?: ScenarioId; errorDemo?: boolean; mode?: string };
  const { message, scenarioId, errorDemo, mode } = body;

  // Replay mode: serve pre-recorded SSE events
  if (mode === 'replay' && scenarioId) {
    try {
      const stream = createReplayStream(scenarioId);
      return new Response(stream, { headers: SSE_HEADERS });
    } catch {
      // Fall through to live mode
    }
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return new Response(JSON.stringify({ error: '메시지가 필요합니다.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const emitter = new AgentEventEmitter();
  const orchestrator = new Orchestrator(emitter, { errorDemo });

  // Start orchestration asynchronously — do not await
  orchestrator.processMessage(message.trim(), scenarioId).catch(console.error);

  // Return SSE stream immediately
  return new Response(emitter.createStream(), { headers: SSE_HEADERS });
}
