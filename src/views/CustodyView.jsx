import React, { useState, useEffect } from 'react';
import ChainOfCustodyTimeline from '../components/ChainOfCustodyTimeline';
import { apiService } from '../services/api';

export default function CustodyView({ isDarkMode = true }) {
  const [handoffs, setHandoffs] = useState([]);

  useEffect(() => {
    async function loadCustodyLogs() {
      try {
        const data = await apiService.getChainOfCustody();
        setHandoffs(data || []);
      } catch (err) {
        console.error('Failed to load chain of custody from API:', err);
      }
    }
    loadCustodyLogs();
  }, []);

  return (
    <div className="space-y-6">
      <ChainOfCustodyTimeline handoffs={handoffs} isDarkMode={isDarkMode} />
    </div>
  );
}
