import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import WorkflowList from './pages/WorkflowList';
import WorkflowEditor from './pages/WorkflowEditor';
import WorkflowBuilder from './pages/WorkflowBuilder';
import theme from './theme/theme';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/workflows" element={<WorkflowList />} />
            <Route path="/workflows/new" element={<WorkflowBuilder />} />
            <Route path="/workflows/:id/edit" element={<WorkflowBuilder />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/workflow/new"
              element={
                <PrivateRoute>
                  <WorkflowEditor />
                </PrivateRoute>
              }
            />
            <Route
              path="/workflow/:id"
              element={
                <PrivateRoute>
                  <WorkflowEditor />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 