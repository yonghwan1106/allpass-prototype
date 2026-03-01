import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { ScenarioCards } from '@/components/landing/ScenarioCards';

export default function HomePage() {
  return (
    <main>
      <Hero />

      {/* Hero (dark) → Features (light indigo-tinted) transition */}
      <div
        className="h-28 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #050a18 0%, #0a1020 30%, #f0f4ff 100%)',
        }}
      />

      <Features />
      <ScenarioCards />

      {/* ScenarioCards (light) → Footer (dark) transition */}
      <div
        className="h-28 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #e8edf5 0%, #1a2035 60%, #050a18 100%)',
        }}
      />

      <footer
        className="relative text-white py-16 px-6 text-center overflow-hidden"
        style={{ backgroundColor: '#050a18' }}
      >
        {/* Dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(148,163,184,0.07) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Horizontal accent line at the very top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
          }}
        />

        <div className="relative z-10">
          {/* Logo mark */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: '#6366f1', boxShadow: '0 0 8px #6366f1' }}
            />
            <p className="text-3xl font-black gov-gradient-text inline-block">All-Pass</p>
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }}
            />
          </div>

          <p className="text-slate-400 text-sm mb-4 font-medium">AI 기반 차세대 민원 처리 플랫폼</p>

          {/* Thin divider */}
          <div
            className="w-16 h-px mx-auto mb-4"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(148,163,184,0.3), transparent)' }}
          />

          {/* Tag line */}
          <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
            {['멀티 에이전트 AI', 'RAG 법령 검색', '원스톱 민원 처리'].map((tag, i) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.18)',
                  color: 'rgba(148,163,184,0.8)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-slate-500 text-xs">
            © 2026 All-Pass — 행정안전부 AI 기반 민원 서비스 혁신 공모전 Track 2 프로토타입
          </p>
        </div>
      </footer>
    </main>
  );
}
