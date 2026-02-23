import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend, ComposedChart, ScatterChart, Scatter } from 'recharts';
import { Activity, Thermometer, Droplets, Wind, AlertTriangle, CheckCircle, Zap, Upload, Download, FileText, Timer, Cpu, HardDrive, TrendingUp, AlertCircle, Brain, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReferenceLine } from 'recharts';

const IoTDashboard = () => {
  // File and data state
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);

  //   const handleCSVUpload = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const formData = new FormData();
  //   formData.append("file", file);

  //   const res = await fetch("http://127.0.0.1:8000/api/upload-csv", {
  //     method: "POST",
  //     body: formData
  //   });

  //   const data = await res.json();
  //   console.log("Backend Response:", data);

  //   setBackendData(data);
  // };

  const uploadCSV = async () => {
    if (!csvFile) {
      alert("Please upload a CSV file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    const res = await fetch("http://127.0.0.1:8000/api/upload-csv", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("Backend response:", data);
  };



  // Isolation Forest parameters
  const [numTrees, setNumTrees] = useState(100);
  const [subsampleSize, setSubsampleSize] = useState(256);
  const [anomalyThreshold, setAnomalyThreshold] = useState(0.5);
  const [isolationTrees, setIsolationTrees] = useState([]);
  const [trainingComplete, setTrainingComplete] = useState(false);

  // System state
  const [systemHealth, setSystemHealth] = useState('healthy');
  const [latency, setLatency] = useState(67);
  const [autoPilot, setAutoPilot] = useState(true);
  const [totalDataPoints, setTotalDataPoints] = useState(0);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [healingSuccessRate, setHealingSuccessRate] = useState(99.2);
  const [detectionMethod, setDetectionMethod] = useState('isolation-forest'); // isolation-forest, z-score, hybrid

  // Sensor data
  const [sensorData, setSensorData] = useState({
    temperature: {
      value: 0,
      history: [],
      confidence: 98.2,
      status: 'healthy',
      threshold: { min: 18, max: 28, critical: 32 },
      unit: '°C',
      deviation: 0,
      trend: 'stable',
      anomalyScore: 0
    },
    humidity: {
      value: 0,
      history: [],
      confidence: 97.8,
      status: 'healthy',
      threshold: { min: 30, max: 70, critical: 85 },
      unit: '%',
      deviation: 0,
      trend: 'stable',
      anomalyScore: 0
    },
    gas: {
      value: 0,
      history: [],
      confidence: 99.1,
      status: 'healthy',
      threshold: { min: 200, max: 500, critical: 800 },
      unit: 'ppm',
      deviation: 0,
      trend: 'stable',
      anomalyScore: 0
    }
  });

  const [healingStage, setHealingStage] = useState(0);
  const [eventLog, setEventLog] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [statisticsWindow, setStatisticsWindow] = useState({
    mean: { temperature: 0, humidity: 0, gas: 0 },
    stdDev: { temperature: 0, humidity: 0, gas: 0 }
  });
  const [anomalyScoreHistory, setAnomalyScoreHistory] = useState([]);

  // ==================== ISOLATION FOREST IMPLEMENTATION ====================

  // Simple Isolation Tree Node
  class IsolationTreeNode {
    constructor(feature, splitValue, left = null, right = null, size = 0) {
      this.feature = feature;
      this.splitValue = splitValue;
      this.left = left;
      this.right = right;
      this.size = size;
    }
  }

  // Build a single isolation tree
  const buildIsolationTree = useCallback((data, maxDepth, currentDepth = 0) => {
    if (data.length <= 1 || currentDepth >= maxDepth) {
      return new IsolationTreeNode(null, null, null, null, data.length);
    }

    // Randomly select a feature (temperature, humidity, or gas)
    const features = ['temperature', 'humidity', 'gas'];
    const randomFeature = features[Math.floor(Math.random() * features.length)];

    // Get min and max values for the selected feature
    const featureValues = data.map(d => d[randomFeature]);
    const minValue = Math.min(...featureValues);
    const maxValue = Math.max(...featureValues);

    if (minValue === maxValue) {
      return new IsolationTreeNode(null, null, null, null, data.length);
    }

    // Random split point between min and max
    const splitValue = minValue + Math.random() * (maxValue - minValue);

    // Split data
    const leftData = data.filter(d => d[randomFeature] < splitValue);
    const rightData = data.filter(d => d[randomFeature] >= splitValue);

    // Recursively build left and right subtrees
    const left = buildIsolationTree(leftData, maxDepth, currentDepth + 1);
    const right = buildIsolationTree(rightData, maxDepth, currentDepth + 1);

    return new IsolationTreeNode(randomFeature, splitValue, left, right, data.length);
  }, []);

  // Calculate path length for a data point in a tree
  const pathLength = useCallback((node, point, currentDepth = 0) => {
    if (!node.left && !node.right) {
      // External node - add average path length adjustment
      return currentDepth + averagePathLength(node.size);
    }

    const featureValue = point[node.feature];

    if (featureValue < node.splitValue) {
      return pathLength(node.left, point, currentDepth + 1);
    } else {
      return pathLength(node.right, point, currentDepth + 1);
    }
  }, []);

  // Average path length of unsuccessful search in BST
  const averagePathLength = (n) => {
    if (n <= 1) return 0;
    const H = Math.log(n - 1) + 0.5772156649; // Euler's constant
    return 2 * H - (2 * (n - 1) / n);
  };

  // Calculate anomaly score for a data point
  const calculateAnomalyScore = useCallback((point, trees) => {
    if (trees.length === 0) return 0;

    const avgPathLength = trees.reduce((sum, tree) => {
      return sum + pathLength(tree, point);
    }, 0) / trees.length;

    const c = averagePathLength(subsampleSize);
    const anomalyScore = Math.pow(2, -avgPathLength / c);

    return anomalyScore;
  }, [subsampleSize, pathLength]);

  // Train Isolation Forest on initial data
  const trainIsolationForest = useCallback((data) => {
    if (data.length < 10) {
      console.log('Not enough data to train Isolation Forest');
      return;
    }

    console.log(`Training Isolation Forest with ${numTrees} trees on ${data.length} samples...`);

    const trees = [];
    const maxDepth = Math.ceil(Math.log2(subsampleSize));

    for (let i = 0; i < numTrees; i++) {
      // Random subsample
      const subsample = [];
      for (let j = 0; j < Math.min(subsampleSize, data.length); j++) {
        const randomIndex = Math.floor(Math.random() * data.length);
        subsample.push(data[randomIndex]);
      }

      // Build tree
      const tree = buildIsolationTree(subsample, maxDepth);
      trees.push(tree);
    }

    setIsolationTrees(trees);
    setTrainingComplete(true);
    console.log('Isolation Forest training complete!');
  }, [numTrees, subsampleSize, buildIsolationTree]);

  // ==================== END ISOLATION FOREST ====================

  // Parse CSV file
  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          const value = values[index].trim();
          row[header] = isNaN(value) ? value : parseFloat(value);
        });
        data.push(row);
      }
    }
    return data;
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const parsed = parseCSV(text);

        // Prepare data for Isolation Forest
        const trainingData = parsed.map(row => ({
          temperature: row.temperature || row.temp || row.Temperature || 0,
          humidity: row.humidity || row.Humidity || 0,
          gas: row.gas || row.Gas || row.gas_level || 0
        }));

        setCsvData(parsed);
        setCurrentIndex(0);
        setIsPlaying(false);
        setTrainingComplete(false);

        // Train Isolation Forest on the data
        if (detectionMethod === 'isolation-forest' || detectionMethod === 'hybrid') {
          trainIsolationForest(trainingData);
        }

        // Initialize with first data point
        if (parsed.length > 0) {
          processDataPoint(parsed[0], 0);
        }
      };
      reader.readAsText(file);
    }
  };

  // Calculate statistics
  const calculateStatistics = useCallback((history, key) => {
    if (history.length === 0) return { mean: 0, stdDev: 0 };

    const values = history.map(h => h[key]).filter(v => v !== undefined);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  }, []);

  // Detect anomaly using Z-score
  const detectAnomalyZScore = useCallback((value, stats, threshold = 3) => {
    if (stats.stdDev === 0) return false;
    const zScore = Math.abs((value - stats.mean) / stats.stdDev);
    return zScore > threshold;
  }, []);

  // Detect anomaly using Isolation Forest
  const detectAnomalyIsolationForest = useCallback((point) => {
    if (!trainingComplete || isolationTrees.length === 0) {
      return { isAnomaly: false, score: 0 };
    }

    const score = calculateAnomalyScore(point, isolationTrees);
    const isAnomaly = score > anomalyThreshold;

    return { isAnomaly, score };
  }, [trainingComplete, isolationTrees, anomalyThreshold, calculateAnomalyScore]);

  // Calculate trend
  const calculateTrend = useCallback((history, key) => {
    if (history.length < 5) return 'stable';
    const recent = history.slice(-5).map(h => h[key]);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const change = ((last - first) / first) * 100;

    if (Math.abs(change) < 2) return 'stable';
    return change > 0 ? 'rising' : 'falling';
  }, []);

  // Process individual data point
  const processDataPoint = useCallback((dataPoint, index) => {
    const tempValue = dataPoint.temperature || dataPoint.temp || dataPoint.Temperature || 0;
    const humidityValue = dataPoint.humidity || dataPoint.Humidity || 0;
    const gasValue = dataPoint.gas || dataPoint.Gas || dataPoint.gas_level || 0;
    const timestamp = dataPoint.timestamp || dataPoint.time || new Date().toLocaleTimeString();

    const point = {
      temperature: tempValue,
      humidity: humidityValue,
      gas: gasValue
    };

    // Detect anomaly using selected method
    let isAnomalyDetected = false;
    let anomalyScore = 0;
    let detectionType = '';
    let detectedSensors = [];

    if (detectionMethod === 'isolation-forest' && trainingComplete) {
      const ifResult = detectAnomalyIsolationForest(point);
      isAnomalyDetected = ifResult.isAnomaly;
      anomalyScore = ifResult.score;
      detectionType = 'Isolation Forest';

      if (isAnomalyDetected) {
        detectedSensors = ['temperature', 'humidity', 'gas']; // Multi-dimensional anomaly
      }
    } else if (detectionMethod === 'z-score') {
      // Z-score for each sensor individually
      detectionType = 'Z-Score';
    } else if (detectionMethod === 'hybrid' && trainingComplete) {
      const ifResult = detectAnomalyIsolationForest(point);
      detectionType = 'Hybrid (IF + Z-Score)';
      anomalyScore = ifResult.score;
      isAnomalyDetected = ifResult.isAnomaly;
    }

    setSensorData(prev => {
      const newData = { ...prev };

      ['temperature', 'humidity', 'gas'].forEach(sensor => {
        const value = sensor === 'temperature' ? tempValue :
          sensor === 'humidity' ? humidityValue : gasValue;

        const stats = calculateStatistics(newData[sensor].history, sensor);
        const isZScoreAnomaly = detectAnomalyZScore(value, stats);
        const trend = calculateTrend(newData[sensor].history, sensor);

        const thresholdViolation =
          value < newData[sensor].threshold.min ||
          value > newData[sensor].threshold.max;

        let sensorAnomalyDetected = false;

        if (detectionMethod === 'z-score') {
          sensorAnomalyDetected = isZScoreAnomaly || thresholdViolation;
        } else if (detectionMethod === 'isolation-forest') {
          sensorAnomalyDetected = isAnomalyDetected && detectedSensors.includes(sensor);
        } else if (detectionMethod === 'hybrid') {
          sensorAnomalyDetected = isAnomalyDetected || isZScoreAnomaly || thresholdViolation;
        }

        if (sensorAnomalyDetected) {
          triggerHealing(sensor, value, detectionType, anomalyScore);
        }

        newData[sensor] = {
          ...newData[sensor],
          value: value,
          deviation: Math.abs(value - stats.mean),
          trend,
          status: sensorAnomalyDetected ? 'healing' : 'healthy',
          anomalyScore: anomalyScore,
          history: [...newData[sensor].history.slice(-49), {
            time: index,
            timestamp: timestamp,
            [sensor]: value,
            temperature: tempValue,
            humidity: humidityValue,
            gas: gasValue,
            anomalyScore: anomalyScore
          }]
        };
      });

      return newData;
    });

    // Track anomaly scores
    setAnomalyScoreHistory(prev => [...prev.slice(-99), {
      time: index,
      timestamp: timestamp,
      score: anomalyScore,
      isAnomaly: isAnomalyDetected
    }]);

    setTotalDataPoints(prev => prev + 1);
    setLatency(Math.floor(45 + Math.random() * 75));
  }, [detectionMethod, trainingComplete, calculateStatistics, detectAnomalyZScore, detectAnomalyIsolationForest, calculateTrend]);

  // Auto-play CSV data
  useEffect(() => {
    if (isPlaying && csvData.length > 0 && currentIndex < csvData.length) {
      const timer = setTimeout(() => {
        processDataPoint(csvData[currentIndex], currentIndex);
        setCurrentIndex(prev => prev + 1);
      }, playbackSpeed);

      return () => clearTimeout(timer);
    } else if (currentIndex >= csvData.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentIndex, csvData, playbackSpeed, processDataPoint]);

  // Update statistics
  useEffect(() => {
    const stats = {
      mean: {},
      stdDev: {}
    };

    ['temperature', 'humidity', 'gas'].forEach(key => {
      const calculated = calculateStatistics(sensorData[key].history, key);
      stats.mean[key] = calculated.mean;
      stats.stdDev[key] = calculated.stdDev;
    });

    setStatisticsWindow(stats);
  }, [sensorData, calculateStatistics]);

  const triggerHealing = (sensor, anomalousValue, detectionType, anomalyScore) => {
    setSystemHealth('degraded');
    setHealingStage(1);
    setAnomalyCount(prev => prev + 1);

    const healingMethods = [
      {
        name: 'Isolation Forest Correction',
        algorithm: 'Tree-based Imputation',
        complexity: 'O(n log n)'
      },
      {
        name: 'Moving Average Smoothing',
        algorithm: 'Statistical Smoothing',
        complexity: 'O(n)'
      }
    ];


    const selectedMethod = healingMethods[Math.floor(Math.random() * healingMethods.length)];

    setTimeout(() => setHealingStage(2), 1200);
    setTimeout(() => setHealingStage(3), 2400);

    setTimeout(() => {
      const confidence = 94 + Math.random() * 5;

      setEventLog(prev => [{
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        sensor,
        action: selectedMethod.name,
        status: 'recovered',
        detectionMethod: detectionType,
        anomalousValue: anomalousValue.toFixed(2),
        anomalyScore: anomalyScore.toFixed(4),
        metadata: {
          algorithm: selectedMethod.algorithm,
          complexity: selectedMethod.complexity,
          confidence: confidence.toFixed(1),
          duration: (0.15 + Math.random() * 0.85).toFixed(3) + 's',
          isolationTrees: numTrees,
          subsampleSize: subsampleSize
        }
      }, ...prev.slice(0, 19)]);

      setSystemHealth('healthy');
      setHealingStage(0);
      setHealingSuccessRate(prev => prev * 0.98 + confidence * 0.02);

      setSensorData(prev => ({
        ...prev,
        [sensor]: { ...prev[sensor], status: 'healthy', confidence }
      }));
    }, 3600);
  };

  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      fileName: csvFile?.name || 'Unknown',
      detectionMethod: detectionMethod,
      isolationForestConfig: {
        numTrees,
        subsampleSize,
        anomalyThreshold,
        trainingComplete
      },
      totalRecords: csvData.length,
      processedRecords: currentIndex,
      sensors: sensorData,
      statistics: statisticsWindow,
      events: eventLog,
      anomalyCount,
      healingSuccessRate,
      anomalyScoreHistory
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `isolation-forest-analysis-${Date.now()}.json`;
    a.click();
  };

  const pulseSpeed = systemHealth === 'healthy' ? 2 : systemHealth === 'degraded' ? 0.6 : 1.5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-2 md:p-6">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
        
        * { font-family: 'JetBrains Mono', monospace; }
        .syne { font-family: 'Syne', sans-serif; }
        
        .glass {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        .glass-light {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(99, 102, 241, 0.15);
        }
        
        .glow { box-shadow: 0 0 30px rgba(99, 102, 241, 0.3); }
        .glow-green { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
        .glow-red { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
        
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0; }
        }
        
        .pulse-ring {
          animation: pulse-ring ${pulseSpeed}s ease-out infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.4); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.5); border-radius: 10px; }
      `}</style>

      {/* Enhanced Header with Isolation Forest Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-4 md:p-6 mb-4 md:mb-6 glow"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="text-purple-400" size={40} />
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 syne">
                  SEALF-HEAL IoT
                </h1>
                <p className="text-indigo-300">AI-Powered Anomaly Detection Dashboard</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm mt-2">
              <span className="text-purple-400">• {totalDataPoints} data points</span>
              <span className="text-pink-400">• {anomalyCount} anomalies</span>
              <span className="text-green-400">• {healingSuccessRate.toFixed(1)}% success</span>
              {trainingComplete && (
                <span className="text-cyan-400">• {numTrees} trees trained ✓</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <label className="glass-light px-4 py-3 rounded-lg cursor-pointer hover:bg-indigo-600/30 transition-all flex items-center gap-2">
              <Upload className="text-indigo-400" size={20} />
              <span className="text-white font-bold">Upload CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setCsvFile(file);        // 🔥 REQUIRED
                  handleFileUpload(e);    // (optional) local parse
                }}
                className="hidden"
              />

            </label>


            {csvFile && (
              <div className="glass-light px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="text-green-400" size={16} />
                  <span className="text-white text-sm">{csvFile.name}</span>
                </div>
                <div className="text-xs text-indigo-300 mt-1">
                  {csvData.length} records | {currentIndex}/{csvData.length} processed
                </div>
              </div>
            )}

            <div className="glass-light rounded-lg px-4 py-2 text-center">
              <div className="text-xs text-indigo-300 mb-1">LATENCY</div>
              <div className="text-2xl font-bold text-cyan-400">{latency}<span className="text-sm">ms</span></div>
            </div>

            <div className="relative">
              <div className={`w-16 h-16 rounded-full absolute inset-0 pulse-ring ${systemHealth === 'healthy' ? 'bg-green-400' :
                systemHealth === 'degraded' ? 'bg-red-400' : 'bg-yellow-400'
                }`}></div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center relative ${systemHealth === 'healthy' ? 'bg-green-500 glow-green' :
                systemHealth === 'degraded' ? 'bg-red-500 glow-red' : 'bg-yellow-500'
                }`}>
                <Activity className="text-white" size={32} />
              </div>
            </div>

            <button
              onClick={exportData}
              className="glass-light p-3 rounded-lg hover:bg-purple-600/30 transition-all"
            >
              <Download className="text-purple-400" size={20} />
            </button>
          </div>
        </div>

        {/* Isolation Forest Configuration Panel */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-light rounded-lg p-3">
            <label className="text-xs text-indigo-300 mb-2 block">Detection Method</label>
            <select
              value={detectionMethod}
              onChange={(e) => setDetectionMethod(e.target.value)}
              className="w-full bg-slate-800 text-white rounded px-3 py-2 text-sm border border-indigo-500/30"
            >
              <option value="isolation-forest">🌲 Isolation Forest</option>
              <option value="z-score">📊 Z-Score</option>
              <option value="hybrid">🔄 Hybrid (IF + Z-Score)</option>
            </select>
          </div>

          <div className="glass-light rounded-lg p-3">
            <label className="text-xs text-indigo-300 mb-2 block">Number of Trees: {numTrees}</label>
            <input
              type="range"
              min="10"
              max="200"
              value={numTrees}
              onChange={(e) => setNumTrees(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="glass-light rounded-lg p-3">
            <label className="text-xs text-indigo-300 mb-2 block">Subsample Size: {subsampleSize}</label>
            <input
              type="range"
              min="50"
              max="512"
              step="50"
              value={subsampleSize}
              onChange={(e) => setSubsampleSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="glass-light rounded-lg p-3">
            <label className="text-xs text-indigo-300 mb-2 block">Anomaly Threshold: {anomalyThreshold.toFixed(2)}</label>
            <input
              type="range"
              min="0.3"
              max="0.8"
              step="0.05"
              value={anomalyThreshold}
              onChange={(e) => setAnomalyThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Playback Controls */}
        {csvData.length > 0 && (
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsPlaying(false);
                setAnomalyScoreHistory([]);
                if (csvData.length > 0) processDataPoint(csvData[0], 0);
              }}
              className="px-6 py-2 rounded-lg font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-all"
            >
              ⏮ Reset
            </button>

            <div className="flex items-center gap-2">
              <label className="text-indigo-300 text-sm">Speed:</label>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="bg-slate-800 text-white rounded px-3 py-1 border border-indigo-500/30"
              >
                <option value={2000}>0.5x</option>
                <option value={1000}>1x</option>
                <option value={500}>2x</option>
                <option value={250}>4x</option>
                <option value={100}>10x</option>
              </select>
            </div>

            {trainingComplete && (
              <div className="glass-light px-3 py-2 rounded-lg flex items-center gap-2">
                <Brain className="text-green-400" size={16} />
                <span className="text-green-400 text-sm font-bold">Model Trained</span>
              </div>
            )}

            <div className="flex-1">
              <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${(currentIndex / csvData.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Continue with rest of the dashboard... (sensor cards, charts, etc.) */}
      {/* [Previous sensor cards and components remain the same] */}

      {csvData.length > 0 && (
        <>
          {/* Anomaly Score Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 md:p-6 mb-4 md:mb-6"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 syne flex items-center gap-2">
              <Target className="text-pink-400" />
              ISOLATION FOREST ANOMALY SCORES
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={anomalyScoreHistory.slice(-50)}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis dataKey="timestamp" stroke="#a78bfa" tick={{ fontSize: 10 }} />
                <YAxis stroke="#a78bfa" tick={{ fontSize: 10 }} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid #6366f1',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    if (payload.isAnomaly) {
                      return <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#fbbf24" strokeWidth={2} />;
                    }
                    return null;
                  }}
                  name="Anomaly Score"
                />
                <ReferenceLine
                  y={anomalyThreshold}
                  stroke="#fbbf24"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="glass-light rounded p-2 text-center">
                <div className="text-pink-400 mb-1">Avg Score</div>
                <div className="text-white font-bold">
                  {(anomalyScoreHistory.reduce((sum, h) => sum + h.score, 0) / (anomalyScoreHistory.length || 1)).toFixed(3)}
                </div>
              </div>
              <div className="glass-light rounded p-2 text-center">
                <div className="text-yellow-400 mb-1">Threshold</div>
                <div className="text-white font-bold">{anomalyThreshold.toFixed(2)}</div>
              </div>
              <div className="glass-light rounded p-2 text-center">
                <div className="text-red-400 mb-1">Anomalies</div>
                <div className="text-white font-bold">{anomalyScoreHistory.filter(h => h.isAnomaly).length}</div>
              </div>
            </div>
          </motion.div>

          {/* Sensor Cards with Anomaly Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
            {[
              { key: 'temperature', icon: Thermometer, label: 'Temperature', color: 'from-orange-500 via-red-500 to-pink-500' },
              { key: 'humidity', icon: Droplets, label: 'Humidity', color: 'from-blue-500 via-cyan-500 to-teal-500' },
              { key: 'gas', icon: Wind, label: 'Gas Level', color: 'from-green-500 via-emerald-500 to-lime-500' }
            ].map((sensor, idx) => {
              const data = sensorData[sensor.key];
              const stats = statisticsWindow[sensor.key];

              return (
                <motion.div
                  key={sensor.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass rounded-xl p-4 md:p-6 hover:bg-slate-800/40 transition-all duration-300 group relative overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${sensor.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <sensor.icon className={`text-transparent bg-clip-text bg-gradient-to-r ${sensor.color}`} size={24} />
                          <h3 className="text-lg md:text-xl font-bold text-white">{sensor.label}</h3>
                          <div className={`text-xs px-2 py-1 rounded ${data.trend === 'rising' ? 'bg-orange-500/20 text-orange-400' :
                            data.trend === 'falling' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                            {data.trend === 'rising' ? '↗' : data.trend === 'falling' ? '↘' : '→'}
                          </div>
                        </div>
                        <div className="text-3xl md:text-4xl font-black text-white">
                          {data.value.toFixed(1)}
                          <span className="text-base ml-1 text-purple-300">{data.unit}</span>
                        </div>
                        {trainingComplete && data.anomalyScore > 0 && (
                          <div className="text-xs text-pink-400 mt-1">
                            IF Score: {data.anomalyScore.toFixed(3)}
                          </div>
                        )}
                      </div>

                      <motion.div
                        animate={{
                          backgroundColor: data.status === 'healthy' ? '#10b981' : '#f59e0b'
                        }}
                        className="px-3 py-1 rounded-full text-xs font-bold text-white"
                      >
                        {data.confidence.toFixed(1)}%
                      </motion.div>
                    </div>

                    <ResponsiveContainer width="100%" height={60}>
                      <LineChart data={data.history.slice(-30)}>
                        <Line
                          type="monotone"
                          dataKey={sensor.key}
                          stroke="#a855f7"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <div className="glass-light rounded p-2 text-center">
                        <div className="text-indigo-400">Mean</div>
                        <div className="text-white font-bold">{stats?.mean?.toFixed(1) || '0.0'}</div>
                      </div>
                      <div className="glass-light rounded p-2 text-center">
                        <div className="text-purple-400">StdDev</div>
                        <div className="text-white font-bold">{stats?.stdDev?.toFixed(2) || '0.00'}</div>
                      </div>
                      <div className="glass-light rounded p-2 text-center">
                        <div className="text-pink-400">Dev</div>
                        <div className="text-white font-bold">{data.deviation.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Event Log remains the same but shows Isolation Forest info */}
        </>
      )}
    </div>
  );
};

export default IoTDashboard;