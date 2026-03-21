'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '@/lib/store/agent-store';
import { useChatStore } from '@/lib/store/chat-store';
import { FileText, X, Printer, Clock, Scale, FileCheck, BarChart3 } from 'lucide-react';

interface ResultReportProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResultReport({ isOpen, onClose }: ResultReportProps) {
  const { workflowState, metrics, citations, dag, apiCalls, piiEvents } = useAgentStore();
  const { currentScenario } = useChatStore();

  if (!isOpen || workflowState !== 'COMPLETED') return null;

  const scenarioTitles: Record<string, string> = {
    restaurant: '소상공인 식당 창업 인허가',
    relocation: '전입신고 및 파생민원 처리',
    welfare: '긴급복지 연계 및 실업급여 신청',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-ap-deep border border-ap-border rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-ap-border bg-ap-deep/95 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">처리 결과 보고서</h2>
                <p className="text-xs text-slate-500">{new Date().toLocaleDateString('ko-KR')} 생성</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
                title="인쇄"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Title */}
            <div className="text-center py-4">
              <h3 className="text-xl font-bold text-white mb-1">
                {currentScenario ? scenarioTitles[currentScenario] : 'AI 민원 처리'} 결과
              </h3>
              <p className="text-sm text-slate-400">All-Pass AI 에이전트 처리 완료</p>
            </div>

            {/* Metrics Grid */}
            {metrics && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-ap-card rounded-xl p-4 border border-ap-border text-center">
                  <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{(metrics.totalTime / 1000).toFixed(1)}초</p>
                  <p className="text-xs text-slate-500 mt-1">총 처리 시간</p>
                </div>
                <div className="bg-ap-card rounded-xl p-4 border border-ap-border text-center">
                  <BarChart3 className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{metrics.timeReduction}%</p>
                  <p className="text-xs text-slate-500 mt-1">시간 단축률</p>
                </div>
                <div className="bg-ap-card rounded-xl p-4 border border-ap-border text-center">
                  <FileCheck className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{metrics.agentCalls}회</p>
                  <p className="text-xs text-slate-500 mt-1">에이전트 호출</p>
                </div>
              </div>
            )}

            {/* DAG Summary */}
            {dag && (
              <div className="bg-ap-card rounded-xl p-4 border border-ap-border">
                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  처리 단계 요약
                </h4>
                <div className="space-y-2">
                  {dag.nodes.map((node, i) => (
                    <div key={node.id} className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="text-slate-300 flex-1">{node.label}</span>
                      {node.duration && <span className="text-xs text-slate-500">{(node.duration / 1000).toFixed(1)}s</span>}
                      <span className="text-emerald-400 text-xs">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legal Citations */}
            {citations.length > 0 && (
              <div className="bg-ap-card rounded-xl p-4 border border-ap-border">
                <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-pink-400" />
                  법령 근거 ({citations.length}건)
                </h4>
                <div className="space-y-2">
                  {citations.map((c, i) => (
                    <div key={i} className="px-3 py-2 bg-ap-panel rounded-lg border border-ap-border">
                      <p className="text-xs font-medium text-pink-400">{c.lawName} {c.article}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Protection */}
            {piiEvents.length > 0 && (
              <div className="bg-ap-card rounded-xl p-4 border border-ap-border">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">🔒 개인정보 보호</h4>
                <p className="text-xs text-slate-400">
                  처리 과정에서 {piiEvents[0].detectedTypes.join(', ')} 등 개인정보가 자동 비식별화되었습니다.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-4 border-t border-ap-border">
              <p className="text-xs text-slate-500">
                본 보고서는 All-Pass AI 시스템에 의해 자동 생성되었습니다.
              </p>
              <p className="text-xs text-slate-600 mt-1">
                © 2026 All-Pass — 행정안전부 AI 기반 민원 서비스 혁신
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
