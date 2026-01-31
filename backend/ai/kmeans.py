"""
K-Means Clustering for Industrial Safety
Real-world applications: Sensor grouping, anomaly detection, maintenance scheduling, risk zone identification
"""

import numpy as np
from typing import List, Dict, Tuple, Any
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import json


class KMeansClusterer:
    """
    K-Means clustering for industrial safety applications

    Real-world use cases:
    1. Sensor Clustering - Group sensors with similar behavior patterns
    2. Anomaly Detection - Identify sensors that don't fit normal clusters
    3. Maintenance Scheduling - Cluster machines by similar maintenance needs
    4. Risk Zone Identification - Cluster factory floor areas by risk levels
    5. Predictive Maintenance - Cluster equipment by failure patterns
    """

    def __init__(self):
        """Initialize K-Means clusterer"""
        self.scaler = StandardScaler()
        self.kmeans_model = None
        self.n_clusters = None

    def cluster_sensors(
        self,
        sensor_data: List[Dict[str, Any]],
        n_clusters: int = None,
        features: List[str] = None
    ) -> Dict[str, Any]:
        """
        Cluster sensors based on their behavior patterns

        Args:
            sensor_data: List of sensor readings with metrics
            n_clusters: Number of clusters (auto-determined if None)
            features: List of features to use for clustering (default: all metrics)

        Returns:
            Dictionary with cluster assignments, centroids, and analysis
        """
        if not sensor_data or len(sensor_data) < 2:
            return {
                "error": "Insufficient data for clustering",
                "clusters": [],
                "n_clusters": 0
            }

        # Default features for sensor clustering
        if features is None:
            features = ["temperature", "vibration", "rpm", "load", "accident_probability"]

        # Extract feature matrix
        X = []
        sensor_ids = []
        for sensor in sensor_data:
            row = []
            valid = True
            for feature in features:
                if feature in sensor:
                    value = sensor[feature]
                    if isinstance(value, (int, float)):
                        row.append(float(value))
                    else:
                        valid = False
                        break
                else:
                    valid = False
                    break

            if valid and len(row) == len(features):
                X.append(row)
                sensor_ids.append(sensor.get("id", f"SENSOR_{len(sensor_ids)}"))

        if len(X) < 2:
            return {
                "error": "Insufficient valid data for clustering",
                "clusters": [],
                "n_clusters": 0
            }

        X = np.array(X)

        # Determine optimal number of clusters if not specified
        if n_clusters is None:
            n_clusters = self._determine_optimal_clusters(X, max_k=min(5, len(X)))

        # Scale features
        X_scaled = self.scaler.fit_transform(X)

        # Perform K-Means clustering
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X_scaled)

        # Calculate cluster statistics
        clusters = self._analyze_clusters(X, labels, sensor_ids, features, kmeans.cluster_centers_, n_clusters)

        # Identify anomalies (sensors far from their cluster center)
        anomalies = self._identify_anomalies(X_scaled, labels, kmeans.cluster_centers_)

        return {
            "n_clusters": n_clusters,
            "clusters": clusters,
            "anomalies": anomalies,
            "features_used": features,
            "inertia": float(kmeans.inertia_),
            "silhouette_score": self._calculate_silhouette_score(X_scaled, labels),
            "cluster_centers": kmeans.cluster_centers_.tolist(),
            "interpretation": self._interpret_clusters(clusters, features)
        }

    def cluster_maintenance_zones(
        self,
        machine_data: List[Dict[str, Any]],
        n_clusters: int = 3
    ) -> Dict[str, Any]:
        """
        Cluster machines by maintenance needs

        Real-world application: Schedule maintenance for similar machines together

        Args:
            machine_data: List of machine readings
            n_clusters: Number of maintenance priority groups (Low/Medium/High)

        Returns:
            Clustered maintenance groups
        """
        features = ["temperature", "vibration", "rpm", "load", "accident_probability"]
        return self.cluster_sensors(machine_data, n_clusters=n_clusters, features=features)

    def cluster_risk_zones(
        self,
        location_data: List[Dict[str, Any]],
        n_clusters: int = 3
    ) -> Dict[str, Any]:
        """
        Cluster factory floor locations by risk levels

        Real-world application: Identify high-risk zones for safety measures

        Args:
            location_data: List of location readings with coordinates and metrics
            n_clusters: Number of risk zones (Low/Medium/High)

        Returns:
            Risk zone clusters
        """
        # Include location coordinates and risk metrics
        features = ["location_x", "location_y", "temperature", "vibration", "accident_probability"]

        # Prepare data with location info
        processed_data = []
        for item in location_data:
            processed = item.copy()
            if "location" in item:
                processed["location_x"] = item["location"].get("x", 0)
                processed["location_y"] = item["location"].get("y", 0)
            processed_data.append(processed)

        return self.cluster_sensors(processed_data, n_clusters=n_clusters, features=features)

    def _determine_optimal_clusters(self, X: np.ndarray, max_k: int = 5) -> int:
        """
        Determine optimal number of clusters using Elbow Method

        Args:
            X: Feature matrix
            max_k: Maximum number of clusters to test

        Returns:
            Optimal number of clusters
        """
        if len(X) < 2:
            return 1

        max_k = min(max_k, len(X) - 1)
        if max_k < 2:
            return 2

        inertias = []
        k_range = range(2, max_k + 1)

        X_scaled = self.scaler.fit_transform(X)

        for k in k_range:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(X_scaled)
            inertias.append(kmeans.inertia_)

        # Simple elbow detection: find point where inertia decrease slows
        if len(inertias) < 2:
            return 2

        # Calculate rate of change
        decreases = [inertias[i] - inertias[i+1] for i in range(len(inertias)-1)]
        if not decreases:
            return 2

        # Find elbow (where decrease rate drops significantly)
        for i in range(len(decreases) - 1):
            if decreases[i+1] < decreases[i] * 0.5:  # Significant drop in decrease rate
                return k_range[i+1]

        # Default to 3 clusters if no clear elbow
        return min(3, max_k)

    def _analyze_clusters(
        self,
        X: np.ndarray,
        labels: np.ndarray,
        sensor_ids: List[str],
        features: List[str],
        centers: np.ndarray,
        n_clusters: int
    ) -> List[Dict[str, Any]]:
        """
        Analyze each cluster and provide statistics

        Args:
            X: Feature matrix
            labels: Cluster labels
            sensor_ids: List of sensor IDs
            features: Feature names
            centers: Cluster centers

        Returns:
            List of cluster analysis dictionaries
        """
        clusters = []
        unique_labels = np.unique(labels)

        # Ensure all clusters from 0 to n_clusters-1 are represented
        # Even if a cluster has no sensors, we still include it
        for cluster_id in range(n_clusters):
            cluster_mask = labels == cluster_id
            cluster_data = X[cluster_mask]
            cluster_sensors = [sensor_ids[i] for i in range(len(sensor_ids)) if cluster_mask[i]]

            # If cluster has no sensors, create empty cluster with default values
            if len(cluster_data) == 0:
                clusters.append({
                    "cluster_id": int(cluster_id) + 1,  # 1-indexed for display
                    "size": 0,
                    "sensor_ids": [],
                    "centroid": centers[cluster_id].tolist() if cluster_id < len(centers) else [0.0] * len(features),
                    "mean_values": {
                        features[i]: 0.0 for i in range(len(features))
                    },
                    "std_values": {
                        features[i]: 0.0 for i in range(len(features))
                    },
                    "characteristics": {},
                    "risk_level": "Low"
                })
            else:
                # Calculate cluster statistics
                cluster_mean = np.mean(cluster_data, axis=0)
                cluster_std = np.std(cluster_data, axis=0)
                cluster_center = centers[cluster_id]

                # Determine cluster characteristics
                characteristics = self._characterize_cluster(cluster_mean, features)

                clusters.append({
                    "cluster_id": int(cluster_id) + 1,  # 1-indexed for display
                    "size": int(np.sum(cluster_mask)),
                    "sensor_ids": cluster_sensors,
                    "centroid": cluster_center.tolist(),
                    "mean_values": {
                        features[i]: float(cluster_mean[i]) for i in range(len(features))
                    },
                    "std_values": {
                        features[i]: float(cluster_std[i]) for i in range(len(features))
                    },
                    "characteristics": characteristics,
                    "risk_level": self._assess_cluster_risk(cluster_mean, features)
                })

        return clusters

    def _characterize_cluster(self, mean_values: np.ndarray, features: List[str]) -> Dict[str, str]:
        """
        Characterize cluster based on mean values

        Args:
            mean_values: Mean values for each feature
            features: Feature names

        Returns:
            Dictionary of characteristics
        """
        characteristics = {}

        for i, feature in enumerate(features):
            value = mean_values[i]

            if feature == "temperature":
                if value > 80:
                    characteristics[feature] = "High Temperature"
                elif value > 70:
                    characteristics[feature] = "Moderate Temperature"
                else:
                    characteristics[feature] = "Normal Temperature"

            elif feature == "vibration":
                if value > 5.0:
                    characteristics[feature] = "High Vibration"
                elif value > 3.5:
                    characteristics[feature] = "Moderate Vibration"
                else:
                    characteristics[feature] = "Normal Vibration"

            elif feature == "accident_probability":
                if value > 0.7:
                    characteristics[feature] = "High Risk"
                elif value > 0.4:
                    characteristics[feature] = "Medium Risk"
                else:
                    characteristics[feature] = "Low Risk"

            elif feature == "load":
                if value > 0.8:
                    characteristics[feature] = "High Load"
                elif value > 0.5:
                    characteristics[feature] = "Moderate Load"
                else:
                    characteristics[feature] = "Low Load"

            else:
                characteristics[feature] = f"Value: {value:.2f}"

        return characteristics

    def _assess_cluster_risk(self, mean_values: np.ndarray, features: List[str]) -> str:
        """
        Assess overall risk level of cluster

        Args:
            mean_values: Mean values for each feature
            features: Feature names

        Returns:
            Risk level (Low/Medium/High)
        """
        risk_score = 0

        for i, feature in enumerate(features):
            value = mean_values[i]

            if feature == "accident_probability":
                risk_score += value * 3  # Weighted heavily
            elif feature == "temperature":
                if value > 80:
                    risk_score += 0.3
                elif value > 70:
                    risk_score += 0.1
            elif feature == "vibration":
                if value > 5.0:
                    risk_score += 0.3
                elif value > 3.5:
                    risk_score += 0.1

        if risk_score > 2.0:
            return "High"
        elif risk_score > 1.0:
            return "Medium"
        else:
            return "Low"

    def _identify_anomalies(
        self,
        X_scaled: np.ndarray,
        labels: np.ndarray,
        centers: np.ndarray,
        threshold: float = 2.0
    ) -> List[Dict[str, Any]]:
        """
        Identify sensors that are anomalies (far from cluster center)

        Args:
            X_scaled: Scaled feature matrix
            labels: Cluster labels
            centers: Cluster centers
            threshold: Distance threshold (in standard deviations)

        Returns:
            List of anomaly sensors
        """
        anomalies = []

        for i, (point, label) in enumerate(zip(X_scaled, labels)):
            center = centers[label]
            distance = np.linalg.norm(point - center)

            # Calculate average distance for this cluster
            cluster_points = X_scaled[labels == label]
            cluster_distances = [np.linalg.norm(p - center) for p in cluster_points]
            avg_distance = np.mean(cluster_distances)
            std_distance = np.std(cluster_distances) if len(cluster_distances) > 1 else avg_distance

            # Check if this point is an anomaly
            if std_distance > 0 and distance > avg_distance + threshold * std_distance:
                anomalies.append({
                    "sensor_index": i,
                    "cluster_id": int(label),
                    "distance_from_center": float(distance),
                    "avg_cluster_distance": float(avg_distance),
                    "anomaly_score": float((distance - avg_distance) / std_distance) if std_distance > 0 else 0.0
                })

        return sorted(anomalies, key=lambda x: x["anomaly_score"], reverse=True)

    def _calculate_silhouette_score(self, X: np.ndarray, labels: np.ndarray) -> float:
        """
        Calculate silhouette score for cluster quality assessment

        Args:
            X: Feature matrix
            labels: Cluster labels

        Returns:
            Silhouette score (-1 to 1, higher is better)
        """
        try:
            from sklearn.metrics import silhouette_score
            if len(np.unique(labels)) < 2:
                return 0.0
            return float(silhouette_score(X, labels))
        except:
            return 0.0

    def _interpret_clusters(self, clusters: List[Dict[str, Any]], features: List[str]) -> Dict[str, Any]:
        """
        Provide interpretation of clustering results

        Args:
            clusters: List of cluster analyses
            features: Feature names

        Returns:
            Interpretation dictionary
        """
        interpretations = []

        for cluster in clusters:
            cluster_id = cluster["cluster_id"]
            size = cluster["size"]
            risk = cluster["risk_level"]
            characteristics = cluster["characteristics"]

            interpretation = {
                "cluster_id": cluster_id,
                "description": f"Cluster {cluster_id}: {size} sensors with {risk} risk level",
                "key_characteristics": list(characteristics.values())[:3],  # Top 3 characteristics
                "recommendation": self._generate_recommendation(risk, characteristics)
            }
            interpretations.append(interpretation)

        return {
            "clusters": interpretations,
            "summary": f"Identified {len(clusters)} distinct sensor groups with different risk profiles"
        }

    def _generate_recommendation(self, risk_level: str, characteristics: Dict[str, str]) -> str:
        """
        Generate actionable recommendation based on cluster characteristics

        Args:
            risk_level: Risk level of cluster
            characteristics: Cluster characteristics

        Returns:
            Recommendation string
        """
        if risk_level == "High":
            return "Immediate inspection and maintenance required. Consider reducing load or adjusting parameters."
        elif risk_level == "Medium":
            return "Schedule preventive maintenance. Monitor closely for any changes."
        else:
            return "Normal operation. Continue regular maintenance schedule."

    def predict_cluster(self, sensor_reading: Dict[str, Any], features: List[str] = None) -> Dict[str, Any]:
        """
        Predict which cluster a new sensor reading belongs to

        Real-world application: Classify new sensor data in real-time

        Args:
            sensor_reading: Single sensor reading
            features: Features to use (must match training features)

        Returns:
            Predicted cluster assignment
        """
        if self.kmeans_model is None:
            return {"error": "Model not trained. Run clustering first."}

        if features is None:
            features = ["temperature", "vibration", "rpm", "load", "accident_probability"]

        # Extract features
        X = []
        for feature in features:
            if feature in sensor_reading:
                X.append(float(sensor_reading[feature]))
            else:
                return {"error": f"Missing feature: {feature}"}

        X = np.array([X])
        X_scaled = self.scaler.transform(X)

        cluster_id = int(self.kmeans_model.predict(X_scaled)[0])
        distance = float(np.linalg.norm(X_scaled[0] - self.kmeans_model.cluster_centers_[cluster_id]))

        return {
            "cluster_id": cluster_id + 1,  # 1-indexed for display
            "distance_from_center": distance,
            "confidence": "high" if distance < 1.0 else "medium" if distance < 2.0 else "low"
        }

