import { create } from 'zustand';
import type { ChatMessage, ScenarioId } from '@/lib/agents/types';

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentScenario: ScenarioId | null;
  inputValue: string;

  addMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setScenario: (scenario: ScenarioId | null) => void;
  setInputValue: (value: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  currentScenario: null,
  inputValue: '',

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateLastAssistantMessage: (content) =>
    set((state) => {
      const msgs = [...state.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') {
          msgs[i] = { ...msgs[i], content };
          break;
        }
      }
      return { messages: msgs };
    }),

  setStreaming: (isStreaming) => set({ isStreaming }),
  setScenario: (currentScenario) => set({ currentScenario }),
  setInputValue: (inputValue) => set({ inputValue }),
  clearMessages: () => set({ messages: [] }),
}));
