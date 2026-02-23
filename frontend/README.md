# 🌐 Self-Healing IoT Dashboard - Complete Frontend Project

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.8-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.0-cyan)

> **AI-Driven Autonomous Recovery System for Real-Time IoT Sensor Monitoring**

---

## ⚡ Quick Start (Open in VS Code)

### Step 1: Open This Folder

```bash
code .
```

### Step 2: Install Dependencies

Open terminal (Ctrl+`) and run:

```bash
npm install
```

### Step 3: Start Development

```bash
npm run dev
```

**Dashboard opens at: `http://localhost:3000`** 🎉

---

## 📦 This Folder Contains Everything

```
Self-Healing-IoT-Dashboard/
├── src/                 # All source code
├── public/              # Static assets
├── Configuration files  # Vite, Tailwind, ESLint
├── Documentation        # Guides and architecture
└── index.html          # Entry point
```

**Complete React frontend - Just open in VS Code and run!**

---

## 🎯 Key Features

✅ Real-time sensor monitoring (Temperature, Humidity, Gas)  
✅ AI anomaly detection with Z-score analysis  
✅ Autonomous self-healing with 5 ML algorithms  
✅ Network topology visualization (8 nodes)  
✅ Performance metrics and analytics  
✅ Event logging with metadata  
✅ Data export (JSON, CSV)  
✅ Beautiful glassmorphism UI  
✅ Fully responsive design  

---

## 🔌 Connect Your Sensors

Edit `src/services/sensorService.js`:

```javascript
// WebSocket
connectWebSocket('ws://your-server.com/sensors', ...)

// Data format
{
  "temperature": 23.5,
  "humidity": 47.2,
  "gas": 315,
  "timestamp": 1234567890
}
```

**See `QUICK_START.md` for full setup guide**

---

## 📚 Documentation

- **README.md** (this file): Overview
- **QUICK_START.md**: Step-by-step setup
- **PROJECT_STRUCTURE.md**: Architecture details

---

## 🛠️ Commands

```bash
npm run dev      # Start development
npm run build    # Build for production
npm run preview  # Preview production
npm run lint     # Check code quality
```

---

## 🎨 Tech Stack

- React 18 + Vite
- Tailwind CSS
- Recharts (charts)
- Framer Motion (animations)
- Lucide React (icons)

---

**Ready to run! Just `npm install` and `npm run dev`** 🚀
