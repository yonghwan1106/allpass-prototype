'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '@/lib/store/agent-store';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowRight } from 'lucide-react';

function HighlightText({ text, highlights, color }: { text: string; highlights: string[]; color: string }) {
  if (!highlights.length) return <span>{text}</span>;
  const regex = new RegExp(`(${highlights.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        highlights.some((h) => h.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} style={{ backgroundColor: color + '40', color, borderRadius: 3, padding: '0 2px' }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

const TYPE_LABELS: Record<string, string> = {
  name: '이름',
  phone: '전화번호',
  address: '주소',
  ssn: '주민등록번호',
  email: '이메일',
  birth: '생년월일',
};

export function PIIMaskingDemo() {
  const piiEvents = useAgentStore((s) => s.piiEvents);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
        <Shield className="w-4 h-4 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-700">PII 마스킹 시연</h3>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4">
        {piiEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <Shield className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-sm text-center">개인정보 마스킹 이벤트가<br />여기에 표시됩니다</p>
          </div>
        ) : (
          <AnimatePresence>
            {piiEvents.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-lg border border-purple-100 bg-purple-50 p-3 space-y-2"
              >
                {/* PII type badges */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {event.detectedTypes.map((type, j) => (
                    <Badge
                      key={j}
                      className="text-xs"
                      style={{ backgroundColor: '#7c3aed20', color: '#7c3aed', border: '1px solid #7c3aed40' }}
                    >
                      {TYPE_LABELS[type] ?? type}
                    </Badge>
                  ))}
                </div>

                {/* Flow: original → masked */}
                <div className="flex items-start gap-2 text-xs flex-wrap">
                  {/* Step 1: original */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 min-w-0 bg-white rounded p-2 border border-red-200"
                  >
                    <p className="text-[10px] text-red-500 font-semibold mb-1">원본 텍스트</p>
                    <p className="text-gray-700 leading-relaxed break-words">
                      <HighlightText
                        text={event.original}
                        highlights={[]}
                        color="#ef4444"
                      />
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center self-center"
                  >
                    <ArrowRight className="w-4 h-4 text-purple-500" />
                  </motion.div>

                  {/* Step 2: masked */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex-1 min-w-0 bg-white rounded p-2 border border-purple-200"
                  >
                    <p className="text-[10px] text-purple-500 font-semibold mb-1">마스킹 처리</p>
                    <p className="text-gray-700 leading-relaxed break-words font-mono">
                      {event.masked}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
