import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RoutePlanner from './pages/RoutePlanner';
import Optimizer from './pages/Optimizer';
import RiskClassifier from './pages/RiskClassifier';
import ClusterAnalysis from './pages/ClusterAnalysis';
import ToastContainer from './components/ToastContainer';
import useToastStore from './hooks/useToast';

function App() {
  const { toasts, removeToast } = useToastStore();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/route-planner" element={<RoutePlanner />} />
          <Route path="/optimizer" element={<Optimizer />} />
          <Route path="/risk-classifier" element={<RiskClassifier />} />
          <Route path="/cluster-analysis" element={<ClusterAnalysis />} />
        </Routes>
      </Layout>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </Router>
  );
}

export default App;
