import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateReferral from './pages/CreateReferral';
import ReferralStatus from './pages/ReferralStatus';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import HospitalProtectedRoute from './components/HospitalProtectedRoute';
import HospitalLayout from './components/HospitalLayout';
import HospitalLogin from './pages/HospitalLogin';
import HospitalSignup from './pages/HospitalSignup';
import HospitalDashboard from './pages/HospitalDashboard';
import Landing from './pages/Landing';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing Route */}
        <Route path="/" element={<Landing />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Hospital Public Routes */}
        <Route path="/hospital/login" element={<HospitalLogin />} />
        <Route path="/hospital/signup" element={<HospitalSignup />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-referral"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateReferral />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/referrals"
          element={
            <ProtectedRoute>
              <Layout>
                <ReferralStatus />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Hospital Protected Routes */}
        <Route
          path="/hospital/dashboard"
          element={
            <HospitalProtectedRoute>
              <HospitalLayout>
                <HospitalDashboard />
              </HospitalLayout>
            </HospitalProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
