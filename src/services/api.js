// Centralized API Service for FAH256 Cold Chain Telematics & Integrity Platform

// Dynamically uses Render server API URL when deployed on Vercel (VITE_API_URL)
// or falls back to relative '/api' for local development proxy.
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function fetchJson(endpoint, options = {}) {
  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data !== undefined ? data.data : data;
  } catch (err) {
    console.error(`Failed to fetch from ${endpoint}:`, err);
    throw err;
  }
}

export const apiService = {
  // System Health
  async getSystemHealth() {
    return fetchJson('/system/health');
  },

  // Database Management
  async clearDatabase() {
    return fetchJson('/db/clear', { method: 'POST' });
  },

  async resetDatabase() {
    return fetchJson('/db/reset', { method: 'POST' });
  },

  // Shipments
  async getShipments(filter = 'ALL') {
    return fetchJson(`/shipments?filter=${filter}`);
  },

  async getShipmentById(id) {
    return fetchJson(`/shipments/${id}`);
  },

  async createShipment(shipmentData) {
    return fetchJson('/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  },

  async updateShipment(id, updates) {
    return fetchJson(`/shipments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteShipment(id) {
    return fetchJson(`/shipments/${id}`, {
      method: 'DELETE',
    });
  },

  // Alerts
  async getAlerts(severity = 'ALL') {
    return fetchJson(`/alerts?severity=${severity}`);
  },

  async createAlert(alertData) {
    return fetchJson('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  },

  // Telemetry
  async getTelemetry(shipmentId) {
    return fetchJson(`/telemetry/${shipmentId}`);
  },

  // Chain of Custody
  async getChainOfCustody() {
    return fetchJson('/custody');
  },

  async addCustodyHandoff(handoffData) {
    return fetchJson('/custody/handoff', {
      method: 'POST',
      body: JSON.stringify(handoffData),
    });
  },

  // Fleet
  async getFleet() {
    return fetchJson('/fleet');
  },

  // Drivers
  async getDrivers() {
    return fetchJson('/drivers');
  },

  // Devices
  async getDevices() {
    return fetchJson('/devices');
  },

  async otaUpdateDevice(id) {
    return fetchJson(`/devices/${id}/ota`, {
      method: 'POST',
    });
  },

  async restartDevice(id) {
    return fetchJson(`/devices/${id}/restart`, {
      method: 'POST',
    });
  },

  // Cryptographic Integrity Verification
  async verifyIntegrity(shipmentId) {
    return fetchJson('/integrity/verify', {
      method: 'POST',
      body: JSON.stringify({ shipmentId }),
    });
  },

  // Predictive AI Analytics
  async getAnalytics() {
    return fetchJson('/analytics');
  },

  // Settings
  async getSettings() {
    return fetchJson('/settings');
  },

  async updateSettings(settingsData) {
    return fetchJson('/settings', {
      method: 'POST',
      body: JSON.stringify(settingsData),
    });
  },
};
