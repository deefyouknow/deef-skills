# ESP32 / Arduino Embedded Firmware

## Core Rule: Never Block the Loop

`delay()` blocks everything — sensors miss readings, network disconnects, UI freezes.

```cpp
// ✗ Blocking — everything stops for 1 second
void loop() {
  readSensor();
  sendToServer();
  delay(1000);
}

// ✓ Non-blocking with millis()
unsigned long lastSensorRead = 0;
unsigned long lastServerSend = 0;
const unsigned long SENSOR_INTERVAL = 1000;
const unsigned long SERVER_INTERVAL = 5000;

void loop() {
  unsigned long now = millis();
  
  if (now - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = now;
    readSensor();
  }
  
  if (now - lastServerSend >= SERVER_INTERVAL) {
    lastServerSend = now;
    sendToServer();
  }
  
  // Other tasks run every loop iteration, no blocking
}
```

## Memory Management on ESP32

ESP32 has ~320KB SRAM — every byte counts.

```cpp
// Use PROGMEM for string constants (stores in flash, not RAM)
const char WIFI_SSID[] PROGMEM = "MyNetwork";

// Prefer stack allocation over heap for small, known-size buffers
char buffer[256];              // ✓ stack
char* buf = malloc(256);       // ✗ heap fragmentation risk

// Monitor heap health
void logHeap() {
  Serial.printf("Free heap: %d bytes, Min ever: %d\n",
    ESP.getFreeHeap(), ESP.getMinFreeHeap());
}

// ArduinoJson — use the stack allocator for small docs
JsonDocument doc;  // ArduinoJson 7+, auto-sized
// For ArduinoJson 6:
StaticJsonDocument<512> doc;   // ✓ stack, fixed size
DynamicJsonDocument doc(512);  // ✗ heap, prefer static when size is known
```

## State Machine Pattern

For multi-step processes (connection, OTA, measurement cycles):

```cpp
enum class State { INIT, CONNECTING_WIFI, CONNECTING_MQTT, RUNNING, ERROR, OTA };
State state = State::INIT;

void loop() {
  switch (state) {
    case State::INIT:
      initSensors();
      state = State::CONNECTING_WIFI;
      break;
      
    case State::CONNECTING_WIFI:
      if (WiFi.status() == WL_CONNECTED) {
        state = State::CONNECTING_MQTT;
      } else if (wifiConnectTimeout()) {
        state = State::ERROR;
      }
      break;
      
    case State::RUNNING:
      handleSensors();
      handleMQTT();
      handleOTACheck();
      break;
      
    case State::ERROR:
      handleError(); // log, blink LED, schedule restart
      break;
  }
}
```

## MQTT Connectivity

```cpp
// Exponential backoff reconnect — never hammer the broker
unsigned long reconnectDelay = 1000;
const unsigned long MAX_RECONNECT_DELAY = 60000;

void reconnectMQTT() {
  if (client.connected()) return;
  if (millis() - lastReconnectAttempt < reconnectDelay) return;
  
  lastReconnectAttempt = millis();
  
  // LWT (Last Will Testament) — broker publishes this if device disconnects unexpectedly
  if (client.connect(DEVICE_ID, MQTT_USER, MQTT_PASS,
      "devices/status", 1, true, "{\"online\":false}")) {
    reconnectDelay = 1000; // reset on success
    client.subscribe("devices/cmd/#", 1); // QoS 1
    client.publish("devices/status", "{\"online\":true}", true);
  } else {
    reconnectDelay = min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
  }
}
```

**QoS levels**:
- QoS 0: Fire and forget. Use for frequent sensor data where loss is acceptable.
- QoS 1: At-least-once. Use for commands, alerts. Store in `client.setKeepAlive()`.
- QoS 2: Exactly-once. Avoid on ESP32 — high overhead, complex.

## OTA Updates

```cpp
#include <ArduinoOTA.h>

void setupOTA() {
  ArduinoOTA.setHostname(DEVICE_ID);
  ArduinoOTA.setPassword(OTA_PASSWORD);
  
  ArduinoOTA.onStart([]() { 
    state = State::OTA; 
    // Stop MQTT, save state to NVS if needed
  });
  ArduinoOTA.onError([](ota_error_t error) { 
    state = State::ERROR; 
  });
  
  ArduinoOTA.begin();
}

void loop() {
  ArduinoOTA.handle(); // must be called every loop
  // ... rest of loop
}
```

**Production OTA**: Use ESP-IDF OTA partitions + HTTPS for production. ArduinoOTA is for development only.

## Power Management (Battery-Powered Devices)

```cpp
// Deep sleep between readings — reduces consumption from ~240mA to ~10µA
void enterDeepSleep(uint64_t seconds) {
  esp_sleep_enable_timer_wakeup(seconds * 1000000ULL);
  
  // Disconnect WiFi/BT cleanly before sleep
  WiFi.disconnect(true);
  btStop();
  
  esp_deep_sleep_start(); // does not return
}

// Read wakeup cause to restore state
void setup() {
  esp_sleep_wakeup_cause_t cause = esp_sleep_get_wakeup_cause();
  if (cause == ESP_SLEEP_WAKEUP_TIMER) {
    // Scheduled wakeup — read sensor and sleep again
    readAndSend();
    enterDeepSleep(60);
  }
}
```

**Power budget guideline**: WiFi transmission costs ~200-350mA for ~1-3 seconds. Optimize: wake → connect → transmit batch → sleep.
