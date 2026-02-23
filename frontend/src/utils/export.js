/**
 * Export data as JSON file
 * @param {Object} data - Data to export
 * @param {string} filename - Filename (without extension)
 */
export const exportAsJSON = (data, filename = 'iot-data') => {
  try {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    downloadBlob(blob, `${filename}-${Date.now()}.json`)
  } catch (error) {
    console.error('Error exporting JSON:', error)
  }
}

/**
 * Export sensor history as CSV file
 * @param {Object} sensorData - Sensor data object
 * @param {string} filename - Filename (without extension)
 */
export const exportAsCSV = (sensorData, filename = 'sensor-data') => {
  try {
    let csv = 'Timestamp,Temperature,Humidity,Gas,Temperature Raw,Humidity Raw,Gas Raw\n'
    
    const history = sensorData.temperature.history
    history.forEach((point) => {
      csv += `${point.timestamp},${point.temperature},${point.humidity},${point.gas},`
      csv += `${point.temperatureRaw},${point.humidityRaw},${point.gasRaw}\n`
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    downloadBlob(blob, `${filename}-${Date.now()}.csv`)
  } catch (error) {
    console.error('Error exporting CSV:', error)
  }
}

/**
 * Export event log as CSV
 * @param {Array} eventLog - Array of events
 * @param {string} filename - Filename (without extension)
 */
export const exportEventLogAsCSV = (eventLog, filename = 'event-log') => {
  try {
    let csv = 'Timestamp,Date,Sensor,Action,Status,Detection Method,Anomalous Value,Algorithm,Confidence,Duration\n'
    
    eventLog.forEach((event) => {
      csv += `${event.timestamp},${event.date},${event.sensor},${event.action},${event.status},`
      csv += `${event.detectionMethod},${event.anomalousValue},${event.metadata.algorithm},`
      csv += `${event.metadata.confidence},${event.metadata.duration}\n`
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    downloadBlob(blob, `${filename}-${Date.now()}.csv`)
  } catch (error) {
    console.error('Error exporting event log:', error)
  }
}

/**
 * Download blob as file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename
 */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Create comprehensive export package
 * @param {Object} allData - All dashboard data
 * @returns {Object} Export package
 */
export const createExportPackage = (allData) => {
  return {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    ...allData
  }
}
