import { Orchestrator } from '@/lib/agents/orchestrator';
import { AgentEventEmitter } from '@/lib/agents/event-emitter';
import type { ScenarioId } from '@/lib/agents/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json() as { message?: string; scenarioId?: ScenarioId };
  const { message, scenarioId } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return new Response(JSON.stringify({ error: '메시지가 필요합니다.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const emitter = new AgentEventEmitter();
  const orchestrator = new Orchestrator(emitter);

  // Start orchestration asynchronously — do not await
  orchestrator.processMessage(message.trim(), scenarioId).catch(console.error);

  // Return SSE stream immediately
  return new Response(emitter.createStream(), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
