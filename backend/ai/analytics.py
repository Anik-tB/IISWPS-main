"""
Advanced Analytics Module
For trend analysis, anomaly detection, and statistical insights
"""

import numpy as np
from typing import List, Dict, Tuple, Any
from datetime import datetime, timedelta
from collections import defaultdict
import statistics


class AnalyticsEngine:
    """Advanced analytics for industrial safety data"""

    def __init__(self):
        """Initialize analytics engine"""
        pass

    def calculate_trends(self, data_points: List[Dict[str, float]], window_size: int = 10) -> Dict[str, Any]:
        """
        Calculate trend analysis for sensor data

        Args:
            data_points: List of sensor readings with timestamps
            window_size: Size of moving average window

        Returns:
            Dictionary with trend information
        """
        if len(data_points) < 2:
            return {"error": "Insufficient data for trend analysis"}

        # Extract values
        temperatures = [d.get("temperature", 0) for d in data_points]
        vibrations = [d.get("vibration", 0) for d in data_points]
        rpms = [d.get("rpm", 0) for d in data_points]
        loads = [d.get("load", 0) for d in data_points]

        trends = {}

        for metric, values in [
            ("temperature", temperatures),
            ("vibration", vibrations),
            ("rpm", rpms),
            ("load", loads)
        ]:
            if len(values) >= window_size:
                # Moving average
                moving_avg = []
                for i in range(window_size - 1, len(values)):
                    window = values[i - window_size + 1:i + 1]
                    moving_avg.append(sum(window) / len(window))

                # Trend direction (slope)
                if len(moving_avg) >= 2:
                    x = np.arange(len(moving_avg))
                    slope = np.polyfit(x, moving_avg, 1)[0]
                    trend_direction = "increasing" if slope > 0.01 else "decreasing" if slope < -0.01 else "stable"
                else:
                    slope = 0
                    trend_direction = "stable"

                # Rate of change
                if len(values) >= 2:
                    rate_of_change = ((values[-1] - values[0]) / values[0]) * 100 if values[0] != 0 else 0
                else:
                    rate_of_change = 0

                trends[metric] = {
                    "current": round(values[-1], 2),
                    "average": round(sum(values) / len(values), 2),
                    "min": round(min(values), 2),
                    "max": round(max(values), 2),
                    "std_dev": round(statistics.stdev(values) if len(values) > 1 else 0, 2),
                    "trend": trend_direction,
                    "slope": round(slope, 4),
                    "rate_of_change_percent": round(rate_of_change, 2),
                    "moving_avg": [round(v, 2) for v in moving_avg[-5:]]  # Last 5 values
                }
            else:
                trends[metric] = {
                    "current": round(values[-1] if values else 0, 2),
                    "average": round(sum(values) / len(values) if values else 0, 2),
                    "trend": "insufficient_data"
                }

        return trends

    def detect_anomalies(self, data_points: List[Dict[str, float]], threshold_std: float = 2.0) -> List[Dict[str, Any]]:
        """
        Detect anomalies using statistical methods (Z-score)

        Args:
            data_points: List of sensor readings
            threshold_std: Standard deviation threshold for anomaly detection

        Returns:
            List of detected anomalies
        """
        if len(data_points) < 3:
            return []

        anomalies = []

        # Extract metrics
        metrics = ["temperature", "vibration", "rpm", "load"]

        for metric in metrics:
            values = [d.get(metric, 0) for d in data_points if metric in d]
            if len(values) < 3:
                continue

            mean = statistics.mean(values)
            std = statistics.stdev(values) if len(values) > 1 else 0

            if std == 0:
                continue

            # Check each data point
            for i, data_point in enumerate(data_points):
                if metric not in data_point:
                    continue

                value = data_point[metric]
                z_score = abs((value - mean) / std)

                if z_score > threshold_std:
                    anomalies.append({
                        "index": i,
                        "metric": metric,
                        "value": round(value, 2),
                        "expected_range": {
                            "min": round(mean - threshold_std * std, 2),
                            "max": round(mean + threshold_std * std, 2)
                        },
                        "z_score": round(z_score, 2),
                        "severity": "high" if z_score > 3.0 else "medium",
                        "timestamp": data_point.get("timestamp", datetime.now().isoformat())
                    })

        return anomalies

    def calculate_statistics(self, data_points: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        Calculate comprehensive statistics

        Args:
            data_points: List of sensor readings

        Returns:
            Dictionary with statistical summaries
        """
        if not data_points:
            return {"error": "No data provided"}

        stats = {}

        metrics = ["temperature", "vibration", "rpm", "load"]

        for metric in metrics:
            values = [d.get(metric, 0) for d in data_points if metric in d]
            if not values:
                continue

            sorted_values = sorted(values)
            n = len(values)

            stats[metric] = {
                "count": n,
                "mean": round(statistics.mean(values), 2),
                "median": round(statistics.median(values), 2),
                "mode": round(statistics.mode(values), 2) if len(set(values)) < len(values) else None,
                "std_dev": round(statistics.stdev(values) if n > 1 else 0, 2),
                "variance": round(statistics.variance(values) if n > 1 else 0, 2),
                "min": round(min(values), 2),
                "max": round(max(values), 2),
                "range": round(max(values) - min(values), 2),
                "q1": round(sorted_values[n // 4], 2) if n >= 4 else None,
                "q3": round(sorted_values[3 * n // 4], 2) if n >= 4 else None,
                "iqr": round(sorted_values[3 * n // 4] - sorted_values[n // 4], 2) if n >= 4 else None,
                "percentile_95": round(sorted_values[int(0.95 * n)] if n > 0 else 0, 2),
                "percentile_99": round(sorted_values[int(0.99 * n)] if n > 0 else 0, 2)
            }

        return stats

    def predict_maintenance(self, data_points: List[Dict[str, float]],
                          maintenance_thresholds: Dict[str, float] = None) -> Dict[str, Any]:
        """
        Predict maintenance needs based on sensor data

        Args:
            data_points: List of sensor readings
            maintenance_thresholds: Custom thresholds for maintenance triggers

        Returns:
            Maintenance prediction with recommendations
        """
        if maintenance_thresholds is None:
            maintenance_thresholds = {
                "temperature": 85.0,
                "vibration": 5.0,
                "rpm": 1400,
                "load": 0.8
            }

        if not data_points:
            return {"error": "No data provided"}

        recent_data = data_points[-10:] if len(data_points) >= 10 else data_points

        maintenance_issues = []
        urgency_scores = []

        for metric, threshold in maintenance_thresholds.items():
            values = [d.get(metric, 0) for d in recent_data if metric in d]
            if not values:
                continue

            avg_value = statistics.mean(values)
            max_value = max(values)

            if max_value > threshold:
                severity = "critical" if max_value > threshold * 1.2 else "high" if max_value > threshold * 1.1 else "medium"
                urgency = 3 if severity == "critical" else 2 if severity == "high" else 1
                urgency_scores.append(urgency)

                maintenance_issues.append({
                    "metric": metric,
                    "current_avg": round(avg_value, 2),
                    "current_max": round(max_value, 2),
                    "threshold": threshold,
                    "exceedance_percent": round(((max_value - threshold) / threshold) * 100, 2),
                    "severity": severity,
                    "urgency": urgency,
                    "recommendation": self._get_maintenance_recommendation(metric, severity)
                })

        overall_urgency = max(urgency_scores) if urgency_scores else 0
        needs_maintenance = overall_urgency >= 2

        return {
            "needs_maintenance": needs_maintenance,
            "overall_urgency": overall_urgency,
            "urgency_level": "critical" if overall_urgency >= 3 else "high" if overall_urgency >= 2 else "low",
            "issues": maintenance_issues,
            "recommended_action": "Immediate maintenance required" if needs_maintenance else "Routine monitoring",
            "estimated_downtime_hours": sum(3 if issue["severity"] == "critical" else 1 for issue in maintenance_issues) if needs_maintenance else 0
        }

    def _get_maintenance_recommendation(self, metric: str, severity: str) -> str:
        """Get maintenance recommendation based on metric and severity"""
        recommendations = {
            "temperature": {
                "critical": "Immediate shutdown and cooling system inspection required",
                "high": "Reduce load and inspect cooling system",
                "medium": "Monitor closely and schedule cooling system maintenance"
            },
            "vibration": {
                "critical": "Emergency shutdown - possible bearing or alignment failure",
                "high": "Reduce RPM and inspect mechanical components",
                "medium": "Schedule vibration analysis and component inspection"
            },
            "rpm": {
                "critical": "Emergency shutdown - operating beyond safe limits",
                "high": "Reduce RPM to safe operating range",
                "medium": "Monitor RPM and adjust operating parameters"
            },
            "load": {
                "critical": "Immediate load reduction required - risk of equipment failure",
                "high": "Reduce load to safe operating range",
                "medium": "Monitor load and schedule capacity review"
            }
        }

        return recommendations.get(metric, {}).get(severity, "Monitor and review operating parameters")

    def calculate_correlation(self, data_points: List[Dict[str, float]]) -> Dict[str, float]:
        """
        Calculate correlation between different sensor metrics

        Args:
            data_points: List of sensor readings

        Returns:
            Correlation matrix
        """
        if len(data_points) < 3:
            return {}

        metrics = ["temperature", "vibration", "rpm", "load"]
        metric_values = {metric: [d.get(metric, 0) for d in data_points if metric in d] for metric in metrics}

        # Filter to metrics with sufficient data
        valid_metrics = {k: v for k, v in metric_values.items() if len(v) >= 3}

        correlations = {}

        metric_list = list(valid_metrics.keys())
        for i, metric1 in enumerate(metric_list):
            for metric2 in metric_list[i+1:]:
                values1 = valid_metrics[metric1]
                values2 = valid_metrics[metric2]

                # Ensure same length
                min_len = min(len(values1), len(values2))
                if min_len < 3:
                    continue

                v1 = values1[:min_len]
                v2 = values2[:min_len]

                # Calculate Pearson correlation
                mean1 = statistics.mean(v1)
                mean2 = statistics.mean(v2)

                numerator = sum((v1[i] - mean1) * (v2[i] - mean2) for i in range(min_len))
                denom1 = sum((v1[i] - mean1) ** 2 for i in range(min_len))
                denom2 = sum((v2[i] - mean2) ** 2 for i in range(min_len))

                if denom1 > 0 and denom2 > 0:
                    correlation = numerator / (denom1 ** 0.5 * denom2 ** 0.5)
                    correlations[f"{metric1}_vs_{metric2}"] = round(correlation, 4)

        return correlations

