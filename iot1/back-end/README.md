# Temperature Service API

This project is an **IoT platform combined with Cardano blockchain** to track and store environmental data such as **temperature** and **humidity** from IoT devices.  
The blockchain ensures transparency and immutability, while the IoT gateway and services provide real-time monitoring and analytics.

![Diagram](./docs/images/temperature-diagram.png)

*(The diagram above illustrates the overall flow of API and events. The sections below describe the corresponding APIs and events in detail.)*

---

## 1. Get all temperatures by device
**Method:** `GET /api/temperatures/:device_address`

- **Required path params**  
  - `device_address` (string): The unique device address to fetch temperature data for.

- **Response body**
```json
{
  "status": "success",
  "device_address": "string",
  "temperatures": [
    {
      "value": "number",
      "unit": "string",
      "time": "string"
    }
  ]
}
```

---

## 2. Subscribe to event: `onUpdateTemperature`

**Event method**: `subscribe`  
**Event params**: none (usually configured in the gateway)  

- **Event payload**
```json
{
  "device_address": "string",
  "value": "number",
  "unit": "string",
  "time": "string"
}
```

---

## 3. Submit updated temperature
**Method:** `POST /api/temperatures`

- **Request body**
```json
{
  "device_address": "string",
  "value": "number",
  "unit": "string",
  "time": "string"
}
```

- **Response body**
```json
{
  "status": "boolean",
  "message": "string",
  "submitted": {
    "device_address": "string",
    "value": "number",
    "unit": "string",
    "time": "string"
  }
}
```

---

## 4. Emit uploaded temperature

**Event method**: `emit` (WebSocket connection via Gateway)  

- **Event payload**
```json
{
  "device_address": "string",
  "value": "number",
  "unit": "string",
  "time": "string"
}
```

---

## Background Service

In addition to API and events, the system includes a **Background Service** that:  
- Periodically aggregates sensor readings.  
- Validates data against tolerance thresholds.  
- Stores verified records to the **Cardano blockchain** for transparency and audit.  

![Background Service](./docs/images/background-service.png)

---

> 📌 The diagrams above provide visual overviews, while this README details the API endpoints, WebSocket events, and background service workflow.
