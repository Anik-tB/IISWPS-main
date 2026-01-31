"""
Database Setup Script
Helps set up MySQL database for the Industrial Safety System
"""

import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database():
    """Interactive database setup"""
    print("=" * 60)
    print("🗄️  MySQL Database Setup for Industrial Safety System")
    print("=" * 60)

    # Get database credentials
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = int(os.getenv('DB_PORT', 3306))
    db_user = os.getenv('DB_USER', 'root')
    db_password = os.getenv('DB_PASSWORD', '')
    db_name = os.getenv('DB_NAME', 'industrial_safety')

    print(f"\n📋 Configuration:")
    print(f"   Host: {db_host}")
    print(f"   Port: {db_port}")
    print(f"   User: {db_user}")
    print(f"   Database: {db_name}")

    if not db_password:
        print("\n⚠️  Warning: DB_PASSWORD not set in .env file")
        print("   Please add your MySQL root password to backend/.env")
        print("   Example: DB_PASSWORD=your_password")
        return False

    try:
        # Connect to MySQL server (without database)
        print(f"\n🔌 Connecting to MySQL server...")
        connection = mysql.connector.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password
        )

        if connection.is_connected():
            print("✅ Connected to MySQL server")

            cursor = connection.cursor()

            # Create database
            print(f"\n📦 Creating database '{db_name}'...")
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
            print(f"✅ Database '{db_name}' created/verified")

            # Select database
            cursor.execute(f"USE {db_name}")

            # Read and execute schema
            schema_path = os.path.join(os.path.dirname(__file__), 'database', 'schema.sql')
            if os.path.exists(schema_path):
                print(f"\n📋 Reading schema from {schema_path}...")
                with open(schema_path, 'r') as f:
                    schema_sql = f.read()

                # Execute each statement
                statements = [s.strip() for s in schema_sql.split(';') if s.strip()]
                print(f"   Found {len(statements)} SQL statements")

                for i, statement in enumerate(statements, 1):
                    try:
                        cursor.execute(statement)
                        print(f"   ✅ Statement {i}/{len(statements)} executed")
                    except Error as e:
                        if "already exists" in str(e).lower():
                            print(f"   ⚠️  Statement {i}: Table already exists (skipping)")
                        else:
                            print(f"   ⚠️  Statement {i} warning: {e}")

                connection.commit()
                print("\n✅ Database schema initialized successfully!")
            else:
                print(f"⚠️  Schema file not found at {schema_path}")
                print("   Creating basic tables...")
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS sensor_readings (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        sensor_id VARCHAR(50),
                        temperature FLOAT,
                        vibration FLOAT,
                        rpm INT,
                        load FLOAT,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                connection.commit()
                print("✅ Basic tables created")

            # Show tables
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            print(f"\n📊 Database tables:")
            for table in tables:
                print(f"   - {table[0]}")

            cursor.close()
            connection.close()

            print("\n" + "=" * 60)
            print("✅ Database setup complete!")
            print("=" * 60)
            return True

    except Error as e:
        print(f"\n❌ Database setup failed: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Make sure MySQL server is running")
        print("   2. Check your password in backend/.env file")
        print("   3. Verify MySQL is accessible on the configured host/port")
        return False


if __name__ == "__main__":
    # Check if python-dotenv is installed
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        print("⚠️  python-dotenv not installed. Using environment variables only.")
        print("   Install it with: pip install python-dotenv")

    setup_database()

