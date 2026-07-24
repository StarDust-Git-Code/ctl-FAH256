import React, { useState, useEffect } from 'react';
import { UserCheck, Phone, ShieldCheck, Award, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';

export default function DriversView({ isDarkMode = true }) {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    async function loadDrivers() {
      try {
        const data = await apiService.getDrivers();
        setDrivers(data || []);
      } catch (err) {
        console.error('Failed to fetch drivers from REST API:', err);
      }
    }
    loadDrivers();
  }, []);

  const cardBg = isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className={`${cardBg} rounded-xl p-5 flex items-center justify-between transition-colors`}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-500" />
            COLD-CHAIN CERTIFIED DRIVERS & OPERATORS
          </h2>
          <p className={`text-xs ${subText}`}>
            HACCP & GSP Certified Personnel • Digital Signatures • Compliance Scores
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {drivers.map(drv => (
          <div key={drv.id} className={`${cardBg} rounded-xl p-5 space-y-4 transition-colors`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div>
                <span className="text-xs font-mono font-bold text-blue-400">{drv.id}</span>
                <h3 className="font-bold text-base">{drv.name}</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}>
                {drv.status}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className={`flex items-center gap-1 ${subText}`}><Phone className="w-3.5 h-3.5 text-blue-400" /> Contact:</span>
                <span>{drv.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className={`flex items-center gap-1 ${subText}`}><Truck className="w-3.5 h-3.5 text-slate-400" /> Vehicle:</span>
                <span>{drv.vehicle}</span>
              </div>
              <div className="flex justify-between">
                <span className={`flex items-center gap-1 ${subText}`}><Award className="w-3.5 h-3.5 text-amber-500" /> Compliance Rating:</span>
                <span className="text-emerald-400 font-bold">{drv.rating}</span>
              </div>
              <div className="flex justify-between">
                <span className={`flex items-center gap-1 ${subText}`}><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed Deliveries:</span>
                <span>{drv.deliveries}</span>
              </div>
              <div className={`text-[11px] ${subText} pt-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                Assigned Cargo: <span className="text-blue-400 font-bold">{drv.cargo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
