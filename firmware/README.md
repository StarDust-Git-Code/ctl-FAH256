# FAH256 ColdSecure ESP32-S3 Hardware Firmware

Industrial C++ firmware for the **ColdSecure ESP32-S3 Smart Cold Chain Hardware Gateway**.

---

## 📍 Configured Route

- **Origin**: `KCG College of Technology, Karapakkam, Chennai` (`12.9100° N, 80.2285° E`)
- **Destination**: `Adyar Courier Service, Chennai` (`13.0067° N, 80.2571° E`)
- **OMR Transit Checkpoints**: Karapakkam ➔ Perungudi Toll ➔ Thiruvanmiyur Signal ➔ Adyar Hub

---

## 🔘 Hardware Tamper Reset Feature (BOOT Button)

- **BOOT Button Pin**: `GPIO 0` (Onboard DevKit BOOT button)
- **How to Clear Tamper Alert**: Press and **hold the BOOT button for > 5 seconds** (5,000 ms).
- **Behavior**:
  1. Clears `tamperLatched` breach state.
  2. Resets onboard NeoPixel RGB LED from 🔴 **Red Flashing** back to 🟢 **Green Healthy**.
  3. Sends updated `"tamperStatus": "SECURE"` payload to the Render REST API to clear alerts on the main dashboard!

---

## 🛠️ Hardware Pinout Mapping

| Component | Pin | Function | Notes |
|-----------|-----|----------|-------|
| **BOOT Button** | `GPIO 0` | Tamper Breach Reset | Hold > 5 seconds to clear breach |
| **DS18B20 Temp Probe** | `GPIO 4` | OneWire Data | Requires 4.7kΩ pull-up resistor to 3.3V |
| **PIR Motion Sensor** | `GPIO 5` | Hatch / Door Breach | High = Motion / Tamper |
| **MPU6050 IMU SDA** | `GPIO 8` | I2C Data | Vibration & Shock (> 15 m/s²) |
| **MPU6050 IMU SCL** | `GPIO 9` | I2C Clock | Tilt / Inclination |
| **NEO-6M GPS TX** | `GPIO 18` | ESP32 RX | Receives NMEA GPS sentences |
| **NEO-6M GPS RX** | `GPIO 17` | ESP32 TX | Optional control |
| **Built-in RGB LED** | `GPIO 48` | WS2812 DIN | NeoPixel System Status Feedback |

---

## 💡 Status LED Indicators (GPIO 48)

| Color | Meaning |
|-------|---------|
| ⚪ **White** | Booting hardware peripherals |
| 🔵 **Blue** | Connecting to Wi-Fi network / Scanning OPEN networks |
| 🟢 **Green** | System healthy & operating in normal range |
| 🟣 **Purple** | Cryptographic HMAC signature calculation & HTTP POST transmission |
| 🟡 **Yellow** | Wi-Fi disconnect warning / Offline logging |
| 🔴 **Red Flashing** | Tamper Breach or High Temperature Excursion detected! (Hold BOOT >5s to clear) |

---

## 📦 Required Libraries (Arduino IDE / PlatformIO)

1. **DallasTemperature** by Miles Burton
2. **OneWire** by Paul Stoffregen
3. **Adafruit MPU6050** by Adafruit
4. **Adafruit Sensor** by Adafruit
5. **TinyGPSPlus** by Mikal Hart
6. **Adafruit NeoPixel** by Adafruit

---

## ⚙️ Compilation & Flashing Instructions

1. Open `firmware/ColdSecure_ESP32S3.ino` in **Arduino IDE 2.x** or **PlatformIO**.
2. Select Board: **ESP32S3 Dev Module**.
3. Set **USB Mode**: `Hardware CDC and JTAG`.
4. Update `DEFAULT_WIFI_SSID` and `DEFAULT_WIFI_PASS` with your Wi-Fi credentials (or let it auto-connect to any open Wi-Fi network).
5. Click **Upload** to flash the ESP32-S3 microcontroller.
6. Open **Serial Monitor** at **115200 baud** to view real-time cryptographic logs and API POST status!
