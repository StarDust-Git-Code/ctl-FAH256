import React from 'react';
import { Package, Thermometer, Truck, Users, BatteryCharging, AlertTriangle, ShieldCheck, Navigation, CheckCircle2, Clock, Activity, Plus } from 'lucide-react';
import DigitalTwin3D from '../components/DigitalTwin3D';
import LiveMap from '../components/LiveMap';
import IntegrityVerifier from '../components/IntegrityVerifier';

export default function DashboardView({ shipments, alerts, fleet, selectedShipment, onSelectShipment, onNavigate, isDarkMode = true }) {
  const cardBg = isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  const activeShipmentsCount = shipments.filter(s => s.status === 'IN_TRANSIT').length;
  const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'UNDER_INVESTIGATION').length;

  return (
    <div className="space-y-6">
      {/* 🎯 Dashboard KPIs (Top Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className={`${cardBg} rounded-xl p-3.5 flex flex-col justify-between transition`}>
          <div className={`flex items-center justify-between ${subText}`}>
            <span className="text-xs font-semibold">Active Shipments</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black font-mono">
            {activeShipmentsCount}
          </div>
          <div className="text-[10px] text-blue-400 mt-1 flex items-center gap-1 font-semibold">
            <Activity className="w-3 h-3" /> Live GPS Monitored
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-3.5 flex flex-col justify-between transition`}>
          <div className={`flex items-center justify-between ${subText}`}>
            <span className="text-xs font-semibold">Avg Temp</span>
            <Thermometer className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-400 font-mono">
            {selectedShipment ? `${selectedShipment.currentTemp}°C` : '--'}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
            {selectedShipment ? '✓ Within Safe Bounds' : 'No Active Payload'}
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-3.5 flex flex-col justify-between transition`}>
          <div className={`flex items-center justify-between ${subText}`}>
            <span className="text-xs font-semibold">Vehicles Online</span>
            <Truck className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`} />
          </div>
          <div className="mt-2 text-2xl font-black font-mono">
            {fleet.length}
          </div>
          <div className={`text-[10px] ${subText} mt-1 font-medium`}>
            {fleet.length} Reefer Units Active
          </div>
        </div>

        <div className={`${cardBg} rounded-xl p-3.5 flex flex-col justify-between transition`}>
          <div className={`flex items-center justify-between ${subText}`}>
            <span className="text-xs font-semibold">Devices Online</span>
            <BatteryCharging className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
            {shipments.length > 0 ? '100%' : '0%'}
          </div>
          <div className={`text-[10px] ${subText} mt-1 font-medium`}>
            {shipments.length} IoT Gateways Active
          </div>
        </div>

        <div className={`rounded-xl p-3.5 flex flex-col justify-between border ${
          activeAlertsCount > 0
            ? isDarkMode ? 'bg-red-950/40 border-red-900/60 text-red-300' : 'bg-red-50/60 border-red-200 text-red-900'
            : cardBg
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Active Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${activeAlertsCount > 0 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className={`mt-2 text-2xl font-black font-mono ${activeAlertsCount > 0 ? 'text-red-400' : ''}`}>
            {activeAlertsCount}
          </div>
          <div className={`text-[10px] mt-1 font-bold ${activeAlertsCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {activeAlertsCount > 0 ? `⚠ ${activeAlertsCount} Active Incident` : '✓ Zero Alerts'}
          </div>
        </div>

        <div className={`rounded-xl p-3.5 flex flex-col justify-between border ${
          isDarkMode ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300' : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Data Integrity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400 font-mono">
            100%
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-bold">
            ✓ HMAC & Chain Valid
          </div>
        </div>
      </div>

      {/* Main Grid: 3D Twin + Command Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <DigitalTwin3D shipment={selectedShipment} isDarkMode={isDarkMode} />
        </div>
        <div className="lg:col-span-6">
          <LiveMap fleet={fleet} shipments={shipments} selectedShipmentId={selectedShipment?.id} isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Cryptographic Integrity Widget */}
      <IntegrityVerifier shipmentId={selectedShipment?.id} isDarkMode={isDarkMode} />

      {/* Recent Alerts & Active Shipments Snapshot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts Timeline Card */}
        <div className={`${cardBg} rounded-xl p-5 space-y-4`}>
          <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              RECENT ALERTS TIMELINE
            </h3>
            <button
              onClick={() => onNavigate('ALERTS')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              View All Alerts →
            </button>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                <p className="font-bold text-emerald-400">Zero Active Alerts</p>
                <p>All telemetry streams are operating within nominal thermal envelopes.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border text-xs space-y-1 ${
                    alert.severity === 'CRITICAL'
                      ? isDarkMode ? 'bg-red-950/50 border-red-900 text-red-200' : 'bg-red-50 border-red-200 text-red-900'
                      : alert.severity === 'HIGH'
                      ? isDarkMode ? 'bg-amber-950/50 border-amber-900 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                      : isDarkMode ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        alert.severity === 'CRITICAL' ? 'bg-red-500 animate-ping' : alert.severity === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      {alert.type}
                    </span>
                    <span className={`font-mono text-[10px] ${subText}`}>{alert.time}</span>
                  </div>
                  <p className="text-[11px] font-normal">{alert.message}</p>
                  <div className={`flex items-center justify-between text-[10px] font-mono ${subText} pt-1 border-t ${
                    isDarkMode ? 'border-slate-800' : 'border-slate-200/60'
                  }`}>
                    <span>Shipment: {alert.shipmentId}</span>
                    <span>Driver: {alert.driver}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Cargo Quick Cards */}
        <div className={`${cardBg} rounded-xl p-5 space-y-4`}>
          <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              ACTIVE COLD CHAIN SHIPMENTS
            </h3>
            <button
              onClick={() => onNavigate('SHIPMENTS')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Manage Cargo →
            </button>
          </div>

          <div className="space-y-3">
            {shipments.length === 0 ? (
              <div className="p-8 text-center text-xs space-y-3">
                <Package className="w-8 h-8 text-slate-500 mx-auto" />
                <div>
                  <p className="font-bold text-slate-300">No Active Shipments in REST API</p>
                  <p className="text-slate-400 text-[11px]">Dispatch your first shipment or load demo data.</p>
                </div>
                <button
                  onClick={() => onNavigate('SHIPMENTS')}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
                >
                  + Create Shipment
                </button>
              </div>
            ) : (
              shipments.slice(0, 3).map((shp) => (
                <div
                  key={shp.id}
                  onClick={() => onSelectShipment(shp)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                    selectedShipment?.id === shp.id
                      ? isDarkMode
                        ? 'bg-blue-950/80 border-blue-600 text-white shadow-inner'
                        : 'bg-blue-50/80 border-blue-400 text-slate-900 shadow-xs'
                      : isDarkMode
                        ? 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="font-mono text-blue-400">{shp.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      shp.status === 'CRITICAL_ALERT'
                        ? 'bg-red-950/80 text-red-400 border border-red-900'
                        : 'bg-emerald-950/80 text-emerald-400 border border-emerald-900'
                    }`}>
                      {shp.status}
                    </span>
                  </div>
                  <div className="font-bold mt-1">{shp.cargoName}</div>
                  <div className={`flex items-center justify-between text-[11px] ${subText} mt-2`}>
                    <span>Current Temp: <strong className={shp.currentTemp > shp.maxSafeTemp ? 'text-red-400' : 'text-blue-400'}>{shp.currentTemp}°C</strong></span>
                    <span>ETA: {shp.eta}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
