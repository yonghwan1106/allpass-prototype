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
    <div className="mt-2 border-l-4 border-blue-500 bg-blue-50 rounded-r-md p-3 text-sm">
      <div className="flex items-center gap-2 font-semibold text-blue-800">
        <Scale className="w-3.5 h-3.5" />
        <span>{citation.lawName}</span>
        <Badge variant="secondary" className="text-xs">{citation.article}</Badge>
      </div>
      <p className="mt-1 text-blue-700 text-xs leading-relaxed">{citation.content}</p>
      <p className="mt-1 text-blue-500 text-xs">관련도: {citation.relevance}</p>
    </div>
  );
}

function DocumentChecklist({ documents }: { documents: DocumentInfo[] }) {
  return (
    <div className="mt-2 space-y-1">
      {documents.map((doc, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          {doc.status === 'auto-filled' ? (
            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
          ) : doc.status === 'required' ? (
            <FileText className="w-4 h-4 text-orange-400 shrink-0" />
          ) : (
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
          )}
          <span className={cn(
            'text-gray-700',
            doc.status === 'auto-filled' && 'line-through text-gray-400'
          )}>
            {doc.name}
          </span>
          {doc.status === 'auto-filled' && (
            <Badge variant="secondary" className="text-xs py-0">자동완성</Badge>
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
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm"
          style={{ backgroundColor: agentConfig?.color ?? '#6366f1' + '20' }}
        >
          {agentConfig?.icon ?? '🤖'}
        </div>
      )}

      <div className={cn('flex flex-col max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        {/* Agent name */}
        {!isUser && agentConfig && (
          <span className="text-xs text-gray-500 mb-1 ml-1">{agentConfig.nameKo}</span>
        )}

        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
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
          <Card className="mt-2 p-3 w-full">
            <p className="text-xs font-semibold text-gray-600 mb-2">필요 서류 목록</p>
            <DocumentChecklist documents={message.documents} />
          </Card>
        )}

        {/* Timestamp */}
        <span className="text-xs text-gray-400 mt-1 px-1">
          {new Date(message.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}
