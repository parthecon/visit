import React, { useEffect, useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  BarChart3,
  CreditCard,
  Bell,
  User,
  LogOut,
  ShieldCheck,
  Menu as MenuIcon,
  X as CloseIcon
} from 'lucide-react';
import UserProfileTray from './UserProfileTray';
import NotificationPopover from './NotificationPopover';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Building2, label: 'Company Settings', href: '/admin/company-settings' },
  { icon: Users, label: 'Employee Management', href: '/admin/employees' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: CreditCard, label: 'Billing', href: '/admin/billing' },
];

export const AdminLayout = () => {
  const location = useLocation();
  const [user, setUser] = useState<{ name?: string; email?: string; phone?: string; role?: string; _id?: string; company?: any }>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.status === 'success' && data.data?.user) {
          setUser(data.data.user);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchUser();
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Overlay and Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />
      <div
        className={`fixed z-50 top-0 left-0 h-screen w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="icon-container">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">Visitify</span>
          </Link>
          {/* Close button */}
          <button
            className="p-2 rounded hover:bg-muted ml-2"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        {/* User Menu */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user.name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      {/* Main Content */}
      <div>
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-30" style={{height: '4rem'}}>
          {/* Hamburger always visible */}
          <button
            className="p-2 rounded hover:bg-muted mr-2"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationPopover />
            {/* User Profile Tray */}
            <UserProfileTray
              user={{
                name: user.name,
                email: user.email,
                role: user.role,
                // photoUrl: user.photoUrl, // if available
              }}
              onLogout={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
            />
          </div>
        </header>
        <main className="pt-16 min-h-screen overflow-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};