# AI Algorithm Data Samples

This document provides sample data entries used for each AI algorithm in the project. These samples are based on the realistic data generation logic found in `backend/populate_realistic_data.py` and the algorithm implementations in `backend/ai/`.

## 1. KNN (K-Nearest Neighbors) - Risk Classification
**Purpose:** Classifies the risk level of a machine based on its operating parameters.
**Data Source:** `risk_classifications` table.

### Sample Data
| Temperature (°F) | Vibration | RPM  | Load (0-1) | Risk Class | Confidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 72.5             | 2.8       | 1050 | 0.45       | **LOW**    | 0.85       |
| 81.2             | 4.1       | 1180 | 0.62       | **MEDIUM** | 0.78       |
| 68.9             | 2.2       | 1010 | 0.41       | **LOW**    | 0.92       |
| 94.5             | 6.8       | 1350 | 0.88       | **HIGH**   | 0.95       |
| 79.0             | 3.9       | 1150 | 0.58       | **MEDIUM** | 0.72       |

---

## 2. K-means Clustering - Anomaly Detection
**Purpose:** Groups sensors with similar behavior to identify patterns or anomalies.
**Data Source:** `sensor_readings` table (Features used: Temperature, Vibration, RPM, Load).

### Sample Data (Cluster Inputs)
| Sensor ID | Temperature (°F) | Vibration | RPM  | Load (0-1) |
| :--- | :--- | :--- | :--- | :--- |
| SENSOR_1  | 71.2             | 2.5       | 1020 | 0.55       |
| SENSOR_2  | 70.8             | 2.6       | 1015 | 0.54       |
| SENSOR_3  | 92.1             | 5.9       | 1300 | 0.85       | *<- Potential Anomaly (Cluster B)*
| SENSOR_4  | 69.5             | 2.4       | 1010 | 0.52       |
| SENSOR_5  | 88.4             | 5.5       | 1280 | 0.82       | *<- Cluster B*

*(Note: K-means takes these unlabelled inputs and assigns them Cluster IDs like 0, 1, 2...)*

---

## 3. Logistic Regression - Accident Probability
**Purpose:** Predicts the probability of an accident occurring based on sensor readings.
**Data Source:** `accident_predictions` table.

### Sample Data
| Temperature (°F) | Vibration | RPM  | Load (0-1) | Accident Probability | Risk Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 65.4             | 2.1       | 980  | 0.35       | **0.05** (5%)        | LOW        |
| 98.2             | 6.5       | 1450 | 0.92       | **0.88** (88%)       | HIGH       |
| 85.1             | 4.8       | 1200 | 0.75       | **0.55** (55%)       | MEDIUM     |
| 74.3             | 3.2       | 1100 | 0.50       | **0.12** (12%)       | LOW        |
| 91.0             | 5.6       | 1320 | 0.81       | **0.72** (72%)       | HIGH       |

---

## 4. A* (A-Star) - Safe Path Planning
**Purpose:** Finds the safest path through the factory floor, avoiding high-risk zones.
**Data Source:** Grid Map derived from risk zones (0 = Safe, 1 = Obstacle/High Danger). Risks can also be weighted (float values).

### Sample Data (Grid Representation)
**Grid:** 5x5 Matrix
- `0`: Walkable Path
- `1`: Blocked/Machine
- `8`: High Risk Zone (Soft Obstacle)

```
[
  [0, 0, 0, 1, 0],
  [0, 8, 8, 1, 0],  <- High risk items near (1,1) and (1,2)
  [0, 0, 0, 0, 0],
  [1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0]
]
```

**Start Node:** `(0, 0)`
**Goal Node:** `(4, 4)`
**Derived Path:** `(0,0) -> (1,0) -> (2,0) -> (2,1) -> (2,2) -> (2,3) -> (2,4) -> (3,4) -> (4,4)` (Detours around walls and risk zones).

---

## 5. Hill Climbing - Parameter Optimization
**Purpose:** Optimizes machine parameters to find the "Safety Score" maximum (safest operating configuration).
**Data Source:** `machine_optimizations` table (shows Before vs After).

### Sample Data
| Initial Temp | Initial Vib | Initial Load | **Initial Score** | Optimized Temp | Optimized Vib | Optimized Load | **Final Score** |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 88.5         | 5.2         | 0.82         | **0.45** (Unsafe) | 71.2           | 2.6           | 0.55           | **0.94** (Safe) |
| 92.1         | 6.1         | 0.91         | **0.32** (Unsafe) | 73.5           | 2.9           | 0.58           | **0.91** (Safe) |
| 75.0         | 3.0         | 0.60         | **0.85** (Okay)   | 70.0           | 2.5           | 0.50           | **0.98** (Optimal)|

*(The Hill Climbing algorithm iteratively tweaks the Initial values to reach the Optimized values)*
