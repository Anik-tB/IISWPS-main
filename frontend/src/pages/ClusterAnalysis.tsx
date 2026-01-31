import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { clusteringApi, ClusteringResponse, Cluster } from '../api/clustering';
import {
  Loader2,
  Layers,
  AlertTriangle,
  TrendingUp,
  Target,
  Zap,
  Settings,
  Activity,
  Shield,
  XCircle,
  BarChart3,
  Factory,
  Wrench,
  AlertCircle,
  Info,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Eye,
  DollarSign,
  Clock,
  MapPin,
} from 'lucide-react';
import ClusterVisualization from '../components/ClusterVisualization';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface ClusterMetrics {
  maintenanceCost: number;
  downtimeHours: number;
  riskScore: number;
  efficiency: number;
  savings: number;
}

export default function ClusterAnalysis() {
  const { sensors } = useAppStore();
  const [clusteringMode, setClusteringMode] = useState<
    'sensors' | 'maintenance' | 'risk-zones' | 'live'
  >('live');
  const [result, setResult] = useState<ClusteringResponse | null>(null);
  const [clusteredSensors, setClusteredSensors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nClusters, setNClusters] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<
    'overview' | 'detailed' | 'comparison'
  >('overview');
  const [showClusterBoundaries, setShowClusterBoundaries] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);

  // Calculate real-world industrial metrics
  const clusterMetrics = useMemo((): Record<number, ClusterMetrics> => {
    if (!result) return {};

    const metrics: Record<number, ClusterMetrics> = {};

    result.clusters.forEach((cluster) => {
      const riskMultiplier =
        cluster.risk_level === 'High'
          ? 1.5
          : cluster.risk_level === 'Medium'
            ? 1.2
            : 1.0;
      const sizeMultiplier = cluster.size / 10;

      metrics[cluster.cluster_id] = {
        maintenanceCost: Math.round(500 * sizeMultiplier * riskMultiplier),
        downtimeHours:
          Math.round(2.5 * sizeMultiplier * riskMultiplier * 10) / 10,
        riskScore:
          cluster.risk_level === 'High'
            ? 85
            : cluster.risk_level === 'Medium'
              ? 60
              : 30,
        efficiency:
          Math.round(
            (100 - (cluster.mean_values.accident_probability || 0) * 100) * 10
          ) / 10,
        savings: Math.round(1200 * sizeMultiplier * (1 - riskMultiplier * 0.3)),
      };
    });

    return metrics;
  }, [result]);

  const totalSavings = useMemo(() => {
    return Object.values(clusterMetrics).reduce((sum, m) => sum + m.savings, 0);
  }, [clusterMetrics]);

  useEffect(() => {
    if (autoRefresh) {
      const timer = setTimeout(() => {
        handleRefresh();
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sensors.length, autoRefresh, clusteringMode, nClusters]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, 10000); // Refresh every 10 seconds
      setRefreshInterval(interval);
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, clusteringMode, nClusters]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      let response: ClusteringResponse;
      const commonOptions = { n_clusters: nClusters || undefined };

      switch (clusteringMode) {
        case 'live':
          response = await clusteringApi.clusterLive(commonOptions);
          break;
        case 'sensors':
          response = await clusteringApi.clusterSensors({
            sensor_data: sensors,
            ...commonOptions,
          });
          break;
        case 'maintenance':
          response = await clusteringApi.clusterMaintenance({
            machine_data: sensors,
            ...commonOptions,
          });
          break;
        case 'risk-zones':
          response = await clusteringApi.clusterRiskZones({
            location_data: sensors,
            ...commonOptions,
          });
          break;
        default:
          response = await clusteringApi.clusterLive(commonOptions);
      }

      setResult(response);

      // Reconstruct sensors from clustering result
      const reconstructedSensors: any[] = [];

      if (response.clusters && response.clusters.length > 0) {
        // Create a map to track which cluster each sensor belongs to
        const sensorClusterMap = new Map<string, number>();
        response.clusters.forEach((cluster) => {
          cluster.sensor_ids.forEach((sensorId) => {
            sensorClusterMap.set(sensorId, cluster.cluster_id);
          });
        });

        // Generate locations for each cluster
        const clusterLocations = new Map<
          number,
          { baseX: number; baseY: number }
        >();
        response.clusters.forEach((cluster, clusterIdx) => {
          // Distribute clusters across the factory floor
          const clustersPerRow = Math.ceil(Math.sqrt(response.clusters.length));
          const row = Math.floor(clusterIdx / clustersPerRow);
          const col = clusterIdx % clustersPerRow;

          const baseX = (col + 0.5) * (90 / clustersPerRow) + 5;
          const baseY = (row + 0.5) * (90 / clustersPerRow) + 5;

          clusterLocations.set(cluster.cluster_id, { baseX, baseY });
        });

        // Create sensors with locations distributed around cluster centers
        response.clusters.forEach((cluster) => {
          const clusterLoc = clusterLocations.get(cluster.cluster_id) || {
            baseX: 50,
            baseY: 50,
          };
          const sensorsInCluster = cluster.sensor_ids.length;

          cluster.sensor_ids.forEach((sensorId, sensorIdx) => {
            // Distribute sensors in a circle around cluster center
            const angle = (sensorIdx / sensorsInCluster) * Math.PI * 2;
            const radius = Math.min(15, sensorsInCluster * 2);
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;

            reconstructedSensors.push({
              id: sensorId,
              location: {
                x: Math.max(5, Math.min(95, clusterLoc.baseX + offsetX)),
                y: Math.max(5, Math.min(95, clusterLoc.baseY + offsetY)),
              },
              temperature: cluster.mean_values.temperature || 75,
              vibration: cluster.mean_values.vibration || 3.0,
              rpm: cluster.mean_values.rpm || 1200,
              load: cluster.mean_values.load || 0.5,
              accident_probability:
                cluster.mean_values.accident_probability || 0.3,
              risk_class: cluster.risk_level || 'Low',
              timestamp: new Date().toISOString(),
            });
          });
        });
      }

      setClusteredSensors(reconstructedSensors);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Clustering failed');
    } finally {
      setLoading(false);
    }
  };

  const getClusterColor = (clusterId: number, riskLevel?: string) => {
    const colors = [
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
      '#f59e0b',
      '#10b981',
      '#ef4444',
      '#06b6d4',
      '#f97316',
    ];
    if (riskLevel === 'High') return '#ef4444';
    if (riskLevel === 'Medium') return '#f59e0b';
    // Use clusterId - 1 since clusters are now 1-indexed
    return colors[(clusterId - 1) % colors.length];
  };

  const prepareClusterComparisonData = () => {
    if (!result) return [];

    return result.clusters.map((cluster) => {
      const metrics = clusterMetrics[cluster.cluster_id];
      return {
        name: `Cluster ${cluster.cluster_id}`,
        size: cluster.size,
        riskScore:
          cluster.risk_level === 'High'
            ? 85
            : cluster.risk_level === 'Medium'
              ? 60
              : 30,
        efficiency:
          Math.round(
            (100 - (cluster.mean_values.accident_probability || 0) * 100) * 10
          ) / 10,
        temperature: cluster.mean_values.temperature || 0,
        vibration: cluster.mean_values.vibration || 0,
        maintenanceCost: metrics?.maintenanceCost || 0,
      };
    });
  };

  const prepareRadarData = (cluster: Cluster) => {
    const metrics = clusterMetrics[cluster.cluster_id];
    return [
      {
        metric: 'Temperature',
        value: Math.min(
          ((cluster.mean_values.temperature || 0) / 100) * 100,
          100
        ),
      },
      {
        metric: 'Vibration',
        value: Math.min(((cluster.mean_values.vibration || 0) / 10) * 100, 100),
      },
      {
        metric: 'Load',
        value: Math.min((cluster.mean_values.load || 0) * 100, 100),
      },
      {
        metric: 'RPM',
        value: Math.min(((cluster.mean_values.rpm || 0) / 2000) * 100, 100),
      },
      {
        metric: 'Safety',
        value: (1 - (cluster.mean_values.accident_probability || 0)) * 100,
      },
      { metric: 'Efficiency', value: metrics?.efficiency || 0 },
    ];
  };

  const prepareMaintenanceSchedule = () => {
    if (!result) return [];

    return result.clusters
      .map((cluster) => ({
        clusterId: cluster.cluster_id,
        clusterName: `Cluster ${cluster.cluster_id}`,
        priority: cluster.risk_level,
        sensors: cluster.size,
        estimatedCost: clusterMetrics[cluster.cluster_id]?.maintenanceCost || 0,
        estimatedTime: clusterMetrics[cluster.cluster_id]?.downtimeHours || 0,
        recommendation:
          cluster.recommendation || 'Continue regular maintenance schedule',
      }))
      .sort((a, b) => {
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return (
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        );
      });
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />

        <div className="relative px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Layers className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">
                  K-Means Cluster Analysis
                </h1>
                <p className="text-white/80 mt-1">
                  Intelligent Sensor Grouping & Industrial Optimization
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {autoRefresh && clusteringMode === 'live' && (
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/20">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-white">Live Monitoring</span>
                </div>
              )}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/20"
                title={autoRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}
              >
                {autoRefresh ? (
                  <PauseCircle className="h-5 w-5 text-white" />
                ) : (
                  <PlayCircle className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {result && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-xs text-white/70 mb-1">Total Savings</div>
                <div className="text-2xl font-bold text-white">
                  ${totalSavings.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-300 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Per Month</span>
                </div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-xs text-white/70 mb-1">Clusters</div>
                <div className="text-2xl font-bold text-white">{result.n_clusters}</div>
                <div className="text-xs text-white/70">Active Groups</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-xs text-white/70 mb-1">Quality Score</div>
                <div className="text-2xl font-bold text-white">
                  {(result.silhouette_score * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-emerald-300">Excellent</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-xs text-white/70 mb-1">Anomalies</div>
                <div className="text-2xl font-bold text-white">
                  {result.anomalies.length}
                </div>
                <div className="text-xs text-amber-300">Require Attention</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-xs text-white/70 mb-1">Efficiency</div>
                <div className="text-2xl font-bold text-white">
                  {Object.values(clusterMetrics).length > 0
                    ? Math.round(
                      Object.values(clusterMetrics).reduce(
                        (sum, m) => sum + m.efficiency,
                        0
                      ) / Object.values(clusterMetrics).length
                    )
                    : 0}%
                </div>
                <div className="text-xs text-emerald-300">System Average</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mode Selection & Controls */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">Clustering Configuration</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setViewMode(
                  viewMode === 'overview'
                    ? 'detailed'
                    : viewMode === 'detailed'
                      ? 'comparison'
                      : 'overview'
                )
              }
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {viewMode === 'overview'
                ? 'Overview'
                : viewMode === 'detailed'
                  ? 'Detailed'
                  : 'Comparison'}
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              id: 'live',
              label: 'Live Sensors',
              icon: Activity,
              desc: 'Real-time clustering',
              gradient: 'from-blue-500 to-cyan-500',
            },
            {
              id: 'sensors',
              label: 'Sensor Groups',
              icon: Zap,
              desc: 'Behavior patterns',
              gradient: 'from-violet-500 to-purple-500',
            },
            {
              id: 'maintenance',
              label: 'Maintenance Zones',
              icon: Settings,
              desc: 'Schedule optimization',
              gradient: 'from-orange-500 to-amber-500',
            },
            {
              id: 'risk-zones',
              label: 'Risk Zones',
              icon: Shield,
              desc: 'Safety zones',
              gradient: 'from-red-500 to-rose-500',
            },
          ].map((mode) => {
            const Icon = mode.icon;
            const isActive = clusteringMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setClusteringMode(mode.id as any);
                  setResult(null);
                }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${isActive
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg shadow-indigo-500/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${isActive
                      ? `bg-gradient-to-br ${mode.gradient} text-white shadow-lg`
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{mode.label}</h3>
                    <p className="text-xs text-muted-foreground">{mode.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold mb-2">
              Number of Clusters
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={nClusters || ''}
              onChange={(e) =>
                setNClusters(e.target.value ? parseInt(e.target.value) : null)
              }
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              placeholder="Auto-determined if empty"
            />
          </div>
          <label className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <input
              type="checkbox"
              checked={showClusterBoundaries}
              onChange={(e) => setShowClusterBoundaries(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium">Show Boundaries</span>
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 dark:text-red-300 font-medium">
              {error}
            </p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Enhanced Advanced Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {result.clusters.map((cluster) => {
              const metrics = clusterMetrics[cluster.cluster_id];
              const isSelected = selectedCluster === cluster.cluster_id;
              const color = getClusterColor(
                cluster.cluster_id,
                cluster.risk_level
              );

              return (
                <div
                  key={cluster.cluster_id}
                  onClick={() =>
                    setSelectedCluster(isSelected ? null : cluster.cluster_id)
                  }
                  className={`relative glass-card rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 overflow-hidden group ${isSelected
                    ? 'border-primary shadow-2xl scale-105 ring-4 ring-primary/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                    }`}
                  style={{
                    borderColor: isSelected ? color : undefined,
                  }}
                >
                  {/* Animated Background Gradient */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${color}00 0%, ${color}40 100%)`,
                    }}
                  />

                  {/* Cluster Badge */}
                  <div className="relative flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                          boxShadow: `0 4px 20px ${color}60`,
                        }}
                      >
                        {cluster.cluster_id}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          Cluster {cluster.cluster_id}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {cluster.size} sensors
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${cluster.risk_level === 'High'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : cluster.risk_level === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}
                    >
                      {cluster.risk_level}
                    </span>
                  </div>

                  {/* Enhanced Metrics Grid */}
                  <div className="relative grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-1 mb-1">
                        <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <div className="text-xs text-muted-foreground">
                          Savings
                        </div>
                      </div>
                      <div className="font-bold text-lg text-green-700 dark:text-green-400">
                        ${metrics?.savings.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <div className="text-xs text-muted-foreground">
                          Efficiency
                        </div>
                      </div>
                      <div className="font-bold text-lg text-blue-700 dark:text-blue-400">
                        {metrics?.efficiency}%
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-1 mb-1">
                        <Wrench className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                        <div className="text-xs text-muted-foreground">
                          Cost
                        </div>
                      </div>
                      <div className="font-bold text-lg text-orange-700 dark:text-orange-400">
                        ${metrics?.maintenanceCost}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        <div className="text-xs text-muted-foreground">
                          Downtime
                        </div>
                      </div>
                      <div className="font-bold text-lg text-purple-700 dark:text-purple-400">
                        {metrics?.downtimeHours}h
                      </div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-primary rounded-full animate-ping" />
                      <div className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Enhanced Interactive Factory Floor with Clusters */}
          <div className="glass-panel rounded-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                  <Factory className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Factory Floor Cluster Visualization
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Interactive cluster mapping with real-time sensor data
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  Click clusters to explore
                </span>
              </div>
            </div>
            <div
              className="relative rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-700 shadow-inner"
              style={{ height: '600px' }}
            >
              {result && result.clusters && result.clusters.length > 0 ? (
                <ClusterVisualization
                  sensors={
                    clusteredSensors.length > 0 ? clusteredSensors : sensors
                  }
                  clusters={result.clusters}
                  selectedCluster={selectedCluster}
                  onClusterSelect={setSelectedCluster}
                  getClusterColor={getClusterColor}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <div className="text-center">
                    <Factory className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-2">
                      No Clustering Data Available
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                      Click the "Refresh" button above to perform cluster
                      analysis
                    </p>
                    <button
                      onClick={handleRefresh}
                      disabled={loading}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {loading ? 'Clustering...' : 'Run Clustering'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Cluster Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cluster Performance Comparison Bar Chart */}
            <div className="glass-panel rounded-2xl p-6 overflow-hidden relative border-blue-200/50 dark:border-blue-800/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Performance Comparison
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Multi-metric cluster analysis
                      </p>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={prepareClusterComparisonData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e0e0e0"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="circle"
                    />
                    <Bar
                      dataKey="size"
                      fill="#3b82f6"
                      name="Sensor Count"
                      radius={[8, 8, 0, 0]}
                    >
                      {prepareClusterComparisonData().map((_entry, index) => (
                        <Cell key={`cell-size-${index}`} fill="#3b82f6" />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="efficiency"
                      fill="#10b981"
                      name="Efficiency %"
                      radius={[8, 8, 0, 0]}
                    >
                      {prepareClusterComparisonData().map((_entry, index) => (
                        <Cell key={`cell-eff-${index}`} fill="#10b981" />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="riskScore"
                      fill="#ef4444"
                      name="Risk Score"
                      radius={[8, 8, 0, 0]}
                    >
                      {prepareClusterComparisonData().map((_entry, index) => (
                        <Cell key={`cell-risk-${index}`} fill="#ef4444" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Enhanced Cluster Distribution Pie Chart */}
            <div className="glass-panel rounded-2xl p-6 overflow-hidden relative border-purple-200/50 dark:border-purple-800/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Sensor Distribution
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Cluster size breakdown
                      </p>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsPieChart>
                    <Pie
                      data={result.clusters.map((c) => ({
                        name: `Cluster ${c.cluster_id}`,
                        value: c.size,
                        risk: c.risk_level,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({
                        name,
                        percent,
                        value,
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                      }) => {
                        if (value === 0) return null; // Don't show label for empty clusters

                        const RADIAN = Math.PI / 180;
                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#374151"
                            fontSize={12}
                            fontWeight="bold"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                          >
                            {`${name}: ${value} (${(percent * 100).toFixed(
                              0
                            )}%)`}
                          </text>
                        );
                      }}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {result.clusters.map((cluster, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getClusterColor(
                            cluster.cluster_id,
                            cluster.risk_level
                          )}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: any, name: string) => {
                        // Calculate total sensors from clustering result
                        const totalSensors = result.clusters.reduce(
                          (sum, cluster) => sum + cluster.size,
                          0
                        );
                        const percentage =
                          totalSensors > 0
                            ? ((value / totalSensors) * 100).toFixed(1)
                            : '0.0';
                        return [
                          `${value} sensor${value !== 1 ? 's' : ''
                          } (${percentage}%)`,
                          name,
                        ];
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {result.clusters.map((cluster) => (
                    <div
                      key={cluster.cluster_id}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className="w-3 h-3 rounded-full border border-white dark:border-gray-700"
                        style={{
                          backgroundColor: getClusterColor(
                            cluster.cluster_id,
                            cluster.risk_level
                          ),
                        }}
                      />
                      <span className="text-muted-foreground">
                        Cluster {cluster.cluster_id}: {cluster.size} sensors
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Selected Cluster Detailed View */}
          {selectedCluster !== null && (
            <div className="glass-panel rounded-2xl p-6 overflow-hidden relative border-primary/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl transition-transform duration-300 hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${getClusterColor(
                          selectedCluster,
                          result.clusters.find(
                            (c) => c.cluster_id === selectedCluster
                          )?.risk_level
                        )} 0%, ${getClusterColor(
                          selectedCluster,
                          result.clusters.find(
                            (c) => c.cluster_id === selectedCluster
                          )?.risk_level
                        )}dd 100%)`,
                        boxShadow: `0 8px 30px ${getClusterColor(
                          selectedCluster,
                          result.clusters.find(
                            (c) => c.cluster_id === selectedCluster
                          )?.risk_level
                        )}60`,
                      }}
                    >
                      {selectedCluster}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Cluster {selectedCluster} - Detailed Analysis
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive performance metrics
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCluster(null)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                    title="Close detailed view"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {(() => {
                  const cluster = result.clusters.find(
                    (c) => c.cluster_id === selectedCluster
                  );
                  if (!cluster) return null;
                  const metrics = clusterMetrics[selectedCluster];

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Enhanced Radar Chart */}
                      <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <Target className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="font-bold text-lg">
                            Performance Radar
                          </h4>
                        </div>
                        <ResponsiveContainer width="100%" height={350}>
                          <RadarChart data={prepareRadarData(cluster)}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis
                              dataKey="metric"
                              tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <PolarRadiusAxis
                              angle={90}
                              domain={[0, 100]}
                              tick={{ fill: '#6b7280', fontSize: 10 }}
                            />
                            <Radar
                              name="Cluster Performance"
                              dataKey="value"
                              stroke={getClusterColor(
                                selectedCluster,
                                cluster.risk_level
                              )}
                              fill={getClusterColor(
                                selectedCluster,
                                cluster.risk_level
                              )}
                              fillOpacity={0.7}
                              strokeWidth={2}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '2px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Enhanced Detailed Metrics */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="glass-card rounded-xl p-5 border-green-200/50 dark:border-green-800/50">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <div className="text-xs text-muted-foreground font-semibold">
                                Monthly Savings
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                              ${metrics?.savings.toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-500 mt-1 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>Optimized</span>
                            </div>
                          </div>
                          <div className="glass-card rounded-xl p-5 border-blue-200/50 dark:border-blue-800/50">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <div className="text-xs text-muted-foreground font-semibold">
                                Efficiency
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                              {metrics?.efficiency}%
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                              System Performance
                            </div>
                          </div>
                          <div className="glass-card rounded-xl p-5 border-orange-200/50 dark:border-orange-800/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Wrench className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              <div className="text-xs text-muted-foreground font-semibold">
                                Maintenance Cost
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                              ${metrics?.maintenanceCost}
                            </div>
                            <div className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                              Per Cycle
                            </div>
                          </div>
                          <div className="glass-card rounded-xl p-5 border-purple-200/50 dark:border-purple-800/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              <div className="text-xs text-muted-foreground font-semibold">
                                Downtime
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                              {metrics?.downtimeHours}h
                            </div>
                            <div className="text-xs text-purple-600 dark:text-purple-500 mt-1">
                              Estimated
                            </div>
                          </div>
                        </div>

                        <div className="glass-card rounded-xl p-5 border-blue-200/50 dark:border-blue-800/50">
                          <div className="flex items-center gap-2 mb-3">
                            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <h4 className="font-bold text-lg text-blue-700 dark:text-blue-300">
                              Maintenance Recommendation
                            </h4>
                          </div>
                          <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                            {cluster.recommendation ||
                              'Continue regular maintenance schedule.'}
                          </p>
                        </div>

                        <div className="glass-card rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <Activity className="h-5 w-5 text-primary" />
                            <h4 className="font-bold text-lg">
                              Sensors in Cluster
                            </h4>
                            <span className="ml-auto px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                              {cluster.sensor_ids.length} Total
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {cluster.sensor_ids.map((id) => (
                              <span
                                key={id}
                                className="px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary rounded-lg text-sm font-mono border border-primary/20 hover:border-primary/40 transition-colors"
                              >
                                {id}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Enhanced Maintenance Scheduling */}
          <div className="glass-panel rounded-2xl p-6 overflow-hidden relative border-orange-200/50 dark:border-orange-800/50">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Maintenance Schedule Recommendations
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Priority-based maintenance planning
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                    {prepareMaintenanceSchedule()
                      .reduce((sum, s) => sum + s.estimatedTime, 0)
                      .toFixed(1)}
                    h Total
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {prepareMaintenanceSchedule().map((schedule) => {
                  const color = getClusterColor(
                    schedule.clusterId,
                    schedule.priority
                  );
                  const isHighPriority = schedule.priority === 'High';

                  return (
                    <div
                      key={schedule.clusterId}
                      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] glass-card ${schedule.priority === 'High'
                        ? 'border-red-500/50 shadow-lg'
                        : schedule.priority === 'Medium'
                          ? 'border-yellow-500/50'
                          : 'border-green-500/50'
                        }`}
                    >
                      {/* Priority Indicator Bar */}
                      <div
                        className="absolute top-0 left-0 h-full w-1"
                        style={{ backgroundColor: color }}
                      />

                      {/* Animated Priority Badge */}
                      {isHighPriority && (
                        <div className="absolute top-2 right-2">
                          <div className="relative">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                            <div className="relative bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              URGENT
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-5 pl-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform duration-300 hover:scale-110"
                              style={{
                                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                                boxShadow: `0 4px 20px ${color}60`,
                              }}
                            >
                              {schedule.clusterId}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold mb-1">
                                {schedule.clusterName}
                              </h4>
                              <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Activity className="h-4 w-4" />
                                  {schedule.sensors} sensors
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${schedule.priority === 'High'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                    : schedule.priority === 'Medium'
                                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                      : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                                    }`}
                                >
                                  {schedule.priority} Priority
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right glass-effect rounded-lg p-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <DollarSign className="h-3 w-3" />
                              Estimated Cost
                            </div>
                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              ${schedule.estimatedCost.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              {schedule.estimatedTime}h downtime
                            </div>
                          </div>
                        </div>

                        <div className="glass-effect rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {schedule.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Enhanced Anomalies Section */}
          {result.anomalies.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 overflow-hidden relative border-orange-300/50 dark:border-orange-700/50">
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg animate-pulse">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Anomaly Detection
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {result.anomalies.length} sensor
                        {result.anomalies.length !== 1 ? 's' : ''} requiring
                        immediate attention
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-800">
                    <span className="text-sm font-bold text-red-700 dark:text-red-300">
                      {result.anomalies.length} Alert
                      {result.anomalies.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="glass-card border-l-4 border-yellow-500 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                        Warning: Unusual Behavior Detected
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        These sensors exhibit unusual behavior patterns and
                        don't fit well into any cluster. Immediate inspection
                        and maintenance recommended to prevent potential
                        failures.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.anomalies.map((anomaly, idx) => {
                    const sensor = sensors[anomaly.sensor_index];
                    if (!sensor) return null;
                    const riskLevel =
                      (sensor.accident_probability || 0) > 0.7
                        ? 'Critical'
                        : (sensor.accident_probability || 0) > 0.4
                          ? 'High'
                          : 'Medium';

                    return (
                      <div
                        key={idx}
                        className="glass-card rounded-xl p-5 border-orange-400/50 dark:border-orange-600/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group"
                      >
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Animated Pulse Indicator */}
                        <div className="absolute top-3 right-3">
                          <div className="relative">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                            <div className="relative w-3 h-3 bg-red-500 rounded-full"></div>
                          </div>
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
                                <AlertCircle className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-lg">{sensor.id}</p>
                                <p className="text-xs text-muted-foreground">
                                  Anomaly Detected
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-xs font-bold shadow-md">
                                Score: {anomaly.anomaly_score.toFixed(2)}
                              </div>
                              <div
                                className={`mt-1 px-2 py-0.5 rounded text-xs font-bold ${riskLevel === 'Critical'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                                  : riskLevel === 'High'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                                  }`}
                              >
                                {riskLevel} Risk
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="glass-effect rounded-lg p-3">
                              <div className="flex items-center gap-1 mb-1">
                                <Activity className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-muted-foreground">
                                  Temperature
                                </span>
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {sensor.temperature}°F
                              </div>
                            </div>
                            <div className="glass-effect rounded-lg p-3">
                              <div className="flex items-center gap-1 mb-1">
                                <Zap className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-muted-foreground">
                                  Vibration
                                </span>
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {sensor.vibration} m/s²
                              </div>
                            </div>
                            <div className="glass-effect rounded-lg p-3">
                              <div className="flex items-center gap-1 mb-1">
                                <MapPin className="h-3 w-3 text-gray-500" />
                                <span className="text-xs text-muted-foreground">
                                  Distance
                                </span>
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {anomaly.distance_from_center.toFixed(2)}
                              </div>
                            </div>
                            <div className="glass-card rounded-lg p-3 border-red-200/50 dark:border-red-800/50">
                              <div className="flex items-center gap-1 mb-1">
                                <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                                <span className="text-xs text-muted-foreground">
                                  Accident Risk
                                </span>
                              </div>
                              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                {(
                                  (sensor.accident_probability || 0) * 100
                                ).toFixed(1)}
                                %
                              </div>
                            </div>
                          </div>

                          <div className="glass-card rounded-lg p-3 border-blue-200/50 dark:border-blue-800/50">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                This sensor is{' '}
                                {anomaly.anomaly_score.toFixed(1)} standard
                                deviations away from its expected cluster
                                center. Immediate inspection and parameter
                                adjustment recommended.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
