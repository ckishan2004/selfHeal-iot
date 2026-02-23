import { useState, useCallback } from 'react'
import { HEALING_ALGORITHMS, DEFAULT_CONFIG } from '@constants/config'

/**
 * Custom hook for managing healing events and pipeline
 * @returns {Object} Healing state and methods
 */
export const useHealing = () => {
  const [healingStage, setHealingStage] = useState(0)
  const [eventLog, setEventLog] = useState([])
  const [healingSuccessRate, setHealingSuccessRate] = useState(
    DEFAULT_CONFIG.initialHealingSuccessRate
  )
  const [anomalyCount, setAnomalyCount] = useState(0)

  /**
   * Trigger healing process for a sensor anomaly
   */
  const triggerHealing = useCallback((sensor, anomalousValue, detectionMethod, onStageChange, onComplete) => {
    setHealingStage(1)
    setAnomalyCount(prev => prev + 1)
    
    if (onStageChange) onStageChange(1, 'degraded')

    const selectedMethod = HEALING_ALGORITHMS[
      Math.floor(Math.random() * HEALING_ALGORITHMS.length)
    ]

    // Stage 1: Anomaly Detection
    setTimeout(() => {
      setHealingStage(2)
      if (onStageChange) onStageChange(2, 'degraded')
    }, 1200)

    // Stage 2: Root Cause Analysis
    setTimeout(() => {
      setHealingStage(3)
      if (onStageChange) onStageChange(3, 'recovering')
    }, 2400)

    // Stage 3: Self-Healing Complete
    setTimeout(() => {
      const confidence = 94 + Math.random() * 5
      const duration = (0.15 + Math.random() * 0.85).toFixed(3)

      const newEvent = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        sensor,
        action: selectedMethod.name,
        status: confidence > 96 ? 'recovered' : 'partial-recovery',
        detectionMethod: detectionMethod === 'statistical' ? 'Z-Score Analysis' : 'Threshold Violation',
        anomalousValue: anomalousValue.toFixed(2),
        metadata: {
          algorithm: selectedMethod.algorithm,
          complexity: selectedMethod.complexity,
          confidence: confidence.toFixed(1),
          duration: duration + 's',
          dataPointsAnalyzed: Math.floor(50 + Math.random() * 150),
          correlationScore: (0.85 + Math.random() * 0.14).toFixed(3),
          residualError: (Math.random() * 0.5).toFixed(4)
        }
      }

      setEventLog(prev => [newEvent, ...prev.slice(0, DEFAULT_CONFIG.maxEventLog - 1)])
      setHealingStage(0)
      setHealingSuccessRate(prev => prev * 0.98 + confidence * 0.02)
      
      if (onComplete) onComplete(confidence, newEvent)
      if (onStageChange) onStageChange(0, 'healthy')
    }, 3600)
  }, [])

  /**
   * Clear event log
   */
  const clearEventLog = useCallback(() => {
    setEventLog([])
  }, [])

  /**
   * Export event log
   */
  const getEventLog = useCallback(() => {
    return eventLog
  }, [eventLog])

  return {
    healingStage,
    eventLog,
    healingSuccessRate,
    anomalyCount,
    triggerHealing,
    clearEventLog,
    getEventLog
  }
}
