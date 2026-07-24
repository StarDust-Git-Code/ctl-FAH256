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

export const ingestTelemetry = (req, res) => {
  const { shipmentId } = req.params;
  const targetId = shipmentId || req.body.shipmentId || 'SHP-88219';

  const telemetryPoint = {
    timestamp: new Date().toISOString(),
    shipmentId: targetId,
    temp: Number(req.body.currentTemp !== undefined ? req.body.currentTemp : (req.body.temp || -72.4)),
    humidity: 58,
    lat: req.body.gps?.lat || 12.9100,
    lng: req.body.gps?.lng || 80.2285,
    speed: req.body.gps?.speed || "48.5 km/h",
    tamperStatus: req.body.tamperStatus || "SECURE",
    motionDetected: Boolean(req.body.motionDetected),
    shockDetected: Boolean(req.body.shockDetected),
    source: req.body.source || "KCG College of Technology, Karapakkam, Chennai",
    destination: req.body.destination || "Adyar Courier Service, Chennai",
    accel: req.body.accel || { x: 0, y: 0, z: 9.81 },
    hmacSignature: req.body.hmacSignature || "HMAC_OK"
  };

  store.telemetrySeries.push(telemetryPoint);
  if (store.telemetrySeries.length > 200) {
    store.telemetrySeries.shift();
  }

  // Update existing shipment or auto-create active shipment
  let shp = store.getShipmentById(targetId);
  if (!shp) {
    shp = store.createShipment({
      cargoName: "ESP32-S3 Smart Cold Chain Hardware Telemetry",
      cargoType: "Ultra-Low Vaccine Payload",
      source: telemetryPoint.source,
      destination: telemetryPoint.destination,
      currentTemp: telemetryPoint.temp,
    });
    shp.id = targetId;
  } else {
    shp.currentTemp = telemetryPoint.temp;
    shp.tamperStatus = telemetryPoint.tamperStatus;
    shp.location = {
      lat: telemetryPoint.lat,
      lng: telemetryPoint.lng,
      name: `${telemetryPoint.source} ➔ ${telemetryPoint.destination}`
    };
  }

  // Update fleet array for vehicle map tracking
  let fleetItem = store.fleet.find(f => f.assignedShipment === targetId || f.vehicleId === 'TRK-908');
  if (!fleetItem) {
    fleetItem = {
      vehicleId: 'TRK-908',
      name: 'Volvo FH16 Cold Reefer (Unit 908)',
      driver: shp.driver || 'Assigned Driver',
      driverId: shp.driverId || 'DRV-104',
      vehicleStatus: telemetryPoint.tamperStatus === 'POTENTIAL_BREACH' ? 'ALERT' : 'ON_ROUTE',
      currentSpeed: telemetryPoint.speed || '48.5 km/h',
      fuelLevel: '82%',
      reeferSetTemp: -75.0,
      reeferActualTemp: telemetryPoint.temp,
      route: `${telemetryPoint.source} ➔ ${telemetryPoint.destination}`,
      assignedShipment: targetId,
      gps: { lat: telemetryPoint.lat, lng: telemetryPoint.lng }
    };
    store.fleet.unshift(fleetItem);
  } else {
    fleetItem.reeferActualTemp = telemetryPoint.temp;
    fleetItem.vehicleStatus = telemetryPoint.tamperStatus === 'POTENTIAL_BREACH' ? 'ALERT' : 'ON_ROUTE';
    fleetItem.gps = { lat: telemetryPoint.lat, lng: telemetryPoint.lng };
    fleetItem.currentSpeed = telemetryPoint.speed || '48.5 km/h';
    fleetItem.route = `${telemetryPoint.source} ➔ ${telemetryPoint.destination}`;
  }

  // Auto-trigger alert if tamper detected
  if (telemetryPoint.tamperStatus === 'POTENTIAL_BREACH' || telemetryPoint.motionDetected || telemetryPoint.shockDetected) {
    shp.status = 'CRITICAL_ALERT';
    store.createAlert({
      severity: 'HIGH',
      type: 'Hardware Tamper Breach',
      message: `ESP32-S3 Gateway detected hatch breach/motion at Lat ${telemetryPoint.lat}, Lng ${telemetryPoint.lng}`,
      shipmentId: targetId,
      location: 'KCG College to Adyar Transit Corridor'
    });
  } else {
    if (shp.status === 'CRITICAL_ALERT') shp.status = 'IN_TRANSIT';
  }

  store.saveToDisk();

  res.status(200).json({
    success: true,
    message: "ESP32-S3 Telemetry packet ingested successfully",
    shipmentId: targetId,
    receivedSequence: req.body.seq || 1
  });
};

export const getChainOfCustody = (req, res) => {
  res.json({ success: true, data: store.getChainOfCustody() });
};

export const addCustodyHandoff = (req, res) => {
  const handoff = store.addCustodyHandoff(req.body);
  res.status(201).json({ success: true, message: 'Custody handoff logged and persisted', data: handoff });
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
  const hasShipments = store.shipments.length > 0;
  const hasAlerts = store.alerts.length > 0;

  res.json({
    success: true,
    data: {
      riskIndex: hasShipments ? 14.2 : 0,
      failureHorizonHours: hasAlerts ? 1.2 : 0,
      successRatePct: hasShipments ? 99.4 : 100,
      alertDistribution: hasAlerts ? [
        { name: 'Temp High Excursion', count: 14, color: '#ef4444' },
        { name: 'Cellular Signal Drop', count: 8, color: '#f59e0b' },
        { name: 'Door Tamper Optical', count: 3, color: '#ec4899' },
        { name: 'Toll Delay Checkpoint', count: 19, color: '#3b82f6' },
      ] : [],
      driverMatrix: store.drivers.map(d => ({
        name: d.name,
        score: 98,
        delays: 0
      }))
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
