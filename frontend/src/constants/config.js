// Sensor configuration
export const SENSOR_CONFIG = {
  temperature: {
    label: 'Temperature',
    unit: '°C',
    threshold: { min: 18, max: 28, critical: 32 },
    color: 'from-orange-500 via-red-500 to-pink-500',
    icon: 'Thermometer'
  },
  humidity: {
    label: 'Humidity',
    unit: '%',
    threshold: { min: 30, max: 70, critical: 85 },
    color: 'from-blue-500 via-cyan-500 to-teal-500',
    icon: 'Droplets'
  },
  gas: {
    label: 'Gas Level',
    unit: 'ppm',
    threshold: { min: 200, max: 500, critical: 800 },
    color: 'from-green-500 via-emerald-500 to-lime-500',
    icon: 'Wind'
  }
}

// Healing algorithms
export const HEALING_ALGORITHMS = [
  { 
    name: 'Temporal Kriging Imputation', 
    algorithm: 'Gaussian Process Regression', 
    complexity: 'O(n³)' 
  },
  { 
    name: 'Node Redundancy Switch', 
    algorithm: 'Consensus Protocol (Raft)', 
    complexity: 'O(n log n)' 
  },
  { 
    name: 'Synthetic Data Injection', 
    algorithm: 'GAN-based Synthesis', 
    complexity: 'O(n²)' 
  },
  { 
    name: 'Kalman Filter Smoothing', 
    algorithm: 'Extended Kalman Filter', 
    complexity: 'O(n)' 
  },
  { 
    name: 'ARIMA Forecasting', 
    algorithm: 'AutoRegressive Integrated Moving Average', 
    complexity: 'O(n²)' 
  }
]

// Healing pipeline stages
export const HEALING_STAGES = [
  { 
    stage: 1, 
    label: 'Anomaly Detection', 
    icon: 'AlertTriangle', 
    desc: 'Z-Score + Threshold', 
    method: 'Statistical Analysis' 
  },
  { 
    stage: 2, 
    label: 'Root Cause Analysis', 
    icon: 'Activity', 
    desc: 'Bayesian Inference', 
    method: 'Causal Modeling' 
  },
  { 
    stage: 3, 
    label: 'Self-Healing', 
    icon: 'CheckCircle', 
    desc: 'Auto-Remediation', 
    method: 'ML-Based Recovery' 
  }
]

// Default configuration
export const DEFAULT_CONFIG = {
  dataRate: 2.5, 
  anomalyThreshold: 3,
  historyLength: 50, 
  metricsLength: 20, 
  maxEventLog: 20, 
  initialHealingSuccessRate: 99.2
}

// Data source types
export const DATA_SOURCES = {
  SIMULATED: 'simulated',
  WEBSOCKET: 'websocket',
  MQTT: 'mqtt',
  HTTP: 'http'
}

// Connection status
export const CONNECTION_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting'
}

// System health states
export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  RECOVERING: 'recovering'
}
