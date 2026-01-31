import { useMemo } from 'react'
import { Factory, MapPin, Radio, Thermometer, Activity, AlertTriangle, CheckCircle, Layers } from 'lucide-react'

interface Sensor {
  id: string
  location: { x: number; y: number }
  temperature: number
  vibration: number
  rpm: number
  load: number
  accident_probability?: number
  risk_class?: string
}

interface Cluster {
  cluster_id: number
  size: number
  sensor_ids: string[]
  risk_level: string
  mean_values: Record<string, number>
}

interface ClusterVisualizationProps {
  sensors: Sensor[]
  clusters: Cluster[]
  selectedCluster: number | null
  onClusterSelect: (clusterId: number | null) => void
  getClusterColor: (clusterId: number, riskLevel?: string) => string
}

export default function ClusterVisualization({
  sensors,
  clusters,
  selectedCluster,
  onClusterSelect,
  getClusterColor
}: ClusterVisualizationProps) {
  const clusterMap = useMemo(() => {
    const map: Record<string, Cluster> = {}
    clusters.forEach(cluster => {
      cluster.sensor_ids.forEach(sensorId => {
        map[sensorId] = cluster
      })
    })
    return map
  }, [clusters])

  const clusterCentroids = useMemo(() => {
    const centroids: Record<number, { x: number; y: number; count: number }> = {}

    clusters.forEach(cluster => {
      let sumX = 0
      let sumY = 0
      let count = 0

      cluster.sensor_ids.forEach(sensorId => {
        const sensor = sensors.find(s => s.id === sensorId)
        if (sensor && sensor.location) {
          sumX += sensor.location.x
          sumY += sensor.location.y
          count++
        }
      })

      if (count > 0) {
        centroids[cluster.cluster_id] = {
          x: sumX / count,
          y: sumY / count,
          count
        }
      }
    })

    return centroids
  }, [clusters, sensors])

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-700">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}></div>

      {/* Cluster Boundaries */}
      {clusters.map((cluster) => {
        const centroid = clusterCentroids[cluster.cluster_id]
        if (!centroid) return null

        const isSelected = selectedCluster === cluster.cluster_id
        const color = getClusterColor(cluster.cluster_id, cluster.risk_level)

        // Calculate boundary radius based on sensor spread
        const maxDistance = Math.max(
          ...cluster.sensor_ids.map(sensorId => {
            const sensor = sensors.find(s => s.id === sensorId)
            if (!sensor || !sensor.location) return 0
            const dx = sensor.location.x - centroid.x
            const dy = sensor.location.y - centroid.y
            return Math.sqrt(dx * dx + dy * dy)
          }),
          10
        )

        return (
          <div
            key={`boundary-${cluster.cluster_id}`}
            className="absolute rounded-full pointer-events-none transition-all duration-500"
            style={{
              left: `${centroid.x}%`,
              top: `${centroid.y}%`,
              width: `${maxDistance * 2.5}%`,
              height: `${maxDistance * 2.5}%`,
              transform: 'translate(-50%, -50%)',
              border: `3px dashed ${color}`,
              opacity: isSelected ? 0.6 : 0.3,
              boxShadow: isSelected ? `0 0 30px ${color}40` : 'none',
              animation: isSelected ? 'pulse 2s infinite' : 'none'
            }}
          />
        )
      })}

      {/* Cluster Heatmap Overlay */}
      {clusters.map((cluster) => {
        const centroid = clusterCentroids[cluster.cluster_id]
        if (!centroid) return null

        const color = getClusterColor(cluster.cluster_id, cluster.risk_level)
        const intensity = cluster.risk_level === 'High' ? 0.4 : cluster.risk_level === 'Medium' ? 0.25 : 0.15

        return (
          <div
            key={`heatmap-${cluster.cluster_id}`}
            className="absolute rounded-full pointer-events-none blur-3xl transition-all duration-500"
            style={{
              left: `${centroid.x}%`,
              top: `${centroid.y}%`,
              width: '30%',
              height: '30%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, ${color}${Math.round(intensity * 255).toString(16)} 0%, transparent 70%)`,
              opacity: selectedCluster === null || selectedCluster === cluster.cluster_id ? 1 : 0.3
            }}
          />
        )
      })}

      {/* Factory Machines with Status Indicators */}
      {useMemo(() => {
        // Check which machines have nearby sensors (within cluster boundaries)
        const machinePositions = [
          { id: 'M1', x: 15, y: 20, width: 12, height: 8 },
          { id: 'M2', x: 50, y: 25, width: 20, height: 6 },
          { id: 'M3', x: 75, y: 60, width: 10, height: 8 }
        ]

        return machinePositions.map((machine) => {
          // Check if any sensor is near this machine (within 15% distance)
          const hasNearbySensors = sensors.some(sensor => {
            if (!sensor.location) return false
            const dx = Math.abs(sensor.location.x - machine.x)
            const dy = Math.abs(sensor.location.y - machine.y)
            return dx < 15 && dy < 15
          })

          return (
            <div
              key={machine.id}
              className="absolute group"
              style={{
                left: `${machine.x}%`,
                top: `${machine.y}%`,
                width: `${machine.width}%`,
                height: `${machine.height}%`
              }}
            >
              <div className="relative w-full h-full bg-gray-400 dark:bg-gray-600 rounded border-2 border-gray-500 opacity-60 flex items-center justify-center transition-all duration-300 hover:opacity-80">
                <Factory className="h-4 w-4 text-gray-700 dark:text-gray-300" />

                {/* Green Checkmark - Indicates machine is monitored by sensors */}
                {hasNearbySensors && (
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 shadow-lg animate-pulse">
                    <CheckCircle className="h-4 w-4 text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-gray-700 whitespace-nowrap">
                    <div className="font-bold mb-1">{machine.id}</div>
                    <div className="text-gray-300">
                      {hasNearbySensors ? '✓ Monitored' : 'Not Monitored'}
                    </div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                      <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      }, [sensors])}

      {/* Sensors with Cluster Colors */}
      {sensors.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No sensors available
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Run clustering to visualize sensor clusters
            </p>
          </div>
        </div>
      )}
      {sensors.map((sensor) => {
        const cluster = clusterMap[sensor.id]
        if (!cluster || !sensor.location) return null

        const isSelected = selectedCluster === cluster.cluster_id
        const isHighlighted = selectedCluster === null || isSelected
        const color = getClusterColor(cluster.cluster_id, cluster.risk_level)

        return (
          <div
            key={sensor.id}
            onClick={() => onClusterSelect(isSelected ? null : cluster.cluster_id)}
            className="absolute cursor-pointer transition-all duration-300 group"
            style={{
              left: `${sensor.location.x}%`,
              top: `${sensor.location.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: isSelected ? 50 : 10
            }}
          >
            {/* Sensor Glow */}
            <div
              className="absolute rounded-full blur-md transition-all duration-300"
              style={{
                width: isSelected ? '40px' : '24px',
                height: isSelected ? '40px' : '24px',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: color,
                opacity: isHighlighted ? 0.4 : 0.2,
                animation: cluster.risk_level === 'High' ? 'pulse 2s infinite' : 'none'
              }}
            />

            {/* Sensor Body */}
            <div
              className="relative rounded-full border-2 transition-all duration-300 flex items-center justify-center shadow-lg"
              style={{
                width: isSelected ? '32px' : '20px',
                height: isSelected ? '32px' : '20px',
                backgroundColor: color,
                borderColor: isSelected ? '#fff' : color,
                boxShadow: isSelected
                  ? `0 0 20px ${color}, 0 0 40px ${color}80`
                  : `0 2px 8px ${color}60`
              }}
            >
              {isSelected && (
                <MapPin className="h-3 w-3 text-white" />
              )}
            </div>

            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-gray-700 whitespace-nowrap">
                <div className="font-bold mb-1">{sensor.id}</div>
                <div className="text-gray-300">Cluster {cluster.cluster_id}</div>
                <div className="text-gray-300">Risk: {cluster.risk_level}</div>
                <div className="text-gray-300">Temp: {sensor.temperature}°F</div>
                <div className="text-gray-300">Vib: {sensor.vibration} m/s²</div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                  <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Empty State for Clusters */}
      {clusters.length === 0 && sensors.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No clusters found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Click "Refresh" to perform clustering analysis
            </p>
          </div>
        </div>
      )}

      {/* Cluster Labels */}
      {clusters.map((cluster) => {
        const centroid = clusterCentroids[cluster.cluster_id]
        if (!centroid) return null

        const isSelected = selectedCluster === cluster.cluster_id
        const color = getClusterColor(cluster.cluster_id, cluster.risk_level)

        return (
          <div
            key={`label-${cluster.cluster_id}`}
            className="absolute pointer-events-none transition-all duration-300"
            style={{
              left: `${centroid.x}%`,
              top: `${centroid.y}%`,
              transform: 'translate(-50%, -50%)',
              opacity: isSelected ? 1 : 0.6
            }}
          >
            <div
              className="px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg border-2 border-white"
              style={{
                backgroundColor: color
              }}
            >
              Cluster {cluster.cluster_id}
              <span className="ml-2 text-xs opacity-90">
                ({cluster.size} sensors)
              </span>
            </div>
          </div>
        )
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-xs font-bold mb-2 text-gray-700 dark:text-gray-300">Cluster Legend</div>
        <div className="space-y-1">
          {clusters.map((cluster) => {
            const color = getClusterColor(cluster.cluster_id, cluster.risk_level)
            return (
              <div key={cluster.cluster_id} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-600 dark:text-gray-400">
                  {cluster.cluster_id}: {cluster.risk_level} Risk
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

