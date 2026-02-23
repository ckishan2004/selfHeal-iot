// import { useState, useEffect, useCallback } from 'react'
// import { calculateStatistics, detectAnomaly, calculateTrend } from '@utils/statistics'
// import { DEFAULT_CONFIG } from '@constants/config'

// /**
//  * Custom hook for managing sensor data state
//  * @param {Object} initialSensorData - Initial sensor configuration
//  * @returns {Object} Sensor data and methods
//  */
// export const useSensorData = (initialSensorData) => {
//   const [sensorData, setSensorData] = useState(initialSensorData)
//   const [statisticsWindow, setStatisticsWindow] = useState({
//     mean: {},
//     stdDev: {},
//     variance: {}
//   })

//   // Calculate statistics whenever sensor data changes
//   useEffect(() => {
//     const stats = {
//       mean: {},
//       stdDev: {},
//       variance: {}
//     }

//     Object.keys(sensorData).forEach(key => {
//       const calculated = calculateStatistics(sensorData[key].history, key)
//       stats.mean[key] = calculated.mean
//       stats.stdDev[key] = calculated.stdDev
//       stats.variance[key] = calculated.variance
//     })

//     setStatisticsWindow(stats)
//   }, [sensorData])

//   /**
//    * Update sensor data with new reading
//    */
//   const updateSensorData = useCallback((rawData) => {
//     const timestamp = rawData.timestamp || Date.now()

//     setSensorData(prev => {
//       const newData = { ...prev }

//       Object.keys(rawData).forEach(key => {
//         if (newData[key] && typeof rawData[key] === 'number' && key !== 'timestamp') {
//           const stats = calculateStatistics(newData[key].history, key)
//           const isAnomaly = detectAnomaly(rawData[key], stats, DEFAULT_CONFIG.anomalyThreshold)
//           const trend = calculateTrend(newData[key].history, key)

//           // Detect threshold violations
//           const thresholdViolation =
//             rawData[key] < newData[key].threshold.min ||
//             rawData[key] > newData[key].threshold.max

//           const criticalViolation = rawData[key] > newData[key].threshold.critical

//           newData[key] = {
//             ...newData[key],
//             value: isAnomaly ? newData[key].value : rawData[key],
//             lastUpdate: timestamp,
//             deviation: Math.abs(rawData[key] - stats.mean),
//             trend,
//             status: isAnomaly || thresholdViolation ? 'healing' : 'healthy',
//             history: [...newData[key].history.slice(-49), {
//               time: timestamp,
//               timestamp: new Date(timestamp).toLocaleTimeString(),
//               [key]: isAnomaly ? newData[key].value : rawData[key],
//               [`${key}Raw`]: rawData[key],
//               temperature: key === 'temperature' ? rawData[key] : newData.temperature.value,
//               humidity: key === 'humidity' ? rawData[key] : newData.humidity.value,
//               gas: key === 'gas' ? rawData[key] : newData.gas.value,
//               temperatureRaw: key === 'temperature' ? rawData[key] : newData.temperature.value,
//               humidityRaw: key === 'humidity' ? rawData[key] : newData.humidity.value,
//               gasRaw: key === 'gas' ? rawData[key] : newData.gas.value
//             }]
//           }

//           // Return anomaly detection result
//           if (isAnomaly || thresholdViolation) {
//             return {
//               newData,
//               anomaly: {
//                 sensor: key,
//                 value: rawData[key],
//                 method: isAnomaly ? 'statistical' : 'threshold'
//               }
//             }
//           }
//         }
//       })

//       return newData
//     })
//   }, [])

//   /**
//    * Reset sensor to healthy state
//    */
//   const resetSensorStatus = useCallback((sensorKey, confidence) => {
//     setSensorData(prev => ({
//       ...prev,
//       [sensorKey]: {
//         ...prev[sensorKey],
//         status: 'healthy',
//         confidence: confidence || prev[sensorKey].confidence
//       }
//     }))
//   }, [])

//   return {
//     sensorData,
//     statisticsWindow,
//     updateSensorData,
//     resetSensorStatus
//   }
// }
export const useSensorData = () => {
  return {
    sensorData: {},
    statisticsWindow: [],
    updateSensorData: () => ({}),
    resetSensorStatus: () => {}
  }
}
