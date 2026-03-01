'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SCENARIOS, ScenarioId } from '@/lib/agents/types';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock } from 'lucide-react';

const STEP_COMPLEXITY: Record<number, string> = {
  5: '간단',
  6: '보통',
  7: '복합',
};

export function ScenarioCards() {
  const scenarios = Object.values(SCENARIOS) as (typeof SCENARIOS)[ScenarioId][];

  return (
    <section
      className="relative py-24 px-6 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 60%, #e8edf5 100%)',
      }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Center radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '50%',
          background: 'radial-gradient(ellipse, rgba(16,185,129,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-bold tracking-widest uppercase mb-5"
            style={{
              color: '#10b981',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.25)',
              boxShadow: '0 0 16px rgba(16,185,129,0.08)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }}
            />
            LIVE DEMO
          </span>

          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            시나리오 체험
          </h2>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            실제 민원 사례로 All-Pass를 직접 경험해보세요
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {scenarios.map((scenario, i) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="scenario-card group relative bg-white rounded-2xl overflow-hidden flex flex-col cursor-default"
              style={{ '--scenario-color': scenario.color } as React.CSSProperties}
            >
              {/* Step indicator badge — top right */}
              <span
                className="absolute top-4 right-4 z-10 text-xs font-black tabular-nums px-2 py-0.5 rounded-full"
                style={{
                  background: `${scenario.color}15`,
                  color: scenario.color,
                  border: `1px solid ${scenario.color}25`,
                }}
              >
                0{i + 1}
              </span>

              {/* Color header area — stronger gradient */}
              <div
                className="px-6 pt-6 pb-5 relative overflow-hidden"
                style={{
                  background: `linear-gradient(145deg, ${scenario.color}18 0%, ${scenario.color}08 100%)`,
                }}
              >
                {/* Decorative circle in the header bg */}
                <div
                  className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${scenario.color} 0%, transparent 70%)` }}
                />

                {/* Icon container */}
                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${scenario.color}25 0%, ${scenario.color}12 100%)`,
                    border: `1px solid ${scenario.color}30`,
                    boxShadow: `0 4px 16px ${scenario.color}20`,
                  }}
                >
                  {scenario.icon}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1.5">{scenario.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{scenario.description}</p>
              </div>

              {/* Tags */}
              <div className="px-6 pb-4 pt-3 flex flex-wrap gap-1.5 flex-1">
                {scenario.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs font-medium"
                    style={{
                      backgroundColor: `${scenario.color}12`,
                      color: scenario.color,
                      border: `1px solid ${scenario.color}20`,
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Progress bar — thicker with shimmer */}
              <div className="px-6 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock aria-hidden="true" className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500 font-medium">예상 처리 단계</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${scenario.color}12`,
                        color: scenario.color,
                      }}
                    >
                      {STEP_COMPLEXITY[scenario.expectedSteps] ?? '복합'}
                    </span>
                    <span className="text-xs font-black" style={{ color: scenario.color }}>
                      {scenario.expectedSteps}단계
                    </span>
                  </div>
                </div>

                {/* Thick progress bar with shimmer */}
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: `${scenario.color}15` }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((scenario.expectedSteps / 10) * 100, 100)}%`,
                      background: `linear-gradient(90deg, ${scenario.color}bb, ${scenario.color})`,
                      boxShadow: `0 0 8px ${scenario.color}50`,
                    }}
                  />
                </div>
              </div>

              {/* CTA button */}
              <div className="px-6 pb-6">
                <Link
                  href={`/demo?scenario=${scenario.id}`}
                  className="scenario-cta-btn group/btn relative w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${scenario.color}dd, ${scenario.color})`,
                    color: 'white',
                    boxShadow: `0 4px 16px ${scenario.color}35`,
                  }}
                >
                  {/* Shimmer on button */}
                  <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                    <span
                      className="absolute inset-y-0 w-1/3 bg-white/20 blur-sm opacity-0 group-hover/btn:opacity-100"
                      style={{ animation: 'cta-shimmer 1.8s ease-in-out infinite' }}
                    />
                  </span>
                  <span className="relative">체험하기</span>
                  <ArrowRight aria-hidden="true" className="relative w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
