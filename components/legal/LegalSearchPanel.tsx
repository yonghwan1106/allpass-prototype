'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAgentStore } from '@/lib/store/agent-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LegalCitation } from './LegalCitation';
import { Scale } from 'lucide-react';

export function LegalSearchPanel() {
  const citations = useAgentStore((s) => s.citations);

  return (
    <div className="flex flex-col h-full bg-ap-deep">
      <div className="cmd-panel-header">
        <Scale className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-slate-300">법령 인용</h3>
        {citations.length > 0 && (
          <span className="ml-auto text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5 font-medium">
            {citations.length}건
          </span>
        )}
      </div>

      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="p-3 space-y-2">
          {citations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-600">
              <Scale className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm text-center">법령 검색 결과가<br />여기에 표시됩니다</p>
            </div>
          ) : (
            <AnimatePresence>
              {citations.map((citation, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <LegalCitation citation={citation} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
