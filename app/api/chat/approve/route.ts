import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { approvalId, decision, reason } = body as {
      approvalId?: string;
      decision?: string;
      reason?: string;
    };

    if (!approvalId || typeof approvalId !== 'string') {
      return NextResponse.json({ error: 'approvalId is required' }, { status: 400 });
    }

    const validDecisions = ['approved', 'rejected', 'modified'];
    if (!decision || !validDecisions.includes(decision)) {
      return NextResponse.json(
        { error: `decision must be one of: ${validDecisions.join(', ')}` },
        { status: 400 }
      );
    }

    // Prototype demo: log and return success.
    // In production this would resume the paused workflow via a queue/event bus.
    console.log('[approve] decision received', { approvalId, decision, reason });

    return NextResponse.json({
      ok: true,
      approvalId,
      decision,
      reason: reason ?? null,
      timestamp: Date.now(),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
