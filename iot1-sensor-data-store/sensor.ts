import { PythonShell } from 'python-shell';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SensorData {
  temperature?: number;
  humidity?: number;
  error?: string;
}

// Cache for last successful reading
let lastValidData: SensorData | null = null;
let lastReadTime: number = 0;

/**
 * Read sensor once (Promise-based)
 */
function dht22(): Promise<SensorData> {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text' as const,
      pythonPath: 'python3',
      pythonOptions: ['-u'],
      scriptPath: __dirname
      // No args required; GPIO 4 is hardcoded in the Python script
    };

    // Timeout after 60 seconds
    const timeout = setTimeout(() => {
      reject(new Error('Timeout: no response from sensor after 60 seconds'));
    }, 60000);

    PythonShell.run('dht22.py', options)
      .then(results => {
        clearTimeout(timeout);
        const data: SensorData = JSON.parse(results[0]);
        resolve(data);
      })
      .catch(err => {
        clearTimeout(timeout);
        reject(err);
      });
  });
}



/**
 * Read data from DHT22 sensor
 * Connection:
 * - Positive -> 3.3V (Pin 1)
 * - Out -> GPIO 4 (Pin 7)
 * - Negative -> GND (Pin 9)
 * 
 * Returns cached data if new reading fails
 */
export async function readDHT22(): Promise<SensorData | void> {
  try {
    const data = await dht22();
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Save successful reading
    if (data.temperature !== undefined && data.humidity !== undefined) {
      lastValidData = { ...data };
      lastReadTime = Date.now();
      return data;
    }
    
    // No valid data, return cached if available
    if (lastValidData) {
      return lastValidData;
    }
    
    return undefined;
  } catch (error) {
    if (lastValidData) {
      return lastValidData;
    }
    return undefined;
  }
}

/**
 * Get last valid sensor data (if any)
 */
export function getLastValidData(): SensorData | null {
  return lastValidData;
}

/**
 * Get cache age in seconds
 */
export function getCacheAge(): number {
  if (!lastValidData) return -1;
  return Math.floor((Date.now() - lastReadTime) / 1000);
}

/**
 * Clear cached data
 */
export function clearCache(): void {
  lastValidData = null;
  lastReadTime = 0;
}
