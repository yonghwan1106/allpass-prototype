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

function renderInline(text: string) {
  // Bold: **text**
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, j) =>
    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
  );
}

function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines but add spacing
    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Horizontal rule: ---
    if (/^-{3,}$/.test(trimmed)) {
      elements.push(<hr key={i} className="border-white/10 my-3" />);
      continue;
    }

    // Heading: ## or ###
    if (trimmed.startsWith('## ')) {
      const text = trimmed.replace(/^##\s+/, '');
      elements.push(
        <h3 key={i} className="text-base font-bold text-white mt-4 mb-2">
          {renderInline(text)}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      const text = trimmed.replace(/^###\s+/, '');
      elements.push(
        <h4 key={i} className="text-sm font-bold text-blue-300 mt-3 mb-1.5">
          {renderInline(text)}
        </h4>
      );
      continue;
    }

    // Blockquote: >
    if (trimmed.startsWith('> ')) {
      const text = trimmed.replace(/^>\s*/, '');
      elements.push(
        <div key={i} className="border-l-2 border-blue-500/40 pl-3 py-0.5 text-slate-400 text-xs leading-relaxed">
          {renderInline(text)}
        </div>
      );
      continue;
    }

    // Numbered list: 1. 2. etc.
    if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s+/, '');
      const num = trimmed.match(/^(\d+)\./)?.[1];
      elements.push(
        <div key={i} className="flex gap-2 ml-1 py-0.5">
          <span className="text-blue-400/70 text-xs font-bold shrink-0 mt-0.5">{num}.</span>
          <span>{renderInline(text)}</span>
        </div>
      );
      continue;
    }

    // Unordered list: - or •
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const text = trimmed.replace(/^[-•]\s+/, '');
      elements.push(
        <div key={i} className="flex gap-2 ml-1 py-0.5">
          <span className="text-blue-400/60 shrink-0 mt-0.5">•</span>
          <span>{renderInline(text)}</span>
        </div>
      );
      continue;
    }

    // Regular text
    elements.push(
      <p key={i} className="py-0.5">
        {renderInline(trimmed)}
      </p>
    );
  }

  return elements;
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
              : 'bg-ap-card text-slate-200 border border-ap-border rounded-bl-sm [&_strong]:text-white'
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
          <Card className="mt-2 p-3 w-full bg-ap-card border-ap-border">
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
