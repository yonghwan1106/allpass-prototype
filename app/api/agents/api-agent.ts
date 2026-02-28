import { callGovernmentAPI } from '@/lib/mock/government-apis';

const IS_SIMULATION = !process.env.ANTHROPIC_API_KEY;

export async function runAPIAgent(
  taskDescription: string,
  apiType: string,
  params?: Record<string, unknown>
): Promise<{
  endpoint: string;
  response: Record<string, unknown>;
  responseTime: number;
}> {
  void IS_SIMULATION; // always use mock for API agent (no LLM needed)

  const start = Date.now();
  const endpoint = `/api/gov/${apiType}`;

  const response = await callGovernmentAPI(apiType, params ?? { task: taskDescription });
  const responseTime = Date.now() - start;

  return { endpoint, response, responseTime };
}
