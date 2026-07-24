import { store } from '../db/store.js';

export const getSystemHealth = (req, res) => {
  res.json({ success: true, data: store.systemHealth });
};

export const getShipments = (req, res) => {
  const { filter } = req.query;
  const data = store.getShipments(filter);
  res.json({ success: true, count: data.length, data });
};

export const getShipmentById = (req, res) => {
  const { id } = req.params;
  const shipment = store.getShipmentById(id);
  if (!shipment) {
    return res.status(404).json({ success: false, message: 'Shipment not found' });
  }
  res.json({ success: true, data: shipment });
};

export const createShipment = (req, res) => {
  const newShipment = store.createShipment(req.body);
  res.status(201).json({ success: true, data: newShipment });
};

export const updateShipment = (req, res) => {
  const { id } = req.params;
  const updated = store.updateShipment(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Shipment not found' });
  }
  res.json({ success: true, data: updated });
};

export const deleteShipment = (req, res) => {
  const { id } = req.params;
  const success = store.deleteShipment(id);
  res.json({ success, message: success ? 'Shipment deleted' : 'Shipment not found' });
};

export const clearDatabase = (req, res) => {
  const result = store.resetAllData();
  res.json({ success: true, message: result.message });
};

export const resetDatabase = (req, res) => {
  const result = store.seedSampleData();
  res.json({ success: true, message: result.message });
};

export const getAlerts = (req, res) => {
  const { severity } = req.query;
  const data = store.getAlerts(severity);
  res.json({ success: true, count: data.length, data });
};

export const createAlert = (req, res) => {
  const newAlert = store.createAlert(req.body);
  res.status(201).json({ success: true, data: newAlert });
};

export const getTelemetry = (req, res) => {
  const { shipmentId } = req.params;
  res.json({ success: true, shipmentId, data: store.telemetrySeries });
};

export const getChainOfCustody = (req, res) => {
  res.json({ success: true, data: store.chainOfCustody });
};

export const getFleet = (req, res) => {
  res.json({ success: true, data: store.fleet });
};

export const getDrivers = (req, res) => {
  res.json({ success: true, data: store.drivers });
};

export const getDevices = (req, res) => {
  res.json({ success: true, data: store.getDevices() });
};

export const otaUpdateDevice = (req, res) => {
  const { id } = req.params;
  const updated = store.otaUpdateDevice(id);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Device not found' });
  }
  res.json({ success: true, message: `OTA update executed on ${id}`, data: updated });
};

export const restartDevice = (req, res) => {
  const { id } = req.params;
  const updated = store.restartDevice(id);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Device not found' });
  }
  res.json({ success: true, message: `Restart signal sent to ${id}`, data: updated });
};

export const verifyIntegrity = (req, res) => {
  const { shipmentId } = req.body;
  const auditResult = store.verifyIntegrity(shipmentId);
  res.json({ success: true, data: auditResult });
};

export const getAnalytics = (req, res) => {
  res.json({
    success: true,
    data: {
      riskIndex: store.shipments.length > 0 ? 14.2 : 0,
      failureHorizonHours: 1.2,
      successRatePct: 99.4,
      alertDistribution: [
        { name: 'Temp High Excursion', count: store.alerts.length > 0 ? 14 : 0, color: '#ef4444' },
        { name: 'Cellular Signal Drop', count: store.alerts.length > 0 ? 8 : 0, color: '#f59e0b' },
        { name: 'Door Tamper Optical', count: store.alerts.length > 0 ? 3 : 0, color: '#ec4899' },
        { name: 'Toll Delay Checkpoint', count: store.alerts.length > 0 ? 19 : 0, color: '#3b82f6' },
      ],
      driverMatrix: [
        { name: 'Marcus Vance', score: 98, delays: 1 },
        { name: 'Sarah Jenkins', score: 100, delays: 0 },
        { name: 'Vikram Sharma', score: 82, delays: 3 },
        { name: 'Arjun Reddy', score: 95, delays: 1 },
      ]
    }
  });
};

export const getSettings = (req, res) => {
  res.json({ success: true, data: store.settings });
};

export const updateSettings = (req, res) => {
  const updated = store.updateSettings(req.body);
  res.json({ success: true, message: 'Settings updated successfully', data: updated });
};
