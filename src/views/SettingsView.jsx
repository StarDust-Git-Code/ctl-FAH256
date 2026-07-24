import React, { useState, useEffect } from 'react';
import { Settings, Sliders, ShieldCheck, Key, Bell, Moon, Sun, Save } from 'lucide-react';
import { apiService } from '../services/api';

export default function SettingsView({ isDarkMode = true, onToggleTheme }) {
  const [vaccineMin, setVaccineMin] = useState(-80);
  const [vaccineMax, setVaccineMax] = useState(-60);
  const [organMin, setOrganMin] = useState(2);
  const [organMax, setOrganMax] = useState(6);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await apiService.getSettings();
        if (settings) {
          setVaccineMin(settings.vaccineMin || -80);
          setVaccineMax(settings.vaccineMax || -60);
          setOrganMin(settings.organMin || 2);
          setOrganMax(settings.organMax || 6);
        }
      } catch (err) {
        console.error('Failed to load settings from API:', err);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await apiService.updateSettings({
        vaccineMin,
        vaccineMax,
        organMin,
        organMax,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save settings to API:', err);
    }
  };

  const cardBg = isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className={`${cardBg} rounded-xl p-5 flex items-center justify-between transition-colors`}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            COLD CHAIN SYSTEM SETTINGS & THRESHOLDS
          </h2>
          <p className={`text-xs ${subText}`}>
            Temperature Threshold Rules • API Security Keys • Theme Aesthetics
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </div>

      {savedSuccess && (
        <div className={`p-3 rounded-lg text-xs font-mono font-bold text-center border ${
          isDarkMode ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400' : 'bg-emerald-100 border-emerald-200 text-emerald-800'
        }`}>
          ✓ Configuration rules updated in Express API and deployed to all connected IoT Gateways!
        </div>
      )}

      {/* Temperature Envelopes */}
      <div className={`${cardBg} rounded-xl p-5 space-y-4 transition-colors`}>
        <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-3 ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <Sliders className="w-4 h-4 text-blue-500" />
          THERMAL THRESHOLD ENVELOPES BY CARGO TYPE
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className={`p-4 rounded-lg border space-y-2 ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="font-bold block">mRNA Vaccines (Ultra-Low)</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] block mb-1 ${subText}`}>Min Threshold (°C)</label>
                <input
                  type="number"
                  value={vaccineMin}
                  onChange={(e) => setVaccineMin(Number(e.target.value))}
                  className={`w-full border rounded px-2.5 py-1.5 font-mono focus:outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-blue-400' : 'bg-white border-slate-300 text-blue-700'
                  }`}
                />
              </div>
              <div>
                <label className={`text-[10px] block mb-1 ${subText}`}>Max Threshold (°C)</label>
                <input
                  type="number"
                  value={vaccineMax}
                  onChange={(e) => setVaccineMax(Number(e.target.value))}
                  className={`w-full border rounded px-2.5 py-1.5 font-mono focus:outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-blue-400' : 'bg-white border-slate-300 text-blue-700'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border space-y-2 ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="font-bold block">Organ Transplant (Heart/Liver)</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[10px] block mb-1 ${subText}`}>Min Threshold (°C)</label>
                <input
                  type="number"
                  value={organMin}
                  onChange={(e) => setOrganMin(Number(e.target.value))}
                  className={`w-full border rounded px-2.5 py-1.5 font-mono focus:outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-blue-400' : 'bg-white border-slate-300 text-blue-700'
                  }`}
                />
              </div>
              <div>
                <label className={`text-[10px] block mb-1 ${subText}`}>Max Threshold (°C)</label>
                <input
                  type="number"
                  value={organMax}
                  onChange={(e) => setOrganMax(Number(e.target.value))}
                  className={`w-full border rounded px-2.5 py-1.5 font-mono focus:outline-none ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-blue-400' : 'bg-white border-slate-300 text-blue-700'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security API Keys */}
      <div className={`${cardBg} rounded-xl p-5 space-y-3 transition-colors`}>
        <h3 className={`text-sm font-bold flex items-center gap-2 border-b pb-3 ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <Key className="w-4 h-4 text-blue-500" />
          CRYPTOGRAPHIC SIGNING API KEYS & SECRETS
        </h3>

        <div className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <span className={`text-[10px] block ${subText}`}>HMAC SHA-256 Master Key</span>
            <span className="text-blue-400 font-bold">●●●●●●●●●●●●●●●●0x9F8A3C2B</span>
          </div>
          <button className={`px-3 py-1 border rounded text-[11px] font-semibold transition ${
            isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
          }`}>
            Reveal Key
          </button>
        </div>
      </div>
    </div>
  );
}
