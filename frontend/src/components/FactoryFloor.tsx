import { AlertTriangle, CheckCircle, AlertCircle, Factory, Cog, Package, Shield, Zap, Thermometer, Activity, Gauge, TrendingUp, MapPin, Radio } from 'lucide-react'
import { useState } from 'react'

interface Sensor {
  id: string
  location: { x: number; y: number }
  temperature: number
  vibration: number
  rpm: number
  load: number
  accident_probability?: number
  risk_class?: string
  risk_confidence?: number
  timestamp: string
}

interface FactoryFloorProps {
  sensors: Sensor[]
  onSensorClick?: (sensor: Sensor) => void
}

interface Machine {
  id: string
  name: string
  type: 'production' | 'assembly' | 'quality' | 'storage' | 'maintenance'
  position: { x: number; y: number }
  width: number
  height: number
  status: 'operational' | 'warning' | 'critical' | 'maintenance'
}

export default function FactoryFloor({ sensors, onSensorClick }: FactoryFloorProps) {
  const [hoveredSensor, setHoveredSensor] = useState<Sensor | null>(null)
  const [viewMode, setViewMode] = useState<'normal' | 'heatmap' | 'risk'>('normal')
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return {
          bg: 'bg-red-500',
          glow: 'shadow-red-500/50',
          border: 'border-red-600',
          pulse: 'animate-pulse'
        }
      case 'Medium':
        return {
          bg: 'bg-yellow-500',
          glow: 'shadow-yellow-500/50',
          border: 'border-yellow-600',
          pulse: ''
        }
      default:
        return {
          bg: 'bg-green-500',
          glow: 'shadow-green-500/50',
          border: 'border-green-600',
          pulse: ''
        }
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'High':
        return <AlertTriangle className="h-4 w-4" />
      case 'Medium':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  // Define realistic factory machines and equipment
  const machines: Machine[] = [
    { id: 'M1', name: 'CNC Mill', type: 'production', position: { x: 15, y: 20 }, width: 120, height: 80, status: 'operational' },
    { id: 'M2', name: 'Assembly Line A', type: 'assembly', position: { x: 50, y: 25 }, width: 200, height: 60, status: 'operational' },
    { id: 'M3', name: 'Quality Station', type: 'quality', position: { x: 75, y: 60 }, width: 100, height: 80, status: 'operational' },
    { id: 'M4', name: 'Storage Bay 1', type: 'storage', position: { x: 20, y: 70 }, width: 140, height: 100, status: 'operational' },
    { id: 'M5', name: 'Press Machine', type: 'production', position: { x: 70, y: 15 }, width: 110, height: 70, status: 'warning' },
    { id: 'M6', name: 'Packaging Line', type: 'assembly', position: { x: 30, y: 50 }, width: 180, height: 50, status: 'operational' },
  ]

  const getMachineIcon = (type: string) => {
    switch (type) {
      case 'production': return <Cog className="h-5 w-5" />
      case 'assembly': return <Factory className="h-5 w-5" />
      case 'quality': return <Shield className="h-5 w-5" />
      case 'storage': return <Package className="h-5 w-5" />
      default: return <Cog className="h-5 w-5" />
    }
  }

  const getMachineStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'warning': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'maintenance': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      default: return 'border-green-500 bg-green-50 dark:bg-green-900/20'
    }
  }

  // Calculate heat map data for temperature
  const getHeatMapIntensity = (x: number, y: number) => {
    const nearbySensors = sensors.filter(s => {
      const dx = Math.abs(s.location.x - x)
      const dy = Math.abs(s.location.y - y)
      return Math.sqrt(dx * dx + dy * dy) < 15
    })

    if (nearbySensors.length === 0) return 0

    const avgTemp = nearbySensors.reduce((sum, s) => sum + s.temperature, 0) / nearbySensors.length
    return Math.min(1, (avgTemp - 60) / 30) // Normalize 60-90°F to 0-1
  }

  // Calculate risk propagation
  const getRiskIntensity = (x: number, y: number) => {
    const nearbySensors = sensors.filter(s => {
      const dx = Math.abs(s.location.x - x)
      const dy = Math.abs(s.location.y - y)
      return Math.sqrt(dx * dx + dy * dy) < 12
    })

    if (nearbySensors.length === 0) return 0

    const avgRisk = nearbySensors.reduce((sum, s) => {
      const risk = s.accident_probability || 0
      return sum + risk
    }, 0) / nearbySensors.length

    return avgRisk
  }

  return (
    <div className="relative w-full">
      {/* View Mode Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">View Mode:</span>
          <div className="flex gap-2">
            {(['normal', 'heatmap', 'risk'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Critical</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[700px] bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-xl overflow-hidden border-2 border-border shadow-2xl">
        {/* Factory floor pattern - more realistic */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Heat Map Overlay */}
        {viewMode === 'heatmap' && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) =>
              Array.from({ length: 20 }).map((_, j) => {
                const x = (j / 20) * 100
                const y = (i / 20) * 100
                const intensity = getHeatMapIntensity(x, y)
                const opacity = intensity * 0.4
                const color = intensity > 0.7 ? 'rgba(239, 68, 68, 0.6)' : intensity > 0.4 ? 'rgba(245, 158, 11, 0.5)' : 'rgba(34, 197, 94, 0.3)'
                return (
                  <div
                    key={`heat-${i}-${j}`}
                    className="absolute"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: '5%',
                      height: '5%',
                      backgroundColor: color,
                      opacity: opacity
                    }}
                  />
                )
              })
            )}
          </div>
        )}

        {/* Risk Propagation Overlay */}
        {viewMode === 'risk' && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) =>
              Array.from({ length: 20 }).map((_, j) => {
                const x = (j / 20) * 100
                const y = (i / 20) * 100
                const intensity = getRiskIntensity(x, y)
                const opacity = intensity * 0.5
                const color = intensity > 0.7 ? 'rgba(239, 68, 68, 0.7)' : intensity > 0.4 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(34, 197, 94, 0.4)'
                return (
                  <div
                    key={`risk-${i}-${j}`}
                    className="absolute rounded-full"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: '6%',
                      height: '6%',
                      backgroundColor: color,
                      opacity: opacity,
                      transform: 'translate(-50%, -50%)',
                      filter: 'blur(8px)'
                    }}
                  />
                )
              })
            )}
          </div>
        )}

        {/* Conveyor Belts */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            <pattern id="conveyor" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="10" x2="20" y2="10" stroke="rgba(100, 100, 100, 0.3)" strokeWidth="2" />
            </pattern>
          </defs>
          <rect x="10%" y="30%" width="40%" height="4" fill="url(#conveyor)" opacity="0.5" />
          <rect x="25%" y="55%" width="35%" height="4" fill="url(#conveyor)" opacity="0.5" />
        </svg>

        {/* Factory Machines and Equipment */}
        {machines.map((machine) => (
          <div
            key={machine.id}
            className={`absolute border-2 rounded-lg ${getMachineStatusColor(machine.status)} shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105`}
            style={{
              left: `${machine.position.x}%`,
              top: `${machine.position.y}%`,
              width: `${machine.width}px`,
              height: `${machine.height}px`,
              transform: 'translate(-50%, -50%)',
              zIndex: 2
            }}
          >
            <div className="p-2 h-full flex flex-col justify-between">
              <div className="flex items-center gap-2">
                {getMachineIcon(machine.type)}
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300">{machine.name}</div>
                  <div className="text-[10px] text-muted-foreground">{machine.id}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className={`text-[10px] px-2 py-0.5 rounded ${
                  machine.status === 'operational' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  machine.status === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  machine.status === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {machine.status}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Safety Equipment Locations */}
        <div className="absolute top-5 right-5 z-10">
          <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-lg p-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-300">Emergency Exit</span>
          </div>
        </div>
        <div className="absolute bottom-5 left-5 z-10">
          <div className="bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 rounded-lg p-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">First Aid</span>
          </div>
        </div>

        {/* Workstations */}
        <div className="absolute top-[45%] left-[60%] z-10">
          <div className="bg-gray-100 dark:bg-gray-800 border-2 border-gray-400 rounded-lg p-2 w-24 h-16 flex flex-col items-center justify-center">
            <Package className="h-5 w-5 text-gray-600 dark:text-gray-400 mb-1" />
            <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-300">Workstation</span>
          </div>
        </div>

        {/* Enhanced Sensors with Data Visualization */}
        {sensors.map((sensor) => {
          const colors = getRiskColor(sensor.risk_class || 'Low')
          const isHovered = hoveredSensor?.id === sensor.id
          const sensorSize = isHovered ? 80 : 64

          return (
            <div
              key={sensor.id}
              onClick={() => onSensorClick?.(sensor)}
              onMouseEnter={() => setHoveredSensor(sensor)}
              onMouseLeave={() => setHoveredSensor(null)}
              className={`absolute ${colors.border} rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${colors.pulse}`}
              style={{
                left: `${sensor.location.x}%`,
                top: `${sensor.location.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${sensorSize}px`,
                height: `${sensorSize}px`,
                borderWidth: '3px',
                zIndex: isHovered ? 100 : 10,
                boxShadow: `0 0 ${isHovered ? 30 : 20}px ${colors.glow.replace('/50', '')}, 0 0 ${isHovered ? 60 : 40}px ${colors.glow.replace('/50', '')}`
              }}
            >
              {/* Sensor Body */}
              <div className={`${colors.bg} rounded-full w-full h-full flex flex-col items-center justify-center relative overflow-hidden`}>
                {/* Data Transmission Indicator */}
                <div className="absolute top-1 right-1">
                  <Radio className={`h-3 w-3 ${isHovered ? 'text-white animate-pulse' : 'text-white/70'}`} />
                </div>

                {/* Sensor ID */}
                <span className="text-xs font-bold text-white mb-0.5 z-10">{sensor.id.split('_')[1]}</span>

                {/* Risk Icon */}
                <div className="text-white z-10">
                  {getRiskIcon(sensor.risk_class || 'Low')}
                </div>

                {/* Mini Metrics Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-white/30" style={{
                  background: `conic-gradient(
                    from 0deg,
                    ${sensor.temperature > 75 ? '#ef4444' : '#10b981'} 0deg ${(sensor.temperature / 100) * 360}deg,
                    transparent ${(sensor.temperature / 100) * 360}deg
                  )`
                }}></div>

                {/* Pulse ring for high risk */}
                {sensor.risk_class === 'High' && (
                  <div className={`absolute inset-0 ${colors.bg} rounded-full animate-ping opacity-75`}></div>
                )}
              </div>

              {/* Enhanced Tooltip on Hover */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-64 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{sensor.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} border-2 ${colors.border}`}>
                      {sensor.risk_class || 'Low'} Risk
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="text-xs text-muted-foreground">Temperature</div>
                        <div className="font-bold text-sm">{sensor.temperature.toFixed(1)}°F</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-xs text-muted-foreground">Vibration</div>
                        <div className="font-bold text-sm">{sensor.vibration.toFixed(2)} m/s²</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-purple-500" />
                      <div>
                        <div className="text-xs text-muted-foreground">RPM</div>
                        <div className="font-bold text-sm">{sensor.rpm.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <div>
                        <div className="text-xs text-muted-foreground">Load</div>
                        <div className="font-bold text-sm">{(sensor.load * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Accident Probability</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              (sensor.accident_probability || 0) > 0.7 ? 'bg-red-500' :
                              (sensor.accident_probability || 0) > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(sensor.accident_probability || 0) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold">
                          {sensor.accident_probability ? (sensor.accident_probability * 100).toFixed(1) + '%' : 'N/A'}
                        </span>
                      </div>
                    </div>
                    {sensor.risk_confidence && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">Confidence</span>
                        <span className="text-xs font-semibold">{(sensor.risk_confidence * 100).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>Location: ({sensor.location.x.toFixed(1)}, {sensor.location.y.toFixed(1)})</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Data Flow Connections - Show sensor network */}
        {sensors.length > 1 && viewMode === 'normal' && (
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
            {sensors.map((sensor, idx) => {
              // Connect to nearest sensors
              const nearbySensors = sensors
                .map((s, i) => ({ sensor: s, index: i, distance: Math.sqrt(
                  Math.pow(s.location.x - sensor.location.x, 2) +
                  Math.pow(s.location.y - sensor.location.y, 2)
                )}))
                .filter(s => s.index !== idx && s.distance < 20)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 2) // Connect to 2 nearest sensors

              return nearbySensors.map((nearby, i) => {
                const risk = sensor.risk_class || 'Low'
                const strokeColor = risk === 'High' ? 'rgba(239, 68, 68, 0.4)' :
                                  risk === 'Medium' ? 'rgba(245, 158, 11, 0.3)' :
                                  'rgba(34, 197, 94, 0.2)'
                const strokeWidth = risk === 'High' ? 2 : 1

                return (
                  <line
                    key={`line-${idx}-${nearby.index}-${i}`}
                    x1={`${sensor.location.x}%`}
                    y1={`${sensor.location.y}%`}
                    x2={`${nearby.sensor.location.x}%`}
                    y2={`${nearby.sensor.location.y}%`}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={risk === 'High' ? "3,3" : "5,5"}
                    opacity={0.6}
                  />
                )
              })
            })}
          </svg>
        )}

        {/* Zone Labels */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-blue-100/80 dark:bg-blue-900/50 border-2 border-blue-400 rounded-lg px-3 py-1">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Production Zone A</span>
          </div>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-purple-100/80 dark:bg-purple-900/50 border-2 border-purple-400 rounded-lg px-3 py-1">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">Assembly Zone B</span>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-green-100/80 dark:bg-green-900/50 border-2 border-green-400 rounded-lg px-3 py-1">
            <span className="text-xs font-bold text-green-700 dark:text-green-300">Storage Zone C</span>
          </div>
        </div>
        <div className="absolute bottom-4 right-4 z-10">
          <div className="bg-orange-100/80 dark:bg-orange-900/50 border-2 border-orange-400 rounded-lg px-3 py-1">
            <span className="text-xs font-bold text-orange-700 dark:text-orange-300">Quality Zone D</span>
          </div>
        </div>
      </div>

      {/* Legend and Statistics */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border-2 border-border rounded-lg p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sensor Status
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Sensors</span>
              <span className="font-bold">{sensors.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">High Risk</span>
              <span className="font-bold text-red-600">{sensors.filter(s => s.risk_class === 'High').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Medium Risk</span>
              <span className="font-bold text-yellow-600">{sensors.filter(s => s.risk_class === 'Medium').length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Low Risk</span>
              <span className="font-bold text-green-600">{sensors.filter(s => s.risk_class === 'Low').length}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border-2 border-border rounded-lg p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Average Metrics
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Temperature</span>
              <span className="font-bold">
                {sensors.length > 0 ? (sensors.reduce((sum, s) => sum + s.temperature, 0) / sensors.length).toFixed(1) : '0'}°F
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Vibration</span>
              <span className="font-bold">
                {sensors.length > 0 ? (sensors.reduce((sum, s) => sum + s.vibration, 0) / sensors.length).toFixed(2) : '0'} m/s²
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">RPM</span>
              <span className="font-bold">
                {sensors.length > 0 ? Math.round(sensors.reduce((sum, s) => sum + s.rpm, 0) / sensors.length).toLocaleString() : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Load</span>
              <span className="font-bold">
                {sensors.length > 0 ? ((sensors.reduce((sum, s) => sum + s.load, 0) / sensors.length) * 100).toFixed(1) : '0'}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border-2 border-border rounded-lg p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Analysis
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Avg. Accident Prob.</span>
              <span className="font-bold">
                {sensors.length > 0 ? ((sensors.reduce((sum, s) => sum + (s.accident_probability || 0), 0) / sensors.length) * 100).toFixed(1) : '0'}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Critical Alerts</span>
              <span className="font-bold text-red-600">
                {sensors.filter(s => (s.accident_probability || 0) > 0.7).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Warning Alerts</span>
              <span className="font-bold text-yellow-600">
                {sensors.filter(s => (s.accident_probability || 0) > 0.4 && (s.accident_probability || 0) <= 0.7).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">System Health</span>
              <span className={`font-bold ${
                sensors.filter(s => (s.accident_probability || 0) > 0.7).length > 0 ? 'text-red-600' :
                sensors.filter(s => (s.accident_probability || 0) > 0.4).length > 0 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {sensors.filter(s => (s.accident_probability || 0) > 0.7).length > 0 ? 'Critical' :
                 sensors.filter(s => (s.accident_probability || 0) > 0.4).length > 0 ? 'Warning' : 'Normal'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

