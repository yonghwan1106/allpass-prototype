# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

행정안전부 「AI 기반 민원 서비스 혁신」 공모전 Track 2 프로토타입.
7개 AI 에이전트가 협업하여 복합민원을 자동 분석/처리하는 풀스택 데모 시스템.

## Commands

```bash
npm run dev      # 개발 서버 (Turbopack, http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
```

## Environment

`.env.local`에 `ANTHROPIC_API_KEY` 필요. Claude Sonnet 4.6 + Haiku 4.5 사용.

## Architecture

### SSE 스트리밍 파이프라인

```
POST /api/chat → Orchestrator → AgentEventEmitter → ReadableStream (SSE) → 클라이언트
```

1. `app/api/chat/route.ts` — SSE 엔드포인트. `Orchestrator`를 비동기 실행하고 스트림 즉시 반환.
2. `lib/agents/orchestrator.ts` — 전체 워크플로우 제어. 상태 머신(INIT→PLANNING→EXECUTING→VALIDATING→COMPLETED), 최대 3회 재시도, HUMAN_REVIEW 분기.
3. `lib/agents/event-emitter.ts` — `ReadableStreamDefaultController`에 `data: {JSON}\n\n` 형식으로 SSE 이벤트 전송.
4. `lib/agents/dag-executor.ts` — DAG 의존관계 해석 후 준비된 노드를 `Promise.all`로 병렬 실행. 각 노드를 `agentId`별로 적절한 에이전트에 디스패치.

### 7개 에이전트 (`app/api/agents/`)

| 파일 | 에이전트 | 모델 | 역할 |
|------|---------|------|------|
| `master.ts` | MasterAgent | Sonnet | 의도 분석 + 최종 응답 합성 |
| `planner.ts` | PlannerAgent | Haiku | 민원 → DAG JSON 분해 |
| `legal.ts` | LegalAgent | Sonnet | RAG 법령 검색, 법조문 인용 |
| `document.ts` | DocumentAgent | Haiku | 필요 서류 목록 + 자동완성 안내 |
| `api-agent.ts` | APIAgent | Haiku | 정부 API 시뮬레이션 호출 |
| `validator.ts` | ValidatorAgent | Sonnet | 결과 검증, 할루시네이션 탐지 |
| `scheduler.ts` | SchedulerAgent | Haiku | 기관 방문 일정 최적화 |

에이전트는 Vercel AI SDK의 `generateText` + 시스템 프롬프트로 구현. 타입 정의는 `lib/agents/types.ts`.

### 상태 관리 (Zustand)

- `lib/store/chat-store.ts` — 메시지, 스트리밍 상태, 시나리오 선택, 입력값
- `lib/store/agent-store.ts` — 워크플로우 상태, 7개 에이전트 상태, DAG, 법령 인용, 메트릭, PII 이벤트, API 호출 로그

클라이언트는 SSE 이벤트를 `ChatInterface.handleSSEEvent()`에서 수신하여 두 스토어에 분배.

### 3개 데모 시나리오

`lib/agents/types.ts`의 `SCENARIOS` + `lib/mock/personas.ts`의 `PERSONAS`에 정의:
- `restaurant` — 소상공인 식당 창업 (DAG 7단계)
- `relocation` — 전입신고 + 파생민원 6건 자동연계
- `welfare` — 실직 → 실업급여 + 긴급복지 연계

### 프론트엔드 레이아웃 (데모 대시보드)

`app/demo/page.tsx` — 4패널 구성:
- **상단 좌**: DAG 워크플로우 (`components/dag/` — React Flow `@xyflow/react`)
- **상단 우**: 탭(활동 로그 / 법령 인용 / 메트릭) (`components/monitor/`, `components/legal/`)
- **상단 바**: 상태 머신 시각화 (`StateMachine.tsx`)
- **하단**: 채팅 인터페이스 (`components/chat/`)

### 디자인 시스템

`app/globals.css`에 `@theme inline` 블록으로 커스텀 색상 토큰 등록:
- `bg-ap-deep`, `bg-ap-base`, `bg-ap-panel`, `bg-ap-card` 등 Tailwind 유틸리티로 사용
- `:root` CSS 변수(`--ap-bg-*`, `--ap-border`)는 인라인 스타일용
- Tailwind CSS 4에서 `bg-[color:var(--custom)]` 문법이 작동하지 않으므로 반드시 `@theme inline`에 `--color-ap-*`로 등록 후 `bg-ap-*`로 사용

### Mock 데이터

- `lib/mock/government-apis.ts` — 정부 API 시뮬레이션 (건축물대장, 전입신고, 복지 등)
- `lib/mock/mydata.ts` — 마이데이터 시뮬레이션
- `lib/mock/personas.ts` — 시나리오별 데모 인물 데이터
- `data/legal/*.json` — 7개 법령 데이터 (식품위생법, 건축법, 주민등록법 등)
- `data/scenarios/*.json` — 시나리오별 DAG/서류/안내 데이터

### 주요 의존성

- **Next.js 16** (App Router, Turbopack)
- **Vercel AI SDK 6** (`ai`, `@ai-sdk/anthropic`)
- **@xyflow/react** (DAG 시각화)
- **Framer Motion** (애니메이션)
- **Zustand 5** (상태관리)
- **shadcn/ui** + Radix UI + Tailwind CSS 4

### 배포

Vercel에 배포. `next.config.ts`에서 `serverExternalPackages: ["vectordb"]` 설정.
