"""
Intelligent Industrial Safety & Workflow Prediction System
FastAPI Backend - Main Application Entry Point
"""

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
from typing import Dict, List, Any
import asyncio
from datetime import datetime
import json
import random
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from ai.knn import KNNClassifier
from ai.logistic import LogisticPredictor
from ai.hill_climb import HillClimbingOptimizer
from ai.a_star import AStarPlanner
from ai.analytics import AnalyticsEngine
from ai.ml_enhanced import EnhancedMLPredictor
from ai.alerts import AlertSystem
from ai.kmeans import KMeansClusterer
from database.connection import get_db_connection, init_database
from models.model_loader import load_models

# Global model instances
knn_model = None
logistic_model = None

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except:
                pass

manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize models and database on startup"""
    global knn_model, logistic_model
    print("🚀 Initializing Industrial Safety System...")

    # Initialize database
    init_database()

    # Load trained models
    try:
        knn_model, logistic_model = load_models()
        print("✅ Models loaded successfully")
    except Exception as e:
        print(f"⚠️ Warning: Models not found. Run training script first: {e}")

    yield

    # Cleanup on shutdown
    print("🛑 Shutting down...")

app = FastAPI(
    title="Industrial Safety & Workflow Prediction API",
    description="AI-powered industrial safety monitoring and prediction system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI components
knn_classifier = KNNClassifier()
logistic_predictor = LogisticPredictor()
hill_climber = HillClimbingOptimizer()
a_star_planner = AStarPlanner()
analytics_engine = AnalyticsEngine()
ml_enhanced = EnhancedMLPredictor()
alert_system = AlertSystem()
kmeans_clusterer = KMeansClusterer()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Industrial Safety & Workflow Prediction System",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "models_loaded": knn_model is not None and logistic_model is not None,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/predict/accident")
async def predict_accident(payload: Dict[str, float]):
    """
    Predict accident probability using Logistic Regression with enhanced features

    Input: { "temperature": 72, "vibration": 3.1, "rpm": 1100, "load": 0.54 }
    Output: { "accident_probability": 0.83, "feature_importance": {...}, "uncertainty": {...} }
    """
    try:
        required_fields = ["temperature", "vibration", "rpm", "load"]
        for field in required_fields:
            if field not in payload:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

        # Use trained model if available, otherwise use default predictor
        if logistic_model:
            probability = logistic_predictor.predict_with_model(
                logistic_model,
                payload["temperature"],
                payload["vibration"],
                payload["rpm"],
                payload["load"]
            )

            # Enhanced features
            import numpy as np
            X_input = np.array([[payload["temperature"], payload["vibration"], payload["rpm"], payload["load"]]])
            X_scaled = logistic_model["scaler"].transform(X_input)

            feature_importance = ml_enhanced.calculate_feature_importance(logistic_model["model"], X_scaled)
            uncertainty = ml_enhanced.calculate_prediction_uncertainty(logistic_model["model"], X_scaled)
        else:
            probability = logistic_predictor.predict(
                payload["temperature"],
                payload["vibration"],
                payload["rpm"],
                payload["load"]
            )
            feature_importance = {}
            uncertainty = {"confidence": 0.5, "uncertainty": 0.5}

        return {
            "accident_probability": round(probability, 4),
            "risk_level": "High" if probability > 0.7 else "Medium" if probability > 0.4 else "Low",
            "feature_importance": feature_importance,
            "uncertainty": uncertainty,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/predict/risk")
async def predict_risk(payload: Dict[str, Any]):
    """
    Classify worker/machine risk using KNN

    Input: { "temperature": 75, "vibration": 4.2, "rpm": 1200, "load": 0.65, "worker_age": 35 }
    Output: { "risk_class": "High", "confidence": 0.85 }
    """
    try:
        required_fields = ["temperature", "vibration", "rpm", "load"]
        for field in required_fields:
            if field not in payload:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")

        # Use trained model if available
        if knn_model:
            risk_class, confidence = knn_classifier.classify_with_model(
                knn_model,
                payload["temperature"],
                payload["vibration"],
                payload["rpm"],
                payload["load"]
            )
        else:
            risk_class, confidence = knn_classifier.classify(
                payload["temperature"],
                payload["vibration"],
                payload["rpm"],
                payload["load"]
            )

        return {
            "risk_class": risk_class,
            "confidence": round(confidence, 4),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification error: {str(e)}")


@app.post("/route/astar")
async def plan_escape_route(payload: Dict[str, Any]):
    """
    Plan safest escape route using A* algorithm with multi-objective optimization

    Input: {
        "grid": [[0,0,0,1,0], [0,1,0,0,0], ...],
        "start": [0, 0],
        "goal": [4, 4],
        "blocked": [[1,1], [2,2]],
        "risk_map": [[0.1, 0.2, ...], ...],  # Optional
        "safety_weight": 0.5,  # Optional: 0.0 = distance only, 1.0 = safety only
        "compare_routes": false  # Optional: compare shortest vs safest
    }
    Output: { "path": [[0,0], [0,1], ...], "cost": 12.5, "risk": 2.3, "length": 8 }
    """
    try:
        grid = payload.get("grid")
        start = payload.get("start")
        goal = payload.get("goal")
        blocked = payload.get("blocked", [])
        risk_map = payload.get("risk_map")
        safety_weight = payload.get("safety_weight", 0.5)
        compare_routes = payload.get("compare_routes", False)

        if not grid or not start or not goal:
            raise HTTPException(status_code=400, detail="Missing grid, start, or goal")

        # Compare routes if requested
        if compare_routes:
            comparison = a_star_planner.compare_routes(grid, start, goal, risk_map, blocked)
            return {
                **comparison,
                "timestamp": datetime.now().isoformat()
            }

        # Risk-weighted path if risk_map provided
        if risk_map:
            path, distance, risk_cost, length = a_star_planner.find_path_with_risk(
                grid, start, goal, risk_map, blocked, safety_weight
            )

            if not path:
                return {
                    "path": [],
                    "distance": float('inf'),
                    "risk": float('inf'),
                    "length": 0,
                    "message": "No path found",
                    "timestamp": datetime.now().isoformat()
                }

            return {
                "path": path,
                "distance": round(distance, 2),
                "risk": round(risk_cost, 2),
                "length": length,
                "safety_weight": safety_weight,
                "timestamp": datetime.now().isoformat()
            }
        else:
            # Standard A* path
            path, cost, length = a_star_planner.find_path(grid, start, goal, blocked)

            if not path:
                return {
                    "path": [],
                    "cost": float('inf'),
                    "length": 0,
                    "message": "No path found",
                    "timestamp": datetime.now().isoformat()
                }

            return {
                "path": path,
                "cost": round(cost, 2),
                "length": length,
                "timestamp": datetime.now().isoformat()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Route planning error: {str(e)}")


@app.post("/optimize/machine")
async def optimize_machine(payload: Dict[str, Any]):
    """
    Optimize machine safety parameters using Hill Climbing with constraints and history

    Input: {
        "temperature": 80,
        "vibration": 5.0,
        "load": 0.7,
        "constraints": {"temperature": [60, 90], "vibration": [2.0, 6.0]},  # Optional
        "track_history": true  # Optional
    }
    Output: { "optimized": {...}, "safety_score": 0.92, "metadata": {...} }
    """
    try:
        initial_temp = payload.get("temperature", 70.0)
        initial_vib = payload.get("vibration", 3.0)
        initial_load = payload.get("load", 0.5)
        constraints = payload.get("constraints")
        track_history = payload.get("track_history", False)

        # Convert constraints format if needed
        if constraints:
            constraints_dict = {}
            for key, value in constraints.items():
                if isinstance(value, list) and len(value) == 2:
                    constraints_dict[key] = tuple(value)
                elif isinstance(value, tuple):
                    constraints_dict[key] = value
            constraints = constraints_dict if constraints_dict else None

        optimized_params, safety_score, metadata = hill_climber.optimize(
            initial_temp, initial_vib, initial_load, constraints, track_history
        )

        return {
            "initial": {
                "temperature": initial_temp,
                "vibration": initial_vib,
                "load": initial_load
            },
            "optimized": optimized_params,
            "safety_score": round(safety_score, 4),
            "improvement": metadata["improvement"],
            "improvement_percent": metadata["improvement_percent"],
            "metadata": metadata,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization error: {str(e)}")


def _fetch_live_sensors_from_db(limit: int = 6):
    """Helper to fetch latest sensor readings from database"""
    sensors = []
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT sr.sensor_id as id, sr.temperature, sr.vibration, sr.rpm,
                       sr.`load`, sr.timestamp
                FROM sensor_readings sr
                INNER JOIN (
                    SELECT sensor_id, MAX(timestamp) as max_ts
                    FROM sensor_readings
                    GROUP BY sensor_id
                ) latest ON sr.sensor_id = latest.sensor_id AND sr.timestamp = latest.max_ts
                ORDER BY sr.sensor_id
                LIMIT %s
            """, (limit,))
            rows = cursor.fetchall()
            cursor.close()
            connection.close()

            for i, row in enumerate(rows):
                sensors.append({
                    "id": row["id"],
                    "location": {"x": round((i % 3) * 33 + random.uniform(0, 10), 2),
                                 "y": round((i // 3) * 50 + random.uniform(0, 10), 2)},
                    "temperature": round(float(row["temperature"]), 2),
                    "vibration": round(float(row["vibration"]), 2),
                    "rpm": int(row["rpm"]),
                    "load": round(float(row["load"]), 2),
                    "timestamp": row["timestamp"].isoformat() if hasattr(row["timestamp"], 'isoformat') else str(row["timestamp"]),
                    "source": "database"
                })
        except Exception as e:
            print(f"⚠️ Database read error: {e}")
            if connection.is_connected():
                connection.close()

    # Fallback to mock data if no database data
    if not sensors:
        for i in range(limit):
            sensors.append({
                "id": f"SENSOR_{i+1}",
                "location": {"x": random.uniform(0, 100), "y": random.uniform(0, 100)},
                "temperature": round(random.uniform(60, 90), 2),
                "vibration": round(random.uniform(1.0, 6.0), 2),
                "rpm": int(random.uniform(800, 1500)),
                "load": round(random.uniform(0.3, 0.9), 2),
                "timestamp": datetime.now().isoformat(),
                "source": "mock"
            })
    return sensors


@app.get("/sensors/live")
async def get_live_sensors():
    """
    Get live sensor data from database (real data)
    Falls back to mock data if database unavailable
    """
    sensors = _fetch_live_sensors_from_db(limit=6)
    return {
        "sensors": sensors,
        "timestamp": datetime.now().isoformat()
    }


@app.websocket("/ws/sensors")
async def websocket_sensors(websocket: WebSocket):
    """
    WebSocket endpoint for real-time sensor data updates
    Broadcasts sensor data every 5 seconds from database
    """
    await manager.connect(websocket)
    try:
        while True:
            # Get live sensor data from database
            sensors = []
            connection = get_db_connection()
            if connection:
                try:
                    cursor = connection.cursor(dictionary=True)
                    cursor.execute("""
                        SELECT sr.sensor_id as id, sr.temperature, sr.vibration, sr.rpm,
                               sr.`load`, sr.timestamp
                        FROM sensor_readings sr
                        INNER JOIN (
                            SELECT sensor_id, MAX(timestamp) as max_ts
                            FROM sensor_readings
                            GROUP BY sensor_id
                        ) latest ON sr.sensor_id = latest.sensor_id AND sr.timestamp = latest.max_ts
                        ORDER BY sr.sensor_id
                        LIMIT 6
                    """)
                    rows = cursor.fetchall()
                    cursor.close()
                    connection.close()

                    for i, row in enumerate(rows):
                        sensors.append({
                            "id": row["id"],
                            "location": {"x": round((i % 3) * 33 + random.uniform(0, 5), 2),
                                         "y": round((i // 3) * 50 + random.uniform(0, 5), 2)},
                            "temperature": round(float(row["temperature"]), 2),
                            "vibration": round(float(row["vibration"]), 2),
                            "rpm": int(row["rpm"]),
                            "load": round(float(row["load"]), 2),
                            "timestamp": row["timestamp"].isoformat() if hasattr(row["timestamp"], 'isoformat') else str(row["timestamp"]),
                            "source": "database"
                        })
                except Exception as e:
                    print(f"⚠️ WebSocket DB error: {e}")
                    if connection.is_connected():
                        connection.close()

            # Fallback to mock data if no database
            if not sensors:
                for i in range(5):
                    sensors.append({
                        "id": f"SENSOR_{i+1}",
                        "location": {"x": round(random.uniform(0, 100), 2), "y": round(random.uniform(0, 100), 2)},
                        "temperature": round(random.uniform(60, 90), 2),
                        "vibration": round(random.uniform(1.0, 6.0), 2),
                        "rpm": int(random.uniform(800, 1500)),
                        "load": round(random.uniform(0.3, 0.9), 2),
                        "timestamp": datetime.now().isoformat(),
                        "source": "mock"
                    })

            # Calculate predictions for each sensor
            for sensor in sensors:
                if logistic_model:
                    prob = logistic_predictor.predict_with_model(
                        logistic_model,
                        sensor["temperature"],
                        sensor["vibration"],
                        sensor["rpm"],
                        sensor["load"]
                    )
                else:
                    prob = logistic_predictor.predict(
                        sensor["temperature"],
                        sensor["vibration"],
                        sensor["rpm"],
                        sensor["load"]
                    )
                sensor["accident_probability"] = round(prob, 4)

                if knn_model:
                    risk, conf = knn_classifier.classify_with_model(
                        knn_model,
                        sensor["temperature"],
                        sensor["vibration"],
                        sensor["rpm"],
                        sensor["load"]
                    )
                else:
                    risk, conf = knn_classifier.classify(
                        sensor["temperature"],
                        sensor["vibration"],
                        sensor["rpm"],
                        sensor["load"]
                    )
                sensor["risk_class"] = risk
                sensor["risk_confidence"] = round(conf, 4)

            # Send data to client
            await websocket.send_json({
                "type": "sensor_update",
                "sensors": sensors,
                "timestamp": datetime.now().isoformat()
            })

            # Wait 5 seconds before next update
            await asyncio.sleep(5)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)


# Database Query Endpoints - Real Historical Data
@app.get("/data/sensor-history")
async def get_sensor_history(sensor_id: str = None, hours: int = 24, limit: int = 100):
    """
    Get historical sensor readings from database

    Query params:
    - sensor_id: Filter by specific sensor (optional)
    - hours: How many hours of history (default 24)
    - limit: Max records to return (default 100)
    """
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        cursor = connection.cursor(dictionary=True)

        if sensor_id:
            cursor.execute("""
                SELECT * FROM sensor_readings
                WHERE sensor_id = %s AND timestamp >= NOW() - INTERVAL %s HOUR
                ORDER BY timestamp DESC LIMIT %s
            """, (sensor_id, hours, limit))
        else:
            cursor.execute("""
                SELECT * FROM sensor_readings
                WHERE timestamp >= NOW() - INTERVAL %s HOUR
                ORDER BY timestamp DESC LIMIT %s
            """, (hours, limit))

        rows = cursor.fetchall()
        cursor.close()
        connection.close()

        # Convert datetime to string
        for row in rows:
            if row.get("timestamp"):
                row["timestamp"] = row["timestamp"].isoformat()

        return {
            "data": rows,
            "count": len(rows),
            "source": "database",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/data/predictions")
async def get_predictions_history(risk_level: str = None, hours: int = 24, limit: int = 100):
    """
    Get historical accident predictions from database

    Query params:
    - risk_level: Filter by LOW/MEDIUM/HIGH (optional)
    - hours: How many hours of history (default 24)
    - limit: Max records to return (default 100)
    """
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        cursor = connection.cursor(dictionary=True)

        if risk_level:
            cursor.execute("""
                SELECT * FROM accident_predictions
                WHERE risk_level = %s AND timestamp >= NOW() - INTERVAL %s HOUR
                ORDER BY timestamp DESC LIMIT %s
            """, (risk_level.upper(), hours, limit))
        else:
            cursor.execute("""
                SELECT * FROM accident_predictions
                WHERE timestamp >= NOW() - INTERVAL %s HOUR
                ORDER BY timestamp DESC LIMIT %s
            """, (hours, limit))

        rows = cursor.fetchall()
        cursor.close()
        connection.close()

        for row in rows:
            if row.get("timestamp"):
                row["timestamp"] = row["timestamp"].isoformat()

        return {
            "data": rows,
            "count": len(rows),
            "source": "database",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/data/risk-classifications")
async def get_risk_history(risk_class: str = None, hours: int = 24, limit: int = 100):
    """
    Get historical risk classifications from database
    """
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        cursor = connection.cursor(dictionary=True)

        if risk_class:
            cursor.execute("""
                SELECT * FROM risk_classifications
                WHERE risk_class = %s AND timestamp >= NOW() - INTERVAL %s HOUR
                ORDER BY timestamp DESC LIMIT %s
            """, (risk_class.upper(), hours, limit))
        else:
            cursor.execute("""
                SELECT * FROM risk_classifications
                WHERE timestamp >= NOW() - INTERVAL %s HOUR
                ORDER BY timestamp DESC LIMIT %s
            """, (hours, limit))

        rows = cursor.fetchall()
        cursor.close()
        connection.close()

        for row in rows:
            if row.get("timestamp"):
                row["timestamp"] = row["timestamp"].isoformat()

        return {
            "data": rows,
            "count": len(rows),
            "source": "database",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/data/optimizations")
async def get_optimizations_history(hours: int = 24, limit: int = 50):
    """
    Get historical machine optimizations from database
    """
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM machine_optimizations
            WHERE timestamp >= NOW() - INTERVAL %s HOUR
            ORDER BY timestamp DESC LIMIT %s
        """, (hours, limit))

        rows = cursor.fetchall()
        cursor.close()
        connection.close()

        for row in rows:
            if row.get("timestamp"):
                row["timestamp"] = row["timestamp"].isoformat()

        return {
            "data": rows,
            "count": len(rows),
            "source": "database",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/data/escape-routes")
async def get_routes_history(hours: int = 24, limit: int = 50):
    """
    Get historical escape routes from database
    """
    connection = get_db_connection()
    if not connection:
        raise HTTPException(status_code=503, detail="Database unavailable")

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM escape_routes
            WHERE timestamp >= NOW() - INTERVAL %s HOUR
            ORDER BY timestamp DESC LIMIT %s
        """, (hours, limit))

        rows = cursor.fetchall()
        cursor.close()
        connection.close()

        for row in rows:
            if row.get("timestamp"):
                row["timestamp"] = row["timestamp"].isoformat()

        return {
            "data": rows,
            "count": len(rows),
            "source": "database",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/data/dashboard-stats")
async def get_dashboard_stats():
    """
    Get comprehensive dashboard statistics from all tables
    """
    connection = get_db_connection()
    if not connection:
        return {
            "database_connected": False,
            "message": "Database unavailable - using mock data",
            "timestamp": datetime.now().isoformat()
        }

    try:
        cursor = connection.cursor(dictionary=True)
        stats = {}

        # Sensor readings stats
        cursor.execute("SELECT COUNT(*) as count FROM sensor_readings")
        stats["total_sensor_readings"] = cursor.fetchone()["count"]

        cursor.execute("""
            SELECT AVG(temperature) as avg_temp, AVG(vibration) as avg_vib,
                   AVG(rpm) as avg_rpm, AVG(`load`) as avg_load
            FROM sensor_readings WHERE timestamp >= NOW() - INTERVAL 1 HOUR
        """)
        recent = cursor.fetchone()
        stats["recent_averages"] = {
            "temperature": round(float(recent["avg_temp"] or 0), 2),
            "vibration": round(float(recent["avg_vib"] or 0), 2),
            "rpm": round(float(recent["avg_rpm"] or 0), 0),
            "load": round(float(recent["avg_load"] or 0), 2)
        }

        # Predictions stats
        cursor.execute("""
            SELECT risk_level, COUNT(*) as count
            FROM accident_predictions
            WHERE timestamp >= NOW() - INTERVAL 24 HOUR
            GROUP BY risk_level
        """)
        stats["predictions_by_risk"] = {row["risk_level"]: row["count"] for row in cursor.fetchall()}

        # Risk classifications stats
        cursor.execute("""
            SELECT risk_class, COUNT(*) as count
            FROM risk_classifications
            WHERE timestamp >= NOW() - INTERVAL 24 HOUR
            GROUP BY risk_class
        """)
        stats["classifications_by_risk"] = {row["risk_class"]: row["count"] for row in cursor.fetchall()}

        # Optimizations count
        cursor.execute("SELECT COUNT(*) as count FROM machine_optimizations")
        stats["total_optimizations"] = cursor.fetchone()["count"]

        cursor.close()
        connection.close()

        return {
            "database_connected": True,
            "stats": stats,
            "source": "database",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Advanced Analytics Endpoints
@app.post("/analytics/trends")
async def analyze_trends(payload: Dict[str, Any]):
    """
    Analyze trends in sensor data

    Input: {
        "data_points": [
            {"temperature": 70, "vibration": 3.0, "rpm": 1000, "load": 0.5, "timestamp": "..."},
            ...
        ],
        "window_size": 10
    }
    """
    try:
        data_points = payload.get("data_points", [])
        window_size = payload.get("window_size", 10)

        if not data_points:
            raise HTTPException(status_code=400, detail="Missing data_points")

        trends = analytics_engine.calculate_trends(data_points, window_size)
        return {
            "trends": trends,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trend analysis error: {str(e)}")


@app.post("/analytics/anomalies")
async def detect_anomalies(payload: Dict[str, Any]):
    """
    Detect anomalies in sensor data

    Input: {
        "data_points": [...],
        "threshold_std": 2.0
    }
    """
    try:
        data_points = payload.get("data_points", [])
        threshold_std = payload.get("threshold_std", 2.0)

        if not data_points:
            raise HTTPException(status_code=400, detail="Missing data_points")

        anomalies = analytics_engine.detect_anomalies(data_points, threshold_std)
        return {
            "anomalies": anomalies,
            "count": len(anomalies),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection error: {str(e)}")


@app.post("/analytics/statistics")
async def calculate_statistics(payload: Dict[str, Any]):
    """
    Calculate comprehensive statistics for sensor data

    Input: {
        "data_points": [...]
    }
    """
    try:
        data_points = payload.get("data_points", [])

        if not data_points:
            raise HTTPException(status_code=400, detail="Missing data_points")

        stats = analytics_engine.calculate_statistics(data_points)
        return {
            "statistics": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Statistics calculation error: {str(e)}")


@app.post("/analytics/maintenance")
async def predict_maintenance(payload: Dict[str, Any]):
    """
    Predict maintenance needs based on sensor data

    Input: {
        "data_points": [...],
        "maintenance_thresholds": {...}  # Optional
    }
    """
    try:
        data_points = payload.get("data_points", [])
        thresholds = payload.get("maintenance_thresholds")

        if not data_points:
            raise HTTPException(status_code=400, detail="Missing data_points")

        prediction = analytics_engine.predict_maintenance(data_points, thresholds)
        return {
            **prediction,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Maintenance prediction error: {str(e)}")


@app.post("/analytics/correlation")
async def calculate_correlation(payload: Dict[str, Any]):
    """
    Calculate correlation between sensor metrics

    Input: {
        "data_points": [...]
    }
    """
    try:
        data_points = payload.get("data_points", [])

        if not data_points:
            raise HTTPException(status_code=400, detail="Missing data_points")

        correlations = analytics_engine.calculate_correlation(data_points)
        return {
            "correlations": correlations,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Correlation calculation error: {str(e)}")


@app.post("/predict/batch")
async def batch_predict(payload: Dict[str, Any]):
    """
    Batch prediction for multiple sensor readings

    Input: {
        "readings": [
            {"temperature": 72, "vibration": 3.1, "rpm": 1100, "load": 0.54},
            ...
        ]
    }
    """
    try:
        readings = payload.get("readings", [])

        if not readings:
            raise HTTPException(status_code=400, detail="Missing readings")

        results = []
        for reading in readings:
            required_fields = ["temperature", "vibration", "rpm", "load"]
            if not all(field in reading for field in required_fields):
                continue

            if logistic_model:
                prob = logistic_predictor.predict_with_model(
                    logistic_model,
                    reading["temperature"],
                    reading["vibration"],
                    reading["rpm"],
                    reading["load"]
                )
            else:
                prob = logistic_predictor.predict(
                    reading["temperature"],
                    reading["vibration"],
                    reading["rpm"],
                    reading["load"]
                )

            results.append({
                **reading,
                "accident_probability": round(prob, 4),
                "risk_level": "High" if prob > 0.7 else "Medium" if prob > 0.4 else "Low"
            })

        return {
            "predictions": results,
            "count": len(results),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")


# Alert System Endpoints
@app.post("/alerts/check")
async def check_alerts(payload: Dict[str, Any]):
    """
    Check for alerts based on sensor readings

    Input: {
        "readings": {"temperature": 85.0, "vibration": 5.0, ...},
        "custom_thresholds": {...}  # Optional
    }
    """
    try:
        readings = payload.get("readings", {})

        if not readings:
            raise HTTPException(status_code=400, detail="Missing readings")

        custom_thresholds = payload.get("custom_thresholds")
        if custom_thresholds:
            alert_system.set_thresholds(custom_thresholds)

        alerts = alert_system.check_multiple_alerts(readings)
        summary = alert_system.get_alert_summary(alerts)

        return {
            "alerts": alerts,
            "summary": summary,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Alert check error: {str(e)}")


@app.post("/alerts/thresholds")
async def set_alert_thresholds(payload: Dict[str, Any]):
    """
    Set custom alert thresholds

    Input: {
        "thresholds": {
            "temperature": {"warning": 85.0, "critical": 95.0},
            ...
        }
    }
    """
    try:
        thresholds = payload.get("thresholds", {})

        if not thresholds:
            raise HTTPException(status_code=400, detail="Missing thresholds")

        alert_system.set_thresholds(thresholds)

        return {
            "message": "Thresholds updated successfully",
            "thresholds": alert_system.get_thresholds(),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Threshold update error: {str(e)}")


@app.get("/alerts/thresholds")
async def get_alert_thresholds(metric: str = None):
    """
    Get current alert thresholds

    Query params: ?metric=temperature (optional)
    """
    try:
        thresholds = alert_system.get_thresholds(metric)

        return {
            "thresholds": thresholds,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Threshold retrieval error: {str(e)}")


# K-Means Clustering Endpoints
@app.post("/cluster/sensors")
async def cluster_sensors(payload: Dict[str, Any]):
    try:
        sensor_data = payload.get("sensor_data", [])
        if not sensor_data:
            # Fallback to live sensors if no data provided
            sensor_data = _fetch_live_sensors_from_db(limit=6)

        # Add accident probability if not present
        for sensor in sensor_data:
            if "accident_probability" not in sensor:
                if logistic_model:
                    prob = logistic_predictor.predict_with_model(
                        logistic_model,
                        sensor.get("temperature", 70),
                        sensor.get("vibration", 3),
                        sensor.get("rpm", 1000),
                        sensor.get("load", 0.5)
                    )
                else:
                    prob = logistic_predictor.predict(
                        sensor.get("temperature", 70),
                        sensor.get("vibration", 3),
                        sensor.get("rpm", 1000),
                        sensor.get("load", 0.5)
                    )
                sensor["accident_probability"] = round(prob, 4)

        n_clusters = payload.get("n_clusters", None)
        features = payload.get("features", None)

        result = kmeans_clusterer.cluster_sensors(sensor_data, n_clusters=n_clusters, features=features)

        return {
            **result,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Clustering error: {str(e)}")


@app.post("/cluster/maintenance")
async def cluster_maintenance_zones(payload: Dict[str, Any]):
    try:
        machine_data = payload.get("machine_data", [])
        if not machine_data:
            # Fallback to live sensors if no data provided
            machine_data = _fetch_live_sensors_from_db(limit=6)

        # Ensure predictions are available
        for machine in machine_data:
            if "accident_probability" not in machine:
                if logistic_model:
                    prob = logistic_predictor.predict_with_model(
                        logistic_model,
                        machine.get("temperature", 70),
                        machine.get("vibration", 3),
                        machine.get("rpm", 1000),
                        machine.get("load", 0.5)
                    )
                else:
                    prob = logistic_predictor.predict(
                        machine.get("temperature", 70),
                        machine.get("vibration", 3),
                        machine.get("rpm", 1000),
                        machine.get("load", 0.5)
                    )
                machine["accident_probability"] = round(prob, 4)

        n_clusters = payload.get("n_clusters", 3)

        result = kmeans_clusterer.cluster_maintenance_zones(machine_data, n_clusters=n_clusters)

        return {
            **result,
            "application": "Maintenance Scheduling",
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Maintenance clustering error: {str(e)}")


@app.post("/cluster/risk-zones")
async def cluster_risk_zones(payload: Dict[str, Any]):
    try:
        location_data = payload.get("location_data", [])
        if not location_data:
            # Fallback to live sensors if no data provided
            location_data = _fetch_live_sensors_from_db(limit=6)

        # Ensure location and predictions are available
        for item in location_data:
            if "location" not in item:
                item["location"] = {"x": random.uniform(0, 100), "y": random.uniform(0, 100)}

            if "accident_probability" not in item:
                if logistic_model:
                    prob = logistic_predictor.predict_with_model(
                        logistic_model,
                        item.get("temperature", 70),
                        item.get("vibration", 3),
                        item.get("rpm", 1000),
                        item.get("load", 0.5)
                    )
                else:
                    prob = logistic_predictor.predict(
                        item.get("temperature", 70),
                        item.get("vibration", 3),
                        item.get("rpm", 1000),
                        item.get("load", 0.5)
                    )
                item["accident_probability"] = round(prob, 4)

        n_clusters = payload.get("n_clusters", 3)

        result = kmeans_clusterer.cluster_risk_zones(location_data, n_clusters=n_clusters)

        return {
            **result,
            "application": "Risk Zone Identification",
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk zone clustering error: {str(e)}")


@app.post("/cluster/live")
async def cluster_live_sensors(payload: Dict[str, Any] = None):

    try:
        # Get current live sensor data
        sensors = _fetch_live_sensors_from_db(limit=10)

        # Add predictions (accident probability) for clustering
        for sensor in sensors:
            if "accident_probability" not in sensor:
                if logistic_model:
                    prob = logistic_predictor.predict_with_model(
                        logistic_model,
                        sensor.get("temperature", 70),
                        sensor.get("vibration", 3),
                        sensor.get("rpm", 1000),
                        sensor.get("load", 0.5)
                    )
                else:
                    prob = logistic_predictor.predict(
                        sensor.get("temperature", 70),
                        sensor.get("vibration", 3),
                        sensor.get("rpm", 1000),
                        sensor.get("load", 0.5)
                    )
                sensor["accident_probability"] = round(prob, 4)

        n_clusters = payload.get("n_clusters", None) if payload else None
        features = payload.get("features", None) if payload else None

        result = kmeans_clusterer.cluster_sensors(sensors, n_clusters=n_clusters, features=features)

        return {
            **result,
            "sensor_count": len(sensors),
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Live clustering error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

