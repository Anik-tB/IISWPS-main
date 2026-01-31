

import mysql.connector
import random
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'industrial_safety')
}

# Industrial sensor configurations (realistic ranges)
SENSOR_CONFIGS = {
    'SENSOR_1': {  # Compressor Unit
        'name': 'Air Compressor A1',
        'temp_range': (65, 85),
        'vib_range': (2.0, 4.5),
        'rpm_range': (1000, 1200),
        'load_range': (0.4, 0.7),
        'risk_factor': 0.3
    },
    'SENSOR_2': {  # Heavy Machinery
        'name': 'Hydraulic Press B2',
        'temp_range': (70, 95),
        'vib_range': (3.5, 6.0),
        'rpm_range': (800, 1100),
        'load_range': (0.6, 0.9),
        'risk_factor': 0.6
    },
    'SENSOR_3': {  # Cooling System
        'name': 'Cooling Tower C3',
        'temp_range': (55, 75),
        'vib_range': (1.5, 3.0),
        'rpm_range': (1200, 1500),
        'load_range': (0.3, 0.6),
        'risk_factor': 0.2
    },
    'SENSOR_4': {  # Conveyor Belt
        'name': 'Conveyor Belt D4',
        'temp_range': (60, 80),
        'vib_range': (2.5, 4.0),
        'rpm_range': (900, 1300),
        'load_range': (0.5, 0.8),
        'risk_factor': 0.4
    },
    'SENSOR_5': {  # Generator
        'name': 'Backup Generator E5',
        'temp_range': (75, 100),
        'vib_range': (3.0, 5.5),
        'rpm_range': (1100, 1400),
        'load_range': (0.4, 0.85),
        'risk_factor': 0.5
    },
    'SENSOR_6': {  # Pump Station
        'name': 'Water Pump F6',
        'temp_range': (62, 82),
        'vib_range': (2.0, 4.2),
        'rpm_range': (1050, 1250),
        'load_range': (0.45, 0.75),
        'risk_factor': 0.35
    }
}

def generate_realistic_reading(sensor_id, config, timestamp, add_anomaly=False):
    """Generate a realistic sensor reading with optional anomalies"""

    # Base values with some variation
    temp = random.uniform(*config['temp_range'])
    vib = random.uniform(*config['vib_range'])
    rpm = int(random.uniform(*config['rpm_range']))
    load = random.uniform(*config['load_range'])

    # Add time-based patterns (higher load during day shift)
    hour = timestamp.hour
    if 8 <= hour <= 16:  # Day shift
        load = min(0.95, load + 0.1)
        temp += random.uniform(2, 5)
    elif 16 <= hour <= 24:  # Evening shift
        load = min(0.9, load + 0.05)
        temp += random.uniform(1, 3)

    # Add anomalies occasionally (5% chance)
    if add_anomaly or random.random() < 0.05:
        anomaly_type = random.choice(['temp_spike', 'vib_spike', 'overload'])
        if anomaly_type == 'temp_spike':
            temp = min(100, temp + random.uniform(10, 20))
        elif anomaly_type == 'vib_spike':
            vib = min(7.0, vib + random.uniform(1.5, 3.0))
        elif anomaly_type == 'overload':
            load = min(0.98, load + random.uniform(0.15, 0.25))

    return {
        'sensor_id': sensor_id,
        'temperature': round(temp, 2),
        'vibration': round(vib, 2),
        'rpm': rpm,
        'load': round(load, 2),
        'timestamp': timestamp
    }

def populate_sensor_readings(cursor, days=7, readings_per_hour=12):
    """Populate sensor_readings table with realistic historical data"""
    print(f"\n📊 Generating {days} days of sensor readings...")

    end_time = datetime.now()
    start_time = end_time - timedelta(days=days)

    total_readings = 0
    current_time = start_time

    while current_time <= end_time:
        for sensor_id, config in SENSOR_CONFIGS.items():
            reading = generate_realistic_reading(sensor_id, config, current_time)

            cursor.execute("""
                INSERT INTO sensor_readings (sensor_id, temperature, vibration, rpm, `load`, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                reading['sensor_id'],
                reading['temperature'],
                reading['vibration'],
                reading['rpm'],
                reading['load'],
                reading['timestamp']
            ))
            total_readings += 1

        # Move to next reading interval (5 minutes)
        current_time += timedelta(minutes=5)

        # Progress indicator
        if total_readings % 500 == 0:
            print(f"  ✓ Generated {total_readings} readings...")

    print(f"✅ Total sensor readings inserted: {total_readings}")
    return total_readings

def populate_predictions(cursor, count=100):
    """Populate accident_predictions table"""
    print(f"\n🔮 Generating {count} accident predictions...")

    for i in range(count):
        sensor_id = random.choice(list(SENSOR_CONFIGS.keys()))
        config = SENSOR_CONFIGS[sensor_id]

        timestamp = datetime.now() - timedelta(hours=random.randint(0, 168))
        reading = generate_realistic_reading(sensor_id, config, timestamp)

        # Calculate accident probability based on readings
        temp_factor = (reading['temperature'] - 60) / 40
        vib_factor = reading['vibration'] / 7.0
        load_factor = reading['load']

        accident_prob = (temp_factor * 0.3 + vib_factor * 0.4 + load_factor * 0.3) * config['risk_factor']
        accident_prob = min(0.99, max(0.01, accident_prob))

        risk_level = 'HIGH' if accident_prob > 0.7 else 'MEDIUM' if accident_prob > 0.4 else 'LOW'

        cursor.execute("""
            INSERT INTO accident_predictions (temperature, vibration, rpm, `load`, accident_probability, risk_level, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            reading['temperature'],
            reading['vibration'],
            reading['rpm'],
            reading['load'],
            round(accident_prob, 4),
            risk_level,
            timestamp
        ))

    print(f"✅ Accident predictions inserted: {count}")

def populate_risk_classifications(cursor, count=100):
    """Populate risk_classifications table"""
    print(f"\n⚠️  Generating {count} risk classifications...")

    for i in range(count):
        sensor_id = random.choice(list(SENSOR_CONFIGS.keys()))
        config = SENSOR_CONFIGS[sensor_id]

        timestamp = datetime.now() - timedelta(hours=random.randint(0, 168))
        reading = generate_realistic_reading(sensor_id, config, timestamp)

        # Determine risk class
        risk_score = (reading['temperature'] / 100 + reading['vibration'] / 7 + reading['load']) / 3
        risk_score *= config['risk_factor']

        if risk_score > 0.6:
            risk_class = 'HIGH'
            confidence = random.uniform(0.75, 0.95)
        elif risk_score > 0.35:
            risk_class = 'MEDIUM'
            confidence = random.uniform(0.65, 0.85)
        else:
            risk_class = 'LOW'
            confidence = random.uniform(0.70, 0.90)

        cursor.execute("""
            INSERT INTO risk_classifications (temperature, vibration, rpm, `load`, risk_class, confidence, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            reading['temperature'],
            reading['vibration'],
            reading['rpm'],
            reading['load'],
            risk_class,
            round(confidence, 4),
            timestamp
        ))

    print(f"✅ Risk classifications inserted: {count}")

def populate_optimizations(cursor, count=50):
    """Populate machine_optimizations table"""
    print(f"\n⚙️  Generating {count} optimization records...")

    for i in range(count):
        timestamp = datetime.now() - timedelta(hours=random.randint(0, 168))

        # Initial (problematic) state
        initial_temp = random.uniform(80, 95)
        initial_vib = random.uniform(4.5, 6.5)
        initial_load = random.uniform(0.75, 0.95)

        # Optimized state (improved)
        optimized_temp = initial_temp - random.uniform(5, 15)
        optimized_vib = initial_vib - random.uniform(1.0, 2.5)
        optimized_load = initial_load - random.uniform(0.1, 0.25)

        # Safety score (higher is better)
        safety_score = 1.0 - ((optimized_temp / 100 + optimized_vib / 7 + optimized_load) / 3)
        safety_score = max(0.5, min(0.99, safety_score))

        cursor.execute("""
            INSERT INTO machine_optimizations
            (initial_temperature, initial_vibration, initial_load,
             optimized_temperature, optimized_vibration, optimized_load,
             safety_score, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            round(initial_temp, 2),
            round(initial_vib, 2),
            round(initial_load, 2),
            round(optimized_temp, 2),
            round(optimized_vib, 2),
            round(optimized_load, 2),
            round(safety_score, 4),
            timestamp
        ))

    print(f"✅ Optimization records inserted: {count}")

def main():
    print("=" * 60)
    print("🏭 Industrial Safety Database - Realistic Data Population")
    print("=" * 60)

    try:
        # Connect to database
        print("\n🔌 Connecting to database...")
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        print("✅ Connected successfully!")

        # Clear existing data (optional)
        print("\n🗑️  Clearing existing data...")
        cursor.execute("DELETE FROM sensor_readings")
        cursor.execute("DELETE FROM accident_predictions")
        cursor.execute("DELETE FROM risk_classifications")
        cursor.execute("DELETE FROM machine_optimizations")
        connection.commit()
        print("✅ Existing data cleared")

        # Populate tables
        populate_sensor_readings(cursor, days=7, readings_per_hour=12)
        connection.commit()

        populate_predictions(cursor, count=150)
        connection.commit()

        populate_risk_classifications(cursor, count=150)
        connection.commit()

        populate_optimizations(cursor, count=75)
        connection.commit()

        # Show summary
        print("\n" + "=" * 60)
        print("📊 Database Population Summary")
        print("=" * 60)

        cursor.execute("SELECT COUNT(*) FROM sensor_readings")
        print(f"  Sensor Readings: {cursor.fetchone()[0]:,}")

        cursor.execute("SELECT COUNT(*) FROM accident_predictions")
        print(f"  Predictions: {cursor.fetchone()[0]:,}")

        cursor.execute("SELECT COUNT(*) FROM risk_classifications")
        print(f"  Classifications: {cursor.fetchone()[0]:,}")

        cursor.execute("SELECT COUNT(*) FROM machine_optimizations")
        print(f"  Optimizations: {cursor.fetchone()[0]:,}")

        print("\n✅ Database populated successfully with realistic industrial data!")
        print("🚀 Your application now has real industrial sensor data!")

        cursor.close()
        connection.close()

    except mysql.connector.Error as err:
        print(f"\n❌ Database error: {err}")
        return 1
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1

    return 0

if __name__ == "__main__":
    exit(main())
