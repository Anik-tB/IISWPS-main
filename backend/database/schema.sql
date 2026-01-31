-- Industrial Safety System Database Schema

-- Sensor readings table
CREATE TABLE IF NOT EXISTS sensor_readings (
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

-- Accident predictions table
CREATE TABLE IF NOT EXISTS accident_predictions (
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

-- Risk classifications table
CREATE TABLE IF NOT EXISTS risk_classifications (
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

-- Machine optimizations table
CREATE TABLE IF NOT EXISTS machine_optimizations (
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

-- Escape routes table
CREATE TABLE IF NOT EXISTS escape_routes (
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

