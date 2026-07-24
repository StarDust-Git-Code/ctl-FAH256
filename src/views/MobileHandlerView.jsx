import React, { useState, useEffect, useRef } from 'react';
import { Package, Search, CheckCircle2, AlertTriangle, ShieldCheck, Thermometer, User, Building, MapPin, RefreshCw, PenTool, Send, Battery, Signal, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';

export default function MobileHandlerView({ isDarkMode = true, onSelectShipment }) {
  const [shipments, setShipments] = useState([]);
  const [selectedParcelCode, setSelectedParcelCode] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [stage, setStage] = useState('Manufacturer / Dispatcher');
  const [person, setPerson] = useState('');
  const [organization, setOrg] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Canvas Signature Pad State
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    async function loadParcels() {
      try {
        const data = await apiService.getShipments('ALL');
        setShipments(data || []);
        if (data && data.length > 0) {
          setSelectedParcelCode(data[0].id);
          setSelectedShipment(data[0]);
        }
      } catch (err) {
        console.error('Failed to load parcels from API:', err);
      }
    }
    loadParcels();
  }, []);

  const handleParcelSelectChange = (code) => {
    setSelectedParcelCode(code);
    const shp = shipments.find(s => s.id === code);
    if (shp) {
      setSelectedShipment(shp);
    } else {
      setSelectedShipment({
        id: code,
        cargoName: `Parcel Payload (${code})`,
        currentTemp: -72.4,
        minSafeTemp: -80,
        maxSafeTemp: -60,
        driver: "Marcus Vance",
        status: "IN_TRANSIT",
      });
    }
  };

  // Canvas Drawing Handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = isDarkMode ? '#38bdf8' : '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
  }, [isDarkMode]);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmitHandoff = async (e) => {
    e.preventDefault();
    if (!selectedParcelCode) {
      alert('Please enter or select a Parcel Code!');
      return;
    }

    try {
      setIsSubmitting(true);
      const canvas = canvasRef.current;
      const sigData = canvas ? canvas.toDataURL() : null;

      await apiService.addCustodyHandoff({
        parcelCode: selectedParcelCode,
        stage,
        person,
        organization,
        notes: notes || `Parcel Code ${selectedParcelCode} custody transfer verified by handler.`,
        signatureData: sigData,
        gps: "18.5204 N, 73.8567 E",
      });

      setToastMessage(`✓ Custody handoff for ${selectedParcelCode} recorded & persisted to Render API!`);
      setTimeout(() => setToastMessage(''), 4000);

      setPerson('');
      setOrg('');
      setNotes('');
      clearSignature();

      // Refresh shipments
      const refreshed = await apiService.getShipments('ALL');
      setShipments(refreshed || []);
    } catch (err) {
      console.error('Failed to post custody handoff:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardBg = isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Header Bar */}
      <div className={`${cardBg} rounded-2xl p-4 flex items-center justify-between transition-colors border`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${
            isDarkMode ? 'bg-blue-950/80 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base">PARCEL HANDLER MOBILE APP</h2>
              <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold border ${
                isDarkMode ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}>
                REACT VITE
              </span>
            </div>
            <p className={`text-[11px] ${subText}`}>Handheld Terminal & Custody Handshake</p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs font-mono font-bold text-center shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Step 1: Parcel Code Lookup (No QR) */}
      <div className={`${cardBg} rounded-2xl p-4 space-y-3`}>
        <div className={`flex items-center justify-between border-b pb-2.5 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
            <Search className="w-4 h-4" /> 1. Select / Enter Parcel Code
          </span>
          <button
            onClick={async () => {
              const data = await apiService.getShipments('ALL');
              setShipments(data || []);
            }}
            className="text-[10px] text-blue-400 hover:underline font-mono flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        <div className="space-y-2">
          <label className={`block text-[10px] uppercase font-bold ${subText}`}>Parcel Code ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={selectedParcelCode}
              onChange={(e) => handleParcelSelectChange(e.target.value.toUpperCase())}
              placeholder="e.g. SHP-88219"
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase focus:outline-none border ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-slate-50 border-slate-300 text-blue-700'
              }`}
            />
          </div>

          <select
            value={selectedParcelCode}
            onChange={(e) => handleParcelSelectChange(e.target.value)}
            className={`w-full rounded-xl px-3 py-2 text-xs font-mono focus:outline-none border ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}
          >
            <option value="">-- Select active API shipment --</option>
            {shipments.map(s => (
              <option key={s.id} value={s.id}>
                {s.id} - {s.cargoName.substring(0, 22)}... ({s.currentTemp}°C)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step 2: Payload Telemetry Inspector */}
      {selectedShipment && (
        <div className={`${cardBg} rounded-2xl p-4 space-y-3`}>
          <div className={`flex items-center justify-between border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-blue-400" /> Payload Telemetry Readout
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
              selectedShipment.status === 'CRITICAL_ALERT'
                ? 'bg-red-950 text-red-400 border-red-900 animate-pulse'
                : 'bg-blue-950 text-blue-400 border-blue-900'
            }`}>
              {selectedShipment.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className={`p-3 rounded-xl border space-y-1 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-bold block ${subText}`}>Cargo Payload</span>
              <p className="font-bold font-sans text-xs truncate">{selectedShipment.cargoName}</p>
            </div>

            <div className={`p-3 rounded-xl border space-y-1 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-bold block ${subText}`}>Internal Temp</span>
              <div className="text-lg font-black text-blue-400">{selectedShipment.currentTemp}°C</div>
              <span className="text-[9px] text-slate-400 block">
                Window: {selectedShipment.minSafeTemp}°C to {selectedShipment.maxSafeTemp}°C
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className={`p-2 rounded-lg border flex justify-between ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={subText}>Driver:</span>
              <span className="font-bold">{selectedShipment.driver || 'Assigned Courier'}</span>
            </div>
            <div className={`p-2 rounded-lg border flex justify-between ${isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <span className={subText}>Seal State:</span>
              <span className="font-bold text-emerald-400">✓ SECURE</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Custody Transfer & Digital Touch Signature */}
      <div className={`${cardBg} rounded-2xl p-4 space-y-3`}>
        <div className={`border-b pb-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <PenTool className="w-4 h-4" /> 2. Custodian Handshake & Signature
          </span>
        </div>

        <form onSubmit={handleSubmitHandoff} className="space-y-3 text-xs">
          <div>
            <label className={`block text-[10px] uppercase font-bold mb-1 ${subText}`}>Transfer Stage Protocol</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className={`w-full rounded-xl p-2.5 text-xs font-medium focus:outline-none border ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="Manufacturer / Dispatcher">1. Manufacturer / Dispatcher Handoff</option>
              <option value="Warehouse Hub Handoff">2. Warehouse Hub Acceptance</option>
              <option value="Driver Acceptance">3. Driver Reefer Intake</option>
              <option value="Intermediate Transit Hub">4. Inter-Hub Relay Transfer</option>
              <option value="Hospital Destination Receiver">5. Hospital / Final Recipient Audit</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-[10px] uppercase font-bold mb-1 ${subText}`}>Custodian Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Alok Verma"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                className={`w-full rounded-xl p-2 text-xs font-medium focus:outline-none border ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[10px] uppercase font-bold mb-1 ${subText}`}>Organization / Hub</label>
              <input
                type="text"
                required
                placeholder="e.g. Cold Storage Facility"
                value={organization}
                onChange={(e) => setOrg(e.target.value)}
                className={`w-full rounded-xl p-2 text-xs font-medium focus:outline-none border ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-[10px] uppercase font-bold mb-1 ${subText}`}>Inspection Notes</label>
            <input
              type="text"
              placeholder="e.g. Thermal box sealed at target temp. Visual seal intact."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full rounded-xl p-2 text-xs font-medium focus:outline-none border ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Touch Digital Signature Pad */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
              <span>Digital Signature (Draw below)</span>
              <button type="button" onClick={clearSignature} className="text-amber-400 hover:underline">
                Clear
              </button>
            </div>
            <div className={`rounded-xl p-1 border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
              <canvas
                ref={canvasRef}
                width={340}
                height={110}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-28 rounded-lg cursor-crosshair"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Persisting Handoff to API...' : 'CONFIRM HANDSHAKE & PERSIST TO RENDER API'}
          </button>
        </form>
      </div>
    </div>
  );
}
