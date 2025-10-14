# IoT Temperature Monitoring Frontend

A modern, responsive Next.js application for real-time IoT temperature monitoring with Cardano blockchain integration. This frontend provides an intuitive dashboard for viewing and managing temperature sensor data from IoT devices.

## 🚀 Features

- **Real-time Temperature Monitoring**: Live temperature data visualization with WebSocket support
- **Interactive Charts**: Responsive temperature charts with logarithmic scaling for better data visualization
- **Device Management**: Multi-sensor support with device selection and detailed information display
- **Responsive Design**: Mobile-first design that works across all devices
- **Data Export**: Copy transaction references and device addresses to clipboard
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS for a polished user experience

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts for data visualization
- **Real-time**: Socket.IO for WebSocket connections
- **Icons**: Lucide React
- **Validation**: Zod for schema validation
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js (v18 or higher)
- Bun (recommended) or npm/yarn
- Backend API running (typically on port 3000)

## 🔧 Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd front-end
   ```

2. **Install dependencies**:
   ```bash
   bun install
   # or
   npm install
   ```

3. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** in `.env`:
   ```bash
   NEXT_PUBLIC_API_ENDPOINT=http://localhost:3000/api
   NEXT_PUBLIC_WEBSOCKET=ws://localhost:3000
   ```

## 🚀 Development

Start the development server:

```bash
bun dev
# or
npm run dev
```

The application will be available at `http://localhost:3001`

## 📦 Build & Production

### Local Production Build

```bash
# Build the application
bun run build

# Start production server
bun run start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build Docker image manually
docker build -t iot-frontend .
docker run -p 3001:3001 --env-file .env iot-frontend
```

## 🏗️ Project Structure

```
src/
├── api/              # API service layers
│   ├── device.api.ts
│   └── temperature.api.ts
├── app/              # Next.js App Router pages
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/       # React components
│   ├── device-info.tsx
│   ├── temperature-chart.tsx
│   ├── temperature-data.tsx
│   ├── temperature-table.tsx
│   ├── layout/       # Layout components
│   └── ui/           # shadcn/ui components
├── context/          # React contexts
│   └── websocket.context.tsx
├── lib/              # Utility libraries
│   ├── http.ts
│   └── utils.ts
└── types/            # TypeScript type definitions
    ├── device.type.ts
    ├── response.type.ts
    └── temperature.type.ts
```

## 🔌 API Integration

The frontend connects to the backend API through:

- **REST API**: For fetching device lists and historical temperature data
- **WebSocket**: For real-time temperature updates
- **Endpoints**:
  - `GET /temperature-sensor/devices` - Get all devices
  - `GET /temperature-sensor/{device_address}` - Get temperature data for specific device
  - `GET /temperature-sensor/base` - Get base temperature data

## 📊 Features Overview

### Device Management
- View all connected IoT temperature sensors
- Switch between different sensors using dropdown selection
- Display device information including:
  - Device address (with copy functionality)
  - Battery level with visual indicators
  - Sampling rate and location
  - Device type and version

### Temperature Monitoring
- Real-time temperature chart with logarithmic scaling
- Interactive data table with transaction references
- Live updates through WebSocket connections
- Historical data visualization
- Hover tooltips for detailed information

### User Interface
- Clean, modern design with dark/light theme support
- Responsive layout for mobile and desktop
- Loading states and error handling
- Toast notifications for user feedback
- Accessible components following ARIA guidelines

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_ENDPOINT` | Backend API URL | `http://localhost:3000/api` |
| `NEXT_PUBLIC_WEBSOCKET` | WebSocket server URL | `ws://localhost:3000` |

### Customization

The application uses Tailwind CSS for styling and can be customized through:
- `tailwind.config.js` - Tailwind configuration
- `src/app/globals.css` - Global styles
- `components.json` - shadcn/ui configuration

## 🐛 Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure the backend server is running on the correct port
2. **WebSocket Errors**: Check if the WebSocket URL in environment variables is correct
3. **Build Errors**: Clear `.next` folder and rebuild: `rm -rf .next && bun run build`

### Development Tips

- Use browser developer tools to monitor WebSocket connections
- Check the Network tab for API request/response debugging
- Console logs show real-time temperature updates

## 🤝 Contributing

1. Follow the existing code style and TypeScript conventions
2. Use the configured ESLint rules
3. Test on both mobile and desktop devices
4. Ensure WebSocket functionality works correctly

## 📄 License

This project is part of the Cardano IoT example and follows the same licensing terms.

## 🔗 Related Projects

- **Backend API**: `../back-end/` - NestJS backend with Cardano integration
- **Smart Contracts**: `../back-end/contract/` - Aiken smart contracts for Cardano