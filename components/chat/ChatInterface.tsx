'use client';

import { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '@/lib/store/chat-store';
import { useAgentStore } from '@/lib/store/agent-store';
import { SCENARIOS, ScenarioId, SSEEvent, AgentId } from '@/lib/agents/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Send, RotateCcw } from 'lucide-react';

export function ChatInterface() {
  const {
    messages,
    isStreaming,
    currentScenario,
    inputValue,
    addMessage,
    updateLastAssistantMessage,
    setStreaming,
    setScenario,
    setInputValue,
    clearMessages,
  } = useChatStore();

  const {
    setWorkflowState,
    updateAgent,
    setDAG,
    updateDAGNode,
    addCitation,
    setMetrics,
    addEvent,
    addPIIEvent,
    addAPICall,
    reset: resetAgent,
  } = useAgentStore();

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    addEvent(event);
    const d = event.data as Record<string, unknown>;

    switch (event.type) {
      case 'workflow_state':
        setWorkflowState(d.state as Parameters<typeof setWorkflowState>[0]);
        break;

      case 'agent_start':
        updateAgent(d.agentId as AgentId, {
          status: 'running',
          currentTask: d.task as string,
        });
        break;

      case 'agent_thinking':
        updateAgent(d.agentId as AgentId, {
          status: 'thinking',
          thought: d.thought as string,
        });
        break;

      case 'agent_result':
        updateAgent(d.agentId as AgentId, {
          status: 'completed',
          result: d.result as string,
          duration: d.duration as number,
        });
        break;

      case 'agent_error':
        updateAgent(d.agentId as AgentId, { status: 'error' });
        break;

      case 'dag_update':
        setDAG(d.dag as Parameters<typeof setDAG>[0]);
        break;

      case 'dag_node_update':
        updateDAGNode(d.nodeId as string, {
          status: d.status as Parameters<typeof updateDAGNode>[1]['status'],
          result: d.result as string | undefined,
          duration: d.duration as number | undefined,
        });
        break;

      case 'legal_citation':
        addCitation({
          lawName: d.lawName as string,
          article: d.article as string,
          content: d.content as string,
          relevance: d.relevance as string,
        });
        break;

      case 'pii_masking':
        addPIIEvent({
          original: d.original as string,
          masked: d.masked as string,
          detectedTypes: d.detectedTypes as string[],
        });
        break;

      case 'api_call':
        addAPICall({
          endpoint: d.endpoint as string,
          method: d.method as string,
          status: d.status as number,
          responseTime: d.responseTime as number,
        });
        break;

      case 'metrics_update':
        setMetrics(d as Parameters<typeof setMetrics>[0]);
        break;

      case 'message':
        updateLastAssistantMessage(d.content as string);
        break;

      case 'complete':
        setStreaming(false);
        setWorkflowState('COMPLETED');
        break;
    }
  }, [addEvent, setWorkflowState, updateAgent, setDAG, updateDAGNode, addCitation, addPIIEvent, addAPICall, setMetrics, updateLastAssistantMessage, setStreaming]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: text.trim(),
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setInputValue('');
    setStreaming(true);

    // Placeholder assistant message
    const assistantMsg = {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: '',
      timestamp: Date.now(),
      agentId: 'master' as AgentId,
    };
    addMessage(assistantMsg);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), scenarioId: currentScenario }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim();
            if (!raw || raw === '[DONE]') continue;
            try {
              const event = JSON.parse(raw) as SSEEvent;
              handleSSEEvent(event);
            } catch {
              // ignore malformed lines
            }
          }
        }
      }
    } catch (err) {
      console.error('SSE error:', err);
      updateLastAssistantMessage('오류가 발생했습니다. 다시 시도해 주세요.');
      setStreaming(false);
    }
  }, [isStreaming, currentScenario, addMessage, setInputValue, setStreaming, handleSSEEvent, updateLastAssistantMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleScenarioSelect = (id: ScenarioId) => {
    setScenario(id);
    setInputValue(SCENARIOS[id].defaultInput);
    textareaRef.current?.focus();
  };

  const handleReset = () => {
    clearMessages();
    resetAgent();
    setScenario(null);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full bg-[color:var(--ap-bg-base)] border-t border-[color:var(--ap-border)]">
      {/* Scenario quick-select */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[color:var(--ap-border)] bg-[color:var(--ap-bg-panel)] overflow-x-auto shrink-0">
        <span className="text-xs text-slate-500 shrink-0">시나리오:</span>
        {(Object.values(SCENARIOS) as (typeof SCENARIOS)[ScenarioId][]).map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => handleScenarioSelect(scenario.id)}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150"
            style={
              currentScenario === scenario.id
                ? {
                    backgroundColor: scenario.color,
                    color: 'white',
                    borderColor: scenario.color,
                    boxShadow: `0 0 12px ${scenario.color}33`,
                  }
                : {
                    backgroundColor: 'var(--ap-bg-card)',
                    color: '#94a3b8',
                    borderColor: 'var(--ap-border)',
                  }
            }
            onMouseEnter={(e) => {
              if (currentScenario !== scenario.id) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#64748b';
              }
            }}
            onMouseLeave={(e) => {
              if (currentScenario !== scenario.id) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ap-border)';
              }
            }}
          >
            {scenario.icon} {scenario.title}
          </button>
        ))}
        <button
          onClick={handleReset}
          className="ml-auto shrink-0 p-1.5 rounded-full hover:bg-white/5 text-slate-500 transition-colors"
          title="초기화"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message list */}
      <ScrollArea className="flex-1">
        <div className="py-3">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <span className="text-4xl mb-3 opacity-60">🤖</span>
              <p className="text-sm font-medium text-slate-400">All-Pass AI에 민원을 입력하세요</p>
              <p className="text-xs mt-1 text-slate-500">위의 시나리오를 선택하거나 직접 입력하세요</p>
            </motion.div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isStreaming && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="shrink-0 border-t border-[color:var(--ap-border)] bg-[color:var(--ap-bg-panel)] p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="민원 내용을 입력하세요... (Shift+Enter로 줄바꿈)"
            disabled={isStreaming}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-[color:var(--ap-border)] bg-[color:var(--ap-bg-card)] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={isStreaming || !inputValue.trim()}
            className="shrink-0 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-500 hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-1.5 ml-1">
          Enter로 전송 · Shift+Enter로 줄바꿈
        </p>
      </div>
    </div>
  );
}
