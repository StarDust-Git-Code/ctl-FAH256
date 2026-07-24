import React from 'react';
import IntegrityVerifier from '../components/IntegrityVerifier';

export default function IntegrityView({ shipment, isDarkMode = true }) {
  return (
    <div className="space-y-6">
      <IntegrityVerifier shipmentId={shipment?.id} isDarkMode={isDarkMode} />
    </div>
  );
}
