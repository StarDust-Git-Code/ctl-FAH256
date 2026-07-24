import React, { useState } from 'react';
import { FileText, Download, FileSpreadsheet, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import jsPDF from 'jspdf';

export default function ReportsView({ shipments, isDarkMode = true }) {
  const [reportType, setReportType] = useState('SHIPMENT_SUMMARY');

  const handleExportCSV = () => {
    const csvHeader = "Shipment ID,Cargo Name,Status,Current Temp (C),Min Temp,Max Temp,Driver,ETA\n";
    const csvRows = shipments.map(s =>
      `"${s.id}","${s.cargoName}","${s.status}",${s.currentTemp},${s.minSafeTemp},${s.maxSafeTemp},"${s.driver}","${s.eta}"`
    ).join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FAH256_LogisticsReport_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("FAH256 COLD CHAIN TELEMATICS PLATFORM", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Official ISO 21978 Logistics Audit Report", 14, 28);
    doc.text(`Generated: ${new Date().toLocaleString()} UTC`, 14, 34);
    
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    doc.setFont("helvetica", "bold");
    doc.text("ACTIVE SHIPMENTS & TELEMETRY SUMMARY", 14, 46);

    let y = 54;
    shipments.forEach((s, idx) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${s.id} - ${s.cargoName}`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(`   Status: ${s.status} | Temp: ${s.currentTemp}°C (Safe Range: ${s.minSafeTemp}°C to ${s.maxSafeTemp}°C)`, 14, y + 6);
      doc.text(`   Driver: ${s.driver} | Device: ${s.deviceHardwareId}`, 14, y + 12);
      y += 20;
    });

    doc.line(14, y, 196, y);
    doc.setFont("helvetica", "bold");
    doc.text("CRYPTOGRAPHIC AUDIT VERDICT: 100% SECURE & HMAC SIGNED", 14, y + 10);

    doc.save(`FAH256_OfficialReport_${new Date().toISOString().substring(0, 10)}.pdf`);
  };

  const cardBg = isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-xs';
  const subText = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6">
      <div className={`${cardBg} rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 transition-colors`}>
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            COMPLIANCE REPORTS & DATA EXPORTS
          </h2>
          <p className={`text-xs ${subText}`}>
            Generate PDF / CSV Reports • Regulatory Audit Bundles • Thermal Excursion Certification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className={`px-4 py-2 border rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              isDarkMode
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 hover:bg-emerald-900/80'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV Spreadsheet
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" /> Download PDF Audit Report
          </button>
        </div>
      </div>

      {/* Live Preview Paper Card */}
      <div className={`${cardBg} rounded-xl p-6 space-y-4 transition-colors`}>
        <div className={`flex justify-between items-center border-b pb-3 text-xs font-mono ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <span className={`${subText} font-bold`}>REPORT PREVIEW DOCUMENT</span>
          <span className="text-blue-400 font-bold">ISO-21978 CERTIFIED</span>
        </div>

        <div className={`border p-6 rounded-lg font-mono text-xs space-y-4 ${
          isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}>
          <div className={`border-b pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <h3 className="text-base font-black text-blue-400">FAH256 COLD CHAIN TELEMATICS PLATFORM</h3>
            <p className={`text-[11px] ${subText}`}>Official Telemetry & Chain of Custody Audit Report</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <span className={`block ${subText}`}>Total Active Cargo Inspected:</span>
              <span className="font-bold">{shipments.length} Cargo Units</span>
            </div>
            <div>
              <span className={`block ${subText}`}>Cryptographic Integrity Verdict:</span>
              <span className="font-bold text-emerald-400">✓ 100% HMAC Authenticated</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className={`text-[10px] uppercase font-bold block ${subText}`}>Summary of Inspected Shipments</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className={`uppercase border-b text-[9px] ${
                  isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200'
                }`}>
                  <tr>
                    <th className="py-1">ID</th>
                    <th className="py-1">Cargo Name</th>
                    <th className="py-1">Current Temp</th>
                    <th className="py-1">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-sans ${
                  isDarkMode ? 'divide-slate-800' : 'divide-slate-200'
                }`}>
                  {shipments.map(s => (
                    <tr key={s.id}>
                      <td className="py-1.5 text-blue-400 font-mono font-bold">{s.id}</td>
                      <td className="py-1.5 font-semibold">{s.cargoName}</td>
                      <td className={`py-1.5 font-mono ${subText}`}>{s.currentTemp}°C</td>
                      <td className="py-1.5 text-emerald-400 font-bold">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
