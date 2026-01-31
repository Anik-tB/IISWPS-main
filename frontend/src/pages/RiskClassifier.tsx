import { useState } from 'react'
import { predictionApi } from '../api/prediction'
import {
  Loader2, AlertTriangle, CheckCircle, XCircle, Brain, Shield,
  Thermometer, Activity, Gauge as GaugeIcon, Zap, Target, Info,
  Sparkles
} from 'lucide-react'
import Gauge from '../components/Gauge'

export default function RiskClassifier() {
  const [temperature, setTemperature] = useState(75)
  const [vibration, setVibration] = useState(4.2)
  const [rpm, setRpm] = useState(1200)
  const [load, setLoad] = useState(0.65)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClassify = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await predictionApi.classifyRisk({
        temperature,
        vibration,
        rpm,
        load,
      })
      setResult(response)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Classification failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return {
          text: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          gradient: 'from-red-500 to-rose-500',
          glow: 'shadow-red-500/25',
        }
      case 'Medium':
        return {
          text: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          gradient: 'from-amber-500 to-orange-500',
          glow: 'shadow-amber-500/25',
        }
      default:
        return {
          text: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          gradient: 'from-emerald-500 to-teal-500',
          glow: 'shadow-emerald-500/25',
        }
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'High':
        return <XCircle className="h-12 w-12 text-white" />
      case 'Medium':
        return <AlertTriangle className="h-12 w-12 text-white" />
      default:
        return <CheckCircle className="h-12 w-12 text-white" />
    }
  }

  const getRiskDescription = (risk: string) => {
    switch (risk) {
      case 'High':
        return {
          title: 'Critical Risk Detected',
          description: 'Immediate action required. Machine/worker is in dangerous conditions.',
          action: 'Evacuate area and shut down equipment immediately',
        }
      case 'Medium':
        return {
          title: 'Elevated Risk Level',
          description: 'Conditions are above normal. Monitor closely and take preventive measures.',
          action: 'Increase monitoring frequency and prepare safety protocols',
        }
      default:
        return {
          title: 'Safe Operating Conditions',
          description: 'All parameters are within acceptable ranges. Normal operations can continue.',
          action: 'Continue monitoring as per standard procedures',
        }
    }
  }

  const riskInfo = result ? getRiskDescription(result.risk_class) : null
  const riskColors = result ? getRiskColor(result.risk_class) : null

  return (
    <div className="space-y-6 animate-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />

        <div className="relative px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                AI Risk Classifier
              </h1>
              <p className="text-white/80 flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4" />
                K-Nearest Neighbors (KNN) Algorithm for Real-Time Risk Assessment
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters Panel */}
        <div className="lg:col-span-1 space-y-5">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold">Sensor Readings</h2>
            </div>

            <div className="space-y-5">
              {/* Temperature */}
              <div className="p-4 glass-card rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                      <Thermometer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm font-semibold">Temperature</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {temperature.toFixed(1)}°F
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="0.5"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>50°F</span>
                  <span className="font-medium text-orange-600">Optimal: 65-75°F</span>
                  <span>100°F</span>
                </div>
              </div>

              {/* Vibration */}
              <div className="p-4 glass-card rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-semibold">Vibration</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {vibration.toFixed(2)} m/s²
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="7.0"
                  step="0.1"
                  value={vibration}
                  onChange={(e) => setVibration(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>1.0</span>
                  <span className="font-medium text-blue-600">Optimal: 2.0-3.5</span>
                  <span>7.0</span>
                </div>
              </div>

              {/* RPM */}
              <div className="p-4 glass-card rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                      <GaugeIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-sm font-semibold">RPM</span>
                  </div>
                  <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                    {rpm.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="2000"
                  step="10"
                  value={rpm}
                  onChange={(e) => setRpm(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>500</span>
                  <span className="font-medium text-violet-600">Optimal: 1000-1200</span>
                  <span>2000</span>
                </div>
              </div>

              {/* Load */}
              <div className="p-4 glass-card rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-pink-100 dark:bg-pink-900/50 rounded-lg">
                      <Zap className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    </div>
                    <span className="text-sm font-semibold">Load</span>
                  </div>
                  <span className="text-lg font-bold text-pink-600 dark:text-pink-400">
                    {(load * 100).toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.01"
                  value={load}
                  onChange={(e) => setLoad(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>0%</span>
                  <span className="font-medium text-pink-600">Optimal: 40-60%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Classify Button */}
              <button
                onClick={handleClassify}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5" />
                    <span>Classify Risk (KNN)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-5">
          {error && (
            <div className="glass-card rounded-xl p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}

          {result ? (
            <>
              {/* Risk Classification Display */}
              <div className={`glass-panel rounded-2xl p-8 border ${riskColors?.border}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Risk Assessment Result</h2>
                    <p className="text-muted-foreground">KNN Classification Analysis</p>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${riskColors?.gradient} shadow-xl ${riskColors?.glow}`}>
                    {getRiskIcon(result.risk_class)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Risk Level */}
                  <div className="text-center p-6 glass-card rounded-xl">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Risk Classification</p>
                    <p className={`text-5xl font-bold mb-2 ${riskColors?.text}`}>
                      {result.risk_class}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      {result.risk_class === 'High' ? 'Critical' : result.risk_class === 'Medium' ? 'Warning' : 'Normal'}
                    </p>
                  </div>

                  {/* Confidence Score */}
                  <div className="text-center p-6 glass-card rounded-xl">
                    <p className="text-sm font-medium text-muted-foreground mb-3">AI Confidence</p>
                    <Gauge
                      value={result.confidence * 100}
                      label="Confidence"
                      unit="%"
                      color={result.confidence > 0.7 ? 'green' : result.confidence > 0.5 ? 'yellow' : 'red'}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Risk Description */}
                <div className="mt-6 p-5 glass-card rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{riskInfo?.title}</h3>
                      <p className="text-muted-foreground mb-4">{riskInfo?.description}</p>
                      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Recommended Action:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{riskInfo?.action}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Parameters Summary */}
              <div className="glass-panel rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-5">Input Parameters</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Temperature</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{temperature.toFixed(1)}°F</p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Vibration</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{vibration.toFixed(2)} m/s²</p>
                  </div>

                  <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <GaugeIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      <span className="text-xs font-medium text-violet-600 dark:text-violet-400">RPM</span>
                    </div>
                    <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{rpm.toLocaleString()}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                      <span className="text-xs font-medium text-pink-600 dark:text-pink-400">Load</span>
                    </div>
                    <p className="text-2xl font-bold text-pink-700 dark:text-pink-300">{(load * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Risk Guidelines */}
              <div className="glass-panel rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-5">Risk Level Guidelines</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-emerald-500 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">Low Risk</span>
                    </div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                      Safe conditions. Continue standard monitoring.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-amber-500 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-bold text-amber-700 dark:text-amber-300">Medium Risk</span>
                    </div>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Elevated conditions. Increase monitoring.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-red-500 rounded-lg">
                        <XCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-bold text-red-700 dark:text-red-300">High Risk</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Critical danger. Immediate action required.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel rounded-2xl p-12">
              <div className="text-center">
                <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-6">
                  <Brain className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ready for Risk Assessment</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Adjust the sensor readings on the left panel and click "Classify Risk" to analyze using the KNN algorithm
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>AI-powered classification with confidence scoring</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
