# Cardano IoT Temperature Monitoring System

A decentralized IoT platform that combines IoT sensor devices with Cardano blockchain technology to create a transparent, immutable, and real-time temperature monitoring system. This project demonstrates how blockchain can enhance IoT data integrity and provide verifiable environmental monitoring.

## 🌟 Overview

This system consists of three main components:
- **IoT Sensors**: Temperature monitoring devices that collect environmental data
- **Backend API**: NestJS-based server that processes sensor data and manages blockchain interactions
- **Frontend Dashboard**: Next.js web application for real-time monitoring and data visualization
- **Smart Contracts**: Aiken-based Plutus validators on Cardano blockchain for data verification

## 🏗️ Architecture

```
IoT Sensors → Backend API → Cardano Blockchain
                    ↓
            Frontend Dashboard
```

### Key Features
- **Real-time Data Collection**: WebSocket connections for live temperature updates
- **Blockchain Integration**: All temperature data is stored immutably on Cardano testnet
- **Smart Contract Validation**: Plutus validators ensure data integrity and authorization
- **Scheduled Aggregation**: Automated cron jobs process and validate sensor readings
- **Interactive Dashboard**: Real-time charts and data visualization
- **Device Management**: Support for multiple IoT sensor devices

## 🛠️ Technology Stack

### Backend
- **Runtime**: Bun.js
- **Framework**: NestJS with TypeScript
- **Blockchain**: Cardano (Preprod Testnet)
- **Smart Contracts**: Aiken (Plutus v3)
- **WebSocket**: Socket.IO for real-time communication
- **Scheduling**: Cron jobs for periodic data processing
- **Caching**: In-memory cache for temporary data storage

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: TailwindCSS with Radix UI components
- **Charts**: Recharts for data visualization
- **State Management**: React Context for WebSocket
- **Type Safety**: TypeScript with Zod validation

### DevOps
- **Containerization**: Docker & Docker Compose
- **Environment**: Development and production configurations
- **Testing**: Jest for unit testing
- **Linting**: ESLint with Prettier formatting

## 📁 Project Structure

```
├── back-end/                 # NestJS API server
│   ├── src/
│   │   ├── app.controller.ts # REST API endpoints
│   │   ├── app.service.ts    # Business logic
│   │   ├── app.gateway.ts    # WebSocket gateway
│   │   ├── scheduler.service.ts # Cron job handler
│   │   └── models/           # Data models
│   ├── contract/             # Aiken smart contracts
│   │   ├── validators/       # Plutus validators
│   │   └── scripts/          # Contract interaction scripts
│   └── data/                 # Device configuration
│
├── front-end/                # Next.js web application
│   ├── src/
│   │   ├── app/              # App router pages
│   │   ├── components/       # React components
│   │   ├── api/              # API client functions
│   │   ├── context/          # WebSocket context
│   │   └── types/            # TypeScript definitions
│   └── public/               # Static assets
│
└── confirm_status/           # Separate validation service
    ├── src/                  # Service implementation
    └── contract/             # Additional smart contracts
```

## 🚀 Quick Start

### Prerequisites
- **Bun.js** (v1.0+)
- **Node.js** (v18+)
- **Docker** & Docker Compose
- **Aiken** (for smart contract development)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cardano-iot-example/iot1
   ```

2. **Backend Configuration**
   ```bash
   cd back-end
   cp .env.example .env
   # Configure your environment variables:
   # - BLOCKFROST_API_KEY: Your Blockfrost API key
   # - APP_WALLET: Mnemonic phrase for wallet
   # - CRON_EXPRESSION: Schedule for data processing
   ```

3. **Frontend Configuration**
   ```bash
   cd front-end
   cp .env.example .env
   # Configure your environment variables:
   # - NEXT_PUBLIC_API_ENDPOINT: Backend API URL
   # - NEXT_PUBLIC_WEBSOCKET: WebSocket server URL
   ```

### Development Setup

1. **Install Dependencies**
   ```bash
   # Backend
   cd back-end
   bun install
   
   # Frontend
   cd front-end
   bun install
   ```

2. **Build Smart Contracts**
   ```bash
   cd back-end
   bun run build:contract
   ```

3. **Start Development Servers**
   ```bash
   # Backend (port 3000)
   cd back-end
   bun run start:dev
   
   # Frontend (port 3001)
   cd front-end
   bun run dev
   ```

### Docker Deployment

#### Quick Start with Docker
```bash
# Development environment
./docker.sh dev
# or on Windows
.\docker.ps1 dev

# Production environment
./docker.sh prod
# or on Windows
.\docker.ps1 prod
```

#### Manual Docker Commands
```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

For detailed Docker setup instructions, see [DOCKER.md](DOCKER.md)

## 📡 API Documentation

### REST Endpoints

#### Get Device List
```http
GET /api/temperature-sensor/devices
```
Returns all registered IoT devices.

#### Get Temperature Data
```http
GET /api/temperature-sensor/:device_address
```
Retrieves temperature history for a specific device.

#### Submit Temperature Reading
```http
POST /api/temperature-sensor
Content-Type: application/json

{
  "device_address": "addr_test1...",
  "value": 25.5,
  "unit": 0,
  "time": "2025-01-01T12:00:00Z"
}
```

### WebSocket Events

#### Subscribe to Updates
```javascript
socket.on('onUpdatedTemperature', (data) => {
  console.log('New temperature:', data);
});
```

#### Test Temperature Submission
```http
POST /api/temperature-sensor/test-submit-socket
```

## 🔗 Blockchain Integration

### Smart Contract Overview

The system uses an Aiken-based Plutus validator (`confirm_status.ak`) that:
- **Validates ownership** through cryptographic signatures
- **Manages temperature data** with update and withdraw operations
- **Ensures data integrity** through on-chain validation

### Data Flow

1. **Sensor Data Collection**: IoT devices submit temperature readings to the API
2. **Temporary Storage**: Data is cached in memory for aggregation
3. **Periodic Processing**: Cron job runs every 5 minutes to process cached data
4. **Data Aggregation**: System calculates average temperature from recent readings
5. **Blockchain Storage**: Validated data is submitted to Cardano as a transaction
6. **Real-time Updates**: WebSocket notifies connected clients of new data

### Transaction Tracking

All temperature records include transaction references:
```
https://preprod.cexplorer.io/tx/{transaction_hash}
```

## 🎛️ Dashboard Features

### Real-time Monitoring
- **Live temperature charts** with logarithmic scaling
- **Device selection** dropdown for multiple sensors
- **Interactive tooltips** with detailed information
- **Transaction links** for blockchain verification

### Device Information
- Device ID, name, and location
- Battery status and sampling rate
- IP address and device type
- Temperature thresholds

### Data Visualization
- **Area charts** for temperature trends over time
- **Data tables** with sortable columns
- **Responsive design** for mobile and desktop
- **Real-time updates** via WebSocket connections

## ⚙️ Configuration

### Backend Environment Variables
```env
# Blockchain Configuration
BLOCKFROST_API_KEY=your_blockfrost_api_key
APP_WALLET=your_mnemonic_phrase_words

# Caching
APP_CACHE_KEY=temperature_cache
ALLOWED_TIME_OFFSET=3000

# Scheduling
CRON_EXPRESSION=0 */5 * * * *
```

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_ENDPOINT=http://localhost:3000
NEXT_PUBLIC_WEBSOCKET=http://localhost:3000
```

## 🧪 Testing

### Backend Tests
```bash
cd back-end
bun run test          # Unit tests
bun run test:e2e      # End-to-end tests
bun run test:cov      # Coverage report
```

### Smart Contract Tests
```bash
cd back-end
aiken check           # Contract validation
bun run test          # Integration tests
```

## 🔄 Deployment

### Production Build
```bash
# Backend
cd back-end
bun run build
bun run start:prod

# Frontend
cd front-end
bun run build
bun run start
```

### Docker Production
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring & Logging

- **Winston Logger**: Structured logging for backend services
- **Error Handling**: Comprehensive error management and user feedback
- **Performance Monitoring**: Built-in metrics for API and blockchain operations
- **Real-time Status**: WebSocket connection status and device monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions or issues:
- Check the API documentation
- Review smart contract implementations
- Test with the development environment
- Monitor blockchain transactions on Cardano testnet

---

*This project demonstrates the potential of combining IoT technology with blockchain for creating transparent, verifiable, and decentralized monitoring systems.*