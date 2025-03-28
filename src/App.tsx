import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import WorkflowList from './pages/WorkflowList';
import WorkflowBuilder from './pages/WorkflowBuilder';
import WorkflowEditor from './pages/WorkflowEditor';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status when app loads
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route path="/workflows" element={
          <ProtectedRoute>
            <WorkflowList />
          </ProtectedRoute>
        } />
        <Route path="/workflows/new" element={
          <ProtectedRoute>
            <WorkflowBuilder />
          </ProtectedRoute>
        } />
        <Route path="/workflows/:id" element={
          <ProtectedRoute>
            <WorkflowEditor />
          </ProtectedRoute>
        } />
        
        {/* Default route - redirect to login or workflows based on auth status */}
        <Route path="/" element={
          localStorage.getItem('isAuthenticated') === 'true' 
            ? <Navigate to="/workflows" replace />
            : <Navigate to="/login" replace />
        } />

        {/* Catch all route - redirect to login or workflows */}
        <Route path="*" element={
          localStorage.getItem('isAuthenticated') === 'true'
            ? <Navigate to="/workflows" replace />
            : <Navigate to="/login" replace />
        } />
      </Routes>
    </Router>
  );
};

export default App; 