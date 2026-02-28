import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { ScenarioCards } from '@/components/landing/ScenarioCards';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <ScenarioCards />

      {/* Divider: gradient fade from slate-50 to footer dark */}
      <div
        className="h-24"
        style={{
          background: 'linear-gradient(to bottom, #f8fafc 0%, #050a18 100%)',
        }}
      />

      <footer
        className="relative text-white py-14 px-6 text-center overflow-hidden"
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
        {/* Subtle top glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10">
          <p
            className="text-3xl font-black mb-2 gov-gradient-text inline-block"
          >
            All-Pass
          </p>
          <p className="text-slate-400 text-sm mb-3">AI 기반 차세대 민원 처리 플랫폼</p>
          <div
            className="w-12 h-px mx-auto mb-3"
            style={{ background: 'rgba(148,163,184,0.2)' }}
          />
          <p className="text-slate-600 text-xs">
            © 2026 All-Pass. 행정안전부 공공데이터 활용 프로토타입.
          </p>
        </div>
      </footer>
    </main>
  );
}
