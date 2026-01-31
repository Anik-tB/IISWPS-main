import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import Breadcrumbs from './Breadcrumbs';
import {
  LayoutDashboard,
  Route,
  Settings,
  AlertTriangle,
  Layers,
  Moon,
  Sun,
  Menu,
  X,
  Cpu,
  Sparkles,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-500' },
    { path: '/route-planner', label: 'Route Planner', icon: Route, color: 'from-emerald-500 to-teal-500' },
    { path: '/optimizer', label: 'Optimizer', icon: Settings, color: 'from-violet-500 to-purple-500' },
    { path: '/risk-classifier', label: 'Risk Classifier', icon: AlertTriangle, color: 'from-orange-500 to-amber-500' },
    { path: '/cluster-analysis', label: 'Clusters', icon: Layers, color: 'from-pink-500 to-rose-500' },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground min-h-screen">
        {/* Background Gradient Mesh */}
        <div className="fixed inset-0 gradient-mesh pointer-events-none" />

        {/* Navbar */}
        <nav className="glass sticky top-0 z-50 border-b border-white/10">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <Cpu className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold text-gradient">
                    Industrial Safety
                  </span>
                  <span className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground -mt-0.5">
                    <Sparkles className="h-3 w-3" />
                    AI-Powered Monitoring
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 group ${isActive
                        ? 'text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                      {/* Active background */}
                      {isActive && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl shadow-lg`} />
                      )}
                      {/* Hover background */}
                      <div className={`absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'hidden' : ''}`} />

                      <Icon className={`relative h-4 w-4 ${isActive ? '' : 'group-hover:scale-110'} transition-transform duration-200`} />
                      <span className="relative text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Right side actions */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="relative p-2.5 rounded-xl glass-button group"
                  aria-label="Toggle dark mode"
                >
                  <div className="relative">
                    {darkMode ? (
                      <Sun className="h-5 w-5 text-amber-500 group-hover:rotate-45 transition-transform duration-300" />
                    ) : (
                      <Moon className="h-5 w-5 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
                    )}
                  </div>
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2.5 rounded-xl glass-button"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl">
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs />
          </div>
          {children}
        </main>

        {/* Footer */}
        <footer className="relative mt-auto py-6 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                  <Cpu className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-medium">Industrial Safety System</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Powered by AI</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Real-time Monitoring</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
