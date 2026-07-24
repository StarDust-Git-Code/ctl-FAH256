import React from 'react';
import { Truck, Navigation, Gauge, Thermometer, User, Fuel } from 'lucide-react';

export default function FleetView({ fleet, onSelectShipment, isDarkMode = true }) {
  const cardBg = isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className={`${cardBg} rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 transition-colors`}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-500" />
            FLEET & REEFER VEHICLES CONTROL
          </h2>
          <p className={`text-xs ${subText}`}>
            Active Reefer Units • Vehicle Speed • Fuel & Compressor Diagnostics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fleet.map((vehicle) => {
          const isWarning = vehicle.vehicleStatus.includes('WARNING');

          return (
            <div
              key={vehicle.vehicleId}
              className={`rounded-xl p-5 border space-y-4 transition ${
                isWarning
                  ? isDarkMode ? 'bg-red-950/40 border-red-900/80 text-red-200 shadow-lg' : 'bg-red-50/60 border-red-300 text-red-900'
                  : cardBg
              }`}
            >
              <div className={`flex items-center justify-between border-b pb-3 ${
                isDarkMode ? 'border-slate-800' : 'border-slate-100'
              }`}>
                <div>
                  <span className="text-xs font-mono font-bold text-blue-400">{vehicle.vehicleId}</span>
                  <h3 className="font-bold text-sm mt-0.5">{vehicle.name}</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  isWarning
                    ? 'bg-red-900 text-red-200 border-red-800'
                    : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                }`}>
                  {vehicle.vehicleStatus}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className={`flex items-center gap-1 ${subText}`}><User className="w-3.5 h-3.5 text-blue-400" /> Driver:</span>
                  <span className="font-semibold">{vehicle.driver}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`flex items-center gap-1 ${subText}`}><Gauge className="w-3.5 h-3.5 text-slate-400" /> Speed:</span>
                  <span>{vehicle.currentSpeed}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`flex items-center gap-1 ${subText}`}><Fuel className="w-3.5 h-3.5 text-amber-500" /> Fuel:</span>
                  <span>{vehicle.fuelLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`flex items-center gap-1 ${subText}`}><Thermometer className="w-3.5 h-3.5 text-blue-400" /> Payload Temp:</span>
                  <span className={isWarning ? 'text-red-400 font-bold' : 'text-blue-400 font-bold'}>
                    {vehicle.reeferActualTemp}°C
                  </span>
                </div>
                <div className={`text-[11px] ${subText} pt-2 border-t ${
                  isDarkMode ? 'border-slate-800' : 'border-slate-100'
                }`}>
                  Route: <span className={isDarkMode ? 'text-slate-200 font-semibold' : 'text-slate-800 font-semibold'}>{vehicle.route}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
