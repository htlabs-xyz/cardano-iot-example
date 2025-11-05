#!/usr/bin/env node
import { readDHT22 } from "./sensor";
import { writeDataToContract } from "./action/write";
import { readDataFromContract } from "./action/read";

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  sensor: args.includes('--sensor'),
  write: args.includes('--write'),
  monitor: args.includes('--monitor'),
  help: args.includes('--help') || args.includes('-h'),
};


/**
 * Display help information
 */
function showHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         DHT22 IoT + Blockchain Integration Tool              ║
╚═══════════════════════════════════════════════════════════════╝

Usage: npm start [options]

Options:
  (no flags)        Monitor sensor data only (default mode)
  --once            Read sensor once and exit
  --write           Monitor sensor + write to blockchain every 2 min
  --monitor         Real-time monitoring from blockchain
  --help, -h        Show this help message

Examples:
  npm start                  # Monitor sensor continuously
  npm start --once        # Read sensor one time
  npm start --write       # Monitor + submit to blockchain
  npm start --monitor     # Monitor blockchain data

Press Ctrl+C to stop any running process.
  `);
  process.exit(0);
}


/**
 * Mode 1: Monitor sensor only
 */
async function monitorSensor() {
  console.log('========================================');
  console.log('DHT22 Real-Time Sensor Monitor');
  console.log('========================================');
  console.log('Connection Details:');
  console.log('  Positive -> 3.3V (Pin 1)');
  console.log('  Out      -> GPIO 4 (Pin 7)');
  console.log('  Negative -> GND (Pin 9)');
  console.log('========================================');
  console.log(`Read Interval: 0,5 seconds`);
  console.log('Press Ctrl+C to stop');
  console.log('========================================\n');

  // Read immediately
  console.log(await readDHT22());

  // Then read at intervals
  setInterval(async () => {
    console.log(await readDHT22());;
  }, 500);
}

/**
 * Mode 2: Write to blockchain
 */
async function write() {
  console.log('========================================');
  console.log('DHT22 Monitor + Blockchain Writer');
  console.log('========================================');
  console.log('Connection Details:');
  console.log('  Positive -> 3.3V (Pin 1)');
  console.log('  Out      -> GPIO 4 (Pin 7)');
  console.log('  Negative -> GND (Pin 9)');
  console.log('========================================');
  console.log(`Blockchain Write: Every 2 minutes`);
  console.log('Press Ctrl+C to stop');
  console.log('========================================\n');

  writeDataToContract();
  const intervalMs = 2 * 60 * 1000; // 2 minutes
  setInterval(writeDataToContract, intervalMs);

}



/**
 * Mode 3: Monitor blockchain (continuous)
 */
async function monitorBlockchain() {
  console.log('========================================');
  console.log('Blockchain Real-Time Monitor');
  console.log('========================================');
  console.log('Monitoring Cardano Preprod Network');
  console.log('Press Ctrl+C to stop');
  console.log('========================================\n');

  const checkBlockchain = async () => {
    try {
      const data = await readDataFromContract();
      const recentData = data.slice(-5);
      
      if (recentData.length === 0) {
        console.log('\n⚠️  No data found on blockchain\n');
        return;
      }
      
      console.clear(); // Clear console for cleaner display
      console.log('\n╔══════════════════════════════════════════════════════════════════════════════════════════════════╗');
      console.log('║                          📊 CARDANO BLOCKCHAIN - DHT22 SENSOR DATA                               ║');
      console.log('╚══════════════════════════════════════════════════════════════════════════════════════════════════╝');
      console.log(`🕐 Updated: ${new Date().toLocaleString('en-US', { hour12: false })}\n`);
      
      console.log('┌──────┬──────────────────────┬──────────────┬──────────────┬──────────────────────────┐');
      console.log('│  #   │    Timestamp         │  Temperature │   Humidity   │      Transaction Hash    │');
      console.log('├──────┼──────────────────────┼──────────────┼──────────────┼──────────────────────────┤');
      
      recentData.forEach((record, index) => {
        if (record) {
          // Convert BigInt to number and divide by 1000
          const temp = Number(record.temperature) / 1000;
          const humidity = Number(record.humidity) / 1000;
          const txShort = record.tx_ref.split('/tx/')[1]?.substring(0, 21) || 'N/A';
          
          const timeStr = record.time.toLocaleString('en-US', { 
            month: '2-digit', 
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(',', '');
          
          const recordNum = String(data.length - recentData.length + index + 1).padStart(4);
          const tempStr = `${temp.toFixed(1)}°C`.padStart(12);
          const humStr = `${humidity.toFixed(1)}%`.padStart(12);
          
          console.log(`│ ${recordNum} │ ${timeStr}  │ ${tempStr} │ ${humStr} │ ${txShort}... │`);
        }
      });
      
      console.log('└──────┴──────────────────────┴──────────────┴──────────────┴──────────────────────────┘\n');
      
      // Statistics
      console.log('📊 Statistics:');
      console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   � Total Records on Chain: ${data.length}`);
      
      if (recentData.length > 0) {
        const latest = recentData[recentData.length - 1];
        const oldest = recentData[0];
        
        if (latest && oldest) {
          const latestTemp = Number(latest.temperature) / 1000;
          const latestHum = Number(latest.humidity) / 1000;
          
          // Calculate min/max from recent data
          const temps = recentData.map(r => r ? Number(r.temperature) / 1000 : 0).filter(t => t > 0);
          const hums = recentData.map(r => r ? Number(r.humidity) / 1000 : 0).filter(h => h > 0);
          
          const minTemp = Math.min(...temps);
          const maxTemp = Math.max(...temps);
          const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
          
          const minHum = Math.min(...hums);
          const maxHum = Math.max(...hums);
          const avgHum = hums.reduce((a, b) => a + b, 0) / hums.length;
          
          console.log(`   🌡️  Latest Temperature: ${latestTemp.toFixed(1)}°C`);
          console.log(`   💧 Latest Humidity: ${latestHum.toFixed(1)}%`);
          console.log(`   ⏰ Last Update: ${latest.time.toLocaleString('en-US', { hour12: false })}`);
          console.log('\n   📈 Last 5 Records Range:');
          console.log(`   • Temperature: ${minTemp.toFixed(1)}°C - ${maxTemp.toFixed(1)}°C (avg: ${avgTemp.toFixed(1)}°C)`);
          console.log(`   • Humidity: ${minHum.toFixed(1)}% - ${maxHum.toFixed(1)}% (avg: ${avgHum.toFixed(1)}%)`);
          console.log(`   • Time Span: ${oldest.time.toLocaleTimeString()} - ${latest.time.toLocaleTimeString()}`);
        }
      }
      
      console.log('\n🔗 Explorer Links:');
      recentData.slice(-5).forEach((record, index) => {
        if (record) {
          const temp = Number(record.temperature) / 1000;
          const hum = Number(record.humidity) / 1000;
          console.log(`   ${index + 1}. ${temp.toFixed(1)}°C, ${hum.toFixed(1)}% - ${record.tx_ref}`);
        }
      });
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⏰ Refreshing in 30 seconds... (Press Ctrl+C to stop)\n');
      
    } catch (error) {
      console.error('\n❌ Error reading blockchain:', (error as Error).message);
      console.log('⏰ Retrying in 30 seconds...\n');
    }
  };

  // Check immediately
  await checkBlockchain();
  setInterval(checkBlockchain, 30000);
}


/**
 * Main entry point
 */
async function main() {
  // Show help
  if (flags.help) {
    showHelp();
    return;
  }


  // Route to appropriate mode
  if (flags.write) {
    await write();
  } else if (flags.monitor) {
    await monitorBlockchain();
  } else {
    await monitorSensor();
  }
}

// Run main function
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
