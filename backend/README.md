# Backend - Industrial Safety System API

FastAPI backend for the Intelligent Industrial Safety & Workflow Prediction System.

## Quick Start

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Train models:
   ```bash
   python train_models.py
   ```

3. Start server:
   ```bash
   python main.py
   ```

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Environment Variables

Create a `.env` file (optional):
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=industrial_safety
DB_USER=root
DB_PASSWORD=
```

## Project Structure

- `main.py` - FastAPI application and endpoints
- `ai/` - AI algorithm implementations
- `models/` - Trained ML models (generated)
- `database/` - Database connection and schema
- `train_models.py` - Model training script

