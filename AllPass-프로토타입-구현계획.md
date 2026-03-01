# All-Pass 프로토타입 구현 계획

## Context

행정안전부 「AI 기반 민원 서비스 혁신 시나리오 및 개발 방법」 공모전 Track 2 제출용 프로토타입.
제안서(35쪽)는 완성되었으며, 선택 제출물인 **프로토타입(데모, PoC)**을 구현하여 경쟁력을 극대화한다.

Track 2 평가기준에서 프로토타입이 직접 영향을 미치는 항목:
- 서비스 설계 완성도 (20점) - E2E 처리 흐름 시연
- AI 기술 적용 적합성 (20점) - 멀티 에이전트 동작 증명
- 신뢰도 높은 AI (15점) - RAG + 법령 인용 시연
- 기술 아키텍처 타당성 (15점) - 실제 구현으로 실현 가능성 입증

**목표:** 심사위원이 "이건 실제로 돌아가는구나"라고 느끼는 수준의 풀스택 프로토타입

---

## 기술 스택

| 레이어 | 기술 | 선정 근거 |
|--------|------|----------|
| 프레임워크 | Next.js 16 (App Router) | 최신 버전, SSE 스트리밍, Vercel 네이티브 |
| AI SDK | Vercel AI SDK 6 | Agent 추상화, 네이티브 스트리밍 |
| LLM | Claude Sonnet 4.6 (주) + Haiku 4.5 (경량) | 사용자 Claude Max 보유 |
| 벡터 DB | LanceDB (임베디드) | 서버리스 호환, Vercel 배포 가능, 설정 불필요 |
| DAG 시각화 | React Flow | 노드 기반 UI 전문, 애니메이션 에지 |
| 애니메이션 | Framer Motion | 프로덕션급 인터랙션 |
| UI | shadcn/ui + Tailwind CSS 4 + Radix UI | 빠른 개발, 세련된 디자인 |
| 상태관리 | Zustand | 경량, 빠름, React 네이티브 |
| 스트리밍 | Server-Sent Events (SSE) | Next.js App Router 네이티브 |
| 배포 | Vercel | 원클릭, 글로벌 CDN |
| DB (선택) | Supabase | 사용자 이력/세션 저장 (필요시) |

---

## 프로토타입 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│  ┌──────────┐ ┌──────────────┐ ┌───────────────────┐    │
│  │ 채팅 UI  │ │ DAG 시각화   │ │ 에이전트 모니터링 │    │
│  │(대화형)  │ │(React Flow)  │ │(실시간 로그)      │    │
│  └────┬─────┘ └──────┬───────┘ └────────┬──────────┘    │
│       │              │                   │               │
│       └──────────────┼───────────────────┘               │
│                      │ SSE Stream                        │
├──────────────────────┼───────────────────────────────────┤
│                      │                                   │
│              API Routes (Server)                         │
│  ┌───────────────────┴────────────────────────┐         │
│  │         Master Agent (Orchestrator)         │         │
│  │  ┌─────────┐ ┌────────┐ ┌──────────┐      │         │
│  │  │ Planner │ │ Router │ │ Scheduler│      │         │
│  │  └────┬────┘ └───┬────┘ └────┬─────┘      │         │
│  │       │           │           │             │         │
│  │  ┌────┴────┐ ┌────┴───┐ ┌────┴─────┐      │         │
│  │  │  Legal  │ │Document│ │   API    │      │         │
│  │  │(RAG+법령)│ │(서류)  │ │(정부API) │      │         │
│  │  └────┬────┘ └────┬───┘ └────┬─────┘      │         │
│  │       │           │           │             │         │
│  │  ┌────┴───────────┴───────────┴──────┐     │         │
│  │  │         Validator Agent            │     │         │
│  │  └────────────────────────────────────┘     │         │
│  └─────────────────────────────────────────────┘         │
│                      │                                   │
│              ┌───────┴───────┐                           │
│              │   LanceDB    │ (법령 벡터 DB)             │
│              └───────────────┘                           │
└─────────────────────────────────────────────────────────┘
```

---

## 핵심 구현 범위 (6일 스프린트)

### 1. 멀티 에이전트 시스템 (7개 에이전트)

각 에이전트는 Vercel AI SDK의 `generateText` + 커스텀 tool을 사용하여 구현.

| 에이전트 | 모델 | 핵심 기능 |
|---------|------|----------|
| **MasterAgent** | Sonnet | 의도 분석, DAG 실행 오케스트레이션, 최종 응답 합성 |
| **PlannerAgent** | Haiku | 복합민원 → DAG JSON 분해 (노드/에지/의존관계) |
| **LegalAgent** | Sonnet | RAG 기반 법령 검색, 규제 적합성 판단, 법조문 인용 |
| **DocumentAgent** | Haiku | 필요 서류 목록 생성, 자동완성 안내, 마이데이터 매핑 |
| **APIAgent** | Haiku | 정부 API 시뮬레이션 (건축물대장, 홈택스, 새올행정 등) |
| **ValidatorAgent** | Sonnet | 결과 검증, 할루시네이션 탐지, 품질 체크 |
| **SchedulerAgent** | Haiku | 기관 방문 일정 최적화, 예약 시뮬레이션 |

### 2. RAG 법령 지식베이스

- **법령 데이터**: 식품위생법, 건축법, 주민등록법, 민원처리법, 전자정부법, 개인정보보호법 등 핵심 조항 약 200개 청크
- **임베딩**: Claude embeddings 또는 Voyage AI
- **저장**: LanceDB 임베디드 (빌드 타임에 인덱싱)
- **검색**: Top-K 벡터 검색 → Re-ranking → LLM 컨텍스트 주입
- **출력**: "근거: 식품위생법 제37조 제1항" 형태로 법조문 인용

### 3. 실시간 시각화 대시보드

**4-패널 레이아웃:**

```
┌─────────────────────────────────┬──────────────────────────┐
│                                 │  에이전트 활동 로그        │
│   DAG 워크플로우 뷰             │  [Master] 의도 분석 중... │
│   (React Flow)                  │  [Legal] 법령 검색 완료   │
│                                 │  [API] 건축물대장 조회    │
│   노드: 실시간 상태 애니메이션   │                          │
│   에지: 데이터 흐름 파티클       ├──────────────────────────┤
│                                 │  법령 인용 패널           │
│                                 │  📋 식품위생법 제37조     │
│                                 │  "영업의 신고..."         │
├─────────────────────────────────┴──────────────────────────┤
│  💬 민원 채팅 인터페이스                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ "연남동에 파스타 가게를 내려고 합니다..."              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**시각적 차별화 요소:**
- DAG 노드: pending(회색) → running(파란 펄스) → completed(초록) 애니메이션
- 에지: 데이터 흐름을 보여주는 애니메이션 파티클
- 에이전트 로그: 타이핑 효과로 실시간 사고 과정 표시
- 법령 인용: 카드 형태로 법조문명 + 조항번호 + 관련 텍스트 하이라이트
- 처리 시간 메트릭: "처리시간: 47초 (기존 대비 83% 단축)" 실시간 표시

### 4. 3개 데모 시나리오 완전 구현

#### 시나리오 1: 소상공인 식당 창업 (핵심)
- 입력: "연남동 383-XX번지 1층에 파스타 가게를 내려고 해. 임대차 계약은 했어."
- 실행: 건축물대장 조회 → 규제 검토 → DAG 생성(7단계) → 병렬 처리 → 서류 자동완성 → 혜택 안내
- 시각화: 전체 DAG 실시간 진행, 법령 인용, API 호출 로그

#### 시나리오 2: 전입신고 + 파생민원 자동연계
- 입력: "수원시 영통구로 이사해요. 남편이랑 아이(3살) 포함 전입신고 해주세요."
- 실행: 전입신고 1건 → 파생민원 6건 자동 감지 → 일괄 처리
- 시각화: 1건 → 7건 폭포(cascade) 효과 DAG

#### 시나리오 3: 긴급복지 연계 (음성 입력 시뮬레이션)
- 입력: "갑자기 회사에서 잘렸는데... 실업급여 받으려면 어떻게 해야 하나요?"
- 실행: 마이데이터 분석 → 실업급여 자격 확인 → 추가 지원 발굴 → 선제적 복지 연계
- 시각화: 위기 정보 모니터링 대시보드, 복지 혜택 카드

### 5. 정부 API 시뮬레이션

실제 정부 API 호출을 시뮬레이션하는 Mock API 구현:

```
POST /api/mock/dgp-hub/building-registry    → 건축물대장 조회
POST /api/mock/dgp-hub/business-registration → 영업신고 접수
POST /api/mock/dgp-hub/resident-transfer     → 전입신고
GET  /api/mock/dgp-hub/welfare-eligibility   → 복지 수급 자격 확인
POST /api/mock/dgp-hub/health-cert           → 보건증 발급 예약
GET  /api/mock/dgp-hub/crisis-monitoring     → 위기정보 44종 모니터링
```

각 API는 제안서의 JSON 스펙을 그대로 구현하고, 현실적인 응답 딜레이(400~1200ms) 포함.

### 6. PII 마스킹 시연

입력 데이터의 개인정보를 탐지하고 마스킹하는 과정을 시각적으로 보여줌:
```
원본: "김도전, 860115-1XXXXXX"
  → PII 탐지: [이름], [주민번호] 감지
  → 토큰 치환: [NAME_1], [SSN_1]
  → LLM 처리 (마스킹 데이터만)
  → 토큰 복원 → 사용자에게 원본 표시
```

### 7. 상태 머신 시각화

제안서의 State Machine을 실제로 구현:
```
INIT → PLANNING → EXECUTING → VALIDATING → COMPLETED
                                    ↓ (실패 시)
                               RETRY (최대 3회) → HUMAN_REVIEW
```

---

## 프로젝트 구조

```
allpass-prototype/
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 랜딩 페이지 (프로젝트 소개)
│   ├── demo/
│   │   └── page.tsx            # 메인 데모 대시보드
│   ├── api/
│   │   ├── chat/route.ts       # 메인 에이전트 오케스트레이션 SSE 엔드포인트
│   │   ├── agents/
│   │   │   ├── master.ts       # MasterAgent
│   │   │   ├── planner.ts      # PlannerAgent
│   │   │   ├── legal.ts        # LegalAgent (RAG)
│   │   │   ├── document.ts     # DocumentAgent
│   │   │   ├── api-agent.ts    # APIAgent
│   │   │   ├── validator.ts    # ValidatorAgent
│   │   │   └── scheduler.ts    # SchedulerAgent
│   │   ├── rag/
│   │   │   ├── search/route.ts # 법령 검색 API
│   │   │   └── embed.ts        # 임베딩 유틸리티
│   │   └── mock/
│   │       ├── dgp-hub/        # 정부 API 시뮬레이션
│   │       └── mydata/         # 마이데이터 시뮬레이션
│   └── scenarios/
│       ├── restaurant/page.tsx # 시나리오1: 식당 창업
│       ├── relocation/page.tsx # 시나리오2: 전입신고
│       └── welfare/page.tsx    # 시나리오3: 긴급복지
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx   # 대화형 채팅 UI
│   │   ├── MessageBubble.tsx   # 메시지 말풍선
│   │   └── TypingIndicator.tsx # 타이핑 애니메이션
│   ├── dag/
│   │   ├── DAGViewer.tsx       # React Flow DAG 뷰어
│   │   ├── AgentNode.tsx       # 커스텀 에이전트 노드
│   │   ├── TaskNode.tsx        # 커스텀 태스크 노드
│   │   └── AnimatedEdge.tsx    # 애니메이션 에지
│   ├── monitor/
│   │   ├── AgentLog.tsx        # 에이전트 활동 로그
│   │   ├── StateMachine.tsx    # 상태 머신 시각화
│   │   ├── PIIMaskingDemo.tsx  # PII 마스킹 시연
│   │   └── MetricsPanel.tsx    # KPI 메트릭 패널
│   ├── legal/
│   │   ├── LegalCitation.tsx   # 법령 인용 카드
│   │   └── LegalSearchPanel.tsx# 법령 검색 패널
│   ├── landing/
│   │   ├── Hero.tsx            # 랜딩 히어로 섹션
│   │   ├── Features.tsx        # 주요 기능 소개
│   │   └── ScenarioCards.tsx   # 시나리오 선택 카드
│   └── ui/                     # shadcn/ui 공통 컴포넌트
├── lib/
│   ├── agents/
│   │   ├── types.ts            # 에이전트 타입 정의
│   │   ├── orchestrator.ts     # 오케스트레이션 엔진
│   │   ├── dag-executor.ts     # DAG 실행 엔진
│   │   └── event-emitter.ts    # SSE 이벤트 이미터
│   ├── rag/
│   │   ├── lancedb.ts          # LanceDB 클라이언트
│   │   ├── embeddings.ts       # 임베딩 유틸리티
│   │   └── legal-search.ts     # 법령 검색 함수
│   ├── mock/
│   │   ├── government-apis.ts  # 정부 API 모킹
│   │   ├── mydata.ts           # 마이데이터 모킹
│   │   └── personas.ts         # 데모 페르소나 데이터
│   ├── pii/
│   │   └── masking.ts          # PII 탐지 및 마스킹
│   └── store/
│       ├── agent-store.ts      # Zustand 에이전트 상태
│       └── chat-store.ts       # Zustand 채팅 상태
├── data/
│   ├── legal/                  # 법령 데이터 (JSON)
│   │   ├── food-sanitation.json      # 식품위생법
│   │   ├── building-act.json         # 건축법
│   │   ├── resident-registration.json # 주민등록법
│   │   ├── civil-affairs.json        # 민원처리법
│   │   ├── e-government.json         # 전자정부법
│   │   └── privacy-protection.json   # 개인정보보호법
│   ├── scenarios/              # 시나리오별 데이터
│   │   ├── restaurant-startup.json
│   │   ├── relocation.json
│   │   └── emergency-welfare.json
│   └── embeddings/             # 사전 생성된 벡터 인덱스
│       └── legal-index.lance
├── scripts/
│   └── embed-legal-docs.ts     # 법령 임베딩 스크립트
├── public/
│   └── images/                 # 로고, 아이콘 등
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── .env.local                  # ANTHROPIC_API_KEY
```

---

## 6일 개발 스프린트 계획

### Day 1: 프로젝트 기반 + 에이전트 코어
- [x] Next.js 16 프로젝트 초기화 (TypeScript strict, Tailwind CSS 4, shadcn/ui)
- [x] Vercel AI SDK 6 + Anthropic SDK 설정
- [x] 7개 에이전트 기본 구조 구현 (시스템 프롬프트 + 도구 정의)
- [x] SSE 스트리밍 API 라우트 구현 (`/api/chat/route.ts`)
- [x] 에이전트 이벤트 타입 시스템 정의
- [x] Zustand 상태 관리 설정 (에이전트 상태 + 채팅 상태)
- [x] 기본 채팅 UI 구현

### Day 2: 오케스트레이션 + DAG 엔진
- [x] MasterAgent 오케스트레이션 로직 (의도 분석 → 에이전트 위임)
- [x] PlannerAgent DAG 생성 로직 (구조화된 JSON DAG 출력)
- [x] DAG 실행 엔진 구현 (의존관계 해결, 병렬/순차 실행)
- [x] 상태 머신 구현 (INIT → PLANNING → EXECUTING → VALIDATING → COMPLETED)
- [x] 에이전트 간 메시지 패싱 구현
- [x] 시나리오 1 (식당 창업) 전체 파이프라인 연결
- [x] 정부 API Mock 구현 (6개 엔드포인트)

### Day 3: RAG 법령 시스템 + Legal Agent
- [x] 핵심 법령 데이터 수집 및 청킹 (120+ 청크, 7개 법령 JSON)
- [ ] LanceDB 설정 및 법령 임베딩 → **키워드 기반 검색으로 MVP 대체**
- [x] LegalAgent RAG 파이프라인 완성 (키워드 검색 + 스코어링 → 인용 생성)
- [x] 법령 인용 UI 컴포넌트 (법조문명 + 조항번호 + 관련 텍스트)
- [x] ValidatorAgent 교차 검증 로직
- [x] DocumentAgent 서류 목록 생성 + 자동완성 안내
- [x] PII 마스킹 파이프라인 구현

### Day 4: 시각화 대시보드 + 2개 추가 시나리오
- [x] React Flow DAG 시각화 (커스텀 노드, 애니메이션 에지)
- [x] 에이전트 활동 로그 패널 (실시간 타이핑 효과)
- [x] 상태 머신 시각화 컴포넌트
- [x] KPI 메트릭 패널 (처리시간, 단축률 등)
- [x] 시나리오 2 (전입신고) 구현 (1건→7건 cascade DAG)
- [x] 시나리오 3 (긴급복지) 구현 (위기정보 + 복지 연계)
- [x] 시나리오 선택 UI

### Day 5: 랜딩 페이지 + UI 폴리시 + 배포
- [x] 프로젝트 소개 랜딩 페이지 (Hero + 기능 소개 + 시나리오 카드)
- [x] UI 애니메이션 폴리시 (Framer Motion) — Digital Command Center 다크 테마
- [x] 반응형 레이아웃 최적화 (데모 대시보드 Tailwind 반응형, StateMachine 스크롤, MiniMap 숨김, Hero 텍스트, 그리드 브레이크포인트)
- [x] 다크/라이트 테마 (다크 커맨드 센터 데모 + 라이트 랜딩)
- [x] Vercel 배포 및 도메인 설정
- [x] 성능 최적화 (에이전트 딜레이 50% 축소, DAG 내 실시간 이벤트 발행, dummy delay 100ms)
- [x] 데모 시나리오 미세 조정 (빈 시나리오 디렉토리 삭제, api_call/legal_citation DAG 내 실시간 발행)

### Day 6: 버퍼 + 최종 검증
- [x] 버그 수정 및 엣지 케이스 처리 (ValidatorAgent 인용 검증, agent_error 발행, 중복 Legal 호출 제거, PII 하이라이트, emitter 디버그 로깅)
- [x] 에러 복구 시연 구현 (errorDemo 토글 → RETRY → Legal 재실행 → 재검증 → COMPLETED)
- [x] `npm run build` 통합 빌드 검증 통과 (0 에러, 21개 파일 수정)
- [ ] 3개 시나리오 수동 실행 검증 (`npm run dev`로 각 시나리오 E2E 확인)
- [ ] Vercel 재배포 (최신 변경사항 반영)
- [ ] 데모 영상 녹화 (선택)
- [x] GitHub 리포지토리 — https://github.com/yonghwan1106/allpass-prototype

---

## 차별화 "Wow Factor" 요소

1. **실시간 DAG 애니메이션** - 심사위원이 AI의 "사고 과정"을 시각적으로 확인
2. **에이전트 간 협업 로그** - 단일 챗봇이 아닌 멀티 에이전트 협업을 증명
3. **법령 인용 with 조문번호** - 프로덕션급 법적 정확성 시그널
4. **정부 API 시뮬레이션** - 실제 DPG Hub 연계 가능성 입증
5. **PII 마스킹 시연** - 보안 의식 어필
6. **처리 시간 메트릭** - "처리시간: 47초 → 8초 (83% 단축)" 실시간 표시
7. **1건 입력 → N건 자동연계** - 전입신고 cascade 효과
8. **에러 복구 데모** - ValidatorAgent가 오류 감지 → 자동 재시도 → HUMAN_REVIEW 분기
9. **상태 머신 시각화** - INIT→PLANNING→EXECUTING→VALIDATING→COMPLETED 실시간 전이
10. **3개 시나리오 완전 구현** - 식당 창업, 전입신고, 긴급복지 모두 체험 가능

---

## 검증 방법

1. **기능 검증**: 3개 시나리오 각각 입력 → DAG 생성 → 에이전트 실행 → 결과 출력 전체 흐름 확인
2. **시각화 검증**: DAG 노드 상태 변화(pending→running→completed) 애니메이션 동작 확인
3. **RAG 검증**: 법령 질의 시 정확한 법조문 인용 (조항번호 포함) 반환 확인
4. **스트리밍 검증**: SSE를 통한 실시간 에이전트 이벤트 전송 확인
5. **배포 검증**: Vercel 배포 후 외부 접속 가능 여부 확인
6. **성능 검증**: 첫 에이전트 응답 3초 이내, 전체 시나리오 완료 60초 이내

---

## 주요 파일 목록

- `app/api/chat/route.ts` - 핵심 오케스트레이션 엔드포인트
- `lib/agents/orchestrator.ts` - 에이전트 오케스트레이션 엔진
- `lib/agents/dag-executor.ts` - DAG 실행 엔진
- `lib/rag/legal-search.ts` - 법령 RAG 검색
- `components/dag/DAGViewer.tsx` - React Flow DAG 시각화
- `components/chat/ChatInterface.tsx` - 대화형 UI
- `components/monitor/AgentLog.tsx` - 에이전트 모니터링
- `data/legal/*.json` - 법령 데이터
- `lib/mock/government-apis.ts` - 정부 API 시뮬레이션
