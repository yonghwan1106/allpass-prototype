import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { ScenarioCards } from '@/components/landing/ScenarioCards';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <ScenarioCards />
      <footer className="bg-[#003d9d] text-white py-10 px-6 text-center">
        <p className="text-2xl font-black mb-1">All-Pass</p>
        <p className="text-blue-200 text-sm mb-4">AI 기반 차세대 민원 처리 플랫폼</p>
        <p className="text-blue-300 text-xs">
          © 2026 All-Pass. 행정안전부 공공데이터 활용 프로토타입.
        </p>
      </footer>
    </main>
  );
}
