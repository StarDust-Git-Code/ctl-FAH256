import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Navigation, Layers, ShieldCheck, MapPin, Truck, AlertTriangle } from 'lucide-react';

export default function LiveMap({ fleet, shipments, selectedShipmentId, isDarkMode = true }) {
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const geofencesRef = useRef([]);
  const [showGeofences, setShowGeofences] = useState(true);

  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletInstance.current) return;

    // Hardcode map center directly over Adyar / KCG College Chennai Transit Corridor
    const map = L.map(mapRef.current, {
      center: [13.0067, 80.2571], // Adyar, Chennai
      zoom: 12,
      zoomControl: false,
    });
    leafletInstance.current = map;

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dynamic tile URL based on Dark/Light mode
    const tileUrl = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const baseTile = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors &amp; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    });
    baseTile.addTo(map);
    tileLayerRef.current = baseTile;

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, []);

  // Dynamic Route Lines & Markers Rendering
  useEffect(() => {
    const map = leafletInstance.current;
    if (!map) return;

    // Clear previous markers, polylines & geofences
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    polylinesRef.current.forEach(p => map.removeLayer(p));
    polylinesRef.current = [];

    geofencesRef.current.forEach(g => map.removeLayer(g));
    geofencesRef.current = [];

    const activeFleet = fleet || [];
    const activeShipments = shipments || [];

    // Render KCG College to Adyar Geofences if enabled
    if (showGeofences) {
      // KCG College Karapakkam Safe Zone
      const gfKcg = L.circle([12.9100, 80.2285], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        radius: 1200,
      }).bindTooltip("Geofence: KCG College Origin Hub", { permanent: false }).addTo(map);
      geofencesRef.current.push(gfKcg);

      // Adyar Courier Service Safe Zone
      const gfAdyar = L.circle([13.0067, 80.2571], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
        radius: 1500,
      }).bindTooltip("Geofence: Adyar Courier Destination Hub", { permanent: false }).addTo(map);
      geofencesRef.current.push(gfAdyar);
    }

    // Always draw active transit route line (KCG College ➔ Perungudi ➔ Thiruvanmiyur ➔ Adyar)
    const polyCoords = [
      [12.9100, 80.2285], // KCG College
      [12.9400, 80.2370], // Perungudi Toll
      [12.9700, 80.2480], // Thiruvanmiyur
      [13.0067, 80.2571]  // Adyar Courier
    ];

    const isAlert = activeShipments.some(s => s.status === 'CRITICAL_ALERT');
    const poly = L.polyline(polyCoords, {
      color: isAlert ? '#ef4444' : '#3b82f6',
      weight: 4,
      opacity: 0.9,
      dashArray: '8, 8',
    }).bindTooltip("Adyar Courier Transit Corridor (KCG ➔ Adyar)", { permanent: false }).addTo(map);
    polylinesRef.current.push(poly);

    // Combine shipments and fleet items for marker rendering
    const displayLocations = [];

    activeShipments.forEach(shp => {
      const isCritical = shp.status === 'CRITICAL_ALERT' || shp.tamperStatus === 'POTENTIAL_BREACH';
      const lat = shp.location?.lat || 12.9100;
      const lng = shp.location?.lng || 80.2285;

      displayLocations.push([lat, lng]);

      const customIcon = L.divIcon({
        className: 'custom-vehicle-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-9 h-9 rounded-full ${isCritical ? 'bg-red-500 animate-ping opacity-75' : 'bg-blue-400 opacity-60'} absolute"></div>
            <div class="w-9 h-9 rounded-full ${isCritical ? 'bg-red-600' : 'bg-blue-600'} text-white flex items-center justify-center shadow-lg relative z-10 border-2 ${isDarkMode ? 'border-slate-900' : 'border-white'}">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 2 2h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const popupContent = `
        <div style="font-family: system-ui; padding: 4px; min-width: 180px;">
          <div style="font-weight: bold; color: ${isCritical ? '#ef4444' : '#3b82f6'}; font-size: 13px;">
            ${shp.id} - ${shp.cargoName.substring(0, 24)}...
          </div>
          <div style="font-size: 11px; margin-top: 4px; color: ${isDarkMode ? '#e2e8f0' : '#334155'};">
            <strong>Payload Temp:</strong> <span style="color: ${isCritical ? '#ef4444' : '#10b981'}; font-weight: bold;">${shp.currentTemp}°C</span><br/>
            <strong>Safe Window:</strong> ${shp.minSafeTemp}°C to ${shp.maxSafeTemp}°C<br/>
            <strong>Route:</strong> ${shp.source} ➔ ${shp.destination}<br/>
            <strong>Hardware Gateway:</strong> ${shp.deviceHardwareId || 'GW-RUGGED-9941'}<br/>
            <strong>Tamper Status:</strong> <span style="color: ${isCritical ? '#ef4444' : '#10b981'}; font-weight: bold;">${shp.tamperStatus || 'SECURE'}</span>
          </div>
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(map);

      markersRef.current.push(marker);
    });

    activeFleet.forEach(item => {
      if (item.gps && item.gps.lat && item.gps.lng) {
        displayLocations.push([item.gps.lat, item.gps.lng]);
      }
    });

    // Auto-fit map bounds over active locations or center on Adyar, Chennai
    if (displayLocations.length > 0) {
      const bounds = L.latLngBounds(displayLocations);
      map.fitBounds(bounds.pad(0.3));
    } else {
      map.setView([13.0067, 80.2571], 12);
    }
  }, [fleet, shipments, selectedShipmentId, showGeofences, isDarkMode]);

  // Update Tile Layer if Theme Changes dynamically
  useEffect(() => {
    if (!leafletInstance.current || !tileLayerRef.current) return;
    const tileUrl = isDarkMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    
    tileLayerRef.current.setUrl(tileUrl);
  }, [isDarkMode]);

  return (
    <div className={`rounded-xl p-4 relative border transition-colors ${
      isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
    }`}>
      {/* Map Control Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 mb-3 border-b pb-3 ${
        isDarkMode ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-sm tracking-tight">
            LIVE FLEET & CARGO COMMAND MAP
          </span>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
            isDarkMode ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            ● ADYAR CHENNAI LIVE
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowGeofences(!showGeofences)}
            className={`px-2.5 py-1.5 rounded-lg font-semibold border flex items-center gap-1.5 transition ${
              showGeofences
                ? isDarkMode ? 'bg-blue-950/80 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
                : isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Geofences {showGeofences ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className={`relative w-full h-[480px] rounded-lg overflow-hidden border shadow-inner ${
        isDarkMode ? 'border-slate-800 bg-[#0b0f19]' : 'border-slate-200 bg-slate-100'
      }`}>
        <div ref={mapRef} className="w-full h-full z-10" />

        {/* Legend Overlay */}
        <div className={`absolute bottom-4 left-4 z-[400] backdrop-blur-md border rounded-lg p-3 text-xs space-y-2 font-medium shadow-md max-w-xs ${
          isDarkMode ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'
        }`}>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Map Legend</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Optimal Cold Transport (KCG ➔ Adyar)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-red-400 font-bold">Excursion / Tamper Breach</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500 border-t border-dashed"></div>
            <span>Active Transit Corridor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full border ${isDarkMode ? 'bg-emerald-950 border-emerald-500' : 'bg-emerald-100 border-emerald-500'}`}></div>
            <span>Geofence Safe Zone</span>
          </div>
        </div>
      </div>
    </div>
  );
}
