'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';

const NARRATION_STEPS = [
  { step: 1, title: '민원 입력', description: '사용자가 자연어로 민원 내용을 입력합니다', highlight: 'chat' },
  { step: 2, title: 'PII 자동 마스킹', description: '개인정보(주소, 전화번호)가 자동으로 비식별화됩니다', highlight: 'chat' },
  { step: 3, title: '의도 분석', description: 'MasterAgent가 민원 유형과 필요 에이전트를 파악합니다', highlight: 'dag' },
  { step: 4, title: 'DAG 실행 계획', description: 'PlannerAgent가 병렬 처리 가능한 작업 그래프를 생성합니다', highlight: 'dag' },
  { step: 5, title: '에이전트 병렬 실행', description: '법령 검색, 서류 생성, API 호출이 동시에 진행됩니다', highlight: 'dag' },
  { step: 6, title: '법령 근거 확인', description: 'RAG 기반으로 관련 법조문을 검색하고 인용합니다', highlight: 'tabs' },
  { step: 7, title: '결과 검증', description: 'ValidatorAgent가 할루시네이션을 탐지하고 결과를 검증합니다', highlight: 'dag' },
  { step: 8, title: '최종 안내', description: '모든 에이전트 결과를 종합한 맞춤형 안내를 제공합니다', highlight: 'chat' },
];

interface PresentationModeProps {
  isActive: boolean;
  onToggle: () => void;
}

export function PresentationMode({ isActive, onToggle }: PresentationModeProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, NARRATION_STEPS.length - 1));
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight': handleNext(); break;
        case 'ArrowLeft': handlePrev(); break;
        case 'r':
        case 'R': handleReset(); break;
        case 'Escape': onToggle(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isActive, onToggle, handleNext, handlePrev, handleReset]);

  if (!isActive) return null;

  const step = NARRATION_STEPS[currentStep];
  const progress = ((currentStep + 1) / NARRATION_STEPS.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Bottom narration bar */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="pointer-events-auto absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 px-8 py-5"
        >
          <div className="max-w-4xl mx-auto flex items-center gap-6">
            {/* Step counter */}
            <div className="text-3xl font-black text-blue-400 tabular-nums shrink-0">
              {step.step}<span className="text-slate-600 text-xl">/{NARRATION_STEPS.length}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-base text-slate-300">{step.description}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="이전 단계"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentStep === NARRATION_STEPS.length - 1}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="다음 단계"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="처음으로"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                aria-label="발표 모드 닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 max-w-4xl mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Keyboard hints */}
          <div className="mt-2 max-w-4xl mx-auto flex gap-4 text-xs text-slate-500">
            <span>← → 단계 이동</span>
            <span>R 리셋</span>
            <span>ESC 닫기</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
