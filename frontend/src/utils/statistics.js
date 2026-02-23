/**
 * Calculate statistical metrics (mean, standard deviation, variance)
 * @param {Array} history - Array of historical data points
 * @param {string} key - Key to extract from data points
 * @returns {Object} Statistics object
 */
export const calculateStatistics = (history, key) => {
  if (!history || history.length === 0) {
    return { mean: 0, stdDev: 0, variance: 0 }
  }
  
  const values = history
    .map(h => h[key])
    .filter(v => v !== undefined && !isNaN(v))
  
  if (values.length === 0) {
    return { mean: 0, stdDev: 0, variance: 0 }
  }
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  
  return { mean, stdDev, variance }
}

/**
 * Detect anomaly using Z-score method
 * @param {number} value - Current value to check
 * @param {Object} stats - Statistics object with mean and stdDev
 * @param {number} threshold - Z-score threshold (default: 3)
 * @returns {boolean} True if anomaly detected
 */
export const detectAnomaly = (value, stats, threshold = 3) => {
  if (!stats || stats.stdDev === 0) return false
  
  const zScore = Math.abs((value - stats.mean) / stats.stdDev)
  return zScore > threshold
}

/**
 * Calculate trend based on recent history
 * @param {Array} history - Array of historical data points
 * @param {string} key - Key to extract from data points
 * @param {number} windowSize - Number of recent points to consider
 * @returns {string} Trend: 'rising', 'falling', or 'stable'
 */
export const calculateTrend = (history, key, windowSize = 5) => {
  if (!history || history.length < windowSize) return 'stable'
  
  const recent = history.slice(-windowSize).map(h => h[key]).filter(v => v !== undefined)
  
  if (recent.length < 2) return 'stable'
  
  const first = recent[0]
  const last = recent[recent.length - 1]
  const change = ((last - first) / first) * 100
  
  if (Math.abs(change) < 2) return 'stable'
  return change > 0 ? 'rising' : 'falling'
}

/**
 * Check if value violates thresholds
 * @param {number} value - Value to check
 * @param {Object} threshold - Threshold object with min, max, critical
 * @returns {Object} Violation status
 */
export const checkThresholdViolation = (value, threshold) => {
  return {
    isViolation: value < threshold.min || value > threshold.max,
    isCritical: value > threshold.critical,
    type: value < threshold.min ? 'low' : value > threshold.max ? 'high' : 'normal'
  }
}

/**
 * Format timestamp to readable string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted time string
 */
export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

/**
 * Format date to readable string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString()
}

/**
 * Generate random value within range
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random value
 */
export const randomInRange = (min, max) => {
  return min + Math.random() * (max - min)
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calculate moving average
 * @param {Array} values - Array of numbers
 * @param {number} window - Window size
 * @returns {number} Moving average
 */
export const movingAverage = (values, window = 5) => {
  if (!values || values.length === 0) return 0
  
  const recent = values.slice(-window)
  return recent.reduce((a, b) => a + b, 0) / recent.length
}
