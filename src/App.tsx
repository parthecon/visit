import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingLayout } from "@/components/layout/LandingLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import KioskIndex from "./pages/KioskIndex";
import KioskCheckIn from "./pages/KioskCheckIn";
import KioskCheckOut from "./pages/KioskCheckOut";
import Profile from './pages/admin/Profile';
import Settings from './pages/admin/Settings';
import Billing from './pages/admin/Billing';
import Visitors from "./pages/admin/Visitors";
import CompanySettings from './pages/admin/CompanySettings';
import Employees from './pages/admin/Employees';
import Analytics from './pages/admin/Analytics';
import Receptionists from './pages/admin/Receptionists';
import ReceptionistDashboard from './pages/admin/ReceptionistDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import React from "react";
import VisitorRegistration from "./pages/KioskCheckIn";
import GatePass from "./pages/GatePass";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Landing Page */}
          <Route path="/" element={
            <LandingLayout>
              <Landing />
            </LandingLayout>
          } />
          {/* Contact Page */}
          <Route path="/contact" element={<Contact />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="company-settings" element={<CompanySettings />} />
            <Route path="company" element={<div className="p-6">Company Settings (Coming Soon)</div>} />
            <Route path="employees" element={<Employees />} />
            <Route path="receptionists" element={<Receptionists />} />
            <Route path="workflow" element={<div className="p-6">Workflow Config (Coming Soon)</div>} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="billing" element={<Billing />} />
            <Route path="visitors" element={<Visitors />} />
          </Route>
          
          {/* Receptionist Dashboard Route */}
          <Route path="/receptionist/dashboard" element={
            <ProtectedRoute role="receptionist">
              <ReceptionistDashboard />
            </ProtectedRoute>
          } />
          
          {/* Employee Dashboard Route */}
          <Route path="/employee/dashboard" element={
            <ProtectedRoute role="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          
          {/* Kiosk Routes */}
          <Route path="/kiosk" element={<KioskIndex />} />
          <Route path="/kiosk/checkin" element={<KioskCheckIn />} />
          <Route path="/kiosk/checkout" element={<KioskCheckOut />} />
          
          {/* Visitor Registration & Gate Pass */}
          <Route path="/register-visitor" element={<KioskCheckIn />} />
          <Route path="/kiosk/checkin" element={<KioskCheckIn />} />
          <Route path="/gate-pass/:id" element={<GatePass />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
