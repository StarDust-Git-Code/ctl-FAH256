import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ReferenceLine, CartesianGrid } from 'recharts';
import { Thermometer, Activity, Battery, Wifi, Cpu, ShieldCheck, Play, Pause, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

export default function LiveMonitoringView({ shipment, isDarkMode = true }) {
  const [isStreaming, setIsStreaming] = useState(true);
  const [dataSeries, setDataSeries] = useState([]);

  useEffect(() => {
    async function loadTelemetry() {
      try {
        const shpId = shipment ? shipment.id : 'SHP-88219';
        const data = await apiService.getTelemetry(shpId);
        setDataSeries(data || []);
      } catch (err) {
        console.error('Failed to fetch telemetry from REST API:', err);
      }
    }
    loadTelemetry();
  }, [shipment]);

  const currentPayloadTemp = shipment ? shipment.currentTemp : -72.4;
  const targetMin = shipment ? shipment.minSafeTemp : -80;
  const targetMax = shipment ? shipment.maxSafeTemp : -60;

  const cardBg = isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${cardBg} rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 transition-colors`}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-blue-500" />
            LIVE TELEMETRY & SENSOR HEALTH MONITOR
          </h2>
          <p className={`text-xs ${subText}`}>
            Real-Time Stream • 1Hz Sampling Rate • Dual Probe Thermal Redundancy
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-4 py-2 rounded-lg font-semibold text-xs border flex items-center gap-2 transition ${
              isStreaming
                ? isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isDarkMode ? 'bg-amber-950/80 text-amber-400 border-amber-800' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isStreaming ? 'Pause Telemetry Stream' : 'Resume Telemetry Stream'}
          </button>
        </div>
      </div>

      {/* Sensor Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className={`${cardBg} rounded-xl p-4 space-y-1`}>
          <span className={`${subText} font-bold uppercase text-[10px]`}>Internal Payload Probe</span>
          <div className="text-2xl font-black text-blue-400 font-mono">
            {currentPayloadTemp}°C
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold">PT100 Resistance Probe OK</span>
        </div>

        <div className={`${cardBg} rounded-xl p-4 space-y-1`}>
          <span className={`${subText} font-bold uppercase text-[10px]`}>Ambient Air Temperature</span>
          <div className="text-2xl font-black text-amber-400 font-mono">
            +27.9°C
          </div>
          <span className={`text-[10px] ${subText} font-medium`}>External Environment</span>
        </div>

        <div className={`${cardBg} rounded-xl p-4 space-y-1`}>
          <span className={`${subText} font-bold uppercase text-[10px]`}>Relative Humidity</span>
          <div className="text-2xl font-black font-mono">
            58% RH
          </div>
          <span className="text-[10px] text-blue-400 font-semibold">SHT35 Sensor Calibrated</span>
        </div>

        <div className={`${cardBg} rounded-xl p-4 space-y-1`}>
          <span className={`${subText} font-bold uppercase text-[10px]`}>Gateway Battery & Signal</span>
          <div className="text-2xl font-black text-emerald-400 font-mono flex items-center gap-2">
            <Battery className="w-5 h-5 text-emerald-400" /> 94%
          </div>
          <span className={`text-[10px] ${subText} font-medium`}>-72 dBm (5G NR Active)</span>
        </div>
      </div>

      {/* Main Recharts Telemetry Graph */}
      <div className={`${cardBg} rounded-xl p-5 space-y-4`}>
        <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            TELEMETRY CURVE: PAYLOAD TEMP VS AMBIENT ENVIRONMENT
          </h3>
          <div className={`text-xs font-mono ${subText}`}>
            Target Envelope: <span className="text-blue-400 font-bold">{targetMin}°C to {targetMax}°C</span>
          </div>
        </div>

        <div className="h-[360px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataSeries} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1e293b' : '#e2e8f0'} />
              <XAxis dataKey="time" stroke={isDarkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 11 }} />
              <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 11 }} domain={[-90, 40]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                  borderColor: isDarkMode ? '#334155' : '#cbd5e1',
                  borderRadius: '8px',
                  color: isDarkMode ? '#f8fafc' : '#0f172a',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: isDarkMode ? '#cbd5e1' : '#0f172a' }} />
              <ReferenceLine y={targetMax} label={{ value: "Max Threshold", fill: "#ef4444", fontSize: 11 }} stroke="#ef4444" strokeDasharray="4 4" />
              <ReferenceLine y={targetMin} label={{ value: "Min Threshold", fill: "#ef4444", fontSize: 11 }} stroke="#ef4444" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="temp" name="Internal Payload Temp (°C)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="ambient" name="Ambient Air Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
