import { Home, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumbs() {
  const location = useLocation();

  const pathMap: Record<string, string> = {
    '/': 'Dashboard',
    '/route-planner': 'Route Planner',
    '/optimizer': 'Machine Optimizer',
    '/risk-classifier': 'Risk Classifier',
    '/cluster-analysis': 'Cluster Analysis',
  };

  const currentPath = location.pathname;
  const currentPage = pathMap[currentPath] || 'Dashboard';

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/" className="breadcrumb-item flex items-center gap-1">
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      {currentPath !== '/' && (
        <>
          <ChevronRight className="h-4 w-4 breadcrumb-separator" />
          <span className="text-foreground font-medium">{currentPage}</span>
        </>
      )}
    </nav>
  );
}
