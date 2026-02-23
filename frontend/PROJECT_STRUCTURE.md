# Complete Project Structure

## 📁 Directory Tree

```
iot-dashboard-project/
│
├── public/                          # Static assets
│   └── vite.svg                     # Vite logo
│
├── src/                             # Source code
│   ├── components/                  # React components
│   │   ├── Dashboard/               # Main dashboard components
│   │   │   ├── Dashboard.jsx        # Main orchestrator component
│   │   │   ├── Header.jsx           # Dashboard header with metrics
│   │   │   └── HealingPipeline.jsx  # 3-stage healing visualization
│   │   │
│   │   ├── Sensors/                 # Sensor-related components
│   │   │   ├── SensorGrid.jsx       # Grid of sensor cards
│   │   │   ├── SensorCard.jsx       # Individual sensor card
│   │   │   └── SensorSparkline.jsx  # Mini chart component
│   │   │
│   │   ├── Charts/                  # Chart components
│   │   │   ├── ChartsSection.jsx    # Charts container
│   │   │   ├── ComparisonChart.jsx  # Raw vs Healed data
│   │   │   └── PerformanceChart.jsx # System performance metrics
│   │   │
│   │   ├── Network/                 # Network topology components
│   │   │   ├── NetworkTopology.jsx  # SVG network map
│   │   │   └── NetworkNode.jsx      # Individual node component
│   │   │
│   │   ├── EventLog/                # Event logging components
│   │   │   ├── EventLogPanel.jsx    # Event log container
│   │   │   └── EventItem.jsx        # Individual event entry
│   │   │
│   │   └── UI/                      # Reusable UI components
│   │       ├── SettingsModal.jsx    # Settings panel
│   │       ├── StatCard.jsx         # Statistics card
│   │       └── Button.jsx           # Custom button component
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useSensorData.js         # Sensor data management
│   │   ├── useHealing.js            # Healing process management
│   │   ├── useWebSocket.js          # WebSocket connection
│   │   └── useDataExport.js         # Data export functionality
│   │
│   ├── services/                    # External services
│   │   ├── sensorService.js         # Sensor data service
│   │   ├── apiService.js            # HTTP API service
│   │   └── mqttService.js           # MQTT service (optional)
│   │
│   ├── utils/                       # Utility functions
│   │   ├── statistics.js            # Statistical calculations
│   │   ├── export.js                # Export utilities
│   │   └── validators.js            # Data validators
│   │
│   ├── constants/                   # Configuration constants
│   │   ├── config.js                # App configuration
│   │   └── themes.js                # Theme configuration
│   │
│   ├── styles/                      # Global styles
│   │   └── index.css                # Tailwind + custom CSS
│   │
│   ├── App.jsx                      # Root component
│   └── main.jsx                     # Entry point
│
├── index.html                       # HTML entry point
├── package.json                     # Dependencies & scripts
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── .eslintrc.cjs                    # ESLint configuration
├── .gitignore                       # Git ignore rules
├── setup.sh                         # Setup script
└── README.md                        # Project documentation

```

## 📦 Key Files Description

### Configuration Files

- **package.json**: Project dependencies and npm scripts
- **vite.config.js**: Vite build tool configuration with path aliases
- **tailwind.config.js**: Tailwind CSS customization (fonts, colors, animations)
- **postcss.config.js**: PostCSS plugins configuration
- **.eslintrc.cjs**: Code linting rules

### Source Code Structure

#### Components (`src/components/`)

**Dashboard/**
- `Dashboard.jsx`: Main component that orchestrates all sub-components
- `Header.jsx`: Displays system status, metrics, and controls
- `HealingPipeline.jsx`: Visual representation of the 3-stage healing process

**Sensors/**
- `SensorGrid.jsx`: Responsive grid layout for sensor cards
- `SensorCard.jsx`: Individual sensor with value, chart, and statistics
- `SensorSparkline.jsx`: Mini-chart showing recent history

**Charts/**
- `ChartsSection.jsx`: Container for all charts
- `ComparisonChart.jsx`: Comparison of raw data vs AI-healed data
- `PerformanceChart.jsx**: System performance metrics (latency, throughput, CPU)

**Network/**
- `NetworkTopology.jsx`: Interactive SVG network map with 8 nodes
- `NetworkNode.jsx`: Individual node with status indication

**EventLog/**
- `EventLogPanel.jsx`: Scrollable list of healing events
- `EventItem.jsx`: Expandable event entry with metadata

**UI/**
- `SettingsModal.jsx`: Configuration modal
- `StatCard.jsx`: Reusable statistic display card
- `Button.jsx`: Custom styled button component

#### Custom Hooks (`src/hooks/`)

- **useSensorData.js**: Manages sensor state, history, and statistics
- **useHealing.js**: Handles healing pipeline, events, and success rate
- **useWebSocket.js**: WebSocket connection management
- **useDataExport.js**: Data export functionality (JSON, CSV)

#### Services (`src/services/`)

- **sensorService.js**: Handles real-time sensor data from various sources
- **apiService.js**: HTTP API communication
- **mqttService.js**: MQTT protocol support (optional)

#### Utils (`src/utils/`)

- **statistics.js**: Z-score, mean, variance, trend calculations
- **export.js**: JSON/CSV export functions
- **validators.js**: Input validation utilities

#### Constants (`src/constants/`)

- **config.js**: Application configuration (thresholds, algorithms, etc.)
- **themes.js**: Color schemes and styling constants

## 🎯 Component Hierarchy

```
App
└── Dashboard
    ├── Header
    ├── SensorGrid
    │   └── SensorCard (x3)
    │       └── SensorSparkline
    ├── HealingPipeline
    ├── ChartsSection
    │   ├── ComparisonChart
    │   └── PerformanceChart
    ├── NetworkTopology
    │   └── NetworkNode (x8)
    ├── EventLogPanel
    │   └── EventItem (dynamic)
    └── SettingsModal
```

## 🔌 Data Flow

```
External Source → sensorService → Dashboard → useSensorData
                                              ↓
                                    Anomaly Detection
                                              ↓
                                       useHealing
                                              ↓
                                    Update UI Components
```

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Access dashboard:**
   Open `http://localhost:3000`

4. **Connect live data:**
   - Edit `src/services/sensorService.js`
   - Configure WebSocket URL or API endpoint
   - Update data format if needed

## 🛠️ Customization Points

### Add New Sensor
1. Update `SENSOR_CONFIG` in `src/constants/config.js`
2. Add sensor to initial state in `Dashboard.jsx`
3. Component will automatically render new sensor card

### Change Healing Algorithms
1. Modify `HEALING_ALGORITHMS` in `src/constants/config.js`
2. No code changes needed - system uses configuration

### Adjust Thresholds
1. Update threshold values in `SENSOR_CONFIG`
2. System will automatically use new thresholds

### Add Data Source
1. Create new service in `src/services/`
2. Implement connection logic
3. Update Dashboard to use new service

## 📊 Built-in Features

✅ Real-time sensor monitoring (Temperature, Humidity, Gas)
✅ Z-score anomaly detection
✅ Threshold-based alerting
✅ Autonomous healing pipeline
✅ Statistical analytics (mean, stdDev, variance)
✅ Network topology visualization
✅ Performance metrics tracking
✅ Event logging with metadata
✅ Data export (JSON, CSV)
✅ WebSocket support
✅ Responsive design
✅ Dark theme UI
✅ Framer Motion animations

## 📝 Development Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🎨 Styling

- **Framework**: Tailwind CSS
- **Fonts**: JetBrains Mono (mono), Syne (display)
- **Theme**: Dark mode with glassmorphism
- **Colors**: Indigo/Purple/Pink gradient palette
- **Animations**: Framer Motion + CSS animations

## 📱 Responsive Breakpoints

- Mobile: 320px - 768px
- Tablet: 768px - 1280px
- Desktop: 1280px+

All components adapt gracefully to screen size.
