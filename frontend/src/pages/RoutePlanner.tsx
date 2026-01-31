import { useState } from 'react';
import { routingApi } from '../api/routing';
import {
  Loader2, MapPin, Target, X, Route, Zap, Clock, Ruler, AlertTriangle,
  RotateCcw, Grid3X3, Factory, Sparkles, Navigation, Shield
} from 'lucide-react';

export default function RoutePlanner() {
  const [gridSize, setGridSize] = useState(12);
  const [start, setStart] = useState<[number, number]>([0, 0]);
  const [goal, setGoal] = useState<[number, number]>([11, 11]);
  const [blocked, setBlocked] = useState<[number, number][]>([]);
  const [path, setPath] = useState<[number, number][]>([]);
  const [pathCost, setPathCost] = useState<number>(0);
  const [pathLength, setPathLength] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animatedPath, setAnimatedPath] = useState<[number, number][]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const generateGrid = (): number[][] => {
    const grid: number[][] = [];
    for (let i = 0; i < gridSize; i++) {
      grid[i] = [];
      for (let j = 0; j < gridSize; j++) {
        grid[i][j] = blocked.some(([x, y]) => x === i && y === j) ? 1 : 0;
      }
    }
    return grid;
  };

  const handleFindPath = async () => {
    setLoading(true);
    setError(null);
    setAnimatedPath([]);

    try {
      const grid = generateGrid();
      const response = await routingApi.planRoute({
        grid,
        start,
        goal,
        blocked,
      });

      if (response.path.length === 0) {
        setError('No safe path found. Adjust obstacles or try different positions.');
      } else {
        setPath(response.path as [number, number][]);
        setPathCost(response.cost);
        setPathLength(response.length);
        animatePath(response.path as [number, number][]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to calculate escape route');
      setPath([]);
    } finally {
      setLoading(false);
    }
  };

  const animatePath = (fullPath: [number, number][]) => {
    setIsAnimating(true);
    setAnimatedPath([]);
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullPath.length) {
        setAnimatedPath(fullPath.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 80);
  };

  const handleCellClick = (x: number, y: number) => {
    if ((x === start[0] && y === start[1]) || (x === goal[0] && y === goal[1])) {
      return;
    }

    const isBlocked = blocked.some(([bx, by]) => bx === x && by === y);
    if (isBlocked) {
      setBlocked(blocked.filter(([bx, by]) => !(bx === x && by === y)));
    } else {
      setBlocked([...blocked, [x, y]]);
    }
    setPath([]);
    setAnimatedPath([]);
  };

  const getCellType = (x: number, y: number) => {
    if (x === start[0] && y === start[1]) return 'start';
    if (x === goal[0] && y === goal[1]) return 'goal';
    if (blocked.some(([bx, by]) => bx === x && by === y)) return 'blocked';
    if (animatedPath.some(([px, py]) => px === x && py === y)) return 'path';
    return 'empty';
  };

  const resetMap = () => {
    setBlocked([]);
    setPath([]);
    setAnimatedPath([]);
    setError(null);
    setStart([0, 0]);
    setGoal([gridSize - 1, gridSize - 1]);
  };

  const estimatedTime = pathCost > 0 ? (pathCost / 1.4).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />

        <div className="relative px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Navigation className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">
                Escape Route Planner
              </h1>
              <p className="text-white/80 flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4" />
                A* Pathfinding Algorithm for Emergency Evacuation
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-5">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                <Grid3X3 className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-bold">Configuration</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Factory Grid Size</label>
                <input
                  type="number"
                  min="8"
                  max="20"
                  value={gridSize}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    setGridSize(newSize);
                    setStart([0, 0]);
                    setGoal([newSize - 1, newSize - 1]);
                    setBlocked([]);
                    setPath([]);
                    setAnimatedPath([]);
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">{gridSize}×{gridSize} grid</p>
              </div>

              {/* Start Position */}
              <div className="p-4 glass-card rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Start Position</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">X</label>
                    <input
                      type="number"
                      min="0"
                      max={gridSize - 1}
                      value={start[0]}
                      onChange={(e) => setStart([parseInt(e.target.value) || 0, start[1]])}
                      className="w-full px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Y</label>
                    <input
                      type="number"
                      min="0"
                      max={gridSize - 1}
                      value={start[1]}
                      onChange={(e) => setStart([start[0], parseInt(e.target.value) || 0])}
                      className="w-full px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Goal Position */}
              <div className="p-4 glass-card rounded-xl border border-red-200/50 dark:border-red-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <Target className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-sm font-semibold text-red-700 dark:text-red-300">Exit Position</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">X</label>
                    <input
                      type="number"
                      min="0"
                      max={gridSize - 1}
                      value={goal[0]}
                      onChange={(e) => setGoal([parseInt(e.target.value) || 0, goal[1]])}
                      className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 focus:border-red-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Y</label>
                    <input
                      type="number"
                      min="0"
                      max={gridSize - 1}
                      value={goal[1]}
                      onChange={(e) => setGoal([goal[0], parseInt(e.target.value) || 0])}
                      className="w-full px-3 py-2 rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Obstacles */}
              <div className="p-4 glass-card rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Obstacles</span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-bold">{blocked.length}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Click on the grid to add/remove obstacles
                </p>
                <button
                  onClick={resetMap}
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Map
                </button>
              </div>

              <button
                onClick={handleFindPath}
                disabled={loading || isAnimating}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Calculating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    <span>Find Escape Route</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Card */}
          {path.length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                  <Route className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="font-bold text-emerald-700 dark:text-emerald-300">Route Found</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Path Length</span>
                  </div>
                  <span className="font-bold">{pathLength} steps</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-violet-500" />
                    <span className="text-sm font-medium">Total Distance</span>
                  </div>
                  <span className="font-bold">{pathCost.toFixed(2)}m</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Est. Time</span>
                  </div>
                  <span className="font-bold">{estimatedTime}s</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="glass-card rounded-xl p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="text-red-600 dark:text-red-400 font-medium text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Factory Floor Map */}
        <div className="lg:col-span-3">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                  <Factory className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Factory Floor Map</h2>
                  <p className="text-sm text-muted-foreground">Click cells to add obstacles, then find the safest escape route</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold">{gridSize}×{gridSize}</span>
              </div>
            </div>

            {/* Grid */}
            <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 p-4">
              <div
                className="grid gap-1 mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  width: '100%',
                  maxWidth: '700px',
                  aspectRatio: '1',
                }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
                  const x = Math.floor(idx / gridSize);
                  const y = idx % gridSize;
                  const cellType = getCellType(x, y);

                  let cellClass = 'aspect-square rounded-lg transition-all duration-150 cursor-pointer relative ';
                  let cellContent = null;

                  switch (cellType) {
                    case 'start':
                      cellClass += 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/50 animate-pulse';
                      cellContent = (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-white drop-shadow-lg" />
                        </div>
                      );
                      break;
                    case 'goal':
                      cellClass += 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50 animate-pulse';
                      cellContent = (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Target className="h-5 w-5 text-white drop-shadow-lg" />
                        </div>
                      );
                      break;
                    case 'blocked':
                      cellClass += 'bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg';
                      cellContent = (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <X className="h-4 w-4 text-white" />
                        </div>
                      );
                      break;
                    case 'path':
                      const pathIndex = animatedPath.findIndex(([px, py]) => px === x && py === y);
                      const isCurrent = pathIndex === animatedPath.length - 1 && isAnimating;
                      cellClass += `bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50 ${isCurrent ? 'scale-110 z-10' : ''}`;
                      cellContent = (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-white rounded-full" />
                        </div>
                      );
                      break;
                    default:
                      cellClass += 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:scale-105';
                  }

                  return (
                    <div
                      key={idx}
                      className={cellClass}
                      onClick={() => handleCellClick(x, y)}
                      title={`Position: (${x}, ${y})`}
                    >
                      {cellContent}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded" />
                <span className="text-sm font-medium">Start</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded" />
                <span className="text-sm font-medium">Exit</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg">
                <div className="w-4 h-4 bg-gradient-to-br from-gray-700 to-gray-900 rounded" />
                <span className="text-sm font-medium">Obstacle</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <div className="w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded" />
                <span className="text-sm font-medium">Route</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
