'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SCENARIOS, ScenarioId } from '@/lib/agents/types';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export function ScenarioCards() {
  const scenarios = Object.values(SCENARIOS) as (typeof SCENARIOS)[ScenarioId][];

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-black text-gray-900 mb-4">시나리오 체험</h2>
          <p className="text-lg text-gray-500">실제 민원 사례로 All-Pass를 직접 경험해보세요</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarios.map((scenario, i) => (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-xl"
            >
              {/* Color header */}
              <div
                className="px-6 pt-6 pb-4"
                style={{ background: `linear-gradient(135deg, ${scenario.color}15, ${scenario.color}08)` }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm"
                  style={{ backgroundColor: scenario.color + '20' }}
                >
                  {scenario.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{scenario.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{scenario.description}</p>
              </div>

              {/* Tags */}
              <div className="px-6 pb-4 pt-2 flex flex-wrap gap-1.5 flex-1">
                {scenario.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs"
                    style={{ backgroundColor: scenario.color + '15', color: scenario.color }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Meta */}
              <div className="px-6 pb-4 flex items-center gap-2 text-xs text-gray-400">
                <span>예상 처리 단계</span>
                <span className="font-semibold" style={{ color: scenario.color }}>{scenario.expectedSteps}단계</span>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <Link
                  href={`/demo?scenario=${scenario.id}`}
                  className="group w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: scenario.color, color: 'white' }}
                >
                  체험하기
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
