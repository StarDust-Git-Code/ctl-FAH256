import React from 'react';
import { CheckCircle2, Clock, MapPin, QrCode, FileText, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ChainOfCustodyTimeline({ handoffs, isDarkMode = true }) {
  const steps = handoffs || [];

  const cardBg = isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`${cardBg} rounded-xl p-5 space-y-6 transition-colors`}>
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b pb-4 ${
        isDarkMode ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            CHAIN OF CUSTODY IMMUTABLE AUDIT TIMELINE
            <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold border ${
              isDarkMode ? 'bg-blue-950/80 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              ISO 21978 COMPLIANT
            </span>
          </h3>
          <p className={`text-xs ${subText}`}>
            End-to-End Custody Transfer Protocol • Handshake Verification • Dual Signature Proof
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={`px-2.5 py-1 rounded border flex items-center gap-1 font-semibold ${
            isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <ShieldCheck className="w-3.5 h-3.5" /> 3 of 6 Handoffs Completed
          </span>
        </div>
      </div>

      {/* Interactive Horizontal Handoff Flow Diagram */}
      <div className="relative overflow-x-auto pb-4">
        <div className="min-w-[760px] flex items-center justify-between relative px-6">
          <div className={`absolute top-1/2 left-10 right-10 h-1 -translate-y-1/2 z-0 ${
            isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
          }`} />

          {steps.map((step, idx) => {
            const isDone = step.status === 'COMPLETED';
            const isInProgress = step.status === 'IN_PROGRESS';

            return (
              <div key={idx} className="relative z-10 flex flex-col items-center group">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-md transition transform group-hover:scale-105 ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : isInProgress
                      ? 'bg-blue-600 border-blue-500 text-white animate-pulse'
                      : isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-slate-500'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : isInProgress ? (
                    <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
                  ) : (
                    <span className="font-bold font-mono text-sm">{step.step}</span>
                  )}
                </div>

                <span className={`text-xs font-bold mt-2 text-center max-w-[100px] ${
                  isDone
                    ? isDarkMode ? 'text-slate-100' : 'text-slate-900'
                    : isInProgress
                    ? 'text-blue-400'
                    : isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {step.stage}
                </span>
                <span className={`text-[10px] text-center font-mono mt-0.5 max-w-[110px] truncate ${subText}`}>
                  {step.person ? step.person.split(' ')[0] : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Handoff Record Cards */}
      <div className="space-y-3">
        <h4 className={`text-xs font-bold uppercase tracking-wider ${subText}`}>
          Individual Handoff Logs & Signatures
        </h4>

        {steps.map((step) => {
          const isDone = step.status === 'COMPLETED';
          const isInProgress = step.status === 'IN_PROGRESS';

          return (
            <div
              key={step.step}
              className={`p-4 rounded-lg border text-xs space-y-2 transition ${
                isDone
                  ? isDarkMode ? 'bg-slate-800/50 border-slate-700/80' : 'bg-slate-50/80 border-slate-200'
                  : isInProgress
                  ? isDarkMode ? 'bg-blue-950/40 border-blue-900/80' : 'bg-blue-50/80 border-blue-300'
                  : isDarkMode ? 'bg-slate-950/40 border-slate-800/40 opacity-50' : 'bg-slate-50/30 border-slate-100 opacity-60'
              }`}
            >
              <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2 ${
                isDarkMode ? 'border-slate-800' : 'border-slate-200/60'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] border ${
                    isDone
                      ? isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    STEP #{step.step}
                  </span>
                  <span className="font-bold text-sm">{step.stage}</span>
                  <span className={subText}>({step.organization})</span>
                </div>

                <div className={`flex items-center gap-3 font-mono text-[11px] ${subText}`}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    {step.timestamp}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {step.gps}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className={`text-[10px] uppercase font-bold block ${subText}`}>Authorized Custodian</span>
                  <span className="font-semibold flex items-center gap-1.5 mt-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    {step.person}
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] uppercase font-bold block ${subText}`}>QR & HMAC Verification</span>
                  <span className="font-mono text-blue-400 font-bold flex items-center gap-1.5 mt-0.5">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    {step.qrVerified ? `VERIFIED: ${step.hmacHash}` : 'Pending QR Scan'}
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] uppercase font-bold block ${subText}`}>Custody Notes & Seal</span>
                  <span className={`italic block mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    "{step.notes}"
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
