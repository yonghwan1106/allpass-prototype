'use client';

import { motion } from 'framer-motion';
import { Brain, Scale, Link2, Shield, BarChart3, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: '멀티 에이전트 AI',
    description: '7개의 전문 AI 에이전트가 협업하여 복합 민원을 병렬 처리합니다.',
    color: '#6366f1',
    index: '01',
  },
  {
    icon: Scale,
    title: '법령 기반 RAG',
    description: '실시간으로 관련 법령을 검색하고 조문을 직접 인용하여 정확한 답변을 제공합니다.',
    color: '#ec4899',
    index: '02',
  },
  {
    icon: Link2,
    title: '원스톱 처리',
    description: '복합 민원을 자동으로 분해하고 관련 파생 민원까지 한 번에 연계 처리합니다.',
    color: '#10b981',
    index: '03',
  },
  {
    icon: Shield,
    title: 'PII 보호',
    description: '개인정보를 자동으로 감지하고 토큰 치환 방식으로 안전하게 마스킹합니다.',
    color: '#8b5cf6',
    index: '04',
  },
  {
    icon: BarChart3,
    title: '실시간 모니터링',
    description: 'DAG 워크플로우를 시각화하여 에이전트 처리 과정을 실시간으로 확인합니다.',
    color: '#3b82f6',
    index: '05',
  },
  {
    icon: Zap,
    title: '83% 시간 단축',
    description: '기존 대비 83% 처리 시간을 단축하여 민원인의 대기 시간을 획기적으로 줄입니다.',
    color: '#f59e0b',
    index: '06',
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative py-28 px-6 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #f0f4ff 0%, #f8fafc 40%, #ffffff 100%)',
      }}
    >
      {/* Subtle dot-mesh background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(99,102,241,0.07) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Radial glow accent — center */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '40%',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.05) 0%, transparent 70%)',
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
          {/* Badge with animated border */}
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-xs font-bold tracking-widest uppercase mb-5"
            style={{
              color: '#6366f1',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.25)',
              boxShadow: '0 0 16px rgba(99,102,241,0.08)',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#6366f1', boxShadow: '0 0 6px #6366f1' }}
            />
            CORE TECHNOLOGY
          </span>

          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            핵심 기능
          </h2>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            All-Pass가 민원 처리를 혁신하는 방법
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.42, delay: i * 0.07 }}
                className="landing-feature-card group cursor-default"
                style={{ '--card-accent': feature.color } as React.CSSProperties}
              >
                {/* Index number — top right */}
                <span
                  className="absolute top-5 right-5 text-xs font-black tabular-nums opacity-15 group-hover:opacity-40 transition-opacity duration-300"
                  style={{ color: feature.color, fontVariantNumeric: 'tabular-nums' }}
                >
                  {feature.index}
                </span>

                {/* Icon container with gradient bg */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}1a 0%, ${feature.color}0d 100%)`,
                    border: `1px solid ${feature.color}20`,
                    boxShadow: `0 4px 12px ${feature.color}15`,
                  }}
                >
                  <Icon
                    className="w-5 h-5 transition-all duration-300"
                    style={{ color: feature.color }}
                  />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>

                {/* Bottom accent dot */}
                <div
                  className="absolute bottom-5 right-5 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                  style={{ background: feature.color, boxShadow: `0 0 6px ${feature.color}` }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
