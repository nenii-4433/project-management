import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import HRDashboard from './pages/HRDashboard';
import Departments from './pages/hr/Departments';
import Employees from './pages/hr/Employees';
import HRTasks from './pages/hr/Tasks';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeTasks from './pages/employee/Tasks';
import PendingTasks from './pages/employee/PendingTasks';
import TaskDetail from './pages/employee/TaskDetail';
import SubmitReport from './pages/employee/SubmitReport';
import Profile from './pages/employee/Profile';
import Ratings from './pages/hr/Ratings';
import HRReports from './pages/hr/Reports';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Meetings from './pages/Meetings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* HR Protected Routes */}
          <Route
            path="/hr/*"
            element={
              <ProtectedRoute requiredRole="hr">
                <Routes>
                  <Route path="dashboard" element={<HRDashboard />} />
                  <Route path="departments" element={<Departments />} />
                  <Route path="employees" element={<Employees />} />
                  <Route path="tasks" element={<HRTasks />} />
                  <Route path="reports" element={<HRReports />} />
                  <Route path="ratings" element={<Ratings />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="meetings" element={<Meetings />} />
                  {/* Future HR routes will go here */}
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Employee Protected Routes */}
          <Route
            path="/employee/*"
            element={
              <ProtectedRoute requiredRole="employee">
                <Routes>
                  <Route path="dashboard" element={<EmployeeDashboard />} />
                  <Route path="tasks" element={<EmployeeTasks />} />
                  <Route path="pending" element={<PendingTasks />} />
                  <Route path="tasks/:id" element={<TaskDetail />} />
                  <Route path="submit-report" element={<SubmitReport />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="meetings" element={<Meetings />} />
                  {/* Future Employee routes will go here */}
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
