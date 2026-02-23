import { randomInRange } from '@utils/statistics'

/**
 * Sensor Data Service
 * Handles real-time sensor data from various sources
 */
class SensorDataService {
  constructor() {
    this.ws = null
    this.reconnectInterval = 5000
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
    this.listeners = []
  }

  /**
   * Connect to WebSocket server
   * @param {string} url - WebSocket URL
   * @param {Function} onMessage - Message callback
   * @param {Function} onStatusChange - Connection status callback
   */
  connectWebSocket(url, onMessage, onStatusChange) {
    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        onStatusChange('connected')
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        onStatusChange('disconnected')
      }

      this.ws.onclose = () => {
        console.log('WebSocket closed')
        onStatusChange('reconnecting')
        this.attemptReconnect(url, onMessage, onStatusChange)
      }
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
      onStatusChange('disconnected')
    }
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  attemptReconnect(url, onMessage, onStatusChange) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      
      setTimeout(() => {
        this.connectWebSocket(url, onMessage, onStatusChange)
      }, this.reconnectInterval)
    } else {
      console.error('Max reconnect attempts reached')
      onStatusChange('disconnected')
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * Send data through WebSocket
   * @param {Object} data - Data to send
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  /**
   * Generate simulated sensor data
   * @returns {Object} Simulated sensor data
   */
  generateSimulatedData() {
    const shouldAnomaly = Math.random() > 0.97
    const anomalyType = Math.floor(Math.random() * 3)

    return {
      temperature: shouldAnomaly && anomalyType === 0 
        ? randomInRange(12, 32) 
        : randomInRange(21, 24),
      humidity: shouldAnomaly && anomalyType === 1
        ? randomInRange(25, 85)
        : randomInRange(43, 48),
      gas: shouldAnomaly && anomalyType === 2
        ? randomInRange(212, 512)
        : randomInRange(305, 320),
      timestamp: Date.now()
    }
  }

  /**
   * Fetch data from HTTP API
   * @param {string} url - API URL
   * @returns {Promise<Object>} Sensor data
   */
  async fetchFromAPI(url) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching from API:', error)
      throw error
    }
  }

  /**
   * Start HTTP polling
   * @param {string} url - API URL
   * @param {number} interval - Polling interval in ms
   * @param {Function} onData - Data callback
   * @returns {number} Interval ID
   */
  startPolling(url, interval, onData) {
    return setInterval(async () => {
      try {
        const data = await this.fetchFromAPI(url)
        onData(data)
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, interval)
  }

  /**
   * Stop HTTP polling
   * @param {number} intervalId - Interval ID to clear
   */
  stopPolling(intervalId) {
    if (intervalId) {
      clearInterval(intervalId)
    }
  }
}

export default new SensorDataService()
