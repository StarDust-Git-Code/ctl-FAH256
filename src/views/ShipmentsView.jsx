import React, { useState } from 'react';
import { Package, Search, QrCode, Thermometer, Battery, Signal, ShieldCheck, AlertTriangle, Eye, CheckCircle2, User, Clock, Plus, Trash2, RefreshCw, Edit3 } from 'lucide-react';
import { apiService } from '../services/api';

export default function ShipmentsView({ shipments, onSelectShipment, selectedShipment, isDarkMode = true, onRefreshData }) {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalShipment, setActiveModalShipment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModalShipment, setEditModalShipment] = useState(null);

  // Edit Threshold State
  const [editMinTemp, setEditMinTemp] = useState('-80.0');
  const [editMaxTemp, setEditMaxTemp] = useState('-60.0');
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);

  // New Shipment Form State
  const [cargoName, setCargoName] = useState('');
  const [cargoType, setCargoType] = useState('Ultra-Low Vaccine');
  const [driver, setDriver] = useState('');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [currentTemp, setCurrentTemp] = useState('-75.0');
  const [minSafeTemp, setMinSafeTemp] = useState('-80.0');
  const [maxSafeTemp, setMaxSafeTemp] = useState('-60.0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredShipments = shipments.filter(s => {
    const matchesFilter =
      filter === 'ALL' ||
      (filter === 'IN_TRANSIT' && s.status === 'IN_TRANSIT') ||
      (filter === 'ALERT' && s.status === 'CRITICAL_ALERT') ||
      (filter === 'DELIVERED' && s.status === 'DELIVERED_TODAY');
    
    const matchesQuery =
      s.cargoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.driver.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesQuery;
  });

  const handleCreateShipmentSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await apiService.createShipment({
        cargoName,
        cargoType,
        driver,
        source,
        destination,
        currentTemp: Number(currentTemp),
        minSafeTemp: Number(minSafeTemp),
        maxSafeTemp: Number(maxSafeTemp),
      });

      setShowCreateModal(false);
      setCargoName('');
      setDriver('');
      setSource('');
      setDestination('');

      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to create shipment via API:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditThresholdSubmit = async (e) => {
    e.preventDefault();
    if (!editModalShipment) return;
    try {
      setIsEditingThreshold(true);
      await apiService.updateShipment(editModalShipment.id, {
        minSafeTemp: Number(editMinTemp),
        maxSafeTemp: Number(editMaxTemp),
      });
      setEditModalShipment(null);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to update shipment safe temp bounds:', err);
    } finally {
      setIsEditingThreshold(false);
    }
  };

  const handleDeleteShipment = async (id) => {
    if (confirm(`Delete shipment ${id} from Express API store?`)) {
      try {
        await apiService.deleteShipment(id);
        if (onRefreshData) onRefreshData();
      } catch (err) {
        console.error('Failed to delete shipment:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar & Search */}
      <div className={`rounded-xl p-5 border flex flex-wrap items-center justify-between gap-4 transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            COLD CHAIN CARGO & SHIPMENTS CONTROL
          </h2>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-Time Payload Telemetry • Safe Temp Threshold Configuration • Dynamic REST API
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search shipment ID, cargo, driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 w-56 border ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> Create Shipment
          </button>

          <div className={`flex p-1 rounded-lg border text-xs font-mono ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {['ALL', 'IN_TRANSIT', 'ALERT', 'DELIVERED'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded font-semibold transition ${
                  filter === f
                    ? isDarkMode ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : isDarkMode ? 'text-slate-400 hover:text-slate-100' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className={`rounded-xl border overflow-hidden transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      }`}>
        <div className="overflow-x-auto">
          {filteredShipments.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="font-bold text-base">No Active Shipments</h3>
              <p className="text-xs text-slate-400">Click "+ Create Shipment" to dispatch new cold chain cargo via the Express REST API.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg"
              >
                + Create Shipment
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className={`font-mono uppercase text-[10px] tracking-wider border-b ${
                isDarkMode ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <tr>
                  <th className="p-3.5">Shipment ID</th>
                  <th className="p-3.5">Cargo Name & Type</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Current Temp</th>
                  <th className="p-3.5">Safe Bounds</th>
                  <th className="p-3.5">Driver & Route</th>
                  <th className="p-3.5">ETA / Progress</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-sans ${
                isDarkMode ? 'divide-slate-800/80 bg-slate-900' : 'divide-slate-100 bg-white'
              }`}>
                {filteredShipments.map((shp) => {
                  const isViolation = shp.currentTemp > shp.maxSafeTemp || shp.currentTemp < shp.minSafeTemp;

                  return (
                    <tr key={shp.id} className={isDarkMode ? 'hover:bg-slate-800/50 transition' : 'hover:bg-slate-50 transition'}>
                      <td className="p-3.5 font-mono font-bold text-blue-400">
                        {shp.id}
                        <span className={`block text-[10px] font-normal ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{shp.deviceHardwareId}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold">{shp.cargoName}</div>
                        <div className={`text-[10px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{shp.cargoType}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold inline-flex items-center gap-1 border ${
                          shp.status === 'CRITICAL_ALERT'
                            ? 'bg-red-950/80 text-red-400 border-red-900 animate-pulse'
                            : shp.status === 'DELIVERED_TODAY'
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-900'
                            : 'bg-blue-950/80 text-blue-400 border-blue-900'
                        }`}>
                          {shp.status === 'CRITICAL_ALERT' && <AlertTriangle className="w-3 h-3" />}
                          {shp.status === 'DELIVERED_TODAY' && <CheckCircle2 className="w-3 h-3" />}
                          {shp.status}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-sm font-black">
                        <span className={isViolation ? 'text-red-400 animate-pulse' : 'text-blue-400'}>
                          {shp.currentTemp}°C
                        </span>
                      </td>
                      <td className={`p-3.5 font-mono text-[11px] ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {shp.minSafeTemp}°C to {shp.maxSafeTemp}°C
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold">{shp.driver}</div>
                        <div className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{shp.source} ➔ {shp.destination}</div>
                      </td>
                      <td className="p-3.5">
                        <div className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{shp.eta}</div>
                        <div className={`w-28 h-1.5 rounded-full overflow-hidden mt-1 border ${
                          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'
                        }`}>
                          <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${shp.progressPct}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-3.5 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditModalShipment(shp);
                            setEditMinTemp(shp.minSafeTemp);
                            setEditMaxTemp(shp.maxSafeTemp);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1 transition ${
                            isDarkMode
                              ? 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-400 border-amber-800'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                          title="Edit Safe Temp Thresholds"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" /> Edit Max Temp
                        </button>
                        <button
                          onClick={() => {
                            onSelectShipment(shp);
                            setActiveModalShipment(shp);
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1 transition ${
                            isDarkMode
                              ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-blue-700 border-slate-300'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                        <button
                          onClick={() => handleDeleteShipment(shp.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg border border-red-900"
                          title="Delete Shipment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Safe Temperature Thresholds Modal */}
      {editModalShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditThresholdSubmit}
            className={`border rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 relative ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className="font-bold text-base flex items-center gap-2 text-amber-400">
                <Thermometer className="w-5 h-5 text-amber-400" /> EDIT SAFE TEMP THRESHOLDS
              </h3>
              <button type="button" onClick={() => setEditModalShipment(null)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-lg border font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <p className="font-bold text-blue-400 text-sm">{editModalShipment.id}</p>
                <p className="text-slate-300 font-sans mt-0.5">{editModalShipment.cargoName}</p>
                <p className="text-slate-400 text-[10px] mt-1">Current Payload Temp: <strong className="text-blue-400">{editModalShipment.currentTemp}°C</strong></p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Min Safe Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editMinTemp}
                    onChange={(e) => setEditMinTemp(e.target.value)}
                    className={`w-full border rounded p-2.5 font-mono text-sm font-bold text-blue-400 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Max Safe Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editMaxTemp}
                    onChange={(e) => setEditMaxTemp(e.target.value)}
                    className={`w-full border rounded p-2.5 font-mono text-sm font-bold text-amber-400 focus:outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Updating the maximum temperature threshold will automatically adjust excursion alert logic for this cargo order across all dashboards and devices.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditModalShipment(null)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-400 border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isEditingThreshold}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg shadow-md"
              >
                {isEditingThreshold ? 'Updating API...' : 'Save Temperature Thresholds'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create New Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateShipmentSubmit}
            className={`border rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" /> CREATE NEW COLD CHAIN SHIPMENT
              </h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cargo Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mRNA BioNTech Vaccines (5,000 Doses)"
                  value={cargoName}
                  onChange={(e) => setCargoName(e.target.value)}
                  className={`w-full border rounded p-2 focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cargo Category</label>
                  <select
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                    className={`w-full border rounded p-2 focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`}
                  >
                    <option value="Ultra-Low Vaccine">Ultra-Low Vaccine (-80°C to -60°C)</option>
                    <option value="Organ Transfer">Organ Transfer (+2°C to +6°C)</option>
                    <option value="Plasma / Biologics">Plasma / Biologics (-30°C to -18°C)</option>
                    <option value="Pharmaceutical">Pharmaceutical (+2°C to +8°C)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Assigned Driver</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    value={driver}
                    onChange={(e) => setDriver(e.target.value)}
                    className={`w-full border rounded p-2 focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Source Hub</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KCG College of Technology, Karapakkam"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className={`w-full border rounded p-2 focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Destination</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adyar Courier Service, Chennai"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className={`w-full border rounded p-2 focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Current Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={currentTemp}
                    onChange={(e) => setCurrentTemp(e.target.value)}
                    className={`w-full border rounded p-2 font-mono text-blue-400 focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Min Safe (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={minSafeTemp}
                    onChange={(e) => setMinSafeTemp(e.target.value)}
                    className={`w-full border rounded p-2 font-mono text-blue-400 focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Max Safe (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={maxSafeTemp}
                    onChange={(e) => setMaxSafeTemp(e.target.value)}
                    className={`w-full border rounded p-2 font-mono text-blue-400 focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-400 border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-md"
              >
                {isSubmitting ? 'Dispatching...' : 'Dispatch Shipment to REST API'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Detail Modal */}
      {activeModalShipment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`border rounded-xl p-6 max-w-xl w-full shadow-2xl space-y-4 relative ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-base">{activeModalShipment.id} - Cargo Details</span>
              </div>
              <button onClick={() => setActiveModalShipment(null)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className={`p-3 rounded-lg border space-y-1 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cargo Specification</span>
                <p className="font-bold text-sm">{activeModalShipment.cargoName}</p>
                <p className={`font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Type: {activeModalShipment.cargoType}</p>
              </div>

              <div className={`p-3 rounded-lg border space-y-1 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cryptographic QR Token</span>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded border border-slate-300">
                    <QrCode className="w-10 h-10 text-slate-900" />
                  </div>
                  <div className="font-mono text-[10px] text-blue-400 font-bold break-all">
                    {activeModalShipment.qrCode}
                  </div>
                </div>
              </div>
            </div>

            <div className={`p-3.5 rounded-lg border space-y-2 text-xs font-mono ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Current Payload Temp:</span>
                <span className="text-blue-400 font-bold">{activeModalShipment.currentTemp}°C</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Safe Window:</span>
                <span>{activeModalShipment.minSafeTemp}°C to {activeModalShipment.maxSafeTemp}°C</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setActiveModalShipment(null)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold">
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
