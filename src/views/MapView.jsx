import React from 'react';
import LiveMap from '../components/LiveMap';

export default function MapView({ fleet, shipments, selectedShipment, isDarkMode = true }) {
  return (
    <div className="space-y-6">
      <LiveMap fleet={fleet} shipments={shipments} selectedShipmentId={selectedShipment?.id} isDarkMode={isDarkMode} />
    </div>
  );
}
