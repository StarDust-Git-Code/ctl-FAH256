# FAH256 ColdSecure ESP32-S3 Hardware Firmware

Industrial C++ firmware for the **ColdSecure ESP32-S3 Smart Cold Chain Hardware Gateway**.

---

## 🛠️ Complete Hardware Pinout Mapping

| Component | Pin | Function | Notes |
|-----------|-----|----------|-------|
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
| 🔵 **Blue** | Connecting to Wi-Fi network |
| 🟢 **Green** | System healthy & operating in normal range |
| 🟣 **Purple** | Cryptographic HMAC signature calculation & HTTP POST transmission |
| 🟡 **Yellow** | Wi-Fi disconnect warning / Offline logging |
| 🔴 **Red Flashing** | Tamper Breach or High Temperature Excursion detected! |

---

## 📦 Required Libraries (Arduino IDE / PlatformIO)

Install the following libraries from the Arduino Library Manager:

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
4. Update `WIFI_SSID` and `WIFI_PASS` with your Wi-Fi credentials.
5. Click **Upload** to flash the ESP32-S3 microcontroller.
6. Open **Serial Monitor** at **115200 baud** to view real-time cryptographic logs and API POST status!
