'use client';

import { motion } from 'framer-motion';
import { ChatMessage, LegalCitation, DocumentInfo, AGENT_CONFIGS } from '@/lib/agents/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CheckCircle, Clock, FileText, Scale } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

function renderContent(content: string) {
  const lines = content.split('\n');
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );
    // List items
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <li key={i} className="ml-4 list-disc">
          {rendered.slice(1)}
        </li>
      );
    }
    return (
      <span key={i}>
        {rendered}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

function CitationCard({ citation }: { citation: LegalCitation }) {
  return (
    <div className="mt-2 border-l-4 border-l-blue-500 bg-blue-500/5 border border-blue-500/10 rounded-r-lg p-3 text-sm">
      <div className="flex items-center gap-2 font-semibold text-blue-300">
        <Scale className="w-3.5 h-3.5" />
        <span>{citation.lawName}</span>
        <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">{citation.article}</Badge>
      </div>
      <p className="mt-1 text-blue-400/70 text-xs leading-relaxed">{citation.content}</p>
      <p className="mt-1 text-blue-500/60 text-xs">관련도: {citation.relevance}</p>
    </div>
  );
}

function DocumentChecklist({ documents }: { documents: DocumentInfo[] }) {
  return (
    <div className="mt-2 space-y-1">
      {documents.map((doc, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          {doc.status === 'auto-filled' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : doc.status === 'required' ? (
            <FileText className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
          )}
          <span className={cn(
            'text-slate-300',
            doc.status === 'auto-filled' && 'line-through text-slate-500'
          )}>
            {doc.name}
          </span>
          {doc.status === 'auto-filled' && (
            <Badge variant="secondary" className="text-xs py-0 bg-emerald-500/10 text-emerald-400 border-0">자동완성</Badge>
          )}
        </div>
      ))}
    </div>
  );
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const agentConfig = message.agentId ? AGENT_CONFIGS[message.agentId] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, x: isUser ? 12 : -12 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('flex gap-3 px-4 py-2', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: (agentConfig?.color ?? '#6366f1') + '26' }}
        >
          {agentConfig?.icon ?? '🤖'}
        </div>
      )}

      <div className={cn('flex flex-col max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        {/* Agent name */}
        {!isUser && agentConfig && (
          <span className="text-xs text-slate-500 mb-1 ml-1">{agentConfig.nameKo}</span>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-[color:var(--ap-bg-card)] text-slate-200 border border-[color:var(--ap-border)] rounded-bl-sm [&_strong]:text-white'
          )}
        >
          {renderContent(message.content)}
        </div>

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="w-full mt-1 space-y-1">
            {message.citations.map((citation, i) => (
              <CitationCard key={i} citation={citation} />
            ))}
          </div>
        )}

        {/* Documents */}
        {message.documents && message.documents.length > 0 && (
          <Card className="mt-2 p-3 w-full bg-[color:var(--ap-bg-card)] border-[color:var(--ap-border)]">
            <p className="text-xs font-semibold text-slate-400 mb-2">필요 서류 목록</p>
            <DocumentChecklist documents={message.documents} />
          </Card>
        )}

        {/* Timestamp */}
        <span className="text-xs text-slate-600 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
