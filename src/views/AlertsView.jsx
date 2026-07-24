import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Clock, MapPin, User, Search, Filter } from 'lucide-react';

export default function AlertsView({ alerts, isDarkMode = true }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filteredAlerts = alerts.filter(a =>
    filterSeverity === 'ALL' || a.severity === filterSeverity
  );

  return (
    <div className="space-y-6">
      {/* Top Header Filter Card */}
      <div className={`rounded-xl p-5 border flex flex-wrap items-center justify-between gap-4 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            REAL-TIME LOGISTICS ALERTS & INCIDENT CENTER
          </h2>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Temperature Excursions • Optical Tamper Breaches • Signal Drop & Power Disconnections
          </p>
        </div>

        <div className={`flex p-1 rounded-lg border text-xs font-mono ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterSeverity === sev
                  ? isDarkMode ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                  : isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Timeline List */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border text-xs space-y-2 transition ${
              alert.severity === 'CRITICAL'
                ? isDarkMode ? 'bg-red-950/60 border-red-900 text-red-200 shadow-lg' : 'bg-red-50 border-red-200 text-red-900'
                : alert.severity === 'HIGH'
                ? isDarkMode ? 'bg-amber-950/60 border-amber-900 text-amber-200 shadow-lg' : 'bg-amber-50 border-amber-200 text-amber-900'
                : isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-200 shadow-xl' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2 ${
              isDarkMode ? 'border-slate-800' : 'border-slate-200/60'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-900 text-red-200 animate-pulse'
                    : alert.severity === 'HIGH'
                    ? 'bg-amber-900 text-amber-200'
                    : 'bg-blue-900 text-blue-200'
                }`}>
                  {alert.severity}
                </span>
                <span className="text-sm">{alert.type}</span>
                <span className="font-mono text-blue-400 text-xs">({alert.id})</span>
              </div>
              <div className={`flex items-center gap-2 font-mono text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {alert.time}
              </div>
            </div>

            <p className={`text-xs leading-relaxed font-sans ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{alert.message}</p>

            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t text-[11px] font-mono ${
              isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200/60 text-slate-600'
            }`}>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {alert.location}
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-400" /> Driver: {alert.driver}
              </div>
              <div>
                Action: <span className="text-emerald-400 font-bold">{alert.actionTaken}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
