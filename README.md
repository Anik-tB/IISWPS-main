# Intelligent Industrial Safety & Workflow Prediction System (IISWPS)

<div align="center">

![Industrial Safety](https://img.shields.io/badge/Industrial-Safety-blue?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-Powered-green?style=for-the-badge)
![Real-time](https://img.shields.io/badge/Real--time-Monitoring-orange?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript)

**AI-powered industrial safety monitoring and prediction system with real-time analytics**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [AI Algorithms](#-ai-algorithms)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Screenshots](#-screenshots)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The **Intelligent Industrial Safety & Workflow Prediction System (IISWPS)** is a comprehensive full-stack application designed to monitor, predict, and optimize industrial safety operations in real-time. It combines **8 advanced AI algorithms** with modern web technologies to provide actionable insights for industrial safety management.

### Key Capabilities

- 🔴 **Real-time Monitoring**: Live sensor data tracking with WebSocket integration
- 🤖 **AI Predictions**: Machine learning models for accident probability and risk classification
- 🗺️ **Route Planning**: A* algorithm for optimal escape route planning
- ⚙️ **Optimization**: Hill climbing algorithm for machine parameter optimization
- 📊 **Clustering**: K-Means clustering for sensor grouping and anomaly detection
- 📈 **Analytics**: Advanced trend analysis and statistical insights
- 🚨 **Alert System**: Multi-level threshold-based alerting (info/warning/critical)
- 🎨 **Modern UI**: Glassmorphism design with dark mode support

---

## ✨ Features

### 🎛️ Dashboard
- **Real-time sensor monitoring** with live updates (6 industrial sensors)
- **Interactive factory floor visualization** with sensor positioning
- **Comprehensive statistics and KPIs** (total readings, predictions, risk classifications)
- **Historical data charts and trends** with Recharts integration
- **WebSocket-based live data streaming** (updates every 5 seconds)
- **Data export functionality** (CSV, JSON, Print)
- **Enhanced table interactions** with hover effects and sorting
- **Breadcrumb navigation** for better UX
- **Professional glassmorphism design** with gradient backgrounds
- **Connection status indicators** (WebSocket health monitoring)

### 🧠 AI-Powered Predictions
- **Accident Probability**: Logistic regression-based prediction (0.0 to 1.0)
- **Risk Classification**: KNN-based risk level assessment (Low/Medium/High)
- **Feature Importance**: Understanding which factors contribute most to risk
- **Uncertainty Estimation**: Confidence scores for predictions
- **Real-time predictions** for all 6 sensors
- **Historical prediction tracking** in database

### 🗺️ Route Planner
- **A* pathfinding algorithm** for escape routes
- **Multi-objective optimization** (distance + safety)
- **Risk-weighted path calculation** with customizable safety weights
- **Interactive grid editor** (10x10 to 50x50 grids)
- **Route comparison** (shortest vs. safest)
- **Visual path highlighting** on factory floor
- **Blocked cell and risk zone marking**
- **Path metrics** (length, cost, risk score)

### ⚙️ Machine Optimizer
- **Hill climbing optimization** for safety parameters
- **Constraint-based parameter adjustment** (temperature, vibration, load)
- **Real-time safety score calculation** (0.0 to 1.0)
- **Optimization history tracking** with database persistence
- **Visual optimization progress** with before/after comparison
- **Customizable constraints** per parameter
- **Convergence tracking** and iteration count

### 📊 Cluster Analysis
- **K-Means clustering** for sensor grouping
- **Automatic optimal cluster determination** (Elbow Method)
- **Anomaly detection and identification** (outlier sensors)
- **Maintenance scheduling recommendations** with priority levels
- **Risk zone identification** (Low/Medium/High risk clusters)
- **Interactive cluster visualization** with scatter plots
- **Silhouette score** for cluster quality assessment
- **Cluster comparison charts** (bar, pie, radar charts)
- **Detailed cluster statistics** (mean, std, min, max per metric)
- **Actionable recommendations** per cluster

### 🔔 Alert System
- **Customizable threshold management** per sensor metric
- **Multi-level alerts** (info/warning/critical)
- **Real-time alert notifications** with toast messages
- **Alert summary and statistics** dashboard
- **Threshold-based triggering** for temperature, vibration, RPM, load

### 📈 Analytics Engine
- **Trend analysis** with moving averages
- **Anomaly detection** using Z-score method
- **Comprehensive statistics** (mean, median, std, percentiles)
- **Correlation analysis** between sensor metrics
- **Maintenance prediction** with severity levels
- **Time-series analysis** for historical data

### 🎨 Enhanced User Interface
- **Toast Notifications**: Success, error, warning, and info messages
- **Loading States**: Spinners, overlays, and skeleton screens
- **Modal Dialogs**: Reusable modals with confirmation variants
- **Tooltips**: Context-sensitive help system
- **Responsive Design**: Mobile-friendly interface
- **Dark Mode**: Persistent theme preference with localStorage
- **Accessibility**: Keyboard navigation and ARIA labels
- **Error Boundaries**: Graceful error handling
- **Breadcrumb Navigation**: Clear page hierarchy
- **Glassmorphism Effects**: Modern frosted glass design
- **Gradient Backgrounds**: Dynamic color schemes
- **Smooth Animations**: Transitions and hover effects

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.8+)
- **ML Libraries**: scikit-learn, NumPy
- **Database**: MySQL 8.0+ / MariaDB
- **Real-time**: WebSocket (native FastAPI)
- **Environment**: python-dotenv
- **Model Persistence**: joblib
- **Database Connector**: mysql-connector-python
- **ASGI Server**: Uvicorn with standard extras

### Frontend
- **Framework**: React 18.2
- **Language**: TypeScript 5.2
- **Build Tool**: Vite 5.0
- **Styling**: TailwindCSS 3.3
- **State Management**: Zustand 4.4
- **Charts**: Recharts 2.10
- **Maps**: Leaflet 1.9 + React Leaflet 4.2
- **HTTP Client**: Axios 1.6
- **Icons**: Lucide React 0.294
- **Routing**: React Router DOM 6.20
- **Utilities**: clsx, tailwind-merge

### Database
- **RDBMS**: MySQL 8.0+ / MariaDB 10.x
- **Tables**: 5 (sensor_readings, accident_predictions, risk_classifications, machine_optimizations, escape_routes)
- **Indexing**: Optimized indexes on timestamps and IDs
- **Data Volume**: Supports 12,000+ sensor readings with realistic historical data

---

## 📁 Project Structure

```
IISWPS-main/
├── backend/                           # FastAPI Backend
│   ├── ai/                           # AI Algorithm Implementations
│   │   ├── a_star.py                # A* Pathfinding Algorithm (13.5 KB)
│   │   ├── alerts.py                # Alert System (6.5 KB)
│   │   ├── analytics.py             # Analytics Engine (13 KB)
│   │   ├── hill_climb.py            # Hill Climbing Optimizer (7 KB)
│   │   ├── kmeans.py                # K-Means Clustering (19 KB)
│   │   ├── knn.py                   # K-Nearest Neighbors Classifier (5.8 KB)
│   │   ├── logistic.py              # Logistic Regression Predictor (5 KB)
│   │   └── ml_enhanced.py           # Enhanced ML Features (8.9 KB)
│   ├── database/                    # Database Module
│   │   ├── connection.py            # Database Connection & Utilities (4 KB)
│   │   └── schema.sql               # Database Schema (5 tables)
│   ├── models/                      # Trained ML Models
│   │   ├── knn_model.joblib        # Trained KNN model
│   │   ├── logistic_model.joblib   # Trained Logistic Regression model
│   │   └── model_loader.py         # Model loading utilities
│   ├── main.py                      # FastAPI Application (1267 lines, 44 KB)
│   ├── train_models.py              # Model Training Script
│   ├── setup_database.py            # Database Setup Script (137 lines)
│   ├── populate_realistic_data.py   # Realistic Data Population (330 lines)
│   ├── requirements.txt             # Python Dependencies (13 packages)
│   ├── .env                         # Environment Variables
│   └── venv/                        # Python Virtual Environment
│
├── frontend/                         # React Frontend
│   ├── src/
│   │   ├── api/                     # API Client Functions
│   │   │   ├── client.ts           # Base Axios client
│   │   │   ├── clustering.ts       # Clustering API calls
│   │   │   ├── optimizer.ts        # Optimizer API calls
│   │   │   ├── prediction.ts       # Prediction API calls
│   │   │   └── routing.ts          # Routing API calls
│   │   ├── components/              # Reusable Components
│   │   │   ├── Breadcrumbs.tsx     # Navigation breadcrumbs
│   │   │   ├── ClusterVisualization.tsx  # Cluster scatter plots (14 KB)
│   │   │   ├── ErrorBoundary.tsx   # Error handling boundary
│   │   │   ├── FactoryFloor.tsx    # Factory floor visualization (28 KB)
│   │   │   ├── Gauge.tsx           # Circular gauge component
│   │   │   ├── Layout.tsx          # Main layout with sidebar (8 KB)
│   │   │   ├── LoadingSpinner.tsx  # Loading indicators
│   │   │   ├── Modal.tsx           # Modal dialog component
│   │   │   ├── Toast.tsx           # Toast notification component
│   │   │   ├── ToastContainer.tsx  # Toast container
│   │   │   └── Tooltip.tsx         # Tooltip component
│   │   ├── hooks/                   # Custom React Hooks
│   │   │   └── useToast.ts         # Toast notification hook
│   │   ├── utils/                   # Utility Functions
│   │   │   └── export.ts           # Data export utilities (CSV, JSON)
│   │   ├── pages/                   # Page Components
│   │   │   ├── ClusterAnalysis.tsx # Cluster analysis page (1519 lines, 71 KB)
│   │   │   ├── Dashboard.tsx       # Main dashboard (844 lines, 36 KB)
│   │   │   ├── Optimizer.tsx       # Machine optimizer page (22 KB)
│   │   │   ├── RiskClassifier.tsx  # Risk classification page (21 KB)
│   │   │   └── RoutePlanner.tsx    # Route planning page (20 KB)
│   │   ├── store/                   # State Management
│   │   │   └── useAppStore.ts      # Zustand global store
│   │   ├── App.tsx                  # Main App Component
│   │   ├── main.tsx                 # Entry Point
│   │   └── index.css                # Global Styles (16 KB, 630+ lines)
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # NPM dependencies
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.js           # TailwindCSS configuration
│   ├── tsconfig.json                # TypeScript configuration
│   └── node_modules/                # NPM packages
│
├── README.md                         # This file
├── QUICKSTART.md                     # Quick start guide (CachyOS/Arch Linux)
├── ALGORITHM_DATA_SAMPLES.md         # AI algorithm data samples
├── .gitignore                        # Git ignore rules
└── .gitattributes                    # Git attributes
```

---

## 🚀 Installation

### Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16.x or higher
- **MySQL**: 8.0 or higher (or MariaDB 10.x)
- **npm** or **yarn**
- **Git** (for cloning)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**

   Create a `.env` file in the `backend` directory:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=industrial_safety
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   ```

5. **Setup database**
   ```bash
   python setup_database.py
   ```

   This will:
   - Create the `industrial_safety` database
   - Create all 5 required tables
   - Set up indexes for optimal performance

6. **Train ML models**
   ```bash
   python train_models.py
   ```

   This will:
   - Train KNN classifier for risk classification
   - Train Logistic Regression for accident prediction
   - Save models to `models/` directory

7. **Populate database with realistic industrial data** (Optional but recommended)
   ```bash
   python populate_realistic_data.py
   ```

   This will generate:
   - **12,000+ sensor readings** from 6 industrial sensors
   - **7 days of historical data** with realistic patterns
   - **Time-based variations** (shift patterns, day/night cycles)
   - **Anomaly detection samples** for testing
   - **100+ predictions** with risk levels
   - **100+ risk classifications** with confidence scores
   - **50+ machine optimizations** with safety scores

8. **Start the backend server**
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

### Quick Start (All-in-One for Linux)

For CachyOS/Arch Linux users, see [QUICKSTART.md](QUICKSTART.md) for streamlined setup instructions.

---

## 💻 Usage

### Accessing the Application

1. **Start Backend**: `cd backend && python main.py`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:5173`

### Main Features

#### 1. Dashboard
- View **real-time sensor data** from 6 industrial sensors
- Monitor **accident probabilities** with live predictions
- Track **risk classifications** (Low/Medium/High)
- Analyze **trends and statistics** with interactive charts
- **Export data** to CSV or JSON formats
- **WebSocket connection** shows live updates every 5 seconds

#### 2. Route Planner
- Create **custom factory floor grids** (10x10 to 50x50)
- Set **start and goal positions** for escape routes
- Mark **blocked areas** and **risk zones**
- Calculate **optimal escape routes** using A* algorithm
- Compare **different routing strategies** (shortest vs. safest)
- Adjust **safety weight** (0.0 to 1.0) for risk-aware pathfinding

#### 3. Machine Optimizer
- Input **current machine parameters** (temperature, vibration, load)
- Set **optimization constraints** per parameter
- Run **hill climbing optimization** to maximize safety score
- View **optimization history** with iteration tracking
- Apply **optimized parameters** to improve safety
- Track **convergence** and improvement metrics

#### 4. Risk Classifier
- Input **sensor readings** (temperature, vibration, RPM, load)
- Get **risk classification** (Low/Medium/High)
- View **confidence scores** for predictions
- Analyze **feature importance** to understand risk factors
- Save classifications to database for historical tracking

#### 5. Cluster Analysis
- **Cluster sensors** by behavior patterns (automatic or manual cluster count)
- Identify **anomalies** (sensors far from cluster centers)
- Schedule **maintenance** based on cluster risk levels
- Visualize **risk zones** on factory floor
- Export **cluster reports** with detailed statistics
- View **cluster comparison charts** (bar, pie, radar)
- Get **actionable recommendations** per cluster

---

## 🤖 AI Algorithms

### 1. K-Means Clustering (`kmeans.py`)
**Purpose**: Sensor grouping, anomaly detection, maintenance scheduling

**Features**:
- Automatic optimal cluster determination (Elbow Method)
- Silhouette score for cluster quality (range: -1 to 1)
- Anomaly detection (outlier identification using distance thresholds)
- Risk level assessment per cluster (Low/Medium/High)
- Maintenance recommendations based on cluster characteristics

**Use Cases**:
- Group sensors with similar behavior patterns
- Identify malfunctioning sensors (anomalies)
- Schedule preventive maintenance by priority
- Map risk zones on factory floor

**Implementation**: 528 lines, 19 KB
- `cluster_sensors()`: Main clustering function
- `cluster_maintenance_zones()`: Maintenance priority grouping
- `cluster_risk_zones()`: Factory floor risk mapping
- `_determine_optimal_clusters()`: Elbow method implementation
- `_identify_anomalies()`: Outlier detection

### 2. K-Nearest Neighbors (`knn.py`)
**Purpose**: Risk classification for workers and machines

**Features**:
- 3-class classification (Low/Medium/High risk)
- Distance-weighted voting for better accuracy
- Confidence score calculation (0.0 to 1.0)
- Pre-trained model support with joblib
- Synthetic data generation for training

**Input**: Temperature, Vibration, RPM, Load
**Output**: Risk class + Confidence score

**Implementation**: 5.8 KB
- Default k=5 neighbors
- StandardScaler for feature normalization
- Model persistence with save/load functions

### 3. Logistic Regression (`logistic.py`)
**Purpose**: Accident probability prediction

**Features**:
- Binary classification with probability output
- Feature scaling with StandardScaler
- Synthetic data generation for training (1000 samples)
- Model persistence with joblib
- Risk level categorization (LOW/MEDIUM/HIGH)

**Input**: Temperature, Vibration, RPM, Load
**Output**: Accident probability (0.0 to 1.0)

**Implementation**: 5 KB
- Thresholds: <0.3 (LOW), 0.3-0.7 (MEDIUM), >0.7 (HIGH)
- Trained on realistic industrial data patterns

### 4. A* Pathfinding (`a_star.py`)
**Purpose**: Optimal escape route planning

**Features**:
- Multi-objective optimization (distance + safety)
- Risk-weighted pathfinding with customizable weights
- Diagonal movement support (8 directions)
- Route comparison (shortest vs. safest)
- Customizable safety weights (0.0 to 1.0)
- Path metrics (length, cost, risk score)

**Input**: Grid, Start, Goal, Risk Map, Blocked Cells
**Output**: Optimal path with cost and risk metrics

**Implementation**: 13.5 KB
- Heuristic: Euclidean distance
- Cost function: distance + (safety_weight × risk)
- Supports grids up to 50x50

### 5. Hill Climbing (`hill_climb.py`)
**Purpose**: Machine safety parameter optimization

**Features**:
- Constraint-based optimization (min/max bounds)
- Random neighbor generation with step sizes
- Convergence tracking (max 1000 iterations)
- Optimization history with iteration logs
- Safety score maximization (0.0 to 1.0)

**Input**: Initial parameters (Temperature, Vibration, Load)
**Output**: Optimized parameters + Safety score

**Implementation**: 7 KB
- Default constraints: Temp [60-90°F], Vibration [2-6], Load [0.3-0.8]
- Step sizes: Temp ±2°F, Vibration ±0.2, Load ±0.05
- Safety score based on distance from danger thresholds

### 6. Analytics Engine (`analytics.py`)
**Purpose**: Trend analysis and statistical insights

**Features**:
- Moving average calculation (customizable window)
- Anomaly detection (Z-score method, threshold: 2.0 std)
- Comprehensive statistics (mean, median, std, min, max, percentiles)
- Correlation analysis between metrics
- Maintenance prediction with severity levels

**Implementation**: 13 KB, 328 lines
- `calculate_trends()`: Time-series trend analysis
- `detect_anomalies()`: Statistical anomaly detection
- `calculate_statistics()`: Descriptive statistics
- `predict_maintenance()`: Predictive maintenance
- `calculate_correlation()`: Correlation matrix

### 7. Alert System (`alerts.py`)
**Purpose**: Threshold-based alerting

**Features**:
- Customizable thresholds per metric
- Multi-level alerts (info/warning/critical)
- Alert summary and statistics
- Human-readable alert messages

**Implementation**: 6.5 KB
- Default thresholds: Temp (70/85/95°F), Vibration (3/5/7), RPM (1100/1300/1500), Load (0.6/0.75/0.9)
- Alert levels: INFO (green), WARNING (yellow), CRITICAL (red)

### 8. ML Enhanced (`ml_enhanced.py`)
**Purpose**: Advanced ML features

**Features**:
- Feature importance calculation (permutation-based)
- Prediction uncertainty estimation
- Model confidence scoring
- Enhanced prediction with metadata

**Implementation**: 8.9 KB
- Integrates with KNN and Logistic Regression models
- Provides explainability for predictions

---

## 📡 API Documentation

### Core Endpoints

#### Health Check
```http
GET /
GET /health
```
Returns API status and database connection health.

#### Predictions

**Accident Probability**
```http
POST /predict/accident
Content-Type: application/json

{
  "temperature": 75.0,
  "vibration": 4.2,
  "rpm": 1200,
  "load": 0.65
}
```
Response:
```json
{
  "accident_probability": 0.73,
  "risk_level": "HIGH",
  "feature_importance": {
    "temperature": 0.25,
    "vibration": 0.35,
    "rpm": 0.20,
    "load": 0.20
  },
  "uncertainty": {
    "confidence": 0.85,
    "margin": 0.15
  }
}
```

**Risk Classification**
```http
POST /predict/risk
Content-Type: application/json

{
  "temperature": 75.0,
  "vibration": 4.2,
  "rpm": 1200,
  "load": 0.65
}
```
Response:
```json
{
  "risk_class": "MEDIUM",
  "confidence": 0.78,
  "probabilities": {
    "LOW": 0.15,
    "MEDIUM": 0.78,
    "HIGH": 0.07
  }
}
```

#### Route Planning
```http
POST /route/astar
Content-Type: application/json

{
  "grid": [[0,0,0], [0,1,0], [0,0,0]],
  "start": [0, 0],
  "goal": [2, 2],
  "blocked": [[1, 1]],
  "risk_map": [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]],
  "safety_weight": 0.5
}
```
Response:
```json
{
  "path": [[0,0], [1,0], [2,0], [2,1], [2,2]],
  "cost": 12.5,
  "risk": 2.3,
  "length": 5,
  "metadata": {
    "algorithm": "A*",
    "safety_weight": 0.5
  }
}
```

#### Machine Optimization
```http
POST /optimize/machine
Content-Type: application/json

{
  "temperature": 80.0,
  "vibration": 5.0,
  "load": 0.7,
  "constraints": {
    "temperature": [60, 90],
    "vibration": [2.0, 6.0]
  },
  "track_history": true
}
```
Response:
```json
{
  "optimized": {
    "temperature": 72.0,
    "vibration": 2.8,
    "load": 0.55
  },
  "safety_score": 0.92,
  "metadata": {
    "iterations": 45,
    "converged": true,
    "improvement": 0.47
  }
}
```

#### Live Sensor Data
```http
GET /sensors/live
```
Returns current readings from all 6 sensors.

#### WebSocket (Real-time Updates)
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/sensors');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Live sensor data:', data.sensors);
};
```
Broadcasts sensor data every 5 seconds.

#### Historical Data

**Sensor History**
```http
GET /data/sensor-history?sensor_id=SENSOR_1&hours=24&limit=100
```

**Predictions History**
```http
GET /data/predictions?risk_level=HIGH&hours=24
```

**Risk Classifications**
```http
GET /data/risk-classifications?risk_class=HIGH
```

**Optimizations**
```http
GET /data/optimizations?hours=24
```

**Escape Routes**
```http
GET /data/escape-routes?hours=24
```

**Dashboard Stats**
```http
GET /data/dashboard-stats
```
Returns aggregate statistics for dashboard.

#### Clustering

**Cluster Sensors**
```http
POST /cluster/sensors
Content-Type: application/json

{
  "sensor_data": [...],
  "n_clusters": 3,
  "features": ["temperature", "vibration", "rpm", "load"]
}
```

**Maintenance Zones**
```http
POST /cluster/maintenance-zones
```

**Risk Zones**
```http
POST /cluster/risk-zones
```

### API Documentation URLs

Once the backend is running:
- **Swagger UI**: `http://localhost:8000/docs` (interactive API testing)
- **ReDoc**: `http://localhost:8000/redoc` (clean documentation)

---

## 🗄️ Database Schema

### Tables

#### 1. sensor_readings
Stores real-time and historical sensor data.

```sql
CREATE TABLE sensor_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id VARCHAR(50) NOT NULL,
    temperature FLOAT NOT NULL,
    vibration FLOAT NOT NULL,
    rpm INT NOT NULL,
    `load` FLOAT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sensor_id (sensor_id),
    INDEX idx_timestamp (timestamp)
);
```

**Sample Data**: 12,000+ records (7 days of history)

#### 2. accident_predictions
Stores accident probability predictions.

```sql
CREATE TABLE accident_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temperature FLOAT NOT NULL,
    vibration FLOAT NOT NULL,
    rpm INT NOT NULL,
    `load` FLOAT NOT NULL,
    accident_probability FLOAT NOT NULL,
    risk_level VARCHAR(20),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp),
    INDEX idx_risk_level (risk_level)
);
```

**Risk Levels**: LOW (<0.3), MEDIUM (0.3-0.7), HIGH (>0.7)

#### 3. risk_classifications
Stores KNN-based risk classifications.

```sql
CREATE TABLE risk_classifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    temperature FLOAT NOT NULL,
    vibration FLOAT NOT NULL,
    rpm INT NOT NULL,
    `load` FLOAT NOT NULL,
    risk_class VARCHAR(20) NOT NULL,
    confidence FLOAT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_risk_class (risk_class),
    INDEX idx_timestamp (timestamp)
);
```

**Risk Classes**: LOW, MEDIUM, HIGH

#### 4. machine_optimizations
Stores hill climbing optimization results.

```sql
CREATE TABLE machine_optimizations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    initial_temperature FLOAT NOT NULL,
    initial_vibration FLOAT NOT NULL,
    initial_load FLOAT NOT NULL,
    optimized_temperature FLOAT NOT NULL,
    optimized_vibration FLOAT NOT NULL,
    optimized_load FLOAT NOT NULL,
    safety_score FLOAT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp)
);
```

#### 5. escape_routes
Stores A* pathfinding results.

```sql
CREATE TABLE escape_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_x INT NOT NULL,
    start_y INT NOT NULL,
    goal_x INT NOT NULL,
    goal_y INT NOT NULL,
    path_length INT NOT NULL,
    path_cost FLOAT NOT NULL,
    path_coordinates TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp)
);
```

---

## 🎨 Screenshots

### 📹 Video Demo

Watch the full system demonstration on YouTube:

[![IISWPS Video Demo](https://img.shields.io/badge/▶️-Watch%20Demo-red?style=for-the-badge&logo=youtube)](https://youtu.be/avzAtd8szAU)

🎥 **[Click here to watch the video demo](https://youtu.be/avzAtd8szAU)**

---

### Dashboard
Real-time monitoring with live sensor data, factory floor visualization, and comprehensive statistics.

**Features Shown**:
- 6 sensor cards with live metrics
- Factory floor with sensor positions
- Real-time charts (line, bar, area)
- WebSocket connection status
- Export buttons (CSV, JSON, Print)

![Dashboard Screenshot](/home/anik/Documents/IISWPS-main/Screenshot/1.jpeg)

---

### Cluster Analysis
K-Means clustering visualization with interactive cluster management and maintenance scheduling.

**Features Shown**:
- Cluster scatter plot (temperature vs. vibration)
- Cluster comparison charts (bar, pie, radar)
- Anomaly detection highlights
- Maintenance schedule table
- Cluster statistics cards

![Cluster Analysis Screenshot](/home/anik/Documents/IISWPS-main/Screenshot/2.jpeg)

---

### Route Planner
A* pathfinding with interactive grid editor and route comparison.

**Features Shown**:
- Interactive grid (click to toggle blocked/risk cells)
- Start/goal position markers
- Calculated path visualization
- Route metrics (length, cost, risk)
- Safety weight slider

![Route Planner Screenshot](/home/anik/Documents/IISWPS-main/Screenshot/3.jpeg)

---

### Machine Optimizer
Hill climbing optimization with real-time safety score calculation and optimization history.

**Features Shown**:
- Parameter input sliders
- Constraint configuration
- Optimization progress
- Before/after comparison
- Safety score gauge

![Machine Optimizer Screenshot](/home/anik/Documents/IISWPS-main/Screenshot/4.jpeg)

---

### Additional Features

![Additional Features Screenshot](/home/anik/Documents/IISWPS-main/Screenshot/5.jpeg)

---

## 🔧 Configuration

### Backend Configuration (`.env`)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=industrial_safety
DB_USER=root
DB_PASSWORD=your_password

# API Configuration (optional)
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend Configuration
The frontend uses Vite's environment variables. Create `.env` in frontend directory:
```env
VITE_API_URL=http://localhost:8000
```

### Sensor Configuration
Edit `backend/populate_realistic_data.py` to customize sensor parameters:
```python
SENSOR_CONFIGS = {
    'SENSOR_1': {
        'location': {'x': 100, 'y': 100},
        'temp_range': (65, 95),
        'vibration_range': (2.0, 7.0),
        # ... more configs
    }
}
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Manual Testing
1. **WebSocket**: Check browser console for live updates
2. **Database**: Query tables to verify data persistence
3. **API**: Use Swagger UI at `http://localhost:8000/docs`

---

## 📦 Building for Production

### Backend
```bash
cd backend
# The backend runs directly with Python
python main.py
```

For production deployment, use a production ASGI server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

Serve with a static file server:
```bash
npm run preview
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- **Backend**: Follow PEP 8 for Python code
- **Frontend**: Follow TypeScript and React best practices
- **Commits**: Use conventional commit messages
- **Documentation**: Update README for new features

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Anik** - *Initial work and development*

---

## 🙏 Acknowledgments

- **FastAPI** for the excellent Python web framework
- **React** team for the amazing frontend library
- **scikit-learn** for machine learning algorithms
- **TailwindCSS** for beautiful styling utilities
- **Recharts** for powerful charting components
- **Leaflet** for interactive maps
- All open-source contributors

---

## 📞 Support

For support, open an issue in the repository or refer to:
- [QUICKSTART.md](QUICKSTART.md) - Quick setup guide
- [ALGORITHM_DATA_SAMPLES.md](ALGORITHM_DATA_SAMPLES.md) - AI algorithm examples
- API Documentation: `http://localhost:8000/docs`

---

## 🗺️ Roadmap

### Planned Features
- [ ] User authentication and authorization (JWT)
- [ ] Role-based access control (Admin, Operator, Viewer)
- [ ] Email/SMS notifications for critical alerts
- [ ] Integration with real IoT sensors (MQTT, Modbus)
- [ ] Mobile application (React Native)
- [ ] Advanced ML models (LSTM, Random Forest, XGBoost)
- [ ] Multi-language support (i18n)
- [ ] Admin dashboard for system configuration
- [ ] PDF report generation
- [ ] Automated testing suite (pytest, Jest)
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] CI/CD pipeline (GitHub Actions)

### Completed Features
- [x] Real-time WebSocket monitoring
- [x] 8 AI algorithms (KNN, K-Means, Logistic, A*, Hill Climbing, Analytics, Alerts, ML Enhanced)
- [x] Interactive dashboard with charts
- [x] Cluster analysis with visualizations
- [x] Route planning with A* algorithm
- [x] Machine parameter optimization
- [x] Data export (CSV, JSON)
- [x] Dark mode support
- [x] Responsive design
- [x] Database persistence (MySQL)
- [x] Realistic data population

---

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Backend**: ~5,000 lines (Python)
- **Frontend**: ~10,000 lines (TypeScript/TSX)
- **AI Algorithms**: 8 implementations
- **Database Tables**: 5 tables
- **API Endpoints**: 25+ endpoints
- **React Components**: 16 components
- **Pages**: 5 main pages
- **Dependencies**: 13 backend, 23 frontend

---

<div align="center">

**Made with ❤️ for Industrial Safety**

⭐ Star this repo if you find it helpful!

**[Back to Top](#intelligent-industrial-safety--workflow-prediction-system-iiswps)**

</div>
