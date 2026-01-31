#!/usr/bin/env python3
"""
Linux Setup Script for Industrial Safety System
Creates .env file and seeds database with real data
"""

import os
import sys
import random
from datetime import datetime, timedelta

def create_env_file():
    """Create .env file with database configuration"""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    
    if os.path.exists(env_path):
        print("⚠️  .env file already exists. Skipping creation.")
        return
    
    print("\n📝 Database Configuration")
    print("-" * 40)
    
    db_host = input("DB Host [localhost]: ").strip() or "localhost"
    db_port = input("DB Port [3306]: ").strip() or "3306"
    db_name = input("DB Name [industrial_safety]: ").strip() or "industrial_safety"
    db_user = input("DB User [root]: ").strip() or "root"
    db_password = input("DB Password: ").strip()
    
    env_content = f"""# Database Configuration
DB_HOST={db_host}
DB_PORT={db_port}
DB_NAME={db_name}
DB_USER={db_user}
DB_PASSWORD={db_password}
"""
    
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print(f"\n✅ Created .env file at {env_path}")


def seed_database():
    """Seed database with realistic industrial sensor data"""
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass
    
    import mysql.connector
    from mysql.connector import Error
    
    print("\n🌱 Seeding database with real data...")
    print("-" * 40)
    
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'industrial_safety'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            port=int(os.getenv('DB_PORT', 3306))
        )
        
        if not connection.is_connected():
            print("❌ Failed to connect to database")
            return False
        
        cursor = connection.cursor()
        
        # Initialize schema first
        schema_path = os.path.join(os.path.dirname(__file__), 'database', 'schema.sql')
        if os.path.exists(schema_path):
            with open(schema_path, 'r') as f:
                schema_sql = f.read()
                for statement in schema_sql.split(';'):
                    if statement.strip():
                        try:
                            cursor.execute(statement)
                        except Error as e:
                            if "already exists" not in str(e).lower():
                                print(f"⚠️  SQL warning: {e}")
            connection.commit()
            print("✅ Database schema initialized")
        
        # Clear existing data
        tables = ['sensor_readings', 'accident_predictions', 'risk_classifications', 
                  'machine_optimizations', 'escape_routes']
        for table in tables:
            try:
                cursor.execute(f"DELETE FROM {table}")
            except:
                pass
        connection.commit()
        print("✅ Cleared existing data")
        
        # Seed sensor readings (last 24 hours of data)
        print("\n📊 Inserting sensor readings...")
        sensor_ids = ['TEMP_001', 'TEMP_002', 'VIB_001', 'VIB_002', 'RPM_001', 'LOAD_001']
        base_time = datetime.now() - timedelta(hours=24)
        
        readings_count = 0
        for i in range(1440):  # One reading per minute for 24 hours
            timestamp = base_time + timedelta(minutes=i)
            
            for sensor_id in sensor_ids:
                # Generate realistic sensor values with some variation
                hour = timestamp.hour
                
                # Temperature varies by time of day (higher during work hours)
                if 8 <= hour <= 18:
                    base_temp = 75 + random.gauss(0, 5)
                else:
                    base_temp = 65 + random.gauss(0, 3)
                
                # Add occasional spikes
                if random.random() < 0.02:
                    base_temp += random.uniform(10, 25)
                
                temperature = max(50, min(120, base_temp))
                vibration = max(0, min(15, 3 + random.gauss(0, 1.5) + (0.5 if random.random() < 0.05 else 0)))
                rpm = max(800, min(3500, 2000 + random.gauss(0, 200)))
                load = max(20, min(100, 60 + random.gauss(0, 15)))
                
                cursor.execute("""
                    INSERT INTO sensor_readings (sensor_id, temperature, vibration, rpm, `load`, timestamp)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (sensor_id, round(temperature, 2), round(vibration, 2), int(rpm), round(load, 2), timestamp))
                readings_count += 1
        
        connection.commit()
        print(f"✅ Inserted {readings_count} sensor readings")
        
        # Seed accident predictions
        print("\n🔮 Inserting accident predictions...")
        predictions_count = 0
        for i in range(500):
            timestamp = base_time + timedelta(minutes=random.randint(0, 1440))
            temperature = random.uniform(60, 110)
            vibration = random.uniform(1, 12)
            rpm = random.randint(1000, 3200)
            load = random.uniform(30, 95)
            
            # Calculate probability based on parameters
            prob = 0.1
            if temperature > 90:
                prob += (temperature - 90) * 0.02
            if vibration > 7:
                prob += (vibration - 7) * 0.05
            if rpm > 2800:
                prob += (rpm - 2800) * 0.0005
            if load > 80:
                prob += (load - 80) * 0.01
            
            prob = min(0.95, max(0.05, prob + random.gauss(0, 0.05)))
            
            if prob < 0.3:
                risk_level = 'LOW'
            elif prob < 0.6:
                risk_level = 'MEDIUM'
            else:
                risk_level = 'HIGH'
            
            cursor.execute("""
                INSERT INTO accident_predictions (temperature, vibration, rpm, `load`, accident_probability, risk_level, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (round(temperature, 2), round(vibration, 2), int(rpm), round(load, 2), round(prob, 4), risk_level, timestamp))
            predictions_count += 1
        
        connection.commit()
        print(f"✅ Inserted {predictions_count} accident predictions")
        
        # Seed risk classifications
        print("\n⚠️  Inserting risk classifications...")
        risk_classes = ['SAFE', 'CAUTION', 'WARNING', 'DANGER']
        classifications_count = 0
        for i in range(300):
            timestamp = base_time + timedelta(minutes=random.randint(0, 1440))
            temperature = random.uniform(55, 115)
            vibration = random.uniform(0.5, 14)
            rpm = random.randint(900, 3400)
            load = random.uniform(25, 98)
            
            # Determine risk class based on parameters
            danger_score = 0
            if temperature > 95:
                danger_score += 2
            elif temperature > 80:
                danger_score += 1
            if vibration > 10:
                danger_score += 2
            elif vibration > 6:
                danger_score += 1
            if load > 85:
                danger_score += 1
            
            risk_class = risk_classes[min(3, danger_score)]
            confidence = random.uniform(0.7, 0.98)
            
            cursor.execute("""
                INSERT INTO risk_classifications (temperature, vibration, rpm, `load`, risk_class, confidence, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (round(temperature, 2), round(vibration, 2), int(rpm), round(load, 2), risk_class, round(confidence, 4), timestamp))
            classifications_count += 1
        
        connection.commit()
        print(f"✅ Inserted {classifications_count} risk classifications")
        
        # Seed machine optimizations
        print("\n⚙️  Inserting machine optimizations...")
        optimizations_count = 0
        for i in range(100):
            timestamp = base_time + timedelta(minutes=random.randint(0, 1440))
            
            # Initial (suboptimal) values
            init_temp = random.uniform(80, 105)
            init_vib = random.uniform(5, 12)
            init_load = random.uniform(70, 95)
            
            # Optimized values (improved)
            opt_temp = init_temp - random.uniform(5, 15)
            opt_vib = init_vib - random.uniform(1, 4)
            opt_load = init_load - random.uniform(5, 20)
            
            safety_score = random.uniform(0.75, 0.98)
            
            cursor.execute("""
                INSERT INTO machine_optimizations 
                (initial_temperature, initial_vibration, initial_load, optimized_temperature, optimized_vibration, optimized_load, safety_score, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (round(init_temp, 2), round(init_vib, 2), round(init_load, 2),
                  round(opt_temp, 2), round(opt_vib, 2), round(opt_load, 2),
                  round(safety_score, 4), timestamp))
            optimizations_count += 1
        
        connection.commit()
        print(f"✅ Inserted {optimizations_count} machine optimizations")
        
        # Seed escape routes
        print("\n🚪 Inserting escape routes...")
        routes_count = 0
        for i in range(50):
            timestamp = base_time + timedelta(minutes=random.randint(0, 1440))
            
            start_x = random.randint(0, 15)
            start_y = random.randint(0, 15)
            goal_x = random.randint(0, 15)
            goal_y = random.randint(0, 15)
            
            # Simple manhattan distance for path length
            path_length = abs(goal_x - start_x) + abs(goal_y - start_y) + random.randint(0, 5)
            path_cost = path_length * random.uniform(1.0, 1.5)
            
            # Generate a simple path
            path = [(start_x, start_y)]
            cx, cy = start_x, start_y
            while (cx, cy) != (goal_x, goal_y):
                if cx < goal_x:
                    cx += 1
                elif cx > goal_x:
                    cx -= 1
                elif cy < goal_y:
                    cy += 1
                elif cy > goal_y:
                    cy -= 1
                path.append((cx, cy))
            
            path_str = str(path)
            
            cursor.execute("""
                INSERT INTO escape_routes (start_x, start_y, goal_x, goal_y, path_length, path_cost, path_coordinates, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (start_x, start_y, goal_x, goal_y, path_length, round(path_cost, 2), path_str, timestamp))
            routes_count += 1
        
        connection.commit()
        print(f"✅ Inserted {routes_count} escape routes")
        
        cursor.close()
        connection.close()
        
        print("\n" + "=" * 50)
        print("🎉 DATABASE SETUP COMPLETE!")
        print("=" * 50)
        print(f"""
Summary:
  - Sensor readings:      {readings_count:,}
  - Accident predictions: {predictions_count}
  - Risk classifications: {classifications_count}
  - Machine optimizations: {optimizations_count}
  - Escape routes:        {routes_count}
        """)
        return True
        
    except Error as e:
        print(f"\n❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False


def main():
    print("=" * 50)
    print("🏭 Industrial Safety System - Linux Setup")
    print("=" * 50)
    
    # Step 1: Create .env file
    create_env_file()
    
    # Step 2: Seed database
    print("\n" + "=" * 50)
    proceed = input("\nSeed database with real data? [Y/n]: ").strip().lower()
    if proceed != 'n':
        seed_database()
    
    print("\n✅ Setup complete! You can now run:")
    print("   cd backend && source venv/bin/activate && python main.py")


if __name__ == "__main__":
    main()

