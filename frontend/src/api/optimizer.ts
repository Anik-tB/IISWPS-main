import { apiClient } from './client'

export interface OptimizationRequest {
  temperature: number
  vibration: number
  load: number
}

export interface OptimizationResponse {
  initial: {
    temperature: number
    vibration: number
    load: number
  }
  optimized: {
    temperature: number
    vibration: number
    load: number
  }
  safety_score: number
  improvement: number
  timestamp: string
}

export const optimizerApi = {
  optimizeMachine: async (data: OptimizationRequest): Promise<OptimizationResponse> => {
    const response = await apiClient.post<OptimizationResponse>('/optimize/machine', data)
    return response.data
  },
}

