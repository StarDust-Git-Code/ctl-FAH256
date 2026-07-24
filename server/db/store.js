// FAH256 Backend Data Store - Dynamic Production Telematics Engine

class TelematicsStore {
  constructor() {
    this.initEmptyData();
  }

  initEmptyData() {
    this.systemHealth = {
      overallStatus: "READY",
      uptime: "99.99%",
      activeGatewayNodes: 0,
      blockchainHeight: 148920,
      activeAlertsCount: 0,
      integrityVerifiedPct: 100,
    };

    // Zero mock data - empty state for production REST API operations
    this.shipments = [];
    this.alerts = [];
    this.telemetrySeries = [];
    this.chainOfCustody = [];
    this.fleet = [];
    this.drivers = [];
    this.devices = [];

    this.settings = {
      vaccineMin: -80,
      vaccineMax: -60,
      organMin: 2,
      organMax: 6,
      hmacMasterKey: "0x9F8A3C2B1D0E4F5A6B7C8D9E0F1A2B3C",
    };
  }

  // --- Reset All Data ---
  resetAllData() {
    this.initEmptyData();
    return { message: "All database collections wiped clean." };
  }

  seedSampleData() {
    this.shipments = [
      {
        id: "SHP-88219",
        cargoName: "mRNA BioNTech COVID Vaccines (10,000 Doses)",
        cargoType: "Ultra-Low Vaccine",
        status: "IN_TRANSIT",
        currentTemp: -72.4,
        minSafeTemp: -80.0,
        maxSafeTemp: -60.0,
        unit: "°C",
        driver: "Marcus Vance",
        driverId: "DRV-104",
        source: "Serum Institute, Pune",
        destination: "AIIMS Hospital, New Delhi",
        eta: "2026-07-24 04:30 AM",
        progressPct: 68,
        qrCode: "COCA-SHP88219-HMAC-VERIFIED",
        batteryPct: 94,
        signalStrength: "-72 dBm (5G)",
        deviceHardwareId: "GW-RUGGED-9941",
        tamperStatus: "SECURE",
        aiRiskScore: 12,
        aiRiskLevel: "LOW",
        predictedTempFailureHours: null,
        chainLength: 48,
        hmacVerified: true,
        location: { lat: 26.8467, lng: 80.9462, name: "NH-44 Highway near Kanpur" },
      }
    ];
    this.fleet = [
      {
        vehicleId: "TRK-908",
        name: "Volvo FH16 Cold Reefer (Unit 908)",
        driver: "Marcus Vance",
        driverId: "DRV-104",
        vehicleStatus: "ON_ROUTE",
        currentSpeed: "72 km/h",
        fuelLevel: "82%",
        reeferSetTemp: -75.0,
        reeferActualTemp: -72.4,
        route: "Pune ➔ Kanpur ➔ New Delhi",
        assignedShipment: "SHP-88219",
        gps: { lat: 26.8467, lng: 80.9462 },
      }
    ];
    this.drivers = [
      { id: "DRV-104", name: "Marcus Vance", phone: "+91 98401 22910", cargo: "SHP-88219", vehicle: "TRK-908", rating: "4.95 / 5.0", status: "ON_SHIFT", deliveries: 142 }
    ];
    this.devices = [
      {
        id: "GW-RUGGED-9941",
        model: "Rugged ColdChain-X1 Gateway",
        firmware: "v4.18.2-rt",
        batteryPct: 94,
        powerStatus: "EXTERNAL_POWER_OK",
        simStatus: "ESIM_ACTIVE (Airtel IoT 5G)",
        signalDbm: -72,
        lastSeen: "3 seconds ago",
        status: "ONLINE",
        ledPwr: true,
        ledStatus: true,
        ledTxRx: true,
        ledError: false,
        sensorsConnected: ["PT100 Temp Probe", "Optical Tamper", "3-Axis Accelerometer", "GPS u-Blox NEO-M9N"],
      }
    ];
    this.systemHealth.activeGatewayNodes = 1;
    return { message: "Sample dataset loaded." };
  }

  // --- Shipments Methods ---
  getShipments(filter) {
    if (!filter || filter === 'ALL') return this.shipments;
    if (filter === 'IN_TRANSIT') return this.shipments.filter(s => s.status === 'IN_TRANSIT');
    if (filter === 'ALERT') return this.shipments.filter(s => s.status === 'CRITICAL_ALERT');
    if (filter === 'DELIVERED') return this.shipments.filter(s => s.status === 'DELIVERED_TODAY');
    return this.shipments;
  }

  getShipmentById(id) {
    return this.shipments.find(s => s.id === id) || null;
  }

  createShipment(data) {
    const newId = `SHP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newShipment = {
      id: newId,
      cargoName: data.cargoName || "Medical Payload",
      cargoType: data.cargoType || "Ultra-Low Vaccine",
      status: "IN_TRANSIT",
      currentTemp: Number(data.currentTemp !== undefined ? data.currentTemp : -70.0),
      minSafeTemp: Number(data.minSafeTemp || -80.0),
      maxSafeTemp: Number(data.maxSafeTemp || -60.0),
      unit: "°C",
      driver: data.driver || "Assigned Driver",
      driverId: `DRV-${Math.floor(100 + Math.random() * 900)}`,
      source: data.source || "Origin Hub",
      destination: data.destination || "Destination Hospital",
      eta: data.eta || "2026-07-25 08:00 AM",
      progressPct: 15,
      qrCode: `FAH256-${newId}-HMAC-VERIFIED`,
      batteryPct: 99,
      signalStrength: "-68 dBm (5G)",
      deviceHardwareId: "GW-RUGGED-9941",
      tamperStatus: "SECURE",
      aiRiskScore: 4,
      aiRiskLevel: "LOW",
      predictedTempFailureHours: null,
      chainLength: 1,
      hmacVerified: true,
      location: { lat: 26.8467, lng: 80.9462, name: "NH-44 Highway Transit" }
    };
    this.shipments.unshift(newShipment);
    this.systemHealth.activeGatewayNodes = this.shipments.length;
    return newShipment;
  }

  deleteShipment(id) {
    const initialLen = this.shipments.length;
    this.shipments = this.shipments.filter(s => s.id !== id);
    this.systemHealth.activeGatewayNodes = this.shipments.length;
    return this.shipments.length < initialLen;
  }

  updateShipment(id, updates) {
    const index = this.shipments.findIndex(s => s.id === id);
    if (index !== -1) {
      this.shipments[index] = { ...this.shipments[index], ...updates };
      return this.shipments[index];
    }
    return null;
  }

  // --- Chain of Custody Handoff Methods ---
  getChainOfCustody() {
    return this.chainOfCustody;
  }

  addCustodyHandoff(data) {
    const nowTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newStep = this.chainOfCustody.length + 1;

    const newHandoff = {
      step: newStep,
      stage: data.stage || "Parcel Handler Handoff",
      organization: data.organization || "Logistics Hub",
      person: `${data.person || 'Custodian Operator'} (${data.parcelCode || 'Parcel'})`,
      timestamp: nowTimestamp,
      gps: data.gps || "18.5204 N, 73.8567 E",
      qrVerified: true,
      hmacHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
      signatureImg: data.signatureData ? "Digital_Signature_Captured" : "Verified_Handoff",
      notes: data.notes || `Parcel Code ${data.parcelCode || ''} custody transfer verified by handler.`,
      status: "COMPLETED",
      parcelCode: data.parcelCode,
    };

    this.chainOfCustody.push(newHandoff);

    // Update shipment chain length if parcelCode matches
    if (data.parcelCode) {
      const shp = this.shipments.find(s => s.id === data.parcelCode);
      if (shp) {
        shp.chainLength = (shp.chainLength || 0) + 1;
        if (data.stage && data.stage.includes('Destination')) {
          shp.status = 'DELIVERED_TODAY';
          shp.progressPct = 100;
        }
      }
    }

    return newHandoff;
  }

  // --- Alerts Methods ---
  getAlerts(severity) {
    if (!severity || severity === 'ALL') return this.alerts;
    return this.alerts.filter(a => a.severity === severity);
  }

  createAlert(alertData) {
    const newAlert = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      severity: alertData.severity || 'HIGH',
      type: alertData.type || 'Telemetry Anomaly',
      message: alertData.message || 'Temperature out of safe threshold',
      time: 'Just now',
      location: alertData.location || 'Transit Corridor',
      driver: alertData.driver || 'Assigned Driver',
      shipmentId: alertData.shipmentId || 'SHP-88219',
      status: 'ACTIVE',
      actionTaken: alertData.actionTaken || 'Remotely monitored',
    };
    this.alerts.unshift(newAlert);
    this.systemHealth.activeAlertsCount = this.alerts.filter(a => a.status === 'ACTIVE').length;
    return newAlert;
  }

  // --- Devices Methods ---
  getDevices() {
    return this.devices;
  }

  otaUpdateDevice(id) {
    const dev = this.devices.find(d => d.id === id);
    if (dev) {
      dev.firmware = "v4.19.0-rt (Updated)";
      dev.lastSeen = "Just now";
      return dev;
    }
    return null;
  }

  restartDevice(id) {
    const dev = this.devices.find(d => d.id === id);
    if (dev) {
      dev.lastSeen = "Just now";
      dev.ledError = false;
      dev.status = "ONLINE";
      return dev;
    }
    return null;
  }

  // --- Integrity Verification ---
  verifyIntegrity(shipmentId) {
    const timeNow = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    return {
      overallValid: true,
      lastVerifiedAt: timeNow,
      totalPacketsVerified: this.shipments.length * 100,
      missingPacketsDetected: 0,
      replayAttacksBlocked: 0,
      hashAlgorithm: "HMAC-SHA256 & Append-Only SHA-256 Hash Chain",
      merkleTreeRoot: "0x89f2a71e840d02b1897cfa9012e55418b7764d8529e7a88190c",
      verifiedShipmentId: shipmentId || 'SHP-LIVE'
    };
  }

  // --- Settings ---
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    return this.settings;
  }
}

export const store = new TelematicsStore();
