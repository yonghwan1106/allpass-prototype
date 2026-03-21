'use client';

import { useEffect, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChatStore } from '@/lib/store/chat-store';
import { ScenarioId, SCENARIOS } from '@/lib/agents/types';
import { DAGViewer } from '@/components/dag/DAGViewer';
import { AgentLog } from '@/components/monitor/AgentLog';
import { LegalSearchPanel } from '@/components/legal/LegalSearchPanel';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { StateMachine } from '@/components/monitor/StateMachine';
import { MetricsPanel } from '@/components/monitor/MetricsPanel';
import { AuditTrail } from '@/components/monitor/AuditTrail';
import { HumanApprovalPanel } from '@/components/monitor/HumanApprovalPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Scale, BarChart2, ShieldCheck, Scan } from 'lucide-react';
import { CrisisDetectionPanel } from '@/components/monitor/CrisisDetectionPanel';
import { PresentationMode } from '@/components/demo/PresentationMode';
import { MCPHubOverlay } from '@/components/dag/MCPHubOverlay';
import Link from 'next/link';

function DemoContent() {
  const searchParams = useSearchParams();
  const { setScenario, setInputValue } = useChatStore();
  const [presentationMode, setPresentationMode] = useState(false);
  const [showMCPHub, setShowMCPHub] = useState(false);

  useEffect(() => {
    const scenarioParam = searchParams.get('scenario') as ScenarioId | null;
    if (scenarioParam && SCENARIOS[scenarioParam]) {
      setScenario(scenarioParam);
      setInputValue(SCENARIOS[scenarioParam].defaultInput);
    }
  }, [searchParams, setScenario, setInputValue]);

  return (
    <div className="flex flex-col h-screen cmd-bg overflow-hidden">
      {/* Human-in-the-Loop approval modal (portal-style, fixed overlay) */}
      <HumanApprovalPanel />

      {/* Top bar + State machine (single row) */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-2 cmd-header border-b border-ap-border z-10 overflow-x-auto">
        <Link href="/" className="text-lg font-black text-blue-400 hover:text-blue-300 transition-colors shrink-0">
          All-Pass
        </Link>
        <span className="text-slate-600 shrink-0">|</span>
        <span className="text-sm text-slate-400 font-medium shrink-0 hidden sm:inline">AI 민원 처리 데모</span>
        <div className="ml-auto shrink-0 flex items-center gap-3">
          <StateMachine />
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full font-medium shrink-0">
            LIVE
          </span>
          <button
            onClick={() => setShowMCPHub(!showMCPHub)}
            className={`text-xs px-1.5 sm:px-2 py-1 rounded-full font-medium border transition-all ${
              showMCPHub
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                : 'bg-ap-card text-slate-500 border-ap-border hover:border-slate-500'
            }`}
          >
            🔗 <span className="hidden sm:inline">MCP </span>HUB
          </button>
          <button
            onClick={() => setPresentationMode(!presentationMode)}
            className="text-xs px-1.5 sm:px-2 py-1 rounded-full font-medium border bg-ap-card text-slate-500 border-ap-border hover:border-slate-500 hover:text-blue-400 transition-all"
          >
            📽️ <span className="hidden sm:inline">발표 </span>모드
          </button>
        </div>
      </header>

      {/* Main layout: Left (DAG + Tabs) | Right (Chat) */}
      <div className="flex-1 flex flex-col-reverse lg:flex-row overflow-hidden min-h-0">

        {/* Left column: DAG (top) + Tabs (bottom) */}
        <div className="flex flex-col h-[40vh] lg:h-auto lg:w-[50%] border-b lg:border-b-0 lg:border-r border-ap-border overflow-hidden">
          {/* DAG area */}
          <div className="flex flex-col flex-1 min-h-0 border-b border-ap-border">
            <div className="shrink-0 flex items-center gap-2 px-3 py-2 cmd-panel-header">
              <span className="text-xs font-semibold text-slate-400">DAG 워크플로우</span>
            </div>
            <div className="flex-1 min-h-0 relative">
              <DAGViewer />
              <MCPHubOverlay isVisible={showMCPHub} />
            </div>
          </div>

          {/* Tabs area (활동 로그 / 법령 인용 / 메트릭) */}
          <div className="flex flex-col h-[30vh] lg:h-[40%] shrink-0 overflow-hidden">
            <Tabs defaultValue="log" className="flex flex-col h-full">
              <TabsList className="shrink-0 rounded-none border-b border-ap-border bg-transparent justify-start px-2 h-9 gap-1">
                <TabsTrigger value="log" className="text-xs gap-1.5 data-[state=active]:bg-white/5 data-[state=active]:text-blue-400 text-slate-500 hover:text-slate-300 rounded-md">
                  <Activity className="w-3 h-3" /> 활동 로그
                </TabsTrigger>
                <TabsTrigger value="legal" className="text-xs gap-1.5 data-[state=active]:bg-white/5 data-[state=active]:text-blue-400 text-slate-500 hover:text-slate-300 rounded-md">
                  <Scale className="w-3 h-3" /> 법령 인용
                </TabsTrigger>
                <TabsTrigger value="metrics" className="text-xs gap-1.5 data-[state=active]:bg-white/5 data-[state=active]:text-blue-400 text-slate-500 hover:text-slate-300 rounded-md">
                  <BarChart2 className="w-3 h-3" /> 메트릭
                </TabsTrigger>
                <TabsTrigger value="audit" className="text-xs gap-1.5 data-[state=active]:bg-white/5 data-[state=active]:text-emerald-400 text-slate-500 hover:text-slate-300 rounded-md">
                  <ShieldCheck className="w-3 h-3" /> AI Audit
                </TabsTrigger>
                <TabsTrigger value="crisis" className="text-xs gap-1.5 data-[state=active]:bg-white/5 data-[state=active]:text-red-400 text-slate-500 hover:text-slate-300 rounded-md">
                  <Scan className="w-3 h-3" /> 위기 감지
                </TabsTrigger>
              </TabsList>

              <TabsContent value="log" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
                <div className="h-full overflow-hidden">
                  <AgentLog />
                </div>
              </TabsContent>

              <TabsContent value="legal" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
                <div className="h-full overflow-hidden">
                  <LegalSearchPanel />
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="flex-1 overflow-auto mt-0 data-[state=inactive]:hidden">
                <MetricsPanel />
              </TabsContent>

              <TabsContent value="audit" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
                <div className="h-full overflow-hidden">
                  <AuditTrail />
                </div>
              </TabsContent>

              <TabsContent value="crisis" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
                <div className="h-full overflow-hidden">
                  <CrisisDetectionPanel />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right column: Chat (full height) */}
        <div className="flex flex-col h-[60vh] lg:h-auto lg:w-[50%] overflow-hidden">
          <ChatInterface />
        </div>
      </div>

      <PresentationMode isActive={presentationMode} onToggle={() => setPresentationMode(!presentationMode)} />
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center text-gray-400">
        <span className="text-sm">데모 로딩 중...</span>
      </div>
    }>
      <DemoContent />
    </Suspense>
  );
}
