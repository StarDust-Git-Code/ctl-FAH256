import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { TrendingUp, Cpu, AlertTriangle, ShieldCheck, Clock, Award, Activity } from 'lucide-react';
import { apiService } from '../services/api';

export default function AnalyticsView({ isDarkMode = true }) {
  const [analyticsData, setAnalyticsData] = useState({
    riskIndex: 0,
    failureHorizonHours: 0,
    successRatePct: 100,
    alertDistribution: [],
    driverMatrix: [],
  });

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await apiService.getAnalytics();
        if (data) {
          setAnalyticsData(data);
        }
      } catch (err) {
        console.error('Failed to load predictive analytics from REST API:', err);
      }
    }
    loadAnalytics();
  }, []);

  const cardBg = isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${cardBg} rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 transition-colors`}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            AI-POWERED PREDICTIVE LOGISTICS ANALYTICS
          </h2>
          <p className={`text-xs ${subText}`}>
            Thermal Degradation Models • Failure Horizon Prediction • Driver Compliance Matrix
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 border rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 ${
            isDarkMode ? 'bg-blue-950/80 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <Cpu className="w-4 h-4 text-blue-400 animate-pulse" /> AI Model v3.9 Active
          </span>
        </div>
      </div>

      {/* AI Risk Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${cardBg} rounded-xl p-5 space-y-3`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${subText}`}>AI Thermal Risk Index</span>
          <div className="text-3xl font-black text-emerald-400 font-mono">{analyticsData.riskIndex} / 100</div>
          <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Overall fleet thermal risk. Insulation integrity across reefer fleet is nominal.</p>
        </div>

        <div className={`rounded-xl p-5 border space-y-3 ${
          analyticsData.failureHorizonHours > 0
            ? isDarkMode ? 'bg-red-950/40 border-red-900/80 text-red-200 shadow-lg' : 'bg-red-50/60 border-red-200 text-red-900 shadow-xs'
            : cardBg
        }`}>
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-red-500" /> Failure Horizon Alert
          </span>
          <div className="text-3xl font-black text-red-400 font-mono">
            {analyticsData.failureHorizonHours > 0 ? `${analyticsData.failureHorizonHours} Hours` : '0 Hours (Nominal)'}
          </div>
          <p className="text-xs opacity-90">
            {analyticsData.failureHorizonHours > 0
              ? 'Active thermal degradation model prediction active.'
              : 'Zero active shipments predicted to breach safe window.'}
          </p>
        </div>

        <div className={`${cardBg} rounded-xl p-5 space-y-3`}>
          <span className={`text-xs font-bold uppercase tracking-wider ${subText}`}>Delivery Success Rate</span>
          <div className="text-3xl font-black text-blue-400 font-mono">{analyticsData.successRatePct}%</div>
          <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Shipments delivered with 0 temperature excursions in past 30 days.</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Type Breakdown Pie */}
        <div className={`${cardBg} rounded-xl p-5 space-y-3`}>
          <h3 className="font-bold text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            ALERT FREQUENCY DISTRIBUTION
          </h3>
          <div className="h-[260px] w-full">
            {analyticsData.alertDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400 border border-dashed rounded-xl">
                Zero alert frequency distribution data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analyticsData.alertDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {analyticsData.alertDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#cbd5e1', borderRadius: '8px', color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: isDarkMode ? '#cbd5e1' : '#0f172a' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Driver Performance Bar Chart */}
        <div className={`${cardBg} rounded-xl p-5 space-y-3`}>
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            DRIVER COMPLIANCE MATRIX SCORECARD
          </h3>
          <div className="h-[260px] w-full">
            {analyticsData.driverMatrix.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400 border border-dashed rounded-xl">
                No active drivers registered in API.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.driverMatrix}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 11 }} />
                  <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#cbd5e1', borderRadius: '8px', color: isDarkMode ? '#f8fafc' : '#0f172a', fontSize: '12px' }} />
                  <Bar dataKey="score" name="Compliance Rating (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
