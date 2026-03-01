'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, ChevronDown } from 'lucide-react';

const FLOATING_DOTS = [
  { top: '13%', left: '7%',  size: 8,  opacity: 0.45, color: '#3b82f6', delay: 0 },
  { top: '22%', right: '11%', size: 12, opacity: 0.35, color: '#6366f1', delay: 1.2 },
  { top: '58%', left: '4%',  size: 6,  opacity: 0.3,  color: '#06b6d4', delay: 0.7 },
  { top: '68%', right: '7%', size: 10, opacity: 0.3,  color: '#3b82f6', delay: 1.8 },
  { top: '38%', left: '14%', size: 5,  opacity: 0.5,  color: '#818cf8', delay: 0.4 },
  { top: '52%', right: '16%', size: 7, opacity: 0.35, color: '#60a5fa', delay: 2.1 },
  { top: '82%', left: '23%', size: 9,  opacity: 0.2,  color: '#6366f1', delay: 1.5 },
  { top: '9%',  right: '28%', size: 5, opacity: 0.4,  color: '#06b6d4', delay: 0.9 },
  { top: '45%', left: '48%', size: 4,  opacity: 0.25, color: '#8b5cf6', delay: 2.5 },
  { top: '75%', right: '32%', size: 6, opacity: 0.2,  color: '#3b82f6', delay: 1.1 },
];

const STATS = [
  { value: '83%', label: '처리 시간 단축', accentColor: '#3b82f6' },
  { value: '7개', label: '전문 AI 에이전트', accentColor: '#6366f1' },
  { value: '24/7', label: '무중단 서비스', accentColor: '#06b6d4' },
];

export function Hero() {
  return (
    <section className="hero-gradient hero-gradient-accent relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Animated grid */}
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
        <div
          className="absolute"
          style={{
            top: '-10%', left: '25%', width: '50%', height: '55%',
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '20%', right: '-5%', width: '35%', height: '45%',
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '10%', left: '-5%', width: '30%', height: '40%',
            background: 'radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Floating decorative dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {FLOATING_DOTS.map((dot, i) => (
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
              '--dot-opacity': dot.opacity,
              boxShadow: `0 0 ${dot.size * 3}px ${dot.color}80`,
              animation: `float-dot ${3.5 + (i % 3) * 0.8}s ease-in-out ${dot.delay}s infinite`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        {/* Badge with animated gradient border */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="inline-flex items-center gap-2.5 mb-9"
        >
          <span
            className="relative inline-flex items-center gap-2.5 backdrop-blur-md rounded-full px-5 py-2 text-sm text-blue-100"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.1) 100%)',
              border: '1px solid rgba(99,102,241,0.35)',
              boxShadow: '0 0 20px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <Zap aria-hidden="true" className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />
            <span className="font-medium tracking-wide">행정안전부 AI 공모전 Track 2</span>
          </span>
        </motion.div>

        {/* Main title with animated glow */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.12 }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight mb-4"
        >
          <span
            className="gov-gradient-text inline-block"
            style={{ filter: 'drop-shadow(0 0 40px rgba(59,130,246,0.35))' }}
          >
            All-Pass
          </span>
        </motion.h1>

        {/* Decorative divider line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <span
            className="h-px flex-1 max-w-[80px]"
            style={{ background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.5))' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#6366f1', boxShadow: '0 0 8px #6366f1' }}
          />
          <span
            className="h-px flex-1 max-w-[80px]"
            style={{ background: 'linear-gradient(to left, transparent, rgba(99,102,241,0.5))' }}
          />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="text-2xl md:text-3xl font-light text-blue-100 mb-5 tracking-wide"
        >
          AI 기반 차세대 민원 처리 플랫폼
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32 }}
          className="text-base text-blue-200/80 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          멀티 에이전트 AI가 복합 민원을 자동으로 분석하고, 법령 검색부터 서류 작성까지 원스톱으로 처리합니다.
        </motion.p>

        {/* Stats — glowing cards */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42 }}
          className="flex items-center justify-center gap-3 sm:gap-4 mb-12 flex-wrap"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.48 + i * 0.08 }}
              className="relative group"
            >
              {/* Glow layer behind the card */}
              <div
                className="absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse, ${stat.accentColor}30 0%, transparent 70%)` }}
              />
              <div
                className="relative rounded-xl px-4 py-3 sm:px-7 sm:py-4 text-center"
                style={{
                  background: 'rgba(15, 29, 50, 0.7)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${stat.accentColor}30`,
                  boxShadow: `0 0 0 1px ${stat.accentColor}10, inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 rounded-full"
                  style={{ background: `linear-gradient(90deg, transparent, ${stat.accentColor}80, transparent)` }}
                />
                <p
                  className="text-2xl sm:text-4xl font-black leading-none mb-1"
                  style={{ color: stat.accentColor, textShadow: `0 0 20px ${stat.accentColor}60` }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-blue-200/70 mt-1 font-medium tracking-wide">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.58 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          {/* Primary — animated shimmer button */}
          <Link
            href="/demo"
            className="group relative inline-flex items-center gap-2.5 font-bold px-9 py-4 rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #3b82f6 100%)',
              backgroundSize: '200% 100%',
              animation: 'badge-border-rotate 4s linear infinite',
              boxShadow: '0 4px 24px rgba(59,130,246,0.4), 0 0 0 1px rgba(99,102,241,0.3)',
              color: 'white',
            }}
          >
            {/* Shimmer sweep */}
            <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
              <span
                className="absolute inset-y-0 w-1/4 bg-white/20 blur-sm"
                style={{ animation: 'cta-shimmer 2.8s ease-in-out infinite' }}
              />
            </span>
            <span className="relative">데모 체험하기</span>
            <ArrowRight aria-hidden="true" className="relative w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>

          {/* Secondary — premium glass */}
          <a
            href="#features"
            className="hero-secondary-cta group inline-flex items-center gap-2 font-semibold px-9 py-4 rounded-full hover:scale-105"
          >
            기능 살펴보기
          </a>
        </motion.div>
      </div>

      {/* Scroll-down indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
      >
        <span className="text-xs text-blue-300/60 font-medium tracking-widest uppercase">Scroll</span>
        <ChevronDown
          aria-hidden="true"
          className="w-5 h-5 text-blue-300/60 animate-chevron-bounce"
        />
      </motion.div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(5,10,24,0.4) 50%, rgba(248,250,252,0.0) 100%)',
        }}
      />
    </section>
  );
}
