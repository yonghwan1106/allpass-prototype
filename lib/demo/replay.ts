import type { SSEEvent, ScenarioId } from '@/lib/agents/types';

// Import recorded data
import restaurantRecording from '@/data/demo-recordings/restaurant.json';
import relocationRecording from '@/data/demo-recordings/relocation.json';
import welfareRecording from '@/data/demo-recordings/welfare.json';

type RecordedEvent = SSEEvent & { _delay?: number };

const RECORDINGS: Record<ScenarioId, RecordedEvent[]> = {
  restaurant: restaurantRecording as RecordedEvent[],
  relocation: relocationRecording as RecordedEvent[],
  welfare: welfareRecording as RecordedEvent[],
};

export function createReplayStream(scenarioId: ScenarioId): ReadableStream {
  const events = RECORDINGS[scenarioId];
  if (!events || events.length === 0) {
    throw new Error(`No recording found for scenario: ${scenarioId}`);
  }

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < events.length; i++) {
        const event = { ...events[i], timestamp: Date.now() };
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));

        // Calculate delay to next event (use recorded timing or default)
        if (i < events.length - 1) {
          const delay = events[i + 1]._delay ?? getDefaultDelay(events[i].type);
          await new Promise(r => setTimeout(r, delay));
        }
      }
      controller.close();
    },
  });
}

function getDefaultDelay(eventType: string): number {
  switch (eventType) {
    case 'workflow_state': return 300;
    case 'agent_start': return 400;
    case 'agent_thinking': return 800;
    case 'agent_result': return 500;
    case 'dag_update': return 600;
    case 'dag_node_update': return 300;
    case 'legal_citation': return 400;
    case 'pii_masking': return 500;
    case 'api_call': return 300;
    case 'crisis_detection': return 1000;
    case 'human_approval_request': return 1500;
    case 'message': return 200;
    case 'metrics_update': return 300;
    case 'complete': return 100;
    default: return 300;
  }
}
