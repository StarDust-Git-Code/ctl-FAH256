import express from 'express';
import {
  getSystemHealth,
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  clearDatabase,
  resetDatabase,
  getAlerts,
  createAlert,
  getTelemetry,
  ingestTelemetry,
  getChainOfCustody,
  addCustodyHandoff,
  getFleet,
  getDrivers,
  createDriver,
  getDevices,
  otaUpdateDevice,
  restartDevice,
  verifyIntegrity,
  getAnalytics,
  getSettings,
  updateSettings
} from '../controllers/logisticsController.js';

const router = express.Router();

// System Health
router.get('/system/health', getSystemHealth);

// Database Actions
router.post('/db/clear', clearDatabase);
router.post('/db/reset', resetDatabase);

// Shipments API
router.get('/shipments', getShipments);
router.get('/shipments/:id', getShipmentById);
router.post('/shipments', createShipment);
router.patch('/shipments/:id', updateShipment);
router.delete('/shipments/:id', deleteShipment);

// Alerts API
router.get('/alerts', getAlerts);
router.post('/alerts', createAlert);

// Telemetry Ingestion & Query API
router.get('/telemetry/:shipmentId', getTelemetry);
router.post('/telemetry', ingestTelemetry);
router.post('/telemetry/:shipmentId', ingestTelemetry);

// Chain of Custody API
router.get('/custody', getChainOfCustody);
router.post('/custody/handoff', addCustodyHandoff);

// Fleet API
router.get('/fleet', getFleet);

// Drivers API
router.get('/drivers', getDrivers);
router.post('/drivers', createDriver);

// Devices API
router.get('/devices', getDevices);
router.post('/devices/:id/ota', otaUpdateDevice);
router.post('/devices/:id/restart', restartDevice);

// Cryptographic Integrity Verification API
router.post('/integrity/verify', verifyIntegrity);

// Predictive Analytics API
router.get('/analytics', getAnalytics);

// Settings API
router.get('/settings', getSettings);
router.post('/settings', updateSettings);

export default router;
