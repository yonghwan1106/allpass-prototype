'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const scenarioData = {
  restaurant: {
    title: '소상공인 식당 창업',
    icon: '🍝',
    asIs: {
      totalTime: '14일',
      steps: [
        { label: '건축물대장 열람', location: '구청 건축과', time: '반나절', icon: '🏛️' },
        { label: '식품위생교육 이수', location: '한국식품산업협회', time: '1일', icon: '📚' },
        { label: '영업신고서 작성', location: '구청 위생과', time: '반나절', icon: '📝' },
        { label: '소방시설 점검', location: '소방서', time: '1~2일', icon: '🚒' },
        { label: '영업허가 심사 대기', location: '구청', time: '7~10일', icon: '⏳' },
        { label: '사업자등록', location: '세무서', time: '1~2일', icon: '💼' },
      ],
    },
    toBe: {
      totalTime: '3일',
      steps: [
        { label: '자연어로 민원 입력', time: '1분', icon: '💬' },
        { label: 'AI 자동 분석 + 서류 생성', time: '30초', icon: '🤖' },
        { label: '행정정보공동이용 자동조회', time: '실시간', icon: '🔄' },
        { label: '병렬 인허가 처리', time: '2~3일', icon: '⚡' },
      ],
    },
    metrics: [
      { label: '처리 기간', from: '14일', to: '3일', reduction: '79%' },
      { label: '방문 횟수', from: '6곳', to: '0곳', reduction: '100%' },
      { label: '서류 제출', from: '12종', to: '0종', reduction: '자동 처리' },
    ],
  },
  relocation: {
    title: '전입신고 + 파생민원',
    icon: '🏠',
    asIs: {
      totalTime: '3일',
      steps: [
        { label: '주민센터 방문 (전입신고)', location: '주민센터', time: '반나절', icon: '🏛️' },
        { label: '건강보험 주소 변경', location: '건보공단', time: '반나절', icon: '🏥' },
        { label: '자동차 등록지 변경', location: '차량등록소', time: '반나절', icon: '🚗' },
        { label: '아동수당 주소 변경', location: '주민센터 재방문', time: '반나절', icon: '👶' },
        { label: '전기/가스/수도 변경', location: '각 기관', time: '1일', icon: '💡' },
      ],
    },
    toBe: {
      totalTime: '1시간',
      steps: [
        { label: '전입신고 입력', time: '1분', icon: '💬' },
        { label: 'AI 파생민원 자동 감지', time: '10초', icon: '🤖' },
        { label: '7건 동시 처리', time: '1시간', icon: '⚡' },
      ],
    },
    metrics: [
      { label: '처리 기간', from: '3일', to: '1시간', reduction: '99%' },
      { label: '방문 횟수', from: '4곳', to: '0곳', reduction: '100%' },
      { label: '민원 처리', from: '1건씩', to: '7건 자동연계', reduction: '자동' },
    ],
  },
  welfare: {
    title: '긴급복지 연계',
    icon: '🆘',
    asIs: {
      totalTime: '30일+',
      steps: [
        { label: '실업급여 신청', location: '고용센터', time: '1일', icon: '🏛️' },
        { label: '대기 + 심사', location: '고용센터', time: '14일', icon: '⏳' },
        { label: '복지 제도 직접 탐색', location: '복지로/주민센터', time: '수일', icon: '🔍' },
        { label: '긴급복지 신청', location: '주민센터', time: '1일', icon: '📝' },
        { label: '심사 및 결정 대기', location: '주민센터', time: '7~14일', icon: '⏳' },
      ],
    },
    toBe: {
      totalTime: '2일',
      steps: [
        { label: '상황 입력', time: '1분', icon: '💬' },
        { label: 'AI 위기 감지 + 복지 매칭', time: '30초', icon: '🤖' },
        { label: '공무원 승인 (Human-in-the-Loop)', time: '1시간', icon: '✅' },
        { label: '자동 신청 + 처리', time: '1~2일', icon: '⚡' },
      ],
    },
    metrics: [
      { label: '처리 기간', from: '30일+', to: '2일', reduction: '93%' },
      { label: '복지 탐색', from: '직접 검색', to: '선제적 안내', reduction: '자동' },
      { label: '사각지대', from: '사후 대응', to: '선제적 감지', reduction: '해소' },
    ],
  },
};

type ScenarioKey = keyof typeof scenarioData;

const tabKeys: ScenarioKey[] = ['restaurant', 'relocation', 'welfare'];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

const toBeItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

function TimelineStep({
  step,
  variant,
  index,
}: {
  step: { label: string; time: string; icon: string; location?: string };
  variant: 'asis' | 'tobe';
  index: number;
}) {
  const isAsis = variant === 'asis';
  return (
    <motion.div
      variants={isAsis ? itemVariants : toBeItemVariants}
      className="flex gap-3 items-start"
    >
      {/* Left border indicator */}
      <div className="flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
          style={{
            background: isAsis
              ? 'rgba(239,68,68,0.12)'
              : 'rgba(59,130,246,0.12)',
            border: isAsis
              ? '1px solid rgba(239,68,68,0.3)'
              : '1px solid rgba(59,130,246,0.3)',
          }}
        >
          {step.icon}
        </div>
        {/* Connector line — rendered except after last step via CSS trick */}
        <div
          className="w-px flex-1 mt-1"
          style={{
            minHeight: 16,
            background: isAsis
              ? 'linear-gradient(to bottom, rgba(239,68,68,0.25), transparent)'
              : 'linear-gradient(to bottom, rgba(59,130,246,0.25), transparent)',
          }}
        />
      </div>

      <div
        className="flex-1 rounded-lg px-3 py-2 mb-2"
        style={{
          background: isAsis
            ? 'rgba(239,68,68,0.04)'
            : 'rgba(59,130,246,0.04)',
          border: isAsis
            ? '1px solid rgba(239,68,68,0.12)'
            : '1px solid rgba(59,130,246,0.12)',
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-slate-200 leading-snug">{step.label}</p>
          <span
            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: isAsis ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
              color: isAsis ? '#f87171' : '#60a5fa',
              border: isAsis ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(59,130,246,0.2)',
            }}
          >
            {step.time}
          </span>
        </div>
        {step.location && (
          <p className="text-xs text-slate-500 mt-1">{step.location}</p>
        )}
      </div>
    </motion.div>
  );
}

function MetricCard({
  metric,
  index,
}: {
  metric: { label: string; from: string; to: string; reduction: string };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="rounded-xl p-4"
      style={{
        background: 'rgba(15,23,42,0.6)',
        border: '1px solid rgba(99,102,241,0.2)',
      }}
    >
      <p className="text-xs text-slate-500 mb-2">{metric.label}</p>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-red-400 line-through opacity-70">{metric.from}</span>
        <span className="text-slate-500">→</span>
        <span className="text-sm font-bold text-blue-400">{metric.to}</span>
      </div>
      <div
        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.3)',
          color: '#a5b4fc',
        }}
      >
        {metric.reduction} 단축
      </div>
    </motion.div>
  );
}

export function ComparisonView() {
  const [activeTab, setActiveTab] = useState<ScenarioKey>('restaurant');

  const scenario = scenarioData[activeTab];

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #050a18 0%, #0a1020 50%, #050a18 100%)',
      }}
    >
      {/* Dot grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(148,163,184,0.05) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
        {/* Nav */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm"
          >
            <span>←</span>
            <span>돌아가기</span>
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{
              background: 'rgba(99,102,241,0.2)',
              border: '1px solid rgba(99,102,241,0.35)',
            }}
          >
            <span>데모 체험</span>
            <span>→</span>
          </Link>
        </div>

        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-4"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)',
              color: '#a5b4fc',
            }}
          >
            현행 대비 비교 분석
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            현행{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #ef4444, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              vs
            </span>{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              All-Pass
            </span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            기존 민원 처리 방식과 AI 기반 All-Pass의 차이를 시나리오별로 비교합니다
          </p>
        </motion.div>

        {/* Scenario tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 sm:justify-center sm:flex-wrap">
          {tabKeys.map((key) => {
            const s = scenarioData[key];
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: isActive
                    ? 'rgba(99,102,241,0.2)'
                    : 'rgba(15,23,42,0.5)',
                  border: isActive
                    ? '1px solid rgba(99,102,241,0.5)'
                    : '1px solid rgba(148,163,184,0.1)',
                  color: isActive ? '#a5b4fc' : '#64748b',
                }}
              >
                <span className="mr-1.5">{s.icon}</span>
                {s.title}
              </button>
            );
          })}
        </div>

        {/* Split layout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* As-Is */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: 'rgba(239,68,68,0.03)',
                  border: '1px solid rgba(239,68,68,0.15)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: '#ef4444', boxShadow: '0 0 6px rgba(239,68,68,0.5)' }}
                    />
                    <h2 className="text-base font-bold text-slate-200">As-Is (현행)</h2>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{
                      background: 'rgba(239,68,68,0.12)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#f87171',
                    }}
                  >
                    총 {scenario.asIs.totalTime}
                  </span>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-0"
                >
                  {scenario.asIs.steps.map((step, i) => (
                    <TimelineStep key={i} step={step} variant="asis" index={i} />
                  ))}
                </motion.div>
              </div>

              {/* To-Be */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background: 'rgba(59,130,246,0.03)',
                  border: '1px solid rgba(59,130,246,0.15)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: '#3b82f6', boxShadow: '0 0 6px rgba(59,130,246,0.5)' }}
                    />
                    <h2 className="text-base font-bold text-slate-200">To-Be (All-Pass)</h2>
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{
                      background: 'rgba(59,130,246,0.12)',
                      border: '1px solid rgba(59,130,246,0.25)',
                      color: '#60a5fa',
                    }}
                  >
                    총 {scenario.toBe.totalTime}
                  </span>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-0"
                >
                  {scenario.toBe.steps.map((step, i) => (
                    <TimelineStep key={i} step={step} variant="tobe" index={i} />
                  ))}
                </motion.div>

                {/* Efficiency badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  className="mt-4 rounded-xl p-3 text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(59,130,246,0.1))',
                    border: '1px solid rgba(99,102,241,0.2)',
                  }}
                >
                  <p className="text-xs text-slate-400">
                    AI 멀티에이전트 + 행정정보공동이용으로 병렬 자동 처리
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Metrics bar */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(10,16,32,0.7)',
                border: '1px solid rgba(99,102,241,0.15)',
              }}
            >
              <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">
                핵심 개선 지표
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {scenario.metrics.map((metric, i) => (
                  <MetricCard key={i} metric={metric} index={i} />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              boxShadow: '0 0 24px rgba(99,102,241,0.3)',
            }}
          >
            All-Pass 데모 체험하기
            <span>→</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
