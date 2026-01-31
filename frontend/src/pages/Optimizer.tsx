import { useState } from 'react'
import { optimizerApi } from '../api/optimizer'
import {
  Loader2, TrendingUp, TrendingDown, ArrowRight, Settings, Zap, Shield,
  Thermometer, Activity, Gauge as GaugeIcon, Target, Sparkles, CheckCircle,
  AlertTriangle
} from 'lucide-react'
import Gauge from '../components/Gauge'

export default function Optimizer() {
  const [temperature, setTemperature] = useState(80)
  const [vibration, setVibration] = useState(5.0)
  const [load, setLoad] = useState(0.7)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOptimize = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await optimizerApi.optimizeMachine({
        temperature,
        vibration,
        load,
      })
      setResult(response)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Optimization failed')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const getSafetyColor = (score: number) => {
    if (score > 0.7) return { color: 'green', text: 'Excellent', gradient: 'from-emerald-500 to-teal-500' }
    if (score > 0.4) return { color: 'yellow', text: 'Good', gradient: 'from-amber-500 to-orange-500' }
    return { color: 'red', text: 'Critical', gradient: 'from-red-500 to-rose-500' }
  }

  const safetyInfo = result ? getSafetyColor(result.safety_score) : null

  return (
    <div className="space-y-6 animate-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />

        <div className="relative px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Settings className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                Machine Safety Optimizer
              </h1>
              <p className="text-white/80 flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4" />
                Hill Climbing Algorithm for Parameter Optimization
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
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl">
                <Target className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold">Current Parameters</h2>
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

              {/* Load */}
              <div className="p-4 glass-card rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                      <GaugeIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-sm font-semibold">Load</span>
                  </div>
                  <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
                    {(load * 100).toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.01"
                  value={load}
                  onChange={(e) => setLoad(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>20%</span>
                  <span className="font-medium text-violet-600">Optimal: 40-60%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Optimize Button */}
              <button
                onClick={handleOptimize}
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Run Hill Climbing</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Current Safety Score */}
          {!result && (
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="inline-flex p-3 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
                <Shield className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground mb-2">Current Safety Score</p>
              <p className="text-3xl font-bold text-gray-400">--</p>
              <p className="text-xs text-muted-foreground mt-2">Run optimization to calculate</p>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-5">
          {error && (
            <div className="glass-card rounded-xl p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}

          {result ? (
            <>
              {/* Safety Score Display */}
              <div className="glass-panel rounded-2xl p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Optimization Complete</h2>
                    <p className="text-muted-foreground">Hill Climbing algorithm found optimal parameters</p>
                  </div>
                  {result.improvement > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        +{(result.improvement * 100).toFixed(1)}% Improved
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Safety Score Gauge */}
                  <div className="flex flex-col items-center justify-center p-6 glass-card rounded-xl">
                    <Gauge
                      value={result.safety_score * 100}
                      label="Safety Score"
                      unit="%"
                      color={safetyInfo?.color as any || 'blue'}
                      size="md"
                    />
                    <div className="mt-4 text-center">
                      <p className={`text-2xl font-bold ${safetyInfo?.color === 'green' ? 'text-emerald-600' : safetyInfo?.color === 'yellow' ? 'text-amber-600' : 'text-red-600'}`}>
                        {safetyInfo?.text}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(result.safety_score * 100).toFixed(1)}% Safety Rating
                      </p>
                    </div>
                  </div>

                  {/* Improvement Stats */}
                  <div className="space-y-4">
                    <div className="p-4 glass-card rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Initial Score</p>
                          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                            {((result.safety_score - result.improvement) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <ArrowRight className="h-6 w-6 text-emerald-500" />
                        <div>
                          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Optimized Score</p>
                          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                            {(result.safety_score * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 glass-card rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                          <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Optimization Gain</p>
                          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                            +{(result.improvement * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parameter Comparison */}
              <div className="glass-panel rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-6">Parameter Optimization Results</h2>

                <div className="space-y-5">
                  {/* Temperature Comparison */}
                  <div className="p-5 glass-card rounded-xl border border-orange-200/50 dark:border-orange-800/50">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                        <Thermometer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="font-bold text-orange-700 dark:text-orange-300">Temperature</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Initial</p>
                        <p className="text-2xl font-bold">{result.initial.temperature.toFixed(1)}°F</p>
                      </div>
                      <div className="flex justify-center">
                        <ArrowRight className="h-6 w-6 text-orange-500" />
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg shadow-lg">
                        <p className="text-xs text-white/80 mb-1">Optimized</p>
                        <p className="text-2xl font-bold text-white">{result.optimized.temperature.toFixed(1)}°F</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {result.optimized.temperature < result.initial.temperature ? (
                          <TrendingDown className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">Change</span>
                      </div>
                      <span className="font-bold">
                        {result.optimized.temperature < result.initial.temperature ? '-' : '+'}
                        {Math.abs(result.optimized.temperature - result.initial.temperature).toFixed(1)}°F
                      </span>
                    </div>
                  </div>

                  {/* Vibration Comparison */}
                  <div className="p-5 glass-card rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-bold text-blue-700 dark:text-blue-300">Vibration</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Initial</p>
                        <p className="text-2xl font-bold">{result.initial.vibration.toFixed(2)} m/s²</p>
                      </div>
                      <div className="flex justify-center">
                        <ArrowRight className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-lg">
                        <p className="text-xs text-white/80 mb-1">Optimized</p>
                        <p className="text-2xl font-bold text-white">{result.optimized.vibration.toFixed(2)} m/s²</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {result.optimized.vibration < result.initial.vibration ? (
                          <TrendingDown className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">Change</span>
                      </div>
                      <span className="font-bold">
                        {result.optimized.vibration < result.initial.vibration ? '-' : '+'}
                        {Math.abs(result.optimized.vibration - result.initial.vibration).toFixed(2)} m/s²
                      </span>
                    </div>
                  </div>

                  {/* Load Comparison */}
                  <div className="p-5 glass-card rounded-xl border border-violet-200/50 dark:border-violet-800/50">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-1.5 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                        <GaugeIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <h3 className="font-bold text-violet-700 dark:text-violet-300">Load</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Initial</p>
                        <p className="text-2xl font-bold">{(result.initial.load * 100).toFixed(1)}%</p>
                      </div>
                      <div className="flex justify-center">
                        <ArrowRight className="h-6 w-6 text-violet-500" />
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg shadow-lg">
                        <p className="text-xs text-white/80 mb-1">Optimized</p>
                        <p className="text-2xl font-bold text-white">{(result.optimized.load * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {result.optimized.load < result.initial.load ? (
                          <TrendingDown className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">Change</span>
                      </div>
                      <span className="font-bold">
                        {result.optimized.load < result.initial.load ? '-' : '+'}
                        {Math.abs(result.optimized.load - result.initial.load).toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel rounded-2xl p-12">
              <div className="text-center">
                <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-6">
                  <Settings className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ready to Optimize</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Adjust parameters on the left and click "Run Hill Climbing" to find optimal safety settings
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  <span>Hill Climbing algorithm will find the best parameters</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
