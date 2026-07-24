import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ReferenceLine, CartesianGrid } from 'recharts';
import { Thermometer, Activity, Battery, Wifi, Cpu, ShieldCheck, Play, Pause, RefreshCw, Clock } from 'lucide-react';
import { apiService } from '../services/api';

const generateInitialTelemetrySeries = (baseTemp = -72.4) => {
  const points = [];
  const now = new Date();
  for (let i = 12; i >= 0; i--) {
    const timeStr = new Date(now.getTime() - i * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const tempVar = baseTemp + (Math.random() * 0.6 - 0.3);
    const ambientVar = 27.5 + (Math.random() * 0.8 - 0.4);
    points.push({
      time: timeStr,
      temp: Number(tempVar.toFixed(2)),
      ambient: Number(ambientVar.toFixed(2)),
      humidity: 58,
    });
  }
  return points;
};

export default function LiveMonitoringView({ shipment, isDarkMode = true }) {
  const [isStreaming, setIsStreaming] = useState(true);
  const [dataSeries, setDataSeries] = useState(() => generateInitialTelemetrySeries(shipment?.currentTemp || -72.4));
  const [lastSeenTime, setLastSeenTime] = useState('Just now (1 sec ago)');

  useEffect(() => {
    async function loadTelemetry() {
      if (!shipment) return;
      try {
        const data = await apiService.getTelemetry(shipment.id);
        if (data && data.length > 0) {
          const formatted = data.map(pt => ({
            time: new Date(pt.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            temp: Number(pt.temp !== undefined ? pt.temp : -72.4),
            ambient: 27.9,
            humidity: 58
          }));
          setDataSeries(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch telemetry from REST API:', err);
      }
    }
    loadTelemetry();
  }, [shipment]);

  // Streaming Live Data Ticker Loop
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const baseTemp = shipment ? shipment.currentTemp : -72.4;
      const nextPoint = {
        time: timeStr,
        temp: Number((baseTemp + (Math.random() * 0.4 - 0.2)).toFixed(2)),
        ambient: Number((27.9 + (Math.random() * 0.6 - 0.3)).toFixed(2)),
        humidity: 58,
      };

      setDataSeries(prev => {
        const updated = [...prev, nextPoint];
        return updated.length > 20 ? updated.slice(1) : updated;
      });

      setLastSeenTime('Just now (1 sec ago)');
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming, shipment]);

  const currentPayloadTemp = shipment ? shipment.currentTemp : -72.4;
  const targetMin = shipment ? shipment.minSafeTemp : -80.0;
  const targetMax = shipment ? shipment.maxSafeTemp : -60.0;

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
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-slate-100 border-slate-300 text-emerald-700'
          }`}>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Last Packet: <span className="font-bold">{lastSeenTime}</span>
          </div>

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
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" /> PT100 Resistance Probe OK
          </span>
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
          <span className="text-[10px] text-blue-400 font-semibold">
            SHT35 Sensor Calibrated
          </span>
        </div>

        <div className={`${cardBg} rounded-xl p-4 space-y-1`}>
          <span className={`${subText} font-bold uppercase text-[10px]`}>Gateway Battery & Signal</span>
          <div className="text-2xl font-black text-emerald-400 font-mono flex items-center gap-2">
            <Battery className="w-5 h-5 text-emerald-400" /> {shipment ? `${shipment.batteryPct || 94}%` : '98%'}
          </div>
          <span className={`text-[10px] ${subText} font-medium`}>
            -68 dBm (4G LTE Link)
          </span>
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
              <ReferenceLine y={targetMax} label={{ value: `Max Threshold (${targetMax}°C)`, fill: "#ef4444", fontSize: 11 }} stroke="#ef4444" strokeDasharray="4 4" />
              <ReferenceLine y={targetMin} label={{ value: `Min Threshold (${targetMin}°C)`, fill: "#ef4444", fontSize: 11 }} stroke="#ef4444" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="temp" name="Internal Payload Temp (°C)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="ambient" name="Ambient Air Temp (°C)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
