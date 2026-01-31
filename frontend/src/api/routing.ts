import { apiClient } from './client'

export interface AStarRequest {
  grid: number[][]
  start: [number, number]
  goal: [number, number]
  blocked?: [number, number][]
}

export interface AStarResponse {
  path: [number, number][]
  cost: number
  length: number
  timestamp: string
}

export const routingApi = {
  planRoute: async (data: AStarRequest): Promise<AStarResponse> => {
    const response = await apiClient.post<AStarResponse>('/route/astar', data)
    return response.data
  },
}

