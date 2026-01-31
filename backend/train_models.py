"""
Model Training Script
Trains KNN and Logistic Regression models and saves them
"""

import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai.knn import KNNClassifier
from ai.logistic import LogisticPredictor


def train_all_models():
    """Train all ML models and save them"""
    print("=" * 60)
    print("🤖 Training ML Models for Industrial Safety System")
    print("=" * 60)

    # Create models directory
    os.makedirs("models", exist_ok=True)

    # Train KNN Classifier
    print("\n📊 Training KNN Classifier...")
    knn = KNNClassifier(k=5)
    knn.train()
    knn.save_model("models/knn_model.joblib")

    # Train Logistic Regression
    print("\n📈 Training Logistic Regression...")
    logistic = LogisticPredictor()
    logistic.train()
    logistic.save_model("models/logistic_model.joblib")

    print("\n" + "=" * 60)
    print("✅ All models trained and saved successfully!")
    print("=" * 60)
    print("\nModels saved in: ./models/")
    print("  - knn_model.joblib")
    print("  - logistic_model.joblib")
    print("\nYou can now start the API server with: python main.py")


if __name__ == "__main__":
    train_all_models()

