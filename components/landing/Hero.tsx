'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="hero-gradient hero-gradient-accent relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          animation: 'hero-grid-fade 6s ease-in-out infinite',
        }}
      />

      {/* Radial accent glows */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top center bloom */}
        <div
          className="absolute"
          style={{
            top: '-10%',
            left: '30%',
            width: '40%',
            height: '50%',
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)',
          }}
        />
        {/* Right bloom */}
        <div
          className="absolute"
          style={{
            top: '20%',
            right: '-5%',
            width: '35%',
            height: '45%',
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 65%)',
          }}
        />
        {/* Bottom left bloom */}
        <div
          className="absolute"
          style={{
            bottom: '10%',
            left: '-5%',
            width: '30%',
            height: '40%',
            background: 'radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Floating decorative dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: '15%', left: '8%', size: 4, opacity: 0.3, color: '#3b82f6' },
          { top: '25%', right: '12%', size: 6, opacity: 0.25, color: '#6366f1' },
          { top: '60%', left: '5%', size: 3, opacity: 0.2, color: '#06b6d4' },
          { top: '70%', right: '8%', size: 5, opacity: 0.2, color: '#3b82f6' },
          { top: '40%', left: '15%', size: 2, opacity: 0.35, color: '#818cf8' },
          { top: '55%', right: '18%', size: 3, opacity: 0.25, color: '#60a5fa' },
          { top: '85%', left: '25%', size: 4, opacity: 0.15, color: '#6366f1' },
          { top: '10%', right: '30%', size: 2, opacity: 0.3, color: '#06b6d4' },
        ].map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: dot.top,
              left: (dot as { left?: string }).left,
              right: (dot as { right?: string }).right,
              width: dot.size,
              height: dot.size,
              background: dot.color,
              opacity: dot.opacity,
              boxShadow: `0 0 ${dot.size * 3}px ${dot.color}`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full px-4 py-1.5 text-sm text-blue-100 mb-8"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-300" />
          <span>멀티 에이전트 AI 기반 차세대 민원 플랫폼</span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight mb-4"
        >
          <span
            className="gov-gradient-text"
            style={{
              filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.35))',
            }}
          >
            All-Pass
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-2xl md:text-3xl font-light text-blue-100 mb-4 tracking-wide"
        >
          AI 기반 차세대 민원 처리 플랫폼
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base text-blue-200/90 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          멀티 에이전트 AI가 복합 민원을 자동으로 분석하고,<br />
          법령 검색부터 서류 작성까지 원스톱으로 처리합니다.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-4 mb-12 flex-wrap"
        >
          {[
            { value: '83%', label: '처리 시간 단축' },
            { value: '7개', label: '전문 AI 에이전트' },
            { value: '24/7', label: '무중단 서비스' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl px-6 py-4 text-center"
            >
              <p className="text-4xl font-black text-white leading-none mb-1">{stat.value}</p>
              <p className="text-xs text-blue-200 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="flex items-center justify-center gap-4"
        >
          <Link
            href="/demo"
            className="group inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-blue-500/30 hover:shadow-2xl hover:scale-105 transition-all duration-200"
          >
            데모 체험하기
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 text-blue-100 border border-white/20 px-8 py-4 rounded-full hover:bg-white/8 hover:border-white/30 transition-all duration-200"
          >
            기능 살펴보기
          </a>
        </motion.div>
      </div>

      {/* Bottom gradient fade to white */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.03) 60%, white 100%)',
        }}
      />
    </section>
  );
}
