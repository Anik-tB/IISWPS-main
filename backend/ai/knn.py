"""
K-Nearest Neighbors (KNN) Classifier
For worker/machine risk classification
"""

import numpy as np
from typing import Tuple, List
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os


class KNNClassifier:
    """KNN-based risk classifier for industrial safety"""

    def __init__(self, k: int = 5):
        """
        Initialize KNN classifier
a_star_planner
        Args:
            k: Number of nearest neighbors to consider
        """
        self.k = k
        self.scaler = StandardScaler()
        self.model = None

    def _generate_synthetic_data(self, n_samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic training data for risk classification

        Returns:
            X: Feature matrix (temperature, vibration, rpm, load)
            y: Risk labels (0=Low, 1=Medium, 2=High)
        """
        np.random.seed(42)

        # Low risk: normal operating conditions
        low_risk_temp = np.random.normal(70, 5, n_samples // 3)
        low_risk_vib = np.random.normal(2.5, 0.5, n_samples // 3)
        low_risk_rpm = np.random.normal(1000, 100, n_samples // 3)
        low_risk_load = np.random.normal(0.5, 0.1, n_samples // 3)
        low_risk_labels = np.zeros(n_samples // 3)

        # Medium risk: elevated conditions
        med_risk_temp = np.random.normal(80, 8, n_samples // 3)
        med_risk_vib = np.random.normal(4.0, 1.0, n_samples // 3)
        med_risk_rpm = np.random.normal(1200, 150, n_samples // 3)
        med_risk_load = np.random.normal(0.65, 0.15, n_samples // 3)
        med_risk_labels = np.ones(n_samples // 3)

        # High risk: dangerous conditions
        high_risk_temp = np.random.normal(90, 10, n_samples - 2 * (n_samples // 3))
        high_risk_vib = np.random.normal(5.5, 1.5, n_samples - 2 * (n_samples // 3))
        high_risk_rpm = np.random.normal(1400, 200, n_samples - 2 * (n_samples // 3))
        high_risk_load = np.random.normal(0.8, 0.2, n_samples - 2 * (n_samples // 3))
        high_risk_labels = np.full(n_samples - 2 * (n_samples // 3), 2)

        # Combine all data
        X = np.column_stack([
            np.concatenate([low_risk_temp, med_risk_temp, high_risk_temp]),
            np.concatenate([low_risk_vib, med_risk_vib, high_risk_vib]),
            np.concatenate([low_risk_rpm, med_risk_rpm, high_risk_rpm]),
            np.concatenate([low_risk_load, med_risk_load, high_risk_load])
        ])

        y = np.concatenate([low_risk_labels, med_risk_labels, high_risk_labels])

        return X, y

    def train(self, X: np.ndarray = None, y: np.ndarray = None) -> None:
        """
        Train the KNN classifier

        Args:
            X: Feature matrix (optional, generates synthetic if not provided)
            y: Labels (optional, generates synthetic if not provided)
        """
        if X is None or y is None:
            X, y = self._generate_synthetic_data()

        # Scale features
        X_scaled = self.scaler.fit_transform(X)

        # Train KNN
        self.model = KNeighborsClassifier(n_neighbors=self.k, weights='distance')
        self.model.fit(X_scaled, y)

        print(f"✅ KNN model trained with {len(X)} samples")

    def classify(self, temperature: float, vibration: float, rpm: float, load: float) -> Tuple[str, float]:
        """
        Classify risk level for given sensor readings

        Args:
            temperature: Temperature reading
            vibration: Vibration reading
            rpm: RPM reading
            load: Load percentage

        Returns:
            Tuple of (risk_class, confidence)
        """
        if self.model is None:
            # Train with default data if not already trained
            self.train()

        # Prepare input
        X_input = np.array([[temperature, vibration, rpm, load]])
        X_scaled = self.scaler.transform(X_input)

        # Predict
        prediction = self.model.predict(X_scaled)[0]
        probabilities = self.model.predict_proba(X_scaled)[0]

        # Map to risk classes
        risk_classes = ["Low", "Medium", "High"]
        risk_class = risk_classes[int(prediction)]
        confidence = float(probabilities[int(prediction)])

        return risk_class, confidence

    def classify_with_model(self, model_data: dict, temperature: float, vibration: float, rpm: float, load: float) -> Tuple[str, float]:
        """
        Classify using a pre-trained model

        Args:
            model_data: Dictionary containing 'model' and 'scaler' from joblib
            temperature, vibration, rpm, load: Sensor readings

        Returns:
            Tuple of (risk_class, confidence)
        """
        model = model_data['model']
        scaler = model_data['scaler']

        X_input = np.array([[temperature, vibration, rpm, load]])
        X_scaled = scaler.transform(X_input)

        prediction = model.predict(X_scaled)[0]
        probabilities = model.predict_proba(X_scaled)[0]

        risk_classes = ["Low", "Medium", "High"]
        risk_class = risk_classes[int(prediction)]
        confidence = float(probabilities[int(prediction)])

        return risk_class, confidence

    def save_model(self, filepath: str = "models/knn_model.joblib") -> None:
        """Save trained model and scaler"""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")

        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler,
            'k': self.k
        }, filepath)
        print(f"✅ KNN model saved to {filepath}")

