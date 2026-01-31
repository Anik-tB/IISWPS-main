"""
Alert System Module
For threshold management and alert generation
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
from enum import Enum


class AlertSeverity(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertSystem:
    """Alert system for industrial safety monitoring"""

    def __init__(self):
        """Initialize alert system with default thresholds"""
        self.default_thresholds = {
            "temperature": {"warning": 80.0, "critical": 90.0},
            "vibration": {"warning": 4.5, "critical": 6.0},
            "rpm": {"warning": 1300, "critical": 1450},
            "load": {"warning": 0.75, "critical": 0.85},
            "accident_probability": {"warning": 0.5, "critical": 0.7}
        }
        self.custom_thresholds = {}

    def set_thresholds(self, thresholds: Dict[str, Dict[str, float]]):
        """
        Set custom thresholds for alerts

        Args:
            thresholds: Dictionary of metric thresholds
                       Example: {"temperature": {"warning": 85.0, "critical": 95.0}}
        """
        self.custom_thresholds.update(thresholds)

    def get_thresholds(self, metric: str = None) -> Dict[str, Any]:
        """
        Get thresholds for a metric or all metrics

        Args:
            metric: Optional metric name

        Returns:
            Dictionary of thresholds
        """
        all_thresholds = {**self.default_thresholds, **self.custom_thresholds}
        if metric:
            return all_thresholds.get(metric, {})
        return all_thresholds

    def check_alert(self, metric: str, value: float,
                   custom_thresholds: Dict[str, float] = None) -> Optional[Dict[str, Any]]:
        """
        Check if a value triggers an alert

        Args:
            metric: Metric name (temperature, vibration, etc.)
            value: Current value
            custom_thresholds: Optional custom thresholds for this check

        Returns:
            Alert dictionary if threshold exceeded, None otherwise
        """
        thresholds = custom_thresholds or self.get_thresholds(metric)

        if not thresholds:
            return None

        severity = None
        level = None

        if "critical" in thresholds and value >= thresholds["critical"]:
            severity = AlertSeverity.CRITICAL
            level = "critical"
        elif "warning" in thresholds and value >= thresholds["warning"]:
            severity = AlertSeverity.WARNING
            level = "warning"

        if severity:
            return {
                "metric": metric,
                "value": value,
                "threshold": thresholds.get(level, 0),
                "severity": severity.value,
                "level": level,
                "exceedance": round(value - thresholds.get(level, 0), 2),
                "exceedance_percent": round(((value - thresholds.get(level, 0)) / thresholds.get(level, 1)) * 100, 2),
                "timestamp": datetime.now().isoformat(),
                "message": self._generate_alert_message(metric, level, value, thresholds.get(level, 0))
            }

        return None

    def check_multiple_alerts(self, readings: Dict[str, float]) -> List[Dict[str, Any]]:
        """
        Check multiple metrics for alerts

        Args:
            readings: Dictionary of metric values
                     Example: {"temperature": 85.0, "vibration": 5.0, ...}

        Returns:
            List of alerts
        """
        alerts = []

        for metric, value in readings.items():
            alert = self.check_alert(metric, value)
            if alert:
                alerts.append(alert)

        return alerts

    def _generate_alert_message(self, metric: str, level: str, value: float, threshold: float) -> str:
        """Generate human-readable alert message"""
        messages = {
            "temperature": {
                "warning": f"Temperature elevated: {value:.1f}°F (threshold: {threshold:.1f}°F)",
                "critical": f"CRITICAL: Temperature dangerously high: {value:.1f}°F (threshold: {threshold:.1f}°F)"
            },
            "vibration": {
                "warning": f"Vibration level elevated: {value:.2f} (threshold: {threshold:.2f})",
                "critical": f"CRITICAL: Excessive vibration: {value:.2f} (threshold: {threshold:.2f})"
            },
            "rpm": {
                "warning": f"RPM above safe limit: {value:.0f} (threshold: {threshold:.0f})",
                "critical": f"CRITICAL: RPM critically high: {value:.0f} (threshold: {threshold:.0f})"
            },
            "load": {
                "warning": f"Load capacity high: {value:.2%} (threshold: {threshold:.2%})",
                "critical": f"CRITICAL: Load capacity exceeded: {value:.2%} (threshold: {threshold:.2%})"
            },
            "accident_probability": {
                "warning": f"Accident probability elevated: {value:.1%} (threshold: {threshold:.1%})",
                "critical": f"CRITICAL: High accident probability: {value:.1%} (threshold: {threshold:.1%})"
            }
        }

        return messages.get(metric, {}).get(level, f"{metric} threshold exceeded: {value} (threshold: {threshold})")

    def get_alert_summary(self, alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Get summary of alerts

        Args:
            alerts: List of alert dictionaries

        Returns:
            Summary dictionary
        """
        if not alerts:
            return {
                "total": 0,
                "critical": 0,
                "warning": 0,
                "info": 0,
                "status": "normal"
            }

        critical_count = sum(1 for a in alerts if a.get("severity") == "critical")
        warning_count = sum(1 for a in alerts if a.get("severity") == "warning")
        info_count = sum(1 for a in alerts if a.get("severity") == "info")

        status = "critical" if critical_count > 0 else "warning" if warning_count > 0 else "normal"

        return {
            "total": len(alerts),
            "critical": critical_count,
            "warning": warning_count,
            "info": info_count,
            "status": status,
            "requires_action": critical_count > 0 or warning_count > 0
        }

