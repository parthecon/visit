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
  ShieldCheck
} from 'lucide-react';
import UserProfileTray from './UserProfileTray';
import NotificationPopover from './NotificationPopover';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Building2, label: 'Company Settings', href: '/admin/company' },
  { icon: Users, label: 'Employee Management', href: '/admin/employees' },
  { icon: Settings, label: 'Workflow Config', href: '/admin/workflow' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: CreditCard, label: 'Billing', href: '/admin/billing' },
];

export const AdminLayout = () => {
  const location = useLocation();
  const [user, setUser] = useState<{ name?: string; email?: string; phone?: string; role?: string; _id?: string; company?: any }>({});
  // Remove profileOpen state

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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center space-x-2">
            <div className="icon-container">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">Visitify</span>
          </Link>
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
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
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
        {/* Profile Drawer */}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};