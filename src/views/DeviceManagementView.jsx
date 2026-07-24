import React, { useState, useEffect } from 'react';
import { Cpu, Battery, Wifi, RefreshCw, Power, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { apiService } from '../services/api';

const DEFAULT_DEVICES = [
  {
    id: 'GW-RUGGED-9941',
    model: 'ESP32-S3 ColdChain Gateway v2.4',
    status: 'ONLINE',
    firmware: 'v2.4.1-FAH256',
    batteryPct: 98,
    powerStatus: 'Solar Auxiliary',
    simStatus: 'Airtel 4G IoT (eSIM Active)',
    signalDbm: -68,
    ledError: false,
    lastSeen: 'Just now (1 sec ago)',
    ipAddress: '192.168.137.151'
  },
  {
    id: 'GW-RUGGED-9942',
    model: 'ESP32-S3 ColdChain Gateway v2.4',
    status: 'ONLINE',
    firmware: 'v2.4.0-FAH256',
    batteryPct: 92,
    powerStatus: 'Main 24V DC',
    simStatus: 'Jio 4G IoT (eSIM Active)',
    signalDbm: -72,
    ledError: false,
    lastSeen: '4 mins ago',
    ipAddress: '192.168.137.189'
  }
];

export default function DeviceManagementView({ isDarkMode = true }) {
  const [devices, setDevices] = useState(DEFAULT_DEVICES);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function loadDevices() {
      try {
        const data = await apiService.getDevices();
        if (data && data.length > 0) {
          setDevices(data);
        }
      } catch (err) {
        console.error('Failed to load devices from REST API:', err);
      }
    }
    loadDevices();
  }, []);

  const handleOTAUpdate = async (id) => {
    try {
      setUpdatingId(id);
      await apiService.otaUpdateDevice(id);
      setDevices(prev => prev.map(d => d.id === id ? {
        ...d,
        firmware: 'v2.4.2-FAH256 (Latest)',
        lastSeen: 'Just now (OTA updated)'
      } : d));
    } catch (err) {
      console.error('OTA update failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRestart = async (id) => {
    try {
      await apiService.restartDevice(id);
      setDevices(prev => prev.map(d => d.id === id ? {
        ...d,
        status: 'ONLINE',
        lastSeen: 'Just restarted (0 sec ago)'
      } : d));
    } catch (err) {
      console.error('Restart failed:', err);
    }
  };

  const cardBg = isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${cardBg} rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 transition-colors`}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            RUGGED IOT GATEWAY & DEVICE MANAGEMENT
          </h2>
          <p className={`text-xs ${subText}`}>
            M12 Industrial Interfaces • Hardware LED Telemetry • Cellular SIM & OTA Updates
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className={`px-3 py-1 border rounded-lg font-semibold ${
            isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {devices.length} Gateways Online
          </span>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((dev) => (
          <div key={dev.id} className={`${cardBg} rounded-xl p-5 space-y-4 transition-colors`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div>
                <span className="text-xs font-mono font-bold text-blue-400">{dev.id}</span>
                <h3 className="font-bold text-sm mt-0.5">{dev.model}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                dev.status === 'ONLINE'
                  ? isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-red-900 text-red-200 border-red-800 animate-pulse'
              }`}>
                {dev.status}
              </span>
            </div>

            {/* Hardware Enclosure LED Panel */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 text-white">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Hardware LED Diagnostic Panel</span>
                <span className="text-blue-400 font-mono">IP68 Sealed M12</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-mono">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-emerald-500/50 shadow-md mb-1"></div>
                  <span className="text-emerald-400">PWR</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-blue-500/50 shadow-md mb-1"></div>
                  <span className="text-blue-400">STATUS</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 shadow-amber-500/50 shadow-md mb-1 animate-pulse"></div>
                  <span className="text-amber-400">TX/RX</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full mb-1 ${dev.ledError ? 'bg-red-500 animate-ping' : 'bg-slate-700'}`}></div>
                  <span className={dev.ledError ? 'text-red-400 font-bold' : 'text-slate-500'}>ERROR</span>
                </div>
              </div>
            </div>

            {/* Specs & Info with Last Seen */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className={`flex items-center gap-1 ${subText}`}><Clock className="w-3.5 h-3.5 text-blue-400" /> Last Telemetry Seen:</span>
                <span className="text-emerald-400 font-bold">{dev.lastSeen || 'Just now'}</span>
              </div>
              <div className="flex justify-between">
                <span className={subText}>Firmware Build:</span>
                <span className="text-blue-400 font-bold">{dev.firmware}</span>
              </div>
              <div className="flex justify-between">
                <span className={subText}>Battery / Power:</span>
                <span className="text-emerald-400 font-bold">{dev.batteryPct}% ({dev.powerStatus})</span>
              </div>
              <div className="flex justify-between">
                <span className={subText}>SIM & Network:</span>
                <span>{dev.simStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className={subText}>Signal Strength:</span>
                <span>{dev.signalDbm} dBm (4G LTE)</span>
              </div>
              <div className="flex justify-between">
                <span className={subText}>Local IP Address:</span>
                <span className="text-slate-300 font-mono">{dev.ipAddress || '192.168.137.151'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`grid grid-cols-2 gap-2 pt-2 border-t text-xs ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                onClick={() => handleOTAUpdate(dev.id)}
                disabled={updatingId === dev.id}
                className={`py-1.5 px-2 border rounded font-semibold flex items-center justify-center gap-1 transition ${
                  isDarkMode
                    ? 'bg-blue-950/80 hover:bg-blue-900/80 text-blue-400 border-blue-900'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${updatingId === dev.id ? 'animate-spin' : ''}`} />
                {updatingId === dev.id ? 'Updating Firmware...' : 'OTA Update'}
              </button>

              <button
                onClick={() => handleRestart(dev.id)}
                className={`py-1.5 px-2 border rounded font-semibold flex items-center justify-center gap-1 transition ${
                  isDarkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                Reboot Gateway
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
