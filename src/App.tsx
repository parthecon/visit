import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingLayout } from "@/components/layout/LandingLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={
            <LandingLayout>
              <Landing />
            </LandingLayout>
          } />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="company" element={<div className="p-6">Company Settings (Coming Soon)</div>} />
            <Route path="employees" element={<div className="p-6">Employee Management (Coming Soon)</div>} />
            <Route path="workflow" element={<div className="p-6">Workflow Config (Coming Soon)</div>} />
            <Route path="analytics" element={<div className="p-6">Analytics (Coming Soon)</div>} />
            <Route path="billing" element={<div className="p-6">Billing (Coming Soon)</div>} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
