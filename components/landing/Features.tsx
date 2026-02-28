'use client';

import { motion } from 'framer-motion';
import { Brain, Scale, Link2, Shield, BarChart3, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: '멀티 에이전트 AI',
    description: '7개의 전문 AI 에이전트가 협업하여 복합 민원을 병렬 처리합니다.',
    color: '#6366f1',
  },
  {
    icon: Scale,
    title: '법령 기반 RAG',
    description: '실시간으로 관련 법령을 검색하고 조문을 직접 인용하여 정확한 답변을 제공합니다.',
    color: '#ec4899',
  },
  {
    icon: Link2,
    title: '원스톱 처리',
    description: '복합 민원을 자동으로 분해하고 관련 파생 민원까지 한 번에 연계 처리합니다.',
    color: '#10b981',
  },
  {
    icon: Shield,
    title: 'PII 보호',
    description: '개인정보를 자동으로 감지하고 토큰 치환 방식으로 안전하게 마스킹합니다.',
    color: '#8b5cf6',
  },
  {
    icon: BarChart3,
    title: '실시간 모니터링',
    description: 'DAG 워크플로우를 시각화하여 에이전트 처리 과정을 실시간으로 확인합니다.',
    color: '#3b82f6',
  },
  {
    icon: Zap,
    title: '83% 시간 단축',
    description: '기존 대비 83% 처리 시간을 단축하여 민원인의 대기 시간을 획기적으로 줄입니다.',
    color: '#f59e0b',
  },
];

export function Features() {
  return (
    <section id="features" className="py-28 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-blue-600 bg-blue-50 rounded-full px-4 py-1 text-xs font-semibold tracking-wider uppercase mb-4">
            CORE TECHNOLOGY
          </span>
          <h2 className="text-4xl font-black text-gray-900 mb-4">핵심 기능</h2>
          <p className="text-lg text-gray-500">All-Pass가 민원 처리를 혁신하는 방법</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="landing-feature-card cursor-default"
                style={{ '--card-accent': feature.color } as React.CSSProperties}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: feature.color + '1a' }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
