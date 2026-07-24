import React, { useState } from 'react';
import { History, Search, FileText, Download, ShieldCheck } from 'lucide-react';

export default function HistoryView({ shipments, isDarkMode = true }) {
  const [selectedShpId, setSelectedShpId] = useState('SHP-88219');

  const historyLogs = [
    { time: "2026-07-23 21:00:00", event: "Periodic Telemetry Log", temp: "-72.4°C", location: "NH-44 Kanpur Corridor", verify: "PASS" },
    { time: "2026-07-23 18:45:00", event: "Nagpur Hub Relay Handoff", temp: "-72.8°C", location: "DHL Hub Nagpur", verify: "PASS" },
    { time: "2026-07-23 11:00:00", event: "Driver Acceptance (Marcus Vance)", temp: "-75.0°C", location: "FedEx Pune Yard", verify: "PASS" },
    { time: "2026-07-23 08:30:00", event: "Manufacturer Dispatch Seal Armed", temp: "-75.0°C", location: "Serum Institute Pune", verify: "PASS" },
  ];

  const cardBg = isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className={`${cardBg} rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 transition-colors`}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            IMMUTABLE SHIPMENT AUDIT LOG HISTORY
          </h2>
          <p className={`text-xs ${subText}`}>
            Complete Telemetry Logs • Tamper Event Records • Cryptographic Verification History
          </p>
        </div>

        <select
          value={selectedShpId}
          onChange={(e) => setSelectedShpId(e.target.value)}
          className={`border text-xs font-mono font-bold rounded-lg px-3 py-2 focus:outline-none ${
            isDarkMode ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-slate-50 border-slate-300 text-blue-700'
          }`}
        >
          {shipments.map(s => (
            <option key={s.id} value={s.id}>{s.id} - {s.cargoName.substring(0, 30)}...</option>
          ))}
        </select>
      </div>

      <div className={`${cardBg} rounded-xl overflow-hidden transition-colors`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className={`uppercase text-[10px] tracking-wider border-b ${
              isDarkMode ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Event Description</th>
                <th className="p-3.5">Payload Temp</th>
                <th className="p-3.5">GPS Location</th>
                <th className="p-3.5">Hash Check</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-sans ${
              isDarkMode ? 'divide-slate-800/80 bg-slate-900' : 'divide-slate-100 bg-white'
            }`}>
              {historyLogs.map((log, idx) => (
                <tr key={idx} className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                  <td className={`p-3.5 font-mono ${subText}`}>{log.time}</td>
                  <td className="p-3.5 font-semibold">{log.event}</td>
                  <td className="p-3.5 font-mono text-blue-400 font-bold">{log.temp}</td>
                  <td className={`p-3.5 ${subText}`}>{log.location}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      ✓ {log.verify}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
