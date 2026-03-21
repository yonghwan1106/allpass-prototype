import { create } from 'zustand';
import type {
  AgentId,
  AgentStatus,
  WorkflowState,
  DAGPlan,
  DAGNode,
  LegalCitation,
  SSEEvent,
  MetricsUpdateEvent,
  HumanApprovalRequestEvent,
  CrisisSignal,
} from '@/lib/agents/types';

interface AgentState {
  id: AgentId;
  status: AgentStatus;
  currentTask: string;
  thought: string;
  result: string;
  duration: number;
}

interface AgentStore {
  // Workflow state
  workflowState: WorkflowState;
  retryCount: number;

  // Agent states
  agents: Record<AgentId, AgentState>;

  // DAG
  dag: DAGPlan | null;

  // Legal citations
  citations: LegalCitation[];

  // Metrics
  metrics: MetricsUpdateEvent['data'] | null;

  // Event log
  eventLog: SSEEvent[];

  // PII masking events
  piiEvents: Array<{ original: string; masked: string; detectedTypes: string[]; detectedSpans: string[] }>;

  // API call events
  apiCalls: Array<{ endpoint: string; method: string; status: number; responseTime: number }>;

  // Human-in-the-Loop approval
  pendingApproval: HumanApprovalRequestEvent['data'] | null;

  // Crisis detection
  crisisSignals: CrisisSignal[];
  crisisPhase: 'idle' | 'scanning' | 'detected' | 'matching' | 'complete';
  crisisPrograms: Array<{ name: string; description: string; amount?: string }>;

  // Actions
  setWorkflowState: (state: WorkflowState) => void;
  updateAgent: (id: AgentId, update: Partial<AgentState>) => void;
  setDAG: (dag: DAGPlan) => void;
  updateDAGNode: (nodeId: string, update: Partial<DAGNode>) => void;
  addCitation: (citation: LegalCitation) => void;
  setMetrics: (metrics: MetricsUpdateEvent['data']) => void;
  addEvent: (event: SSEEvent) => void;
  addPIIEvent: (event: { original: string; masked: string; detectedTypes: string[]; detectedSpans: string[] }) => void;
  addAPICall: (call: { endpoint: string; method: string; status: number; responseTime: number }) => void;
  setPendingApproval: (approval: HumanApprovalRequestEvent['data'] | null) => void;
  setCrisisSignals: (signals: CrisisSignal[]) => void;
  setCrisisPhase: (phase: 'idle' | 'scanning' | 'detected' | 'matching' | 'complete') => void;
  setCrisisPrograms: (programs: Array<{ name: string; description: string; amount?: string }>) => void;
  reset: () => void;
}

const defaultAgentState = (id: AgentId): AgentState => ({
  id,
  status: 'idle',
  currentTask: '',
  thought: '',
  result: '',
  duration: 0,
});

const initialAgents: Record<AgentId, AgentState> = {
  master: defaultAgentState('master'),
  planner: defaultAgentState('planner'),
  legal: defaultAgentState('legal'),
  document: defaultAgentState('document'),
  api: defaultAgentState('api'),
  validator: defaultAgentState('validator'),
  scheduler: defaultAgentState('scheduler'),
};

export const useAgentStore = create<AgentStore>((set) => ({
  workflowState: 'INIT',
  retryCount: 0,
  agents: { ...initialAgents },
  dag: null,
  citations: [],
  metrics: null,
  eventLog: [],
  piiEvents: [],
  apiCalls: [],
  pendingApproval: null,
  crisisSignals: [],
  crisisPhase: 'idle',
  crisisPrograms: [],

  setWorkflowState: (workflowState) =>
    set((state) => ({
      workflowState,
      retryCount: workflowState === 'RETRY' ? state.retryCount + 1 : state.retryCount,
    })),

  updateAgent: (id, update) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: { ...state.agents[id], ...update },
      },
    })),

  setDAG: (dag) => set({ dag }),

  updateDAGNode: (nodeId, update) =>
    set((state) => {
      if (!state.dag) return state;
      return {
        dag: {
          ...state.dag,
          nodes: state.dag.nodes.map((n) =>
            n.id === nodeId ? { ...n, ...update } : n
          ),
        },
      };
    }),

  addCitation: (citation) =>
    set((state) => ({ citations: [...state.citations, citation] })),

  setMetrics: (metrics) => set({ metrics }),

  addEvent: (event) =>
    set((state) => ({ eventLog: [...state.eventLog, event] })),

  addPIIEvent: (event) =>
    set((state) => ({ piiEvents: [...state.piiEvents, event] })),

  addAPICall: (call) =>
    set((state) => ({ apiCalls: [...state.apiCalls, call] })),

  setPendingApproval: (approval) => set({ pendingApproval: approval }),

  setCrisisSignals: (signals) => set({ crisisSignals: signals }),

  setCrisisPhase: (phase) => set({ crisisPhase: phase }),

  setCrisisPrograms: (programs) => set({ crisisPrograms: programs }),

  reset: () =>
    set({
      workflowState: 'INIT',
      retryCount: 0,
      agents: { ...initialAgents },
      dag: null,
      citations: [],
      metrics: null,
      eventLog: [],
      piiEvents: [],
      apiCalls: [],
      pendingApproval: null,
      crisisSignals: [],
      crisisPhase: 'idle',
      crisisPrograms: [],
    }),
}));
