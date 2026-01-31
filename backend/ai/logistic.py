"""
Logistic Regression Predictor
For accident probability prediction
"""

import numpy as np
from typing import Tuple
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import joblib
import os


class LogisticPredictor:
    """Logistic Regression model for accident probability prediction"""

    def __init__(self):
        """Initialize logistic regression predictor"""
        self.scaler = StandardScaler()
        self.model = None

    def _generate_synthetic_data(self, n_samples: int = 2000) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate synthetic training data for accident prediction

        Returns:
            X: Feature matrix (temperature, vibration, rpm, load)
            y: Binary labels (0=no accident, 1=accident)
        """
        np.random.seed(42)

        # Safe conditions (no accident)
        safe_temp = np.random.normal(70, 8, n_samples // 2)
        safe_vib = np.random.normal(2.8, 0.8, n_samples // 2)
        safe_rpm = np.random.normal(1050, 150, n_samples // 2)
        safe_load = np.random.normal(0.52, 0.12, n_samples // 2)
        safe_labels = np.zeros(n_samples // 2)

        # Dangerous conditions (accident likely)
        # Higher temperature, vibration, rpm, and load increase accident probability
        danger_temp = np.random.normal(85, 12, n_samples // 2)
        danger_vib = np.random.normal(4.8, 1.5, n_samples // 2)
        danger_rpm = np.random.normal(1300, 200, n_samples // 2)
        danger_load = np.random.normal(0.75, 0.18, n_samples // 2)
        danger_labels = np.ones(n_samples // 2)

        # Combine
        X = np.column_stack([
            np.concatenate([safe_temp, danger_temp]),
            np.concatenate([safe_vib, danger_vib]),
            np.concatenate([safe_rpm, danger_rpm]),
            np.concatenate([safe_load, danger_load])
        ])

        y = np.concatenate([safe_labels, danger_labels])

        # Add some noise - not all high values lead to accidents
        noise_indices = np.random.choice(len(y), size=int(0.1 * len(y)), replace=False)
        y[noise_indices] = 1 - y[noise_indices]

        return X, y

    def train(self, X: np.ndarray = None, y: np.ndarray = None) -> None:
        """
        Train the logistic regression model

        Args:
            X: Feature matrix (optional, generates synthetic if not provided)
            y: Binary labels (optional, generates synthetic if not provided)
        """
        if X is None or y is None:
            X, y = self._generate_synthetic_data()

        # Scale features
        X_scaled = self.scaler.fit_transform(X)

        # Train logistic regression
        self.model = LogisticRegression(max_iter=1000, random_state=42)
        self.model.fit(X_scaled, y)

        print(f"✅ Logistic Regression model trained with {len(X)} samples")
        print(f"   Accuracy: {self.model.score(X_scaled, y):.4f}")

    def predict(self, temperature: float, vibration: float, rpm: float, load: float) -> float:
        """
        Predict accident probability

        Args:
            temperature: Temperature reading
            vibration: Vibration reading
            rpm: RPM reading
            load: Load percentage

        Returns:
            Accident probability (0.0 to 1.0)
        """
        if self.model is None:
            # Train with default data if not already trained
            self.train()

        # Prepare input
        X_input = np.array([[temperature, vibration, rpm, load]])
        X_scaled = self.scaler.transform(X_input)

        # Predict probability
        probability = self.model.predict_proba(X_scaled)[0][1]  # Probability of accident (class 1)

        return float(probability)

    def predict_with_model(self, model_data: dict, temperature: float, vibration: float, rpm: float, load: float) -> float:
        """
        Predict using a pre-trained model

        Args:
            model_data: Dictionary containing 'model' and 'scaler' from joblib
            temperature, vibration, rpm, load: Sensor readings

        Returns:
            Accident probability (0.0 to 1.0)
        """
        model = model_data['model']
        scaler = model_data['scaler']

        X_input = np.array([[temperature, vibration, rpm, load]])
        X_scaled = scaler.transform(X_input)

        probability = model.predict_proba(X_scaled)[0][1]

        return float(probability)

    def save_model(self, filepath: str = "models/logistic_model.joblib") -> None:
        """Save trained model and scaler"""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")

        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({
            'model': self.model,
            'scaler': self.scaler
        }, filepath)
        print(f"✅ Logistic Regression model saved to {filepath}")

