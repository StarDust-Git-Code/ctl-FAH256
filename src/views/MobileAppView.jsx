import React from 'react';
import DriverMobileApp from '../components/DriverMobileApp';

export default function MobileAppView({ selectedShipment }) {
  return (
    <div className="space-y-6">
      <DriverMobileApp shipment={selectedShipment} />
    </div>
  );
}
