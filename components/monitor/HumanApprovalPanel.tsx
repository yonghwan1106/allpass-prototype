'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, X, Check, XCircle } from 'lucide-react';
import { useAgentStore } from '@/lib/store/agent-store';
import type { HumanApprovalRequestEvent } from '@/lib/agents/types';
import { useState } from 'react';

type RiskLevel = HumanApprovalRequestEvent['data']['riskLevel'];

const riskConfig: Record<RiskLevel, { label: string; badgeClass: string; iconClass: string }> = {
  low: {
    label: '낮음',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    iconClass: 'text-emerald-400',
  },
  medium: {
    label: '보통',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    iconClass: 'text-amber-400',
  },
  high: {
    label: '높음',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    iconClass: 'text-orange-400',
  },
  critical: {
    label: '위험',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
    iconClass: 'text-red-400',
  },
};

export function HumanApprovalPanel() {
  const { pendingApproval, setPendingApproval } = useAgentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDecision = async (decision: 'approved' | 'rejected' | 'modified') => {
    if (!pendingApproval || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await fetch('/api/chat/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalId: pendingApproval.approvalId,
          decision,
          reason: decision === 'modified' ? '수정 요청됨' : undefined,
        }),
      });
    } catch (err) {
      console.error('[HumanApprovalPanel] POST /api/chat/approve failed:', err);
    } finally {
      setIsSubmitting(false);
      setPendingApproval(null);
    }
  };

  return (
    <AnimatePresence>
      {pendingApproval && (
        <motion.div
          key="approval-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="w-full max-w-lg mx-4 bg-ap-card border border-ap-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-ap-border bg-ap-panel">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30">
                <ShieldCheck className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-medium">인간 검토 필요 (Human-in-the-Loop)</p>
                <p className="text-sm font-semibold text-slate-200 truncate">{pendingApproval.action}</p>
              </div>
              {/* Risk badge */}
              {(() => {
                const cfg = riskConfig[pendingApproval.riskLevel];
                return (
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.badgeClass}`}>
                    <AlertTriangle className={`w-3 h-3 ${cfg.iconClass}`} />
                    위험도: {cfg.label}
                  </span>
                );
              })()}
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed">{pendingApproval.description}</p>

              {/* Key info grid */}
              <div className="grid grid-cols-2 gap-2">
                {pendingApproval.amount && (
                  <div className="bg-ap-panel rounded-xl p-3 border border-ap-border">
                    <p className="text-xs text-slate-500 mb-1">지급 금액</p>
                    <p className="text-sm font-semibold text-emerald-400">{pendingApproval.amount}</p>
                  </div>
                )}
                {pendingApproval.beneficiary && (
                  <div className="bg-ap-panel rounded-xl p-3 border border-ap-border">
                    <p className="text-xs text-slate-500 mb-1">수혜자</p>
                    <p className="text-sm font-semibold text-slate-200">{pendingApproval.beneficiary}</p>
                  </div>
                )}
              </div>

              {/* Legal basis */}
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-blue-400 font-medium">법적 근거</p>
                  <p className="text-xs text-slate-300 mt-0.5">{pendingApproval.legalBasis}</p>
                </div>
              </div>

              {/* Details */}
              {Object.keys(pendingApproval.details).length > 0 && (
                <div className="rounded-xl border border-ap-border overflow-hidden">
                  {Object.entries(pendingApproval.details).map(([key, value], i, arr) => (
                    <div
                      key={key}
                      className={`flex items-center justify-between px-3 py-2 text-xs ${
                        i < arr.length - 1 ? 'border-b border-ap-border' : ''
                      } bg-ap-panel`}
                    >
                      <span className="text-slate-500">{key}</span>
                      <span className="text-slate-300 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={() => handleDecision('approved')}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(16,185,129,0.2)]"
              >
                <Check className="w-4 h-4" />
                승인
              </button>
              <button
                onClick={() => handleDecision('modified')}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <AlertTriangle className="w-4 h-4" />
                수정 요청
              </button>
              <button
                onClick={() => handleDecision('rejected')}
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4" />
                반려
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
