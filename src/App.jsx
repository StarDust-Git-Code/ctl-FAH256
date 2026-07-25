import React, { useState, useEffect } from 'react';
import {
  Home, Package, Thermometer, AlertTriangle, ShieldCheck, Truck, Users, Link2, MapPin,
  TrendingUp, History, Cpu, Settings, FileText, Activity, Lock, Moon, Sun, ChevronRight, Menu, X, Trash2, RefreshCw, Smartphone
} from 'lucide-react';

import { apiService } from './services/api';

import DashboardView from './views/DashboardView';
import ShipmentsView from './views/ShipmentsView';
import LiveMonitoringView from './views/LiveMonitoringView';
import AlertsView from './views/AlertsView';
import IntegrityView from './views/IntegrityView';
import FleetView from './views/FleetView';
import DriversView from './views/DriversView';
import CustodyView from './views/CustodyView';
import MapView from './views/MapView';
import AnalyticsView from './views/AnalyticsView';
import HistoryView from './views/HistoryView';
import DeviceManagementView from './views/DeviceManagementView';
import SettingsView from './views/SettingsView';
import ReportsView from './views/ReportsView';
import MobileHandlerView from './views/MobileHandlerView';
import ColdChainLogo from './components/ColdChainLogo';

export default function App() {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [shipments, setShipments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [systemHealth, setSystemHealth] = useState({ uptime: '99.98%' });
  const [isDarkMode, setIsDarkMode] = useState(false); // Default Light Theme
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const reloadAllData = async () => {
    try {
      setLoading(true);
      const [shpData, altData, fltData, healthData] = await Promise.all([
        apiService.getShipments('ALL'),
        apiService.getAlerts('ALL'),
        apiService.getFleet(),
        apiService.getSystemHealth(),
      ]);

      setShipments(shpData || []);
      setAlerts(altData || []);
      setFleet(fltData || []);
      setSystemHealth(healthData || { uptime: '99.98%' });
      if (shpData && shpData.length > 0) {
        setSelectedShipment(shpData[0]);
      } else {
        setSelectedShipment(null);
      }
    } catch (err) {
      console.error('Error fetching backend API state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadAllData();
  }, []);

  const handleClearDatabase = async () => {
    if (confirm('Wipe all shipments, alerts, and vehicles from Express REST API database?')) {
      await apiService.clearDatabase();
      reloadAllData();
    }
  };

  const handleResetDatabase = async () => {
    await apiService.resetDatabase();
    reloadAllData();
  };

  const handleSelectShipment = (shp) => {
    setSelectedShipment(shp);
  };

  const navItems = [
    { id: 'DASHBOARD', label: 'Dashboard (Home)', icon: Home },
    { id: 'SHIPMENTS', label: 'Shipments', icon: Package, badge: shipments.length },
    { id: 'MOBILE_HANDLER', label: 'Parcel Mobile Handler', icon: Smartphone, highlight: true },
    { id: 'MONITORING', label: 'Live Monitoring', icon: Thermometer },
    { id: 'ALERTS', label: 'Alerts', icon: AlertTriangle, badge: alerts.length, badgeColor: 'bg-red-500' },
    { id: 'INTEGRITY', label: 'Integrity Verification', icon: Lock },
    { id: 'FLEET', label: 'Fleet', icon: Truck },
    { id: 'DRIVERS', label: 'Drivers', icon: Users },
    { id: 'CUSTODY', label: 'Chain of Custody', icon: Link2 },
    { id: 'MAP', label: 'Live Map Command', icon: MapPin },
    { id: 'ANALYTICS', label: 'Predictive Analytics', icon: TrendingUp },
    { id: 'HISTORY', label: 'Shipment History', icon: History },
    { id: 'DEVICES', label: 'Device Management', icon: Cpu },
    { id: 'SETTINGS', label: 'Settings', icon: Settings },
    { id: 'REPORTS', label: 'Reports', icon: FileText },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans transition-colors duration-200`}>
      
      {/* 🚀 Sleek Enterprise Header with Custom FAH256 SVG Logo */}
      <header className={`${isDarkMode ? 'bg-[#0f172a]/95 border-slate-800 text-slate-100 shadow-lg' : 'bg-white border-slate-200 text-slate-900 shadow-xs'} border-b sticky top-0 z-40 px-4 lg:px-6 py-2.5 flex items-center justify-between backdrop-blur-md`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-1.5 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* FAH256 Brand Logo */}
          <div className="flex items-center gap-3">
            <ColdChainLogo size={42} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`font-black tracking-tight text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  FAH<span className="text-blue-500 font-black">256</span>
                </h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  isDarkMode
                    ? 'bg-blue-950/80 text-blue-400 border-blue-800'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  EXPRESS REST API
                </span>
              </div>
              <p className={`text-[10px] font-medium hidden sm:block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                GLOBAL COLD CHAIN TELEMATICS & CRYPTOGRAPHIC INTEGRITY PLATFORM
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Ticker & Health & API Controls */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <button
            onClick={handleClearDatabase}
            className="px-2.5 py-1.5 rounded-lg border border-red-800 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-semibold text-[11px] flex items-center gap-1 transition"
            title="Wipe Express API Data"
          >
            <Trash2 className="w-3.5 h-3.5" /> Wipe API Data
          </button>

          <button
            onClick={handleResetDatabase}
            className="px-2.5 py-1.5 rounded-lg border border-blue-800 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 font-semibold text-[11px] flex items-center gap-1 transition"
            title="Restore Default API Data"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restore Sample API Data
          </button>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium border ${
            isDarkMode
              ? 'bg-slate-900/90 border-slate-800 text-slate-300'
              : 'bg-slate-100 border-slate-200 text-slate-700'
          }`}>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>API Server:</span>
            <span className="text-emerald-500 font-bold">{systemHealth.uptime}</span>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg border transition ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-amber-400'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
            }`}
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Body Layout: Sidebar + Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-300 border-r
          ${isDarkMode ? 'bg-[#0f172a] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-xs'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className={`p-3 text-[10px] font-bold uppercase tracking-wider border-b ${
            isDarkMode ? 'text-slate-500 border-slate-800/80' : 'text-slate-400 border-slate-100'
          }`}>
            FAH256 Navigation
          </div>

          <nav className="flex-1 overflow-y-auto p-2.5 space-y-1 text-xs font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition text-left
                    ${isActive
                      ? isDarkMode
                        ? 'bg-blue-950/60 text-blue-400 font-bold border-l-4 border-blue-500 shadow-inner'
                        : 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-xs'
                      : item.highlight
                      ? isDarkMode
                        ? 'bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/50 font-semibold'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${
                      isActive
                        ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        : item.highlight
                        ? 'text-emerald-500'
                        : isDarkMode ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold text-white ${item.badgeColor || 'bg-blue-600'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Active Cargo Quick Widget */}
          <div className={`p-3.5 border-t text-xs space-y-1 ${
            isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
          }`}>
            <span className={`text-[10px] font-bold uppercase block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Selected Shipment</span>
            <div className="text-blue-500 font-bold truncate">{selectedShipment?.id || 'None Selected'}</div>
            <div className={`text-[11px] truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{selectedShipment?.cargoName || 'No Active Cargo'}</div>
          </div>
        </aside>

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {activeTab === 'DASHBOARD' && (
            <DashboardView
              shipments={shipments}
              alerts={alerts}
              fleet={fleet}
              selectedShipment={selectedShipment}
              onSelectShipment={handleSelectShipment}
              onNavigate={(tab) => setActiveTab(tab)}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'SHIPMENTS' && (
            <ShipmentsView
              shipments={shipments}
              selectedShipment={selectedShipment}
              onSelectShipment={handleSelectShipment}
              onRefreshData={reloadAllData}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'MOBILE_HANDLER' && (
            <MobileHandlerView
              isDarkMode={isDarkMode}
              onSelectShipment={handleSelectShipment}
            />
          )}

          {activeTab === 'MONITORING' && (
            <LiveMonitoringView shipment={selectedShipment} isDarkMode={isDarkMode} />
          )}

          {activeTab === 'ALERTS' && (
            <AlertsView alerts={alerts} isDarkMode={isDarkMode} />
          )}

          {activeTab === 'INTEGRITY' && (
            <IntegrityView shipment={selectedShipment} isDarkMode={isDarkMode} />
          )}

          {activeTab === 'FLEET' && (
            <FleetView fleet={fleet} onSelectShipment={handleSelectShipment} isDarkMode={isDarkMode} />
          )}

          {activeTab === 'DRIVERS' && (
            <DriversView isDarkMode={isDarkMode} />
          )}

          {activeTab === 'CUSTODY' && (
            <CustodyView isDarkMode={isDarkMode} />
          )}

          {activeTab === 'MAP' && (
            <MapView fleet={fleet} shipments={shipments} selectedShipment={selectedShipment} isDarkMode={isDarkMode} />
          )}

          {activeTab === 'ANALYTICS' && (
            <AnalyticsView isDarkMode={isDarkMode} />
          )}

          {activeTab === 'HISTORY' && (
            <HistoryView shipments={shipments} isDarkMode={isDarkMode} />
          )}

          {activeTab === 'DEVICES' && (
            <DeviceManagementView isDarkMode={isDarkMode} />
          )}

          {activeTab === 'SETTINGS' && (
            <SettingsView isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} />
          )}

          {activeTab === 'REPORTS' && (
            <ReportsView shipments={shipments} isDarkMode={isDarkMode} />
          )}
        </main>
      </div>

    </div>
  );
}
