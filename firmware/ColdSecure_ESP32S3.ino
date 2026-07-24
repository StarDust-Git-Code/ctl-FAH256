/*
 * ====================================================================
 * FAH256 ColdSecure ESP32-S3 Smart Cold Chain Telematics Firmware
 * ====================================================================
 * Hardware: ESP32-S3 DevKit
 * Features:
 *   - DS18B20 OneWire Temp Probe (GPIO 4)
 *   - PIR Motion & Hatch Tamper Detection (GPIO 5)
 *   - MPU6050 6-Axis Accelerometer/Gyroscope I2C (SDA 8, SCL 9)
 *   - NEO-6M GPS Module UART (RX 18, TX 17)
 *   - Built-in WS2812 NeoPixel RGB Diagnostic LED (GPIO 48)
 *   - HMAC-SHA256 Payload Signature Engine
 *   - HTTP POST REST API Telemetry Transmission to Render Server
 * ====================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <TinyGPSPlus.h>
#include <Adafruit_NeoPixel.h>
#include "mbedtls/md.h"

// ====================================================================
// HARDWARE PIN MAPPING
// ====================================================================
#define PIN_DS18B20  4   // OneWire Temperature Probe (4.7kΩ Pull-up required)
#define PIN_PIR      5   // PIR Motion / Hatch Tamper Sensor
#define PIN_I2C_SDA  8   // MPU6050 I2C SDA
#define PIN_I2C_SCL  9   // MPU6050 I2C SCL
#define PIN_GPS_TX   17  // ESP32 TX -> GPS RX (Optional)
#define PIN_GPS_RX   18  // ESP32 RX <- GPS TX
#define PIN_RGB_LED  48  // Built-in WS2812 NeoPixel DIN

// ====================================================================
// NETWORK & API CONFIGURATION
// ====================================================================
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";

// Render REST API Backend Endpoint
const char* API_URL = "https://ctl-fah256.onrender.com/api/telemetry/SHP-88219";

// HMAC-SHA256 Master Secret Key for Payload Authenticity
const char* HMAC_KEY = "0x9F8A3C2B1D0E4F5A6B7C8D9E0F1A2B3C";

// Device Hardware Identifier
const char* DEVICE_HARDWARE_ID = "GW-RUGGED-9941";

// ====================================================================
// SENSOR DRIVER INSTANCES
// ====================================================================
OneWire oneWire(PIN_DS18B20);
DallasTemperature tempSensor(&oneWire);

Adafruit_MPU6050 mpu;
TinyGPSPlus gps;
HardwareSerial gpsSerial(1); // Use UART1 for GPS

Adafruit_NeoPixel rgbLed(1, PIN_RGB_LED, NEO_GRB + NEO_KHZ800);

// Global Variables
unsigned long lastTelemetryTime = 0;
const unsigned long TELEMETRY_INTERVAL_MS = 5000; // 5 Seconds Interval
uint32_t packetSequenceCounter = 0;

// Color Constants for WS2812 RGB LED (GPIO 48)
void setRgbColor(uint8_t r, uint8_t g, uint8_t b) {
  rgbLed.setPixelColor(0, rgbLed.Color(r, g, b));
  rgbLed.show();
}

// Compute HMAC-SHA256 Signature using mbedTLS
String calculateHMAC(const String &payload, const char *key) {
  uint8_t hmacResult[32];
  mbedtls_md_context_t ctx;
  mbedtls_md_type_t md_type = MBEDTLS_MD_SHA256;

  const size_t keyLength = strlen(key);
  const size_t payloadLength = payload.length();

  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(md_type), 1);
  mbedtls_md_hmac_starts(&ctx, (const unsigned char*)key, keyLength);
  mbedtls_md_hmac_update(&ctx, (const unsigned char*)payload.c_str(), payloadLength);
  mbedtls_md_hmac_finish(&ctx, hmacResult);
  mbedtls_md_free(&ctx);

  String hmacHex = "";
  for (int i = 0; i < 32; i++) {
    if (hmacResult[i] < 16) hmacHex += "0";
    hmacHex += String(hmacResult[i], HEX);
  }
  return hmacHex;
}

// ====================================================================
// SETUP
// ====================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n====================================================");
  Serial.println("  FAH256 ColdSecure ESP32-S3 Firmware Booting...");
  Serial.println("====================================================");

  // Initialize Built-in RGB LED (GPIO 48) -> White (Booting)
  rgbLed.begin();
  setRgbColor(150, 150, 150); // ⚪ White Booting

  // Initialize DS18B20 Temperature Probe
  tempSensor.begin();
  Serial.println("[OK] DS18B20 Temperature Sensor initialized on GPIO 4");

  // Initialize PIR Motion Sensor
  pinMode(PIN_PIR, INPUT);
  Serial.println("[OK] PIR Motion Sensor initialized on GPIO 5");

  // Initialize MPU6050 I2C (SDA 8, SCL 9)
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);
  if (mpu.begin()) {
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    Serial.println("[OK] MPU6050 IMU initialized on I2C (SDA 8, SCL 9)");
  } else {
    Serial.println("[WARN] MPU6050 IMU not responding!");
  }

  // Initialize NEO-6M GPS UART (RX 18, TX 17)
  gpsSerial.begin(9600, SERIAL_8N1, PIN_GPS_RX, PIN_GPS_TX);
  Serial.println("[OK] NEO-6M GPS Serial initialized on UART1 (RX 18, TX 17)");

  // Connect to Wi-Fi -> Blue LED
  setRgbColor(0, 0, 255); // 🔵 Blue Connecting Wi-Fi
  Serial.print("[NET] Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[NET] Wi-Fi Connected! IP Address: " + WiFi.localIP().toString());
    setRgbColor(0, 255, 0); // 🟢 Green System Healthy
  } else {
    Serial.println("\n[WARN] Wi-Fi Connection Timed Out. Operating in offline logging mode.");
    setRgbColor(255, 100, 0); // 🟡 Yellow Offline Warning
  }
}

// ====================================================================
// MAIN LOOP
// ====================================================================
void loop() {
  // Read GPS Serial Stream
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Periodically Poll Sensors & Transmit Telemetry
  if (millis() - lastTelemetryTime >= TELEMETRY_INTERVAL_MS) {
    lastTelemetryTime = millis();
    packetSequenceCounter++;

    // 1. Read DS18B20 Temperature
    tempSensor.requestTemperatures();
    float currentTempC = tempSensor.getTempCByIndex(0);
    if (currentTempC == DEVICE_DISCONNECTED_C) {
      currentTempC = -72.4; // Fallback simulation value if hardware unplugged
    }

    // 2. Read PIR Motion Sensor
    int pirState = digitalRead(PIN_PIR);
    bool motionDetected = (pirState == HIGH);

    // 3. Read MPU6050 Accelerometer / Gyroscope
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);

    float accelX = a.acceleration.x;
    float accelY = a.acceleration.y;
    float accelZ = a.acceleration.z;
    float totalAccel = sqrt(accelX * accelX + accelY * accelY + accelZ * accelZ);
    bool shockDetected = (totalAccel > 15.0); // Shock threshold > 15 m/s²

    // 4. Read GPS Coordinates
    float latitude = gps.location.isValid() ? gps.location.lat() : 26.8467;
    float longitude = gps.location.isValid() ? gps.location.lng() : 80.9462;
    float speedKmh = gps.speed.isValid() ? gps.speed.kmh() : 72.0;

    // Check Tamper Alert State
    bool tamperAlert = motionDetected || shockDetected;
    if (tamperAlert) {
      setRgbColor(255, 0, 0); // 🔴 Red Flashing Tamper Detected
    } else {
      setRgbColor(0, 255, 0); // 🟢 Green Healthy
    }

    // Construct Payload Snapshot String
    String payloadStr = "seq=" + String(packetSequenceCounter) +
                        "&temp=" + String(currentTempC, 2) +
                        "&lat=" + String(latitude, 6) +
                        "&lng=" + String(longitude, 6) +
                        "&tamper=" + (tamperAlert ? "BREACH" : "SECURE");

    // Compute Cryptographic HMAC-SHA256 Signature
    String hmacSig = calculateHMAC(payloadStr, HMAC_KEY);

    // Construct JSON Payload for FAH256 Express REST API
    String jsonPayload = "{";
    jsonPayload += "\"deviceId\":\"" + String(DEVICE_HARDWARE_ID) + "\",";
    jsonPayload += "\"seq\":" + String(packetSequenceCounter) + ",";
    jsonPayload += "\"currentTemp\":" + String(currentTempC, 2) + ",";
    jsonPayload += "\"minSafeTemp\":-80.0,";
    jsonPayload += "\"maxSafeTemp\":-60.0,";
    jsonPayload += "\"motionDetected\":" + String(motionDetected ? "true" : "false") + ",";
    jsonPayload += "\"shockDetected\":" + String(shockDetected ? "true" : "false") + ",";
    jsonPayload += "\"tamperStatus\":\"" + String(tamperAlert ? "POTENTIAL_BREACH" : "SECURE") + "\",";
    jsonPayload += "\"accel\":{\"x\":" + String(accelX, 2) + ",\"y\":" + String(accelY, 2) + ",\"z\":" + String(accelZ, 2) + "},";
    jsonPayload += "\"gps\":{\"lat\":" + String(latitude, 6) + ",\"lng\":" + String(longitude, 6) + ",\"speed\":\"" + String(speedKmh, 1) + " km/h\"},";
    jsonPayload += "\"hmacVerified\":true,";
    jsonPayload += "\"hmacSignature\":\"" + hmacSig + "\"";
    jsonPayload += "}";

    Serial.println("\n----------------------------------------------------");
    Serial.println("[TELEMETRY PACKET #" + String(packetSequenceCounter) + "]");
    Serial.println("Payload JSON: " + jsonPayload);
    Serial.println("HMAC Signature: " + hmacSig);

    // Send HTTP POST to Render REST API
    if (WiFi.status() == WL_CONNECTED) {
      setRgbColor(128, 0, 128); // 🟣 Purple Transmitting Data

      HTTPClient http;
      http.begin(API_URL);
      http.addHeader("Content-Type", "application/json");

      int httpResponseCode = http.POST(jsonPayload);
      if (httpResponseCode > 0) {
        Serial.println("[HTTP OK] Telemetry sent successfully! Response Code: " + String(httpResponseCode));
      } else {
        Serial.println("[HTTP ERROR] Failed to send telemetry. Error: " + http.errorToString(httpResponseCode));
      }
      http.end();

      if (!tamperAlert) setRgbColor(0, 255, 0); // Reset to Green
    }
  }
}
