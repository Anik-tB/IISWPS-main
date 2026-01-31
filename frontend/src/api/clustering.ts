import { apiClient } from './client'

export interface Sensor {
  id: string
  location?: { x: number; y: number }
  temperature: number
  vibration: number
  rpm: number
  load: number
  accident_probability?: number
  risk_class?: string
  timestamp?: string
}

export interface Cluster {
  cluster_id: number
  size: number
  sensor_ids: string[]
  centroid: number[]
  mean_values: Record<string, number>
  std_values: Record<string, number>
  characteristics: Record<string, string>
  risk_level: string
  recommendation?: string
}

export interface ClusteringResponse {
  n_clusters: number
  clusters: Cluster[]
  anomalies: Array<{
    sensor_index: number
    cluster_id: number
    distance_from_center: number
    avg_cluster_distance: number
    anomaly_score: number
  }>
  features_used: string[]
  inertia: number
  silhouette_score: number
  cluster_centers: number[][]
  interpretation: {
    clusters: Array<{
      cluster_id: number
      description: string
      key_characteristics: string[]
      recommendation: string
    }>
    summary: string
  }
  timestamp: string
}

export interface ClusteringRequest {
  sensor_data: Sensor[]
  n_clusters?: number
  features?: string[]
}

export const clusteringApi = {
  clusterSensors: async (data: ClusteringRequest): Promise<ClusteringResponse> => {
    const response = await apiClient.post<ClusteringResponse>('/cluster/sensors', data)
    return response.data
  },

  clusterMaintenance: async (data: { machine_data: Sensor[], n_clusters?: number }): Promise<ClusteringResponse> => {
    const response = await apiClient.post<ClusteringResponse>('/cluster/maintenance', data)
    return response.data
  },

  clusterRiskZones: async (data: { location_data: Sensor[], n_clusters?: number }): Promise<ClusteringResponse> => {
    const response = await apiClient.post<ClusteringResponse>('/cluster/risk-zones', data)
    return response.data
  },

  clusterLive: async (options?: { n_clusters?: number, features?: string[] }): Promise<ClusteringResponse> => {
    const response = await apiClient.post<ClusteringResponse>('/cluster/live', options || {})
    return response.data
  },
}

