import React, { useState, useEffect } from 'react';
import { UserCheck, Phone, ShieldCheck, Award, MapPin, Truck, CheckCircle2, Plus, UserPlus } from 'lucide-react';
import { apiService } from '../services/api';

export default function DriversView({ isDarkMode = true }) {
  const [drivers, setDrivers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('TRK-908');
  const [cargo, setCargo] = useState('SHP-88219');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  async function loadDrivers() {
    try {
      const data = await apiService.getDrivers();
      setDrivers(data || []);
    } catch (err) {
      console.error('Failed to fetch drivers from REST API:', err);
    }
  }

  const handleAddDriverSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await apiService.createDriver({
        name,
        phone,
        vehicle,
        cargo
      });
      setShowAddModal(false);
      setName('');
      setPhone('');
      loadDrivers();
    } catch (err) {
      console.error('Failed to create driver:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardBg = isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className={`${cardBg} rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 transition-colors`}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-500" />
            COLD-CHAIN CERTIFIED DRIVERS & OPERATORS
          </h2>
          <p className={`text-xs ${subText}`}>
            HACCP & GSP Certified Personnel • Digital Signatures • Compliance Scores
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition"
        >
          <UserPlus className="w-4 h-4" /> Register New Driver
        </button>
      </div>

      {drivers.length === 0 ? (
        <div className={`${cardBg} rounded-xl p-12 text-center text-xs space-y-3`}>
          <UserCheck className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="font-bold text-slate-300">No Drivers Registered</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
          >
            + Register First Driver
          </button>
        </div>
      ) : (
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
      )}

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddDriverSubmit}
            className={`border rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 relative ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" /> REGISTER NEW COLD-CHAIN DRIVER
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Driver Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full border rounded p-2 focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98401 22910"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full border rounded p-2 focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Assigned Vehicle</label>
                  <input
                    type="text"
                    required
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className={`w-full border rounded p-2 focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Assigned Parcel ID</label>
                  <input
                    type="text"
                    required
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    className={`w-full border rounded p-2 focus:outline-none ${isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold text-slate-400 border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-md"
              >
                {isSubmitting ? 'Registering...' : 'Register Driver'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
