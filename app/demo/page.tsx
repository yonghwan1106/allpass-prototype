'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChatStore } from '@/lib/store/chat-store';
import { ScenarioId, SCENARIOS } from '@/lib/agents/types';
import { DAGViewer } from '@/components/dag/DAGViewer';
import { AgentLog } from '@/components/monitor/AgentLog';
import { LegalSearchPanel } from '@/components/legal/LegalSearchPanel';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { StateMachine } from '@/components/monitor/StateMachine';
import { MetricsPanel } from '@/components/monitor/MetricsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Scale, BarChart2 } from 'lucide-react';
import Link from 'next/link';

function DemoContent() {
  const searchParams = useSearchParams();
  const { setScenario, setInputValue } = useChatStore();

  useEffect(() => {
    const scenarioParam = searchParams.get('scenario') as ScenarioId | null;
    if (scenarioParam && SCENARIOS[scenarioParam]) {
      setScenario(scenarioParam);
      setInputValue(SCENARIOS[scenarioParam].defaultInput);
    }
  }, [searchParams, setScenario, setInputValue]);

  return (
    <div className="flex flex-col h-screen cmd-bg overflow-hidden">
      {/* Top bar + State machine (single row) */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-2 cmd-header border-b border-ap-border z-10 overflow-x-auto">
        <Link href="/" className="text-lg font-black text-blue-400 hover:text-blue-300 transition-colors shrink-0">
          All-Pass
        </Link>
        <span className="text-slate-600 shrink-0">|</span>
        <span className="text-sm text-slate-400 font-medium shrink-0">AI 민원 처리 데모</span>
        <div className="ml-auto shrink-0 flex items-center gap-3">
          <StateMachine />
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full font-medium shrink-0">
            LIVE
          </span>
        </div>
      </header>

      {/* Main layout: Left (DAG + Tabs) | Right (Chat) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

        {/* Left column: DAG (top) + Tabs (bottom) */}
        <div className="flex flex-col h-[50vh] lg:h-auto lg:w-[50%] border-b lg:border-b-0 lg:border-r border-ap-border overflow-hidden">
          {/* DAG area */}
          <div className="flex flex-col flex-1 min-h-0 border-b border-ap-border">
            <div className="shrink-0 flex items-center gap-2 px-3 py-2 cmd-panel-header">
              <span className="text-xs font-semibold text-slate-400">DAG 워크플로우</span>
            </div>
            <div className="flex-1 min-h-0">
              <DAGViewer />
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
            </Tabs>
          </div>
        </div>

        {/* Right column: Chat (full height) */}
        <div className="flex flex-col h-[50vh] lg:h-auto lg:w-[50%] overflow-hidden">
          <ChatInterface />
        </div>
      </div>
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
