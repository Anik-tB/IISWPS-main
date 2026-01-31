import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { predictionApi, DashboardStats } from '../api/prediction';
import { exportToCSV, exportToJSON, printReport, formatSensorDataForExport } from '../utils/export';
import { useToast } from '../hooks/useToast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  AlertCircle,
  Thermometer,
  Gauge as GaugeIcon,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Shield,
  AlertTriangle,
  Factory,
  Wifi,
  WifiOff,
  Database,
  Server,
  Sparkles,
  BarChart3,
  FileJson,
  FileText,
  Printer,
} from 'lucide-react';
import Gauge from '../components/Gauge';
import FactoryFloor from '../components/FactoryFloor';

interface Sensor {
  id: string;
  location: { x: number; y: number };
  temperature: number;
  vibration: number;
  rpm: number;
  load: number;
  accident_probability?: number;
  risk_class?: string;
  risk_confidence?: number;
  timestamp: string;
}

export default function Dashboard() {
  const { sensors, setSensors } = useAppStore();
  const toast = useToast();
  const [timeSeries, setTimeSeries] = useState<
    Array<{ time: string; temp: number; vib: number; rpm: number }>
  >([]);
  const [overallRisk, setOverallRisk] = useState<{
    level: string;
    probability: number;
  }>({ level: 'Low', probability: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [dbStats, setDbStats] = useState<DashboardStats | null>(null);

  // Export handlers
  const handleExportCSV = () => {
    try {
      const formattedData = formatSensorDataForExport(sensors);
      exportToCSV(formattedData, 'sensor_data');
      toast.success('Data exported to CSV successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleExportJSON = () => {
    try {
      const formattedData = formatSensorDataForExport(sensors);
      exportToJSON(formattedData, 'sensor_data');
      toast.success('Data exported to JSON successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handlePrint = () => {
    printReport();
    toast.info('Opening print dialog...');
  };

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let pollingInterval: ReturnType<typeof setInterval> | null = null;

    const connectWebSocket = () => {
      try {
        ws = new WebSocket('ws://localhost:8000/ws/sensors');

        ws.onopen = () => {
          console.log('✅ WebSocket connected - Real-time updates active');
          setIsConnected(true);
          reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'sensor_update') {
              setSensors(data.sensors);

              const avgTemp =
                data.sensors.reduce(
                  (sum: number, s: Sensor) => sum + s.temperature,
                  0
                ) / data.sensors.length;
              const avgVib =
                data.sensors.reduce(
                  (sum: number, s: Sensor) => sum + s.vibration,
                  0
                ) / data.sensors.length;
              const avgRpm =
                data.sensors.reduce(
                  (sum: number, s: Sensor) => sum + s.rpm,
                  0
                ) / data.sensors.length;
              setTimeSeries((prev) => {
                const newSeries = [
                  ...prev,
                  {
                    time: new Date().toLocaleTimeString(),
                    temp: avgTemp,
                    vib: avgVib,
                    rpm: avgRpm,
                  },
                ];
                return newSeries.slice(-30);
              });

              const avgProb =
                data.sensors.reduce(
                  (sum: number, s: Sensor) =>
                    sum + (s.accident_probability || 0),
                  0
                ) / data.sensors.length;
              setOverallRisk({
                level:
                  avgProb > 0.7 ? 'High' : avgProb > 0.4 ? 'Medium' : 'Low',
                probability: avgProb,
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = () => {
          setIsConnected(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
            reconnectTimeout = setTimeout(() => {
              connectWebSocket();
            }, delay);
          } else {
            if (!pollingInterval) {
              pollingInterval = setInterval(fetchSensors, 5000);
            }
          }
        };
      } catch (error) {
        setIsConnected(false);
        if (!pollingInterval) {
          pollingInterval = setInterval(fetchSensors, 5000);
        }
      }
    };

    connectWebSocket();
    fetchSensors();
    pollingInterval = setInterval(fetchSensors, 5000);

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [setSensors]);

  const fetchSensors = async () => {
    try {
      const data = await predictionApi.getLiveSensors();
      setSensors(data.sensors);
    } catch (error) {
      console.error('Error fetching sensors:', error);
    }
  };

  useEffect(() => {
    const fetchDbStats = async () => {
      try {
        const stats = await predictionApi.getDashboardStats();
        setDbStats(stats);
      } catch (error) {
        console.error('Error fetching database stats:', error);
      }
    };
    fetchDbStats();
    const interval = setInterval(fetchDbStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return {
          text: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          glow: 'shadow-red-500/20',
        };
      case 'Medium':
        return {
          text: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          glow: 'shadow-amber-500/20',
        };
      default:
        return {
          text: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          glow: 'shadow-emerald-500/20',
        };
    }
  };

  const getRiskStats = () => {
    const stats = { Low: 0, Medium: 0, High: 0 };
    sensors.forEach((s) => {
      const risk = s.risk_class || 'Low';
      stats[risk as keyof typeof stats]++;
    });
    return stats;
  };

  const riskStats = getRiskStats();
  const pieData = [
    { name: 'Low Risk', value: riskStats.Low, color: '#10b981' },
    { name: 'Medium Risk', value: riskStats.Medium, color: '#f59e0b' },
    { name: 'High Risk', value: riskStats.High, color: '#ef4444' },
  ];

  const avgTemp =
    sensors.length > 0
      ? sensors.reduce((sum, s) => sum + s.temperature, 0) / sensors.length
      : 0;
  const avgVib =
    sensors.length > 0
      ? sensors.reduce((sum, s) => sum + s.vibration, 0) / sensors.length
      : 0;
  const avgRpm =
    sensors.length > 0
      ? Math.round(sensors.reduce((sum, s) => sum + s.rpm, 0) / sensors.length)
      : 0;

  const riskColors = getRiskColor(overallRisk.level);
  const tempPercent = ((avgTemp - 50) / 50) * 100;
  const vibPercent = (avgVib / 7) * 100;
  const rpmPercent = ((avgRpm - 500) / 1000) * 100;
  const riskPercent = overallRisk.probability * 100;

  return (
    <div className="space-y-6 animate-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />

        <div className="relative px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Factory className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">
                    Safety Command Center
                  </h1>
                  <p className="text-white/70 flex items-center gap-2 mt-1">
                    <Sparkles className="h-4 w-4" />
                    AI-powered real-time monitoring & predictive analytics
                  </p>
                </div>
              </div>
            </div>

            {/* Status Cards */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Database Status */}
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-sm border ${dbStats?.database_connected
                ? 'bg-emerald-500/20 border-emerald-400/30'
                : 'bg-amber-500/20 border-amber-400/30'
                }`}>
                <Database className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">
                  {dbStats?.database_connected ? 'Database Live' : 'Mock Data'}
                </span>
              </div>

              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-sm border ${isConnected
                ? 'bg-emerald-500/20 border-emerald-400/30'
                : 'bg-gray-500/20 border-gray-400/30'
                }`}>
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-white" />
                ) : (
                  <WifiOff className="h-4 w-4 text-white" />
                )}
                <span className="text-sm font-medium text-white">
                  {isConnected ? 'Live Stream' : 'Offline'}
                </span>
              </div>

              {/* Risk Status */}
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-sm border ${riskColors.border} ${riskColors.bg}`}>
                <Shield className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">
                  {overallRisk.level} Risk
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Temperature Card */}
        <div className="glass-card rounded-2xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg shadow-orange-500/25">
              <Thermometer className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              {avgTemp > 75 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-red-500 font-medium">High</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Normal</span>
                </>
              )}
            </div>
          </div>
          <Gauge
            value={Math.min(100, Math.max(0, tempPercent))}
            label="Temperature"
            unit="°F"
            color={avgTemp > 75 ? 'red' : avgTemp > 65 ? 'yellow' : 'green'}
            size="sm"
          />
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {avgTemp.toFixed(1)}°F
            </p>
            <p className="text-xs text-muted-foreground mt-1">Optimal: 65-75°F</p>
          </div>
        </div>

        {/* Vibration Card */}
        <div className="glass-card rounded-2xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/25">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-1 text-sm">
              {avgVib > 4.0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-red-500 font-medium">High</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500 font-medium">Normal</span>
                </>
              )}
            </div>
          </div>
          <Gauge
            value={Math.min(100, Math.max(0, vibPercent))}
            label="Vibration"
            unit="m/s²"
            color={avgVib > 4.0 ? 'red' : avgVib > 3.0 ? 'yellow' : 'green'}
            size="sm"
          />
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {avgVib.toFixed(2)} m/s²
            </p>
            <p className="text-xs text-muted-foreground mt-1">Optimal: 2.0-3.5</p>
          </div>
        </div>

        {/* RPM Card */}
        <div className="glass-card rounded-2xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl shadow-lg shadow-violet-500/25">
              <GaugeIcon className="h-5 w-5 text-white" />
            </div>
            <Zap className="h-4 w-4 text-violet-500" />
          </div>
          <Gauge
            value={Math.min(100, Math.max(0, rpmPercent))}
            label="RPM"
            unit=""
            color="purple"
            size="sm"
          />
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {avgRpm.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Optimal: 1000-1200</p>
          </div>
        </div>

        {/* Accident Risk Card */}
        <div className="glass-card rounded-2xl p-6 hover-lift group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg shadow-red-500/25">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            {overallRisk.probability > 0.7 && (
              <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
            )}
          </div>
          <Gauge
            value={riskPercent}
            label="Accident Risk"
            unit="%"
            color={
              overallRisk.probability > 0.7
                ? 'red'
                : overallRisk.probability > 0.4
                  ? 'yellow'
                  : 'green'
            }
            size="sm"
          />
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {(overallRisk.probability * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {overallRisk.probability > 0.7
                ? 'Critical Alert'
                : overallRisk.probability > 0.4
                  ? 'Elevated'
                  : 'Normal'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Analytics Chart */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gradient">Real-Time Analytics</h2>
                <p className="text-sm text-muted-foreground">Live sensor data stream</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Temp</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Vibration</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={timeSeries}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorVib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                }}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#f97316"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTemp)"
                name="Temperature (°F)"
              />
              <Area
                type="monotone"
                dataKey="vib"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorVib)"
                name="Vibration (m/s²)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gradient">Risk Distribution</h2>
              <p className="text-sm text-muted-foreground">Sensor risk levels</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={3}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Factory Floor */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
              <Factory className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gradient">Factory Floor Monitoring</h2>
              <p className="text-sm text-muted-foreground">Interactive sensor visualization</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <span className="text-sm text-muted-foreground">Active Sensors</span>
              <span className="text-lg font-bold">{sensors.length}</span>
            </div>
          </div>
        </div>
        <FactoryFloor sensors={sensors} onSensorClick={setSelectedSensor} />
        {selectedSensor && (
          <div className="mt-6 p-5 glass-card rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-bold text-lg">{selectedSensor.id}</h3>
              <span className={`badge ${getRiskColor(selectedSensor.risk_class || 'Low').text} ${getRiskColor(selectedSensor.risk_class || 'Low').bg}`}>
                {selectedSensor.risk_class || 'Low'} Risk
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Temperature</p>
                <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{selectedSensor.temperature.toFixed(1)}°F</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Vibration</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{selectedSensor.vibration.toFixed(2)} m/s²</p>
              </div>
              <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20">
                <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">RPM</p>
                <p className="text-xl font-bold text-violet-700 dark:text-violet-300">{selectedSensor.rpm}</p>
              </div>
              <div className="p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20">
                <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">Accident Prob.</p>
                <p className="text-xl font-bold text-pink-700 dark:text-pink-300">
                  {selectedSensor.accident_probability
                    ? (selectedSensor.accident_probability * 100).toFixed(1) + '%'
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Database Statistics */}
      {dbStats?.database_connected && dbStats.stats && (
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gradient-blue">Database Statistics</h2>
                <p className="text-sm text-muted-foreground">Real data from MariaDB</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Connected</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Readings</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {dbStats.stats.total_sensor_readings.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/50 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-medium text-violet-600 dark:text-violet-400">Predictions (24h)</span>
              </div>
              <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                {Object.values(dbStats.stats.predictions_by_risk).reduce((a, b) => a + b, 0)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Classifications</span>
              </div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {Object.values(dbStats.stats.classifications_by_risk).reduce((a, b) => a + b, 0)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 hover-lift">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Optimizations</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {dbStats.stats.total_optimizations}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sensor Details Table */}
      <div className="glass-panel rounded-2xl p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Sensor Details</h2>
              <p className="text-sm text-muted-foreground">Complete sensor readings</p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="btn-export flex items-center gap-2"
              title="Export to CSV"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="btn-export flex items-center gap-2"
              title="Export to JSON"
            >
              <FileJson className="h-4 w-4" />
              <span className="hidden sm:inline">JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn-export flex items-center gap-2 no-print"
              title="Print Report"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sensor</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Temp</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vibration</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">RPM</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Load</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {sensors.map((sensor) => {
                const sensorRiskColors = getRiskColor(sensor.risk_class || 'Low');
                return (
                  <tr key={sensor.id} className="table-hover-row cursor-pointer"
                    onClick={() => setSelectedSensor(sensor)}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm font-semibold">{sensor.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-3.5 w-3.5 text-orange-500" />
                        <span className="font-medium">{sensor.temperature.toFixed(1)}°F</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5 text-blue-500" />
                        <span className="font-medium">{sensor.vibration.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium">{sensor.rpm.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{ width: `${sensor.load * 100}%` }}
                          />
                        </div>
                        <span className="text-sm">{(sensor.load * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${sensorRiskColors.bg} ${sensorRiskColors.text}`}>
                        {sensor.risk_class || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${(sensor.accident_probability || 0) > 0.7
                              ? 'bg-red-500'
                              : (sensor.accident_probability || 0) > 0.4
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                              }`}
                            style={{ width: `${(sensor.accident_probability || 0) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {sensor.accident_probability
                            ? (sensor.accident_probability * 100).toFixed(1) + '%'
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
