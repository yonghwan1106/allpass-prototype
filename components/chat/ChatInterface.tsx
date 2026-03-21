'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from '@/lib/store/chat-store';
import { useAgentStore } from '@/lib/store/agent-store';
import { SCENARIOS, ScenarioId, SSEEvent, AgentId } from '@/lib/agents/types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Send, RotateCcw, Mic, FileText } from 'lucide-react';
import { ResultReport } from '@/components/monitor/ResultReport';

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
    setPendingApproval,
    setCrisisSignals,
    setCrisisPhase,
    setCrisisPrograms,
    reset: resetAgent,
  } = useAgentStore();

  const [errorDemo, setErrorDemo] = useState(false);
  const [replayMode, setReplayMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const workflowState = useAgentStore(s => s.workflowState);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userScrolledUp = useRef(false);

  // Track if user manually scrolled up
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handleScroll = () => {
      userScrolledUp.current = el.scrollHeight - el.scrollTop - el.clientHeight > 80;
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll only when user hasn't scrolled up
  useEffect(() => {
    if (!userScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
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
          detectedSpans: (d.detectedSpans as string[]) ?? [],
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

      case 'human_approval_request':
        setPendingApproval(d as Parameters<typeof setPendingApproval>[0]);
        break;

      case 'human_approval_response':
        setPendingApproval(null);
        break;

      case 'crisis_detection':
        // TODO: wire up CrisisDetectionPanel when implemented
        if (d.phase) setCrisisPhase(d.phase as Parameters<typeof setCrisisPhase>[0]);
        if (d.signals) setCrisisSignals(d.signals as Parameters<typeof setCrisisSignals>[0]);
        if (d.matchedPrograms) setCrisisPrograms(d.matchedPrograms as Parameters<typeof setCrisisPrograms>[0]);
        break;

      case 'complete':
        setStreaming(false);
        setWorkflowState('COMPLETED');
        break;
    }
  }, [addEvent, setWorkflowState, updateAgent, setDAG, updateDAGNode, addCitation, addPIIEvent, addAPICall, setMetrics, updateLastAssistantMessage, setStreaming, setPendingApproval, setCrisisSignals, setCrisisPhase, setCrisisPrograms]);

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
        body: JSON.stringify({ message: text.trim(), scenarioId: currentScenario, errorDemo, mode: replayMode ? 'replay' : undefined }),
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
  }, [isStreaming, currentScenario, errorDemo, replayMode, addMessage, setInputValue, setStreaming, handleSSEEvent, updateLastAssistantMessage]);

  const simulateVoiceInput = useCallback(() => {
    setIsListening(true);
    setTimeout(() => {
      const scenario = currentScenario ? SCENARIOS[currentScenario] : null;
      setInputValue(scenario?.defaultInput ?? '식당을 창업하려고 하는데 어떤 절차가 필요한가요?');
      setIsListening(false);
    }, 2000);
  }, [currentScenario, setInputValue]);

  const handleVoiceInput = useCallback(() => {
    if (isListening) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        simulateVoiceInput();
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      simulateVoiceInput();
    }
  }, [isListening, simulateVoiceInput, setInputValue]);

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
    <div className="flex flex-col h-full bg-ap-base border-t border-ap-border">
      {/* Scenario quick-select */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-ap-border bg-ap-panel overflow-x-auto shrink-0" style={{ WebkitOverflowScrolling: 'touch' }}>
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
          onClick={() => setErrorDemo(!errorDemo)}
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
            errorDemo
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-ap-card text-slate-500 border-ap-border hover:border-slate-500'
          }`}
          title="에러 복구 데모 모드"
        >
          ⚡ 에러 복구
        </button>
        <button
          onClick={() => setReplayMode(!replayMode)}
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
            replayMode
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              : 'bg-ap-card text-slate-500 border-ap-border hover:border-slate-500'
          }`}
          title="시뮬레이션 모드 (녹화 재생)"
        >
          🔄 시뮬레이션
        </button>
        <button
          onClick={handleReset}
          className="ml-auto shrink-0 p-1.5 rounded-full hover:bg-white/5 text-slate-500 transition-colors"
          title="초기화"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" ref={scrollContainerRef}>
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
      </div>

      {/* Result report button */}
      {workflowState === 'COMPLETED' && (
        <div className="shrink-0 px-3 py-2 border-t border-ap-border">
          <button
            onClick={() => setShowReport(true)}
            className="w-full py-2 rounded-xl bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" /> 결과 보고서 보기
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 border-t border-ap-border bg-ap-panel p-2 sm:p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="민원 내용을 입력하세요... (Shift+Enter로 줄바꿈)"
            disabled={isStreaming}
            rows={2}
            className="flex-1 resize-none rounded-xl border border-ap-border bg-ap-card px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          <button
            onClick={handleVoiceInput}
            disabled={isStreaming || isListening}
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-ap-card text-slate-400 border border-ap-border hover:border-slate-500 hover:text-slate-300'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title="음성 입력"
          >
            <Mic className="w-4 h-4" />
          </button>
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

      <ResultReport isOpen={showReport} onClose={() => setShowReport(false)} />
    </div>
  );
}
