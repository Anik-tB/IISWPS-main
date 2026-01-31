"""
Database Connection Module
MySQL database connection and initialization
"""

import mysql.connector
from mysql.connector import Error
import os
from typing import Optional

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv not installed, use system environment variables


def get_db_connection():
    """
    Get MySQL database connection

    Returns:
        MySQL connection object or None if connection fails
    """
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'industrial_safety'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            port=int(os.getenv('DB_PORT', 3306))
        )
        return connection
    except Error as e:
        print(f"❌ Database connection error: {e}")
        return None


def create_database_if_not_exists():
    """
    Create database if it doesn't exist
    """
    try:
        # Connect without specifying database
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            port=int(os.getenv('DB_PORT', 3306))
        )
        cursor = connection.cursor()
        db_name = os.getenv('DB_NAME', 'industrial_safety')

        # Create database if it doesn't exist
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"✅ Database '{db_name}' ready")

        cursor.close()
        connection.close()
    except Error as e:
        print(f"⚠️ Could not create database: {e}")
        print("   Please create it manually: CREATE DATABASE industrial_safety;")


def init_database():
    """
    Initialize database schema
    Creates tables if they don't exist
    """
    # First, try to create database if it doesn't exist
    create_database_if_not_exists()

    connection = get_db_connection()
    if connection is None:
        print("⚠️ Database not available. Running in offline mode.")
        return

    try:
        cursor = connection.cursor()

        # Read and execute schema
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        if os.path.exists(schema_path):
            with open(schema_path, 'r') as f:
                schema_sql = f.read()
                # Execute each statement
                for statement in schema_sql.split(';'):
                    if statement.strip():
                        try:
                            cursor.execute(statement)
                        except Error as e:
                            # Ignore "table already exists" errors
                            if "already exists" not in str(e).lower():
                                print(f"⚠️ SQL execution warning: {e}")
            connection.commit()
            print("✅ Database schema initialized")
        else:
            print("⚠️ Schema file not found. Creating basic tables...")
            # Create basic tables if schema file doesn't exist
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

        cursor.close()
    except Error as e:
        print(f"⚠️ Database initialization error: {e}")
    finally:
        if connection.is_connected():
            connection.close()

