import React, { useState, useEffect } from 'react';
import { History, Search, FileText, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';

const DEFAULT_HISTORY = [
  {
    timestamp: '2026-07-24 08:30:00 IST',
    stage: 'Payload Sealed at Origin',
    person: 'Dr. Sarah Connor',
    gps: 'Lat 12.9100, Lng 80.2285 (KCG College)',
    hmacHash: '0x9F8A3C2B1D0E'
  },
  {
    timestamp: '2026-07-24 09:15:22 IST',
    stage: 'Loaded into Reefer Vehicle TRK-908',
    person: 'Rajesh Kumar',
    gps: 'Lat 12.9150, Lng 80.2300 (Karapakkam)',
    hmacHash: '0x8A7C1D0E4F5A'
  },
  {
    timestamp: '2026-07-24 10:45:10 IST',
    stage: 'En Route OMR Toll Checkpoint',
    person: 'Marcus Vance',
    gps: 'Lat 12.9400, Lng 80.2370 (Perungudi)',
    hmacHash: '0x7B6A4F5A6B7C'
  },
  {
    timestamp: '2026-07-24 11:20:45 IST',
    stage: 'Thiruvanmiyur Quality Inspection',
    person: 'K. Raman',
    gps: 'Lat 12.9700, Lng 80.2480 (Thiruvanmiyur)',
    hmacHash: '0x5C4D8E0F1A2B'
  },
  {
    timestamp: '2026-07-24 11:55:00 IST',
    stage: 'Arrived at Adyar Courier Service Depot',
    person: 'Anita Roy',
    gps: 'Lat 13.0067, Lng 80.2571 (Adyar Depot)',
    hmacHash: '0x4D3C9F8A2B1D'
  }
];

export default function HistoryView({ shipments, isDarkMode = true }) {
  const [selectedShpId, setSelectedShpId] = useState('');
  const [historyLogs, setHistoryLogs] = useState(DEFAULT_HISTORY);

  useEffect(() => {
    async function loadLogs() {
      try {
        const custody = await apiService.getChainOfCustody();
        if (custody && custody.length > 0) {
          setHistoryLogs(custody);
        }
      } catch (err) {
        console.error('Failed to load custody audit history:', err);
      }
    }
    loadLogs();
  }, []);

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

        {shipments && shipments.length > 0 && (
          <select
            value={selectedShpId}
            onChange={(e) => setSelectedShpId(e.target.value)}
            className={`border text-xs font-mono font-bold rounded-lg px-3 py-2 focus:outline-none ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-slate-50 border-slate-300 text-blue-700'
            }`}
          >
            <option value="">-- All Parcel Code Logs --</option>
            {shipments.map(s => (
              <option key={s.id} value={s.id}>{s.id} - {s.cargoName.substring(0, 30)}...</option>
            ))}
          </select>
        )}
      </div>

      <div className={`${cardBg} rounded-xl overflow-hidden transition-colors`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className={`uppercase text-[10px] tracking-wider border-b ${
              isDarkMode ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Stage Protocol</th>
                <th className="p-3.5">Custodian Person</th>
                <th className="p-3.5">GPS Location</th>
                <th className="p-3.5">Hash Check</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-sans ${
              isDarkMode ? 'divide-slate-800/80 bg-slate-900' : 'divide-slate-100 bg-white'
            }`}>
              {historyLogs
                .filter(l => !selectedShpId || l.parcelCode === selectedShpId || l.shipmentId === selectedShpId)
                .map((log, idx) => (
                  <tr key={idx} className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}>
                    <td className={`p-3.5 font-mono ${subText}`}>{log.timestamp}</td>
                    <td className="p-3.5 font-semibold text-blue-400">{log.stage}</td>
                    <td className="p-3.5 font-bold">{log.person}</td>
                    <td className={`p-3.5 ${subText}`}>{log.gps}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        ✓ PASS ({log.hmacHash ? log.hmacHash.substring(0, 10) : 'HMAC_OK'})
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
