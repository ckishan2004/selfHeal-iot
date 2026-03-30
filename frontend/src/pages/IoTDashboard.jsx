import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import {
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Upload,
  Download,
  FileText,
  Brain,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

const IoTDashboard = ({ user, onLogout }) => {
  // ================= FILE / BACKEND STATE =================
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [backendData, setBackendData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);

  // ================= MODEL CONFIG STATE =================
  const [numTrees, setNumTrees] = useState(100);
  const [subsampleSize, setSubsampleSize] = useState(256);
  const [anomalyThreshold, setAnomalyThreshold] = useState(0.5);
  const [detectionMethod, setDetectionMethod] = useState('isolation-forest');
  const [trainingComplete, setTrainingComplete] = useState(false);

  // ================= SYSTEM STATE =================
  const [systemHealth, setSystemHealth] = useState('healthy');
  const [latency, setLatency] = useState(67);
  const [totalDataPoints, setTotalDataPoints] = useState(0);
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [healingSuccessRate, setHealingSuccessRate] = useState(99.2);
  const [healingStage, setHealingStage] = useState(0);
  const [eventLog, setEventLog] = useState([]);
  const [anomalyScoreHistory, setAnomalyScoreHistory] = useState([]);

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

  const [statisticsWindow, setStatisticsWindow] = useState({
    temperature: { mean: 0, stdDev: 0 },
    humidity: { mean: 0, stdDev: 0 },
    gas: { mean: 0, stdDev: 0 }
  });

  // ================= HELPERS =================
  const calculateStatistics = (history, key) => {
    if (!history || history.length === 0) return { mean: 0, stdDev: 0 };

    const values = history
      .map((item) => item[key])
      .filter((v) => typeof v === 'number' && !isNaN(v));

    if (values.length === 0) return { mean: 0, stdDev: 0 };

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  };

  const calculateTrend = (history, key) => {
    if (!history || history.length < 5) return 'stable';

    const recent = history.slice(-5).map((h) => h[key]);
    const first = recent[0];
    const last = recent[recent.length - 1];

    if (!first || isNaN(first) || isNaN(last) || first === 0) return 'stable';

    const change = ((last - first) / first) * 100;

    if (Math.abs(change) < 2) return 'stable';
    return change > 0 ? 'rising' : 'falling';
  };

  const processDataPoint = (snapshot, index) => {
    if (!snapshot) return;

    const tempValue = Number(snapshot.temperature ?? snapshot.temp ?? 0);
    const humidityValue = Number(snapshot.humidity ?? 0);
    const gasValue = Number(snapshot.gas ?? snapshot.gas_level ?? 0);
    const score = Number(snapshot.score ?? snapshot.anomalyScore ?? 0);
    const isAnomaly = Boolean(snapshot.isAnomaly);

    const timestamp =
      snapshot.timestamp || snapshot.time || new Date().toLocaleTimeString();

    const severity = snapshot.severity || 'Normal';
    const anomalyType = snapshot.anomalyType || 'Normal';
    const healingAction = snapshot.healingAction || 'No action needed';

    setSensorData((prev) => {
      const updated = { ...prev };

      const sensorMap = {
        temperature: tempValue,
        humidity: humidityValue,
        gas: gasValue
      };

      Object.keys(sensorMap).forEach((sensorKey) => {
        const value = sensorMap[sensorKey];
        const newHistory = [
          ...updated[sensorKey].history.slice(-49),
          {
            time: index,
            timestamp,
            temperature: tempValue,
            humidity: humidityValue,
            gas: gasValue,
            [sensorKey]: value
          }
        ];

        const stats = calculateStatistics(newHistory, sensorKey);
        const trend = calculateTrend(newHistory, sensorKey);

        updated[sensorKey] = {
          ...updated[sensorKey],
          value,
          history: newHistory,
          trend,
          deviation: Math.abs(value - stats.mean),
          anomalyScore: score,
          status: isAnomaly
            ? severity === 'Critical' || severity === 'High'
              ? 'critical'
              : 'healing'
            : 'healthy'
        };
      });

      return updated;
    });

    setAnomalyScoreHistory((prev) => [
      ...prev,
      {
        time: index,
        timestamp,
        score,
        isAnomaly,
        severity
      }
    ]);

    setTotalDataPoints(index + 1);

    if (isAnomaly) {
      setAnomalyCount((prev) => prev + 1);

      if (severity === 'Critical' || severity === 'High') {
        setSystemHealth('degraded');
      } else {
        setSystemHealth('warning');
      }

      setEventLog((prev) => [
        {
          id: `${index}-${timestamp}`,
          timestamp,
          severity,
          type: anomalyType,
          action: healingAction,
          status:
            severity === 'Critical'
              ? 'critical'
              : severity === 'High'
                ? 'warning'
                : 'monitoring',
          anomalyScore: score,
          sensor: 'multi-sensor'
        },
        ...prev.slice(0, 19)
      ]);

      setHealingStage(1);
      setTimeout(() => setHealingStage(2), 800);
      setTimeout(() => setHealingStage(3), 1600);
      setTimeout(() => {
        setHealingStage(0);
        setSystemHealth('healthy');
      }, 2400);
    } else {
      setHealingStage(0);
    }
  };

  // ================= FILE CHANGE =================
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
  };

  // ================= BACKEND UPLOAD =================
  const uploadCSV = async (fileToUpload) => {
    const selectedFile = fileToUpload || csvFile;

    if (!selectedFile) {
      alert('Please upload a CSV file first');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('detectionMethod', detectionMethod);
      formData.append('numTrees', String(numTrees));
      formData.append('subsampleSize', String(subsampleSize));
      formData.append('anomalyThreshold', String(anomalyThreshold));

      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://selfheal-iot.onrender.com';

      const start = performance.now();

      const res = await fetch(`${API_BASE}/api/upload-csv`, {
        method: 'POST',
        headers: token
          ? {
              Authorization: `Bearer ${token}`
            }
          : {},
        body: formData
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Backend response failed');
      }

      const data = await res.json();
      const end = performance.now();

      setLatency(Math.round(end - start));

      setAnomalyScoreHistory([]);
      setEventLog([]);
      setAnomalyCount(0);
      setTotalDataPoints(0);
      setCurrentIndex(0);
      setIsPlaying(false);

      setBackendData(data);
      setCsvData(data.sensorSnapshots || []);
      setHealingSuccessRate(Number(data.healingSuccessRate || 0));
      setTrainingComplete(Boolean(data.trainingComplete ?? true));

      if ((data.systemHealth ?? 100) >= 95) {
        setSystemHealth('healthy');
      } else if ((data.systemHealth ?? 100) >= 80) {
        setSystemHealth('warning');
      } else {
        setSystemHealth('degraded');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('CSV upload failed. Check backend and login token.');
    }
  };

  // Auto upload when file selected
  useEffect(() => {
    if (csvFile) {
      uploadCSV(csvFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [csvFile]);

  // Playback backend-processed snapshots only
  useEffect(() => {
    if (!isPlaying || !csvData.length) return;

    if (currentIndex >= csvData.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      processDataPoint(csvData[currentIndex], currentIndex);
      setCurrentIndex((prev) => prev + 1);
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, csvData, playbackSpeed]);

  // Statistics update
  useEffect(() => {
    setStatisticsWindow({
      temperature: calculateStatistics(sensorData.temperature.history, 'temperature'),
      humidity: calculateStatistics(sensorData.humidity.history, 'humidity'),
      gas: calculateStatistics(sensorData.gas.history, 'gas')
    });
  }, [sensorData]);

  const exportData = () => {
    const data = {
      events: eventLog,
      anomalyCount,
      healingSuccessRate,
      anomalyScoreHistory
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `isolation-forest-analysis-${Date.now()}.json`;
    a.click();
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
    setAnomalyScoreHistory([]);
    setAnomalyCount(0);
    setTotalDataPoints(0);
    setSystemHealth('healthy');
    setHealingStage(0);
    setEventLog([]);

    setSensorData((prev) => ({
      temperature: {
        ...prev.temperature,
        value: 0,
        history: [],
        deviation: 0,
        trend: 'stable',
        anomalyScore: 0,
        status: 'healthy'
      },
      humidity: {
        ...prev.humidity,
        value: 0,
        history: [],
        deviation: 0,
        trend: 'stable',
        anomalyScore: 0,
        status: 'healthy'
      },
      gas: {
        ...prev.gas,
        value: 0,
        history: [],
        deviation: 0,
        trend: 'stable',
        anomalyScore: 0,
        status: 'healthy'
      }
    }));
  };

  const pulseSpeed =
    systemHealth === 'healthy' ? 2 : systemHealth === 'degraded' ? 0.6 : 1.5;

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
                  SELF-HEAL IoT
                </h1>
                <p className="text-indigo-300">AI-Powered Anomaly Detection Dashboard</p>
                <p className="text-sm text-cyan-300 mt-1">
                  Welcome, {user?.name || user?.email || 'User'}
                </p>
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
                onChange={handleFileUpload}
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
              <div className="text-2xl font-bold text-cyan-400">
                {latency}
                <span className="text-sm">ms</span>
              </div>
            </div>

            <div className="relative">
              <div
                className={`w-16 h-16 rounded-full absolute inset-0 pulse-ring ${
                  systemHealth === 'healthy'
                    ? 'bg-green-400'
                    : systemHealth === 'degraded'
                      ? 'bg-red-400'
                      : 'bg-yellow-400'
                }`}
              ></div>
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center relative ${
                  systemHealth === 'healthy'
                    ? 'bg-green-500 glow-green'
                    : systemHealth === 'degraded'
                      ? 'bg-red-500 glow-red'
                      : 'bg-yellow-500'
                }`}
              >
                <Activity className="text-white" size={32} />
              </div>
            </div>

            <button
              onClick={exportData}
              className="glass-light p-3 rounded-lg hover:bg-purple-600/30 transition-all"
              title="Export data"
            >
              <Download className="text-purple-400" size={20} />
            </button>

            <button
              onClick={onLogout}
              className="glass-light px-4 py-3 rounded-lg hover:bg-red-600/30 transition-all text-white font-bold"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-light rounded-lg p-3">
            <label className="text-xs text-indigo-300 mb-2 block">Detection Method</label>
            <select
              value={detectionMethod}
              onChange={(e) => setDetectionMethod(e.target.value)}
              className="w-full bg-slate-800 text-white rounded px-3 py-2 text-sm border border-indigo-500/30"
            >
              <option value="isolation-forest">Isolation Forest</option>
              <option value="z-score">Z-Score</option>
              <option value="hybrid">Hybrid (IF + Z-Score)</option>
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
            <label className="text-xs text-indigo-300 mb-2 block">
              Anomaly Threshold: {anomalyThreshold.toFixed(2)}
            </label>
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

        {csvData.length > 0 && (
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                isPlaying
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>

            <button
              className="px-6 py-2 rounded-lg font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-all"
              onClick={handleReset}
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
                  style={{
                    width: `${csvData.length ? (currentIndex / csvData.length) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4 md:p-6 mb-4 md:mb-6"
      >
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 syne">
          ANOMALY EVENT LOG
        </h2>

        <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-3">
          {eventLog.length === 0 ? (
            <div className="text-indigo-300 text-sm">No anomaly events detected yet.</div>
          ) : (
            eventLog.map((event, idx) => (
              <div
                key={event.id || idx}
                className="glass-light rounded-lg p-4 border border-indigo-500/20"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <div className="text-white font-bold">{event.type || 'Unknown Anomaly'}</div>
                    <div className="text-xs text-indigo-300">{event.timestamp}</div>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                      event.severity === 'Critical'
                        ? 'bg-red-500/20 text-red-400'
                        : event.severity === 'High'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-yellow-500/20 text-yellow-300'
                    }`}
                  >
                    {event.severity || 'Warning'}
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-200">
                  <span className="text-indigo-300">Healing Action:</span> {event.action}
                </div>

                <div className="mt-1 text-sm text-slate-300">
                  <span className="text-indigo-300">Score:</span>{' '}
                  {Number(event.anomalyScore || 0).toFixed(3)}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {csvData.length > 0 && (
        <>
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
              <ComposedChart data={anomalyScoreHistory.slice(-50)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#a78bfa"
                  tick={{ fontSize: 10 }}
                  minTickGap={20}
                />
                <YAxis
                  stroke="#a78bfa"
                  tick={{ fontSize: 10 }}
                  domain={[0, 1]}
                />
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
                  activeDot={{ r: 6 }}
                  dot={(props) => {
                    const { cx, cy, payload } = props;

                    if (!payload?.isAnomaly) return null;

                    const severity = payload.severity || 'Warning';

                    const fillColor =
                      severity === 'Critical'
                        ? '#ef4444'
                        : severity === 'High'
                          ? '#f97316'
                          : '#eab308';

                    return (
                      <g>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={6}
                          fill={fillColor}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                        <circle
                          cx={cx}
                          cy={cy}
                          r={10}
                          fill="none"
                          stroke={fillColor}
                          strokeWidth={2}
                          opacity={0.45}
                        />
                      </g>
                    );
                  }}
                  name="Anomaly Score"
                />

                <ReferenceLine
                  y={anomalyThreshold}
                  stroke="#fbbf24"
                  strokeDasharray="5 5"
                  label={{ value: 'Threshold', fill: '#fbbf24', fontSize: 12 }}
                />
              </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="glass-light rounded p-2 text-center">
                <div className="text-pink-400 mb-1">Avg Score</div>
                <div className="text-white font-bold">
                  {(
                    anomalyScoreHistory.reduce((sum, h) => sum + (h.score || 0), 0) /
                    (anomalyScoreHistory.length || 1)
                  ).toFixed(3)}
                </div>
              </div>
              <div className="glass-light rounded p-2 text-center">
                <div className="text-yellow-400 mb-1">Threshold</div>
                <div className="text-white font-bold">{anomalyThreshold.toFixed(2)}</div>
              </div>
              <div className="glass-light rounded p-2 text-center">
                <div className="text-red-400 mb-1">Anomalies</div>
                <div className="text-white font-bold">
                  {anomalyScoreHistory.filter((h) => h.isAnomaly).length}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 md:mb-6">
            <div className="glass rounded-xl p-4">
              <div className="text-indigo-300 text-sm mb-1">System Health</div>
              <div className="text-2xl font-bold text-white">
                {backendData?.systemHealth?.toFixed?.(1) ?? '100.0'}%
              </div>
            </div>

            <div className="glass rounded-xl p-4">
              <div className="text-yellow-300 text-sm mb-1">Warnings</div>
              <div className="text-2xl font-bold text-white">
                {backendData?.severitySummary?.warning ?? 0}
              </div>
            </div>

            <div className="glass rounded-xl p-4">
              <div className="text-orange-300 text-sm mb-1">High</div>
              <div className="text-2xl font-bold text-white">
                {backendData?.severitySummary?.high ?? 0}
              </div>
            </div>

            <div className="glass rounded-xl p-4">
              <div className="text-red-300 text-sm mb-1">Critical</div>
              <div className="text-2xl font-bold text-white">
                {backendData?.severitySummary?.critical ?? 0}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
            {[
              {
                key: 'temperature',
                icon: Thermometer,
                label: 'Temperature',
                color: 'from-orange-500 via-red-500 to-pink-500'
              },
              {
                key: 'humidity',
                icon: Droplets,
                label: 'Humidity',
                color: 'from-blue-500 via-cyan-500 to-teal-500'
              },
              {
                key: 'gas',
                icon: Wind,
                label: 'Gas Level',
                color: 'from-green-500 via-emerald-500 to-lime-500'
              }
            ].map((sensor, idx) => {
              const data = sensorData[sensor.key];
              const stats = statisticsWindow[sensor.key];
              const IconComponent = sensor.icon;

              return (
                <motion.div
                  key={sensor.key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass rounded-xl p-4 md:p-6 hover:bg-slate-800/40 transition-all duration-300 group relative overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${sensor.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                  ></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="text-purple-400" size={24} />
                          <h3 className="text-lg md:text-xl font-bold text-white">
                            {sensor.label}
                          </h3>
                          <div
                            className={`text-xs px-2 py-1 rounded ${
                              data.trend === 'rising'
                                ? 'bg-orange-500/20 text-orange-400'
                                : data.trend === 'falling'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {data.trend === 'rising'
                              ? '↗'
                              : data.trend === 'falling'
                                ? '↘'
                                : '→'}
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
                          backgroundColor:
                            data.status === 'healthy' ? '#10b981' : '#f59e0b'
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
                        <div className="text-white font-bold">
                          {stats?.mean?.toFixed(1) || '0.0'}
                        </div>
                      </div>
                      <div className="glass-light rounded p-2 text-center">
                        <div className="text-purple-400">StdDev</div>
                        <div className="text-white font-bold">
                          {stats?.stdDev?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                      <div className="glass-light rounded p-2 text-center">
                        <div className="text-pink-400">Dev</div>
                        <div className="text-white font-bold">
                          {data.deviation.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default IoTDashboard;