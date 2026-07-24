import React, { useState } from 'react';
import { QrCode, Camera, CheckCircle2, ShieldAlert, Navigation, FileSignature, Upload, Battery, Signal, Smartphone, Truck, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DriverMobileApp({ shipment, onCompleteHandoff }) {
  const [activeTab, setActiveTab] = useState('ASSIGNED');
  const [scannedCode, setScannedCode] = useState('');
  const [driverNotes, setDriverNotes] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isSigned, setIsSigned] = useState(false);

  const handleSimulateScan = () => {
    setScannedCode('COCA-SHP88219-HMAC-VERIFIED');
    setActiveTab('HANDOFF');
  };

  const handleCompleteHandshake = () => {
    setIsSigned(true);
    confetti({ particleCount: 50, spread: 60 });
    setActiveTab('COMPLETED');
    if (onCompleteHandoff) onCompleteHandoff();
  };

  const handleSimulateUploadPhoto = () => {
    setUploadedImage('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Container Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <span className="font-bold text-slate-800 text-sm tracking-tight">
            CARGO MOBILE APP (DRIVER HANDHELD SIMULATOR)
          </span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-semibold border border-blue-200">
          v2.4.0-DRV
        </span>
      </div>

      <div className="flex justify-center py-2">
        {/* Smartphone Frame Outer Shell */}
        <div className="w-[340px] h-[620px] bg-slate-900 border-4 border-slate-700 rounded-[36px] shadow-2xl overflow-hidden flex flex-col relative">
          
          {/* Phone Speaker Notch & Status Bar */}
          <div className="bg-slate-950 px-5 pt-2 pb-1.5 flex items-center justify-between text-[10px] text-gray-300 font-mono border-b border-slate-800">
            <span className="font-bold text-white">09:41 AM</span>
            <div className="w-16 h-3.5 bg-black rounded-full mx-auto"></div>
            <div className="flex items-center gap-1.5 text-white">
              <Signal className="w-3 h-3 text-emerald-400" />
              <span>5G</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* App Header Bar */}
          <div className="bg-blue-600 px-4 py-3 flex items-center justify-between text-white shadow">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span className="font-bold text-xs tracking-wider">COLD-CHAIN DRIVER</span>
            </div>
            <span className="text-[10px] bg-blue-800 px-2 py-0.5 rounded font-mono border border-blue-400/30">
              DRV-104
            </span>
          </div>

          {/* Mobile Screen Body Content */}
          <div className="flex-1 overflow-y-auto p-3.5 text-xs text-slate-800 bg-slate-100 space-y-3">
            
            {activeTab === 'ASSIGNED' && (
              <div className="space-y-3">
                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-blue-700 font-mono font-bold">ASSIGNED SHIPMENT</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">IN TRANSIT</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{shipment?.cargoName || 'mRNA COVID Vaccines'}</h4>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <p>📍 Source: {shipment?.source || 'Serum Inst. Pune'}</p>
                    <p>🏁 Destination: {shipment?.destination || 'AIIMS Delhi'}</p>
                    <p>🌡 Target Temp: <span className="text-blue-700 font-bold">{shipment?.minSafeTemp ?? -80}°C to {shipment?.maxSafeTemp ?? -60}°C</span></p>
                  </div>
                </div>

                <button
                  onClick={handleSimulateScan}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl text-white shadow-sm flex items-center justify-center gap-2"
                >
                  <QrCode className="w-5 h-5" />
                  Scan Box QR Code for Handoff
                </button>

                <button
                  onClick={() => setActiveTab('INCIDENT')}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Report Incident / Seal Breach
                </button>
              </div>
            )}

            {activeTab === 'HANDOFF' && (
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-800">QR Code Verified!</h4>
                  <p className="text-[10px] font-mono text-slate-600">{scannedCode}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 text-xs shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Handoff Handshake Confirmation</span>
                  <div className="flex justify-between text-slate-700 text-[11px]">
                    <span>Current Payload Temp:</span>
                    <span className="text-blue-700 font-mono font-bold">-72.4°C (Safe)</span>
                  </div>
                  <div className="flex justify-between text-slate-700 text-[11px]">
                    <span>Hardware Seal:</span>
                    <span className="text-emerald-700 font-bold">HMAC Valid</span>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Driver Digital Signature</label>
                    <div className="h-16 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-500 italic font-mono text-xs">
                      [ Signed: Marcus Vance - DRV-104 ]
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCompleteHandshake}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-white shadow-sm flex items-center justify-center gap-2"
                >
                  <FileSignature className="w-5 h-5" />
                  Confirm Custody Transfer
                </button>
              </div>
            )}

            {activeTab === 'INCIDENT' && (
              <div className="space-y-3">
                <h4 className="font-bold text-red-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Report Cargo Incident
                </h4>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Incident Description</label>
                  <textarea
                    rows="3"
                    value={driverNotes}
                    onChange={(e) => setDriverNotes(e.target.value)}
                    placeholder="Describe issue (e.g. Compressor noise, door latch warning...)"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">Upload Photo Evidence</label>
                  <button
                    onClick={handleSimulateUploadPhoto}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center justify-center gap-2 text-slate-700"
                  >
                    <Camera className="w-4 h-4 text-blue-600" />
                    {uploadedImage ? 'Photo Attached (1 File)' : 'Capture / Upload Photo'}
                  </button>
                  {uploadedImage && (
                    <div className="mt-2 text-center text-[10px] text-emerald-700 font-bold">
                      ✓ Image Attached: cargo_seal_evidence.jpg
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    alert("Incident logged to Central Command Telematics!");
                    setActiveTab('ASSIGNED');
                  }}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 font-bold text-white rounded-xl shadow-sm"
                >
                  Transmit Incident Report
                </button>
              </div>
            )}

            {activeTab === 'COMPLETED' && (
              <div className="space-y-4 text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-600 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">HANDSHAKE COMPLETE</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Custody handoff block appended to SHA-256 chain. Command post notified.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('ASSIGNED')}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs border border-slate-300"
                >
                  Return to Active Cargo
                </button>
              </div>
            )}
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <div className="bg-white border-t border-slate-200 px-4 py-2 flex justify-around text-[10px] font-semibold text-slate-500">
            <button onClick={() => setActiveTab('ASSIGNED')} className={activeTab === 'ASSIGNED' ? 'text-blue-600 font-bold' : ''}>
              Shipment
            </button>
            <button onClick={handleSimulateScan} className={activeTab === 'SCANNER' || activeTab === 'HANDOFF' ? 'text-blue-600 font-bold' : ''}>
              Scan QR
            </button>
            <button onClick={() => setActiveTab('INCIDENT')} className={activeTab === 'INCIDENT' ? 'text-red-600 font-bold' : ''}>
              Incidents
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
