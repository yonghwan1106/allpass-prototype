// ===== Agent System Type Definitions =====

export type AgentId =
  | 'master'
  | 'planner'
  | 'legal'
  | 'document'
  | 'api'
  | 'validator'
  | 'scheduler';

export type AgentStatus = 'idle' | 'thinking' | 'running' | 'completed' | 'error';

export type WorkflowState =
  | 'INIT'
  | 'PLANNING'
  | 'EXECUTING'
  | 'VALIDATING'
  | 'COMPLETED'
  | 'RETRY'
  | 'HUMAN_REVIEW';

export interface AgentConfig {
  id: AgentId;
  name: string;
  nameKo: string;
  model: 'claude-sonnet-4-6' | 'claude-haiku-4-5-20251001';
  description: string;
  color: string;
  icon: string;
}

export const AGENT_CONFIGS: Record<AgentId, AgentConfig> = {
  master: {
    id: 'master',
    name: 'MasterAgent',
    nameKo: '마스터 에이전트',
    model: 'claude-sonnet-4-6',
    description: '의도 분석, DAG 실행 오케스트레이션, 최종 응답 합성',
    color: '#6366f1',
    icon: '🧠',
  },
  planner: {
    id: 'planner',
    name: 'PlannerAgent',
    nameKo: '플래너 에이전트',
    model: 'claude-haiku-4-5-20251001',
    description: '복합민원 → DAG JSON 분해',
    color: '#8b5cf6',
    icon: '📋',
  },
  legal: {
    id: 'legal',
    name: 'LegalAgent',
    nameKo: '법령 에이전트',
    model: 'claude-sonnet-4-6',
    description: 'RAG 기반 법령 검색, 규제 적합성 판단',
    color: '#ec4899',
    icon: '⚖️',
  },
  document: {
    id: 'document',
    name: 'DocumentAgent',
    nameKo: '서류 에이전트',
    model: 'claude-haiku-4-5-20251001',
    description: '필요 서류 목록 생성, 자동완성 안내',
    color: '#f59e0b',
    icon: '📄',
  },
  api: {
    id: 'api',
    name: 'APIAgent',
    nameKo: 'API 에이전트',
    model: 'claude-haiku-4-5-20251001',
    description: '정부 API 시뮬레이션',
    color: '#10b981',
    icon: '🔌',
  },
  validator: {
    id: 'validator',
    name: 'ValidatorAgent',
    nameKo: '검증 에이전트',
    model: 'claude-sonnet-4-6',
    description: '결과 검증, 할루시네이션 탐지',
    color: '#ef4444',
    icon: '✅',
  },
  scheduler: {
    id: 'scheduler',
    name: 'SchedulerAgent',
    nameKo: '스케줄러 에이전트',
    model: 'claude-haiku-4-5-20251001',
    description: '기관 방문 일정 최적화',
    color: '#06b6d4',
    icon: '📅',
  },
};

// ===== DAG Types =====

export interface DAGNode {
  id: string;
  label: string;
  agentId: AgentId;
  status: 'pending' | 'running' | 'completed' | 'error';
  description: string;
  result?: string;
  duration?: number;
  dependencies: string[];
}

export interface DAGEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface DAGPlan {
  id: string;
  title: string;
  nodes: DAGNode[];
  edges: DAGEdge[];
}

// ===== SSE Event Types =====

export type SSEEventType =
  | 'workflow_state'
  | 'agent_start'
  | 'agent_thinking'
  | 'agent_result'
  | 'agent_error'
  | 'dag_update'
  | 'dag_node_update'
  | 'legal_citation'
  | 'pii_masking'
  | 'api_call'
  | 'message'
  | 'metrics_update'
  | 'human_approval_request'
  | 'human_approval_response'
  | 'crisis_detection'
  | 'complete';

export interface SSEEvent {
  type: SSEEventType;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface AgentStartEvent extends SSEEvent {
  type: 'agent_start';
  data: { agentId: AgentId; task: string };
}

export interface AgentThinkingEvent extends SSEEvent {
  type: 'agent_thinking';
  data: { agentId: AgentId; thought: string };
}

export interface AgentResultEvent extends SSEEvent {
  type: 'agent_result';
  data: { agentId: AgentId; result: string; duration: number };
}

export interface DAGUpdateEvent extends SSEEvent {
  type: 'dag_update';
  data: { dag: DAGPlan };
}

export interface DAGNodeUpdateEvent extends SSEEvent {
  type: 'dag_node_update';
  data: { nodeId: string; status: DAGNode['status']; result?: string; duration?: number };
}

export interface LegalCitationEvent extends SSEEvent {
  type: 'legal_citation';
  data: {
    lawName: string;
    article: string;
    content: string;
    relevance: string;
  };
}

export interface PIIMaskingEvent extends SSEEvent {
  type: 'pii_masking';
  data: {
    original: string;
    masked: string;
    detectedTypes: string[];
    detectedSpans: string[];
  };
}

export interface APICallEvent extends SSEEvent {
  type: 'api_call';
  data: {
    endpoint: string;
    method: string;
    status: number;
    responseTime: number;
    result: Record<string, unknown>;
  };
}

export interface MetricsUpdateEvent extends SSEEvent {
  type: 'metrics_update';
  data: {
    totalTime: number;
    agentCalls: number;
    apiCalls: number;
    legalCitations: number;
    documentsGenerated: number;
    timeReduction: number;
  };
}

export interface HumanApprovalRequestEvent extends SSEEvent {
  type: 'human_approval_request';
  data: {
    approvalId: string;
    action: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    legalBasis: string;
    amount?: string;
    beneficiary?: string;
    details: Record<string, string>;
  };
}

export interface HumanApprovalResponseEvent extends SSEEvent {
  type: 'human_approval_response';
  data: {
    approvalId: string;
    decision: 'approved' | 'rejected' | 'modified';
    reason?: string;
  };
}

export type CrisisCategory = 'employment' | 'health' | 'housing' | 'finance' | 'family';
export type CrisisLevel = 'normal' | 'caution' | 'warning' | 'critical';

export interface CrisisSignal {
  id: string;
  category: CrisisCategory;
  label: string;
  level: CrisisLevel;
  description: string;
  matchedPrograms?: string[];
}

export interface CrisisDetectionEvent extends SSEEvent {
  type: 'crisis_detection';
  data: {
    phase: 'scanning' | 'detected' | 'matching' | 'complete';
    signals: CrisisSignal[];
    matchedPrograms?: Array<{ name: string; description: string; amount?: string }>;
  };
}

// ===== Chat Message Types =====

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  agentId?: AgentId;
  citations?: LegalCitation[];
  documents?: DocumentInfo[];
  metrics?: MetricsUpdateEvent['data'];
}

export interface LegalCitation {
  lawName: string;
  article: string;
  content: string;
  relevance: string;
}

export interface DocumentInfo {
  name: string;
  status: 'required' | 'auto-filled' | 'pending';
  source?: string;
}

// ===== Scenario Types =====

export type ScenarioId = 'restaurant' | 'relocation' | 'welfare';

export interface Scenario {
  id: ScenarioId;
  title: string;
  description: string;
  icon: string;
  color: string;
  defaultInput: string;
  expectedSteps: number;
  tags: string[];
}

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  restaurant: {
    id: 'restaurant',
    title: '소상공인 식당 창업',
    description: '음식점 창업에 필요한 인허가를 원스톱으로 처리',
    icon: '🍝',
    color: '#f59e0b',
    defaultInput: '연남동 383-22번지 1층에 파스타 가게를 내려고 해요. 임대차 계약은 했어요.',
    expectedSteps: 7,
    tags: ['영업허가', '건축물대장', '식품위생법'],
  },
  relocation: {
    id: 'relocation',
    title: '전입신고 + 파생민원',
    description: '전입신고 1건 → 파생민원 6건 자동 연계 처리',
    icon: '🏠',
    color: '#3b82f6',
    defaultInput: '수원시 영통구로 이사해요. 남편이랑 아이(3살) 포함 전입신고 해주세요.',
    expectedSteps: 7,
    tags: ['전입신고', '주민등록법', '자동연계'],
  },
  welfare: {
    id: 'welfare',
    title: '긴급복지 연계',
    description: '위기 상황 감지 → 복지 혜택 선제적 안내',
    icon: '🆘',
    color: '#ef4444',
    defaultInput: '갑자기 회사에서 잘렸는데... 실업급여 받으려면 어떻게 해야 하나요?',
    expectedSteps: 5,
    tags: ['실업급여', '긴급복지', '마이데이터'],
  },
};
