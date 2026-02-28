'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#003d9d] via-[#1a56db] to-[#2563eb]">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-400/20 via-transparent to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-100 mb-8 backdrop-blur-sm"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-300" />
          <span>멀티 에이전트 AI 기반 차세대 민원 플랫폼</span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-7xl md:text-8xl font-black tracking-tight mb-4"
        >
          <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            All-Pass
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-2xl md:text-3xl font-semibold text-blue-100 mb-4"
        >
          AI 기반 차세대 민원 처리 플랫폼
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg text-blue-200 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          멀티 에이전트 AI가 복합 민원을 자동으로 분석하고,<br />
          법령 검색부터 서류 작성까지 원스톱으로 처리합니다.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-8 mb-10 text-blue-100"
        >
          {[
            { value: '83%', label: '처리 시간 단축' },
            { value: '7개', label: '전문 AI 에이전트' },
            { value: '24/7', label: '무중단 서비스' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="text-xs text-blue-300 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center justify-center gap-4"
        >
          <Link
            href="/demo"
            className="group inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            데모 체험하기
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 text-white border border-white/30 px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            기능 살펴보기
          </a>
        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 30C1200 70 720 0 0 50L0 80Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
