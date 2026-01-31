"""
Model Loader
Loads pre-trained ML models from disk
"""

import joblib
import os
from typing import Tuple, Optional


def load_models() -> Tuple[Optional[dict], Optional[dict]]:
    """
    Load trained models from disk

    Returns:
        Tuple of (knn_model_dict, logistic_model_dict) or (None, None) if not found
    """
    knn_model = None
    logistic_model = None

    # Load KNN model
    knn_path = "models/knn_model.joblib"
    if os.path.exists(knn_path):
        try:
            knn_model = joblib.load(knn_path)
            print(f"✅ Loaded KNN model from {knn_path}")
        except Exception as e:
            print(f"⚠️ Error loading KNN model: {e}")

    # Load Logistic Regression model
    logistic_path = "models/logistic_model.joblib"
    if os.path.exists(logistic_path):
        try:
            logistic_model = joblib.load(logistic_path)
            print(f"✅ Loaded Logistic Regression model from {logistic_path}")
        except Exception as e:
            print(f"⚠️ Error loading Logistic Regression model: {e}")

    return knn_model, logistic_model

