# 🚀 Quick Start Guide

## Prerequisites

- **Node.js**: v16.0.0 or higher
- **NPM**: v7.0.0 or higher
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

## Installation

### 1. Navigate to Project Directory

```bash
cd iot-dashboard-project
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- React 18
- Vite (build tool)
- Tailwind CSS
- Recharts (charts)
- Framer Motion (animations)
- Lucide React (icons)

### 3. Start Development Server

```bash
npm run dev
```

The dashboard will open automatically at `http://localhost:3000`

## ✨ First Run

On first run, you'll see:
- 3 sensor cards (Temperature, Humidity, Gas)
- Simulated real-time data updates
- Network topology with 8 nodes
- System performance charts
- Event log panel

**Everything works out of the box with simulated data!**

## 🔌 Connecting Live Sensors

### Option 1: WebSocket

Edit `src/services/sensorService.js`:

```javascript
// Replace this line
const url = 'ws://localhost:8080/sensors'

// With your WebSocket endpoint
const url = 'ws://your-iot-server.com:PORT/sensors'
```

Expected data format:
```json
{
  "temperature": 23.5,
  "humidity": 47.2,
  "gas": 315,
  "timestamp": 1234567890
}
```

### Option 2: HTTP API

Edit `src/services/sensorService.js`:

```javascript
// Configure API URL
const API_URL = 'https://your-api.com/sensors'

// The service will poll this endpoint every dataRate seconds
```

### Option 3: MQTT (Advanced)

1. Install MQTT client:
```bash
npm install mqtt
```

2. Create `src/services/mqttService.js`
3. Connect to your MQTT broker
4. Subscribe to sensor topics

## 🎯 Configuration

### Update Sensor Thresholds

Edit `src/constants/config.js`:

```javascript
export const SENSOR_CONFIG = {
  temperature: {
    threshold: { 
      min: 18,      // Minimum normal value
      max: 28,      // Maximum normal value
      critical: 32  // Critical threshold
    }
  }
  // ... other sensors
}
```

### Change Update Rate

In the dashboard, click the Settings icon (⚙️) or edit:

```javascript
// src/constants/config.js
export const DEFAULT_CONFIG = {
  dataRate: 2.5  // seconds between updates
}
```

### Modify Anomaly Detection Sensitivity

```javascript
// src/constants/config.js
export const DEFAULT_CONFIG = {
  anomalyThreshold: 3  // Z-score threshold (lower = more sensitive)
}
```

## 📊 Understanding the Dashboard

### Top Header
- **System Pulse**: Pulsing indicator (green = healthy, red = anomaly)
- **Latency**: Current system latency in ms
- **Data Rate**: Update frequency
- **Connection Status**: Data source connection indicator
- **Stats**: Total data points, anomalies, success rate

### Sensor Cards
- **Value**: Current sensor reading
- **Trend**: Rising ↗, Falling ↘, or Stable →
- **Accuracy**: AI confidence score
- **Sparkline**: Last 30 seconds of data
- **Statistics**: Mean, Standard Deviation, Deviation
- **Range**: Normal and critical thresholds

### Healing Pipeline
Three stages visualized in real-time:
1. **Anomaly Detection**: Z-Score or Threshold violation detected
2. **Root Cause Analysis**: Bayesian inference to identify cause
3. **Self-Healing**: ML algorithm applies fix

### Charts
- **AI Intervention Analysis**: Comparison of raw vs healed data
- **System Performance**: Latency, throughput, CPU usage

### Network Topology
- **Green nodes**: Healthy
- **Yellow nodes**: Healing in progress
- **Red nodes**: Failed
- Animated data flow between nodes
- Auto-pilot mode for autonomous healing

### Event Log
- Click any event to expand metadata
- Shows algorithm used, confidence, duration
- Displays correlation scores and residual error
- Export button for CSV download

## 🔧 Common Customizations

### Add a New Sensor

1. Update `src/constants/config.js`:
```javascript
export const SENSOR_CONFIG = {
  // ... existing sensors
  pressure: {
    label: 'Pressure',
    unit: 'bar',
    threshold: { min: 0.8, max: 1.2, critical: 1.5 },
    color: 'from-purple-500 via-pink-500 to-red-500',
    icon: 'Gauge'
  }
}
```

2. Update initial state in `Dashboard.jsx`:
```javascript
pressure: {
  value: 1.0,
  history: [],
  confidence: 98.0,
  status: 'healthy',
  threshold: SENSOR_CONFIG.pressure.threshold,
  unit: SENSOR_CONFIG.pressure.unit,
  lastUpdate: Date.now(),
  deviation: 0,
  trend: 'stable'
}
```

3. That's it! The UI automatically adapts.

### Change Color Scheme

Edit `tailwind.config.js`:

```javascript
colors: {
  'iot': {
    primary: '#6366f1',    // Change these
    secondary: '#a855f7',
    accent: '#ec4899',
  }
}
```

### Add Custom Healing Algorithm

Edit `src/constants/config.js`:

```javascript
export const HEALING_ALGORITHMS = [
  // ... existing algorithms
  {
    name: 'Your Algorithm Name',
    algorithm: 'Technical Description',
    complexity: 'O(n)' // Big-O notation
  }
]
```

## 📦 Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

Output will be in the `dist/` folder.

## 🚀 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Deploy to AWS S3

```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name
```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

Build and run:
```bash
docker build -t iot-dashboard .
docker run -p 3000:3000 iot-dashboard
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Change port in vite.config.js
server: {
  port: 3001  // Change to available port
}
```

### Slow Performance

1. Increase `dataRate` in settings
2. Reduce `historyLength` in config
3. Check browser console for errors

### WebSocket Connection Fails

1. Verify WebSocket URL is correct
2. Check CORS settings on server
3. Ensure server supports WebSocket protocol

### Charts Not Rendering

1. Clear browser cache
2. Check for JavaScript errors in console
3. Verify Recharts is installed: `npm list recharts`

## 📚 Next Steps

- [ ] Connect to real IoT sensors
- [ ] Customize sensor thresholds
- [ ] Add more sensors
- [ ] Implement authentication
- [ ] Set up data persistence
- [ ] Configure alerts/notifications
- [ ] Add data analytics dashboard
- [ ] Deploy to production

## 💡 Tips

1. **Development**: Use simulated mode to test UI changes
2. **Testing**: Trigger manual anomalies via settings
3. **Optimization**: Reduce history length for better performance
4. **Security**: Use WSS (secure WebSocket) in production
5. **Monitoring**: Check event log for system health

## 🆘 Getting Help

- Check `PROJECT_STRUCTURE.md` for architecture details
- Review `README.md` for comprehensive documentation
- Examine component files for inline comments
- Search issues on GitHub repository

---

**You're all set! 🎉**

The dashboard is running with simulated data. Connect your sensors and start monitoring!
