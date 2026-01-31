"""
Enhanced ML Features
Feature importance, confidence intervals, ensemble predictions
"""

import numpy as np
from typing import Dict, List, Tuple, Any
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
import joblib


class EnhancedMLPredictor:
    """Enhanced ML predictor with advanced features"""

    def __init__(self):
        """Initialize enhanced ML predictor"""
        self.scaler = StandardScaler()
        self.feature_names = ["temperature", "vibration", "rpm", "load"]

    def calculate_feature_importance(self, model: Any, X_sample: np.ndarray) -> Dict[str, float]:
        """
        Calculate feature importance for a model

        Args:
            model: Trained model (LogisticRegression, RandomForest, etc.)
            X_sample: Sample feature matrix

        Returns:
            Dictionary of feature importances
        """
        importances = {}

        if hasattr(model, 'feature_importances_'):
            # Random Forest or tree-based models
            importances_dict = dict(zip(self.feature_names, model.feature_importances_))
            importances = {k: round(float(v), 4) for k, v in importances_dict.items()}
        elif hasattr(model, 'coef_'):
            # Linear models (Logistic Regression)
            coef = model.coef_[0] if len(model.coef_.shape) > 1 else model.coef_
            # Use absolute values as importance
            abs_coef = np.abs(coef)
            total = np.sum(abs_coef)
            if total > 0:
                normalized = abs_coef / total
                importances_dict = dict(zip(self.feature_names, normalized))
                importances = {k: round(float(v), 4) for k, v in importances_dict.items()}
        else:
            # Default: equal importance
            importances = {name: 0.25 for name in self.feature_names}

        return importances

    def calculate_confidence_interval(self, predictions: np.ndarray, confidence: float = 0.95) -> Tuple[float, float]:
        """
        Calculate confidence interval for predictions

        Args:
            predictions: Array of prediction probabilities
            confidence: Confidence level (default 0.95)

        Returns:
            Tuple of (lower_bound, upper_bound)
        """
        if len(predictions) == 0:
            return (0.0, 1.0)

        mean_pred = np.mean(predictions)
        std_pred = np.std(predictions)

        # Z-score for confidence level (approximate for common confidence levels)
        z_scores = {
            0.90: 1.645,
            0.95: 1.960,
            0.99: 2.576
        }
        z_score = z_scores.get(confidence, 1.960)  # Default to 95% confidence

        margin = z_score * std_pred / np.sqrt(len(predictions)) if len(predictions) > 1 else z_score * std_pred

        lower = max(0.0, mean_pred - margin)
        upper = min(1.0, mean_pred + margin)

        return (round(lower, 4), round(upper, 4))

    def ensemble_predict(self, models: List[Any], X: np.ndarray,
                        weights: List[float] = None) -> Tuple[float, Dict[str, Any]]:
        """
        Make ensemble prediction from multiple models

        Args:
            models: List of trained models
            X: Feature matrix
            weights: Optional weights for each model

        Returns:
            Tuple of (ensemble_prediction, metadata)
        """
        if not models:
            return 0.0, {"error": "No models provided"}

        if weights is None:
            weights = [1.0 / len(models)] * len(models)

        predictions = []
        model_predictions = {}

        for i, model in enumerate(models):
            try:
                if hasattr(model, 'predict_proba'):
                    pred = model.predict_proba(X)[0][1] if len(model.predict_proba(X)[0]) > 1 else model.predict_proba(X)[0][0]
                else:
                    pred = model.predict(X)[0]

                predictions.append(pred)
                model_predictions[f"model_{i+1}"] = round(float(pred), 4)
            except Exception as e:
                model_predictions[f"model_{i+1}"] = f"error: {str(e)}"

        if not predictions:
            return 0.0, {"error": "No valid predictions"}

        # Weighted average
        ensemble_pred = sum(p * w for p, w in zip(predictions, weights))

        # Calculate statistics
        mean_pred = np.mean(predictions)
        std_pred = np.std(predictions)

        metadata = {
            "ensemble_prediction": round(float(ensemble_pred), 4),
            "mean_prediction": round(float(mean_pred), 4),
            "std_prediction": round(float(std_pred), 4),
            "model_predictions": model_predictions,
            "agreement": "high" if std_pred < 0.1 else "medium" if std_pred < 0.2 else "low",
            "num_models": len(models)
        }

        return round(float(ensemble_pred), 4), metadata

    def calculate_prediction_uncertainty(self, model: Any, X: np.ndarray) -> Dict[str, float]:
        """
        Calculate prediction uncertainty metrics

        Args:
            model: Trained model
            X: Feature matrix

        Returns:
            Dictionary with uncertainty metrics
        """
        try:
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba(X)[0]
                max_prob = np.max(proba)
                entropy = -np.sum(proba * np.log(proba + 1e-10))
                max_entropy = np.log(len(proba))
                normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0

                return {
                    "confidence": round(float(max_prob), 4),
                    "uncertainty": round(float(1 - max_prob), 4),
                    "entropy": round(float(entropy), 4),
                    "normalized_entropy": round(float(normalized_entropy), 4),
                    "prediction_strength": "high" if max_prob > 0.8 else "medium" if max_prob > 0.6 else "low"
                }
            else:
                return {
                    "confidence": 1.0,
                    "uncertainty": 0.0,
                    "note": "Model does not support probability prediction"
                }
        except Exception as e:
            return {
                "error": str(e),
                "confidence": 0.0,
                "uncertainty": 1.0
            }

    def calculate_sensitivity_analysis(self, model: Any, base_input: np.ndarray,
                                       feature_index: int, variation: float = 0.1) -> Dict[str, Any]:
        """
        Perform sensitivity analysis on a feature

        Args:
            model: Trained model
            base_input: Base input vector
            feature_index: Index of feature to vary
            variation: Percentage variation (default 10%)

        Returns:
            Sensitivity analysis results
        """
        base_value = base_input[0, feature_index]
        variations = [
            base_value * (1 - variation),
            base_value,
            base_value * (1 + variation)
        ]

        predictions = []
        for var_value in variations:
            test_input = base_input.copy()
            test_input[0, feature_index] = var_value

            try:
                if hasattr(model, 'predict_proba'):
                    pred = model.predict_proba(test_input)[0][1] if len(model.predict_proba(test_input)[0]) > 1 else model.predict_proba(test_input)[0][0]
                else:
                    pred = model.predict(test_input)[0]
                predictions.append(float(pred))
            except:
                predictions.append(0.0)

        if len(predictions) == 3:
            sensitivity = abs(predictions[2] - predictions[0]) / (2 * variation) if variation > 0 else 0
            impact = predictions[2] - predictions[0]

            return {
                "feature": self.feature_names[feature_index],
                "base_value": round(float(base_value), 2),
                "sensitivity": round(float(sensitivity), 4),
                "impact": round(float(impact), 4),
                "predictions": {
                    f"-{variation*100}%": round(predictions[0], 4),
                    "base": round(predictions[1], 4),
                    f"+{variation*100}%": round(predictions[2], 4)
                },
                "interpretation": "high_sensitivity" if abs(sensitivity) > 0.5 else "medium_sensitivity" if abs(sensitivity) > 0.2 else "low_sensitivity"
            }

        return {"error": "Could not perform sensitivity analysis"}

