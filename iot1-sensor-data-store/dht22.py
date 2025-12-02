#!/usr/bin/env python3
import sys
import json
import time
import board

try:
    import adafruit_dht
except ImportError:
    print(json.dumps({"error": "adafruit-circuitpython-dht library not installed"}))
    sys.exit(1)

def read_dht22():
    board_pin = board.D4
    
    try:
        dht_device = adafruit_dht.DHT22(board_pin, use_pulseio=False)
    except Exception as e:
        print(json.dumps({"error": f"Failed to initialize sensor: {str(e)}"}))
        sys.exit(1)
    
    for attempt in range(5):
        try:
            temperature = dht_device.temperature
            humidity = dht_device.humidity
            
            if humidity is not None and temperature is not None:
                result = {
                    "temperature": round(temperature, 1),
                    "humidity": round(humidity, 1)
                }
                dht_device.exit()
                print(json.dumps(result))
                return
        except RuntimeError as e:
            if attempt < 4:
                time.sleep(2)
            continue
        except Exception as e:
            print(json.dumps({"error": f"Unexpected error: {str(e)}"}))
            dht_device.exit()
            sys.exit(1)
    
    dht_device.exit()
    print(json.dumps({"error": "Failed to read sensor data after 5 attempts"}))
    sys.exit(1)

if __name__ == "__main__":
    read_dht22()
