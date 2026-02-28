'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LegalCitation as LegalCitationType } from '@/lib/agents/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Scale } from 'lucide-react';

interface LegalCitationProps {
  citation: LegalCitationType;
}

export function LegalCitation({ citation }: LegalCitationProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-[color:var(--ap-bg-card)] border border-[color:var(--ap-border)] border-l-4 border-l-blue-500 overflow-hidden rounded-xl hover:bg-[color:var(--ap-bg-elevated)] transition-colors">
      <div
        className="flex items-start gap-3 p-3 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Scale className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-slate-200">{citation.lawName}</span>
            <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">{citation.article}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{citation.content}</p>
        </div>
        <div className="shrink-0 text-slate-500">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 ml-11 border-t border-[color:var(--ap-border)]">
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">{citation.content}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-slate-500">관련도:</span>
                <Badge className="text-xs bg-blue-500/10 text-blue-400 border-0">
                  {citation.relevance}
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
