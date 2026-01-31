# Intelligent Industrial Safety & Workflow Prediction System (IISWPS)

<div align="center">

![Industrial Safety](https://img.shields.io/badge/Industrial-Safety-blue?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-Powered-green?style=for-the-badge)
![Real-time](https://img.shields.io/badge/Real--time-Monitoring-orange?style=for-the-badge)

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
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The **Intelligent Industrial Safety & Workflow Prediction System** is a comprehensive full-stack application designed to monitor, predict, and optimize industrial safety operations in real-time. It combines advanced AI algorithms with modern web technologies to provide actionable insights for industrial safety management.

### Key Capabilities

- 🔴 **Real-time Monitoring**: Live sensor data tracking with WebSocket integration
- 🤖 **AI Predictions**: Machine learning models for accident probability and risk classification
- 🗺️ **Route Planning**: A* algorithm for optimal escape route planning
- ⚙️ **Optimization**: Hill climbing algorithm for machine parameter optimization
- 📊 **Clustering**: K-Means clustering for sensor grouping and anomaly detection
- 📈 **Analytics**: Advanced trend analysis and statistical insights
- 🚨 **Alert System**: Multi-level threshold-based alerting (info/warning/critical)

---

## ✨ Features

### 🎛️ Dashboard
- Real-time sensor monitoring with live updates (6 industrial sensors)
- Interactive factory floor visualization
- Comprehensive statistics and KPIs
- Historical data charts and trends
- WebSocket-based live data streaming
- **NEW**: Data export functionality (CSV, JSON, Print)
- **NEW**: Enhanced table interactions with hover effects
- **NEW**: Breadcrumb navigation
- **NEW**: Professional glassmorphism design

### 🧠 AI-Powered Predictions
- **Accident Probability**: Logistic regression-based prediction
- **Risk Classification**: KNN-based risk level assessment (Low/Medium/High)
- **Feature Importance**: Understanding which factors contribute most to risk
- **Uncertainty Estimation**: Confidence scores for predictions

### 🗺️ Route Planner
- A* pathfinding algorithm for escape routes
- Multi-objective optimization (distance + safety)
- Risk-weighted path calculation
- Interactive grid editor
- Route comparison (shortest vs. safest)

### ⚙️ Machine Optimizer
- Hill climbing optimization for safety parameters
- Constraint-based parameter adjustment
- Real-time safety score calculation
- Optimization history tracking
- Visual optimization progress

### 📊 Cluster Analysis
- K-Means clustering for sensor grouping
- Anomaly detection and identification
- Maintenance scheduling recommendations
- Risk zone identification
- Interactive cluster visualization
- Silhouette score for cluster quality

### 🔔 Alert System
- Customizable threshold management
- Multi-level alerts (info/warning/critical)
- Real-time alert notifications
- Alert summary and statistics

### 🎨 Enhanced User Interface
- **Toast Notifications**: Success, error, warning, and info messages
- **Loading States**: Spinners, overlays, and skeleton screens
- **Modal Dialogs**: Reusable modals with confirmation variants
- **Tooltips**: Context-sensitive help system
- **Responsive Design**: Mobile-friendly interface
- **Dark Mode**: Persistent theme preference
- **Accessibility**: Keyboard navigation and ARIA labels

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **ML Libraries**: scikit-learn, NumPy
- **Database**: MySQL
- **Real-time**: WebSocket
- **Environment**: python-dotenv
- **Model Persistence**: joblib

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Charts**: Recharts
- **Maps**: Leaflet
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Database
- **RDBMS**: MySQL 8.0+
- **Tables**: 5 (sensor_readings, accident_predictions, risk_classifications, machine_optimizations, escape_routes)

---

## 📁 Project Structure

```
IISWPS/
├── backend/                    # FastAPI Backend
│   ├── ai/                    # AI Algorithm Implementations
│   │   ├── a_star.py         # A* Pathfinding Algorithm
│   │   ├── alerts.py         # Alert System
│   │   ├── analytics.py      # Analytics Engine
│   │   ├── hill_climb.py     # Hill Climbing Optimizer
│   │   ├── kmeans.py         # K-Means Clustering
│   │   ├── knn.py            # K-Nearest Neighbors Classifier
│   │   ├── logistic.py       # Logistic Regression Predictor
│   │   └── ml_enhanced.py    # Enhanced ML Features
│   ├── database/             # Database Module
│   │   ├── connection.py     # Database Connection
│   │   └── schema.sql        # Database Schema
│   ├── models/               # Trained ML Models
│   │   ├── knn_model.joblib
│   │   ├── logistic_model.joblib
│   │   └── model_loader.py
│   ├── main.py               # FastAPI Application (1282 lines)
│   ├── train_models.py       # Model Training Script
│   ├── setup_database.py     # Database Setup Script
│   ├── requirements.txt      # Python Dependencies
│   └── .env                  # Environment Variables
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── api/              # API Client Functions
│   │   │   ├── client.ts
│   │   │   ├── clustering.ts
│   │   │   ├── optimizer.ts
│   │   │   ├── prediction.ts
│   │   │   └── routing.ts
│   │   ├── components/       # Reusable Components
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── ClusterVisualization.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── FactoryFloor.tsx
│   │   │   ├── Gauge.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── ToastContainer.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── hooks/            # Custom Hooks
│   │   │   └── useToast.ts
│   │   ├── utils/            # Utility Functions
│   │   │   └── export.ts
│   │   ├── pages/            # Page Components
│   │   │   ├── ClusterAnalysis.tsx (1497 lines)
│   │   │   ├── Dashboard.tsx (820+ lines)
│   │   │   ├── Optimizer.tsx
│   │   │   ├── RiskClassifier.tsx
│   │   │   └── RoutePlanner.tsx
│   │   ├── store/            # State Management
│   │   │   └── useAppStore.ts
│   │   ├── App.tsx           # Main App Component
│   │   ├── main.tsx          # Entry Point
│   │   └── index.css         # Global Styles (630+ lines)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md                  # This file
```

---

## 🚀 Installation

### Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16.x or higher
- **MySQL**: 8.0 or higher
- **npm** or **yarn**

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

6. **Train ML models**
   ```bash
   python train_models.py
   ```

7. **Populate database with realistic industrial data** (Optional but recommended)
   ```bash
   python populate_realistic_data.py
   ```
   This will generate:
   - 12,000+ sensor readings from 6 industrial sensors
   - 7 days of historical data with realistic patterns
   - Time-based variations (shift patterns)
   - Anomaly detection samples
   - Predictions, classifications, and optimizations

8. **Start the backend server**
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`

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

### Quick Start (All-in-One)

For Linux users, use the setup script:
```bash
cd backend
python setup_linux.py
```

---

## 💻 Usage

### Accessing the Application

1. **Start Backend**: `cd backend && python main.py`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:5173`

### API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Main Features

#### 1. Dashboard
- View real-time sensor data
- Monitor accident probabilities
- Track risk classifications
- Analyze trends and statistics

#### 2. Route Planner
- Create custom factory floor grids
- Set start and goal positions
- Mark blocked areas and risk zones
- Calculate optimal escape routes
- Compare different routing strategies

#### 3. Machine Optimizer
- Input current machine parameters
- Set optimization constraints
- Run hill climbing optimization
- View optimization history
- Apply optimized parameters

#### 4. Risk Classifier
- Input sensor readings
- Get risk classification (Low/Medium/High)
- View confidence scores
- Analyze feature importance

#### 5. Cluster Analysis
- Cluster sensors by behavior patterns
- Identify anomalies
- Schedule maintenance
- Visualize risk zones
- Export cluster reports

---

## 🤖 AI Algorithms

### 1. K-Means Clustering (`kmeans.py`)
**Purpose**: Sensor grouping, anomaly detection, maintenance scheduling

**Features**:
- Automatic optimal cluster determination (Elbow Method)
- Silhouette score for cluster quality
- Anomaly detection (outlier identification)
- Risk level assessment per cluster
- Maintenance recommendations

**Use Cases**:
- Group sensors with similar behavior
- Identify malfunctioning sensors
- Schedule preventive maintenance
- Map risk zones on factory floor

### 2. K-Nearest Neighbors (`knn.py`)
**Purpose**: Risk classification for workers and machines

**Features**:
- 3-class classification (Low/Medium/High risk)
- Distance-weighted voting
- Confidence score calculation
- Pre-trained model support

**Input**: Temperature, Vibration, RPM, Load
**Output**: Risk class + Confidence score

### 3. Logistic Regression (`logistic.py`)
**Purpose**: Accident probability prediction

**Features**:
- Binary classification with probability
- Feature scaling with StandardScaler
- Synthetic data generation for training
- Model persistence with joblib

**Input**: Temperature, Vibration, RPM, Load
**Output**: Accident probability (0.0 to 1.0)

### 4. A* Pathfinding (`a_star.py`)
**Purpose**: Optimal escape route planning

**Features**:
- Multi-objective optimization (distance + safety)
- Risk-weighted pathfinding
- Diagonal movement support
- Route comparison (shortest vs. safest)
- Customizable safety weights

**Input**: Grid, Start, Goal, Risk Map, Blocked Cells
**Output**: Optimal path with cost and risk metrics

### 5. Hill Climbing (`hill_climb.py`)
**Purpose**: Machine safety parameter optimization

**Features**:
- Constraint-based optimization
- Random neighbor generation
- Convergence tracking
- Optimization history
- Safety score maximization

**Input**: Initial parameters (Temperature, Vibration, Load)
**Output**: Optimized parameters + Safety score

### 6. Analytics Engine (`analytics.py`)
**Purpose**: Trend analysis and statistical insights

**Features**:
- Moving average calculation
- Anomaly detection (Z-score method)
- Comprehensive statistics (mean, median, std, percentiles)
- Correlation analysis
- Maintenance prediction

### 7. Alert System (`alerts.py`)
**Purpose**: Threshold-based alerting

**Features**:
- Customizable thresholds per metric
- Multi-level alerts (info/warning/critical)
- Alert summary and statistics
- Human-readable alert messages

### 8. ML Enhanced (`ml_enhanced.py`)
**Purpose**: Advanced ML features

**Features**:
- Feature importance calculation
- Prediction uncertainty estimation
- Model confidence scoring

---

## 📡 API Documentation

### Core Endpoints

#### Health Check
```http
GET /
GET /health
```

#### Predictions
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

#### Live Sensor Data
```http
GET /sensors/live
```

#### WebSocket (Real-time Updates)
```javascript
ws://localhost:8000/ws/sensors
```

#### Historical Data
```http
GET /data/sensor-history?sensor_id=SENSOR_1&hours=24&limit=100
GET /data/predictions?risk_level=HIGH&hours=24
GET /data/risk-classifications?risk_class=HIGH
GET /data/optimizations?hours=24
GET /data/escape-routes?hours=24
GET /data/dashboard-stats
```

#### Clustering
```http
POST /cluster/sensors
POST /cluster/maintenance-zones
POST /cluster/risk-zones
```

---

## 🗄️ Database Schema

### Tables

#### 1. sensor_readings
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

#### 2. accident_predictions
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

#### 3. risk_classifications
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

#### 4. machine_optimizations
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

### Dashboard
Real-time monitoring with live sensor data, factory floor visualization, and comprehensive statistics.

### Cluster Analysis
K-Means clustering visualization with interactive cluster management and maintenance scheduling.

### Route Planner
A* pathfinding with interactive grid editor and route comparison.

### Machine Optimizer
Hill climbing optimization with real-time safety score calculation and optimization history.

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

---

## 📦 Building for Production

### Backend
```bash
cd backend
# The backend runs directly with Python
python main.py
```

### Frontend
```bash
cd frontend
npm run build
```

The production build will be in `frontend/dist/`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Your Name** - *Initial work*

---

## 🙏 Acknowledgments

- FastAPI for the excellent Python web framework
- React team for the amazing frontend library
- scikit-learn for machine learning algorithms
- TailwindCSS for beautiful styling utilities
- All open-source contributors

---

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

## 🗺️ Roadmap

- [ ] Add user authentication and authorization
- [ ] Implement role-based access control
- [ ] Add email/SMS notifications for critical alerts
- [ ] Integrate with IoT sensors for real sensor data
- [ ] Add mobile application (React Native)
- [ ] Implement advanced ML models (LSTM, Random Forest)
- [ ] Add multi-language support
- [ ] Create admin dashboard for system configuration
- [ ] Add data export functionality (CSV, PDF)
- [ ] Implement automated testing suite

---

<div align="center">

**Made with ❤️ for Industrial Safety**

⭐ Star this repo if you find it helpful!

</div>
