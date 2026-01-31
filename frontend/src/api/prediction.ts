import { apiClient } from './client'

export interface AccidentPredictionRequest {
  temperature: number
  vibration: number
  rpm: number
  load: number
}

export interface AccidentPredictionResponse {
  accident_probability: number
  risk_level: string
  timestamp: string
}

export interface RiskClassificationRequest {
  temperature: number
  vibration: number
  rpm: number
  load: number
}

export interface RiskClassificationResponse {
  risk_class: string
  confidence: number
  timestamp: string
}

export interface DashboardStats {
  database_connected: boolean
  stats?: {
    total_sensor_readings: number
    recent_averages: {
      temperature: number
      vibration: number
      rpm: number
      load: number
    }
    predictions_by_risk: Record<string, number>
    classifications_by_risk: Record<string, number>
    total_optimizations: number
  }
  message?: string
  timestamp: string
}

export interface SensorHistoryResponse {
  data: Array<{
    id: number
    sensor_id: string
    temperature: number
    vibration: number
    rpm: number
    load: number
    timestamp: string
  }>
  count: number
  source: string
  timestamp: string
}

export const predictionApi = {
  predictAccident: async (data: AccidentPredictionRequest): Promise<AccidentPredictionResponse> => {
    const response = await apiClient.post<AccidentPredictionResponse>('/predict/accident', data)
    return response.data
  },

  classifyRisk: async (data: RiskClassificationRequest): Promise<RiskClassificationResponse> => {
    const response = await apiClient.post<RiskClassificationResponse>('/predict/risk', data)
    return response.data
  },

  getLiveSensors: async () => {
    const response = await apiClient.get('/sensors/live')
    return response.data
  },

  // Database endpoints
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<DashboardStats>('/data/dashboard-stats')
    return response.data
  },

  getSensorHistory: async (params?: { sensor_id?: string, hours?: number, limit?: number }): Promise<SensorHistoryResponse> => {
    const response = await apiClient.get<SensorHistoryResponse>('/data/sensor-history', { params })
    return response.data
  },

  getPredictionsHistory: async (params?: { risk_level?: string, hours?: number, limit?: number }) => {
    const response = await apiClient.get('/data/predictions', { params })
    return response.data
  },

  getRiskHistory: async (params?: { risk_class?: string, hours?: number, limit?: number }) => {
    const response = await apiClient.get('/data/risk-classifications', { params })
    return response.data
  },

  getOptimizationsHistory: async (params?: { hours?: number, limit?: number }) => {
    const response = await apiClient.get('/data/optimizations', { params })
    return response.data
  },
}

