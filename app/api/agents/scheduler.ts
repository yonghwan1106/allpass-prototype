const IS_SIMULATION = !process.env.ANTHROPIC_API_KEY;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randomDelay = () => delay(150 + Math.random() * 250);

export async function runSchedulerAgent(
  tasks: string[],
  location?: string
): Promise<{
  schedule: Array<{ date: string; time: string; task: string; location: string }>;
  optimizedRoute: string;
  estimatedTotal: string;
}> {
  void location;

  if (IS_SIMULATION) {
    await randomDelay();

    const base = new Date();
    base.setDate(base.getDate() + 5);

    const schedule = tasks.map((task, i) => {
      const d = new Date(base.getTime() + i * 86400000);
      return {
        date: d.toISOString().split('T')[0],
        time: i === 0 ? '09:00' : '14:00',
        task,
        location: i % 2 === 0 ? '구청 민원실' : '고용센터 또는 해당 기관',
      };
    });

    return {
      schedule,
      optimizedRoute: tasks.length > 1 ? '지하철 이용 최적 경로로 이동 시 총 이동시간 약 45분' : '해당 기관 직접 방문',
      estimatedTotal: `총 예상 소요시간: ${tasks.length * 2}시간`,
    };
  }

  // Real LLM mode
  const { generateText } = await import('ai');
  const { anthropic } = await import('@ai-sdk/anthropic');

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5'),
    system: `당신은 All-Pass 민원 처리 시스템의 스케줄러 에이전트입니다.
민원 처리 일정을 최적화하고 방문 경로를 안내합니다.
JSON 형식으로 응답하세요: {"schedule": [...], "optimizedRoute": "...", "estimatedTotal": "..."}`,
    prompt: `다음 업무들의 일정을 최적화해주세요:\n${tasks.join('\n')}\n\n지역: ${location ?? '서울/경기'}`,
  });

  try {
    return JSON.parse(text) as { schedule: Array<{ date: string; time: string; task: string; location: string }>; optimizedRoute: string; estimatedTotal: string };
  } catch {
    const base = new Date();
    base.setDate(base.getDate() + 3);
    return {
      schedule: tasks.map((task, i) => ({
        date: new Date(base.getTime() + i * 86400000).toISOString().split('T')[0],
        time: '09:00',
        task,
        location: '해당 기관',
      })),
      optimizedRoute: text,
      estimatedTotal: `약 ${tasks.length}일 소요`,
    };
  }
}
