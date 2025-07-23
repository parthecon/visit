import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Clock, AlertTriangle, TrendingUp, Calendar, BarChart3, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, isSameDay } from 'date-fns';

interface Visitor {
  _id: string;
  name: string;
  hostId?: { _id: string; name: string } | string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: string;
  purpose?: string;
  email?: string;
  phone?: string;
  createdAt?: string; // Added createdAt for wait time calculation
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    company?: { name?: string; email?: string; phone?: string; address?: string };
  }>({});
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch user info
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
      } catch (err) {}
    };
    fetchUser();
  }, []);

  // Helper to fetch visitors
  const fetchVisitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/visitor');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch visitors');
      setVisitors(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch visitors');
    } finally {
      setLoading(false);
    }
  };

  // Fetch visitors with polling
  useEffect(() => {
    fetchVisitors();
    const interval = setInterval(fetchVisitors, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Sort visitors by latest check-in/request time first
  const sortedVisitors = [...visitors].sort((a, b) => {
    const aTime = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
    const bTime = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
    return bTime - aTime;
  });

  // Stats
  const today = new Date().toISOString().slice(0, 10);
  const todaysVisitors = sortedVisitors.filter(v => v.checkInTime && v.checkInTime.startsWith(today));
  const checkedIn = todaysVisitors.filter(v => v.status === 'checked_in');
  // PATCH: Show all pending, not just today's
  const pending = sortedVisitors.filter(v => v.status === 'pending' || v.status === 'scheduled');

  // Debug logs
  console.log('All visitors:', visitors);
  console.log('Pending (all):', pending);

  // Pending requests for this admin as host (robust matching)
  const myPending = sortedVisitors.filter(v => {
    if (v.status !== 'pending') return false;
    if (!user._id) return false;
    // hostId may be an object or string
    if (typeof v.hostId === 'object' && v.hostId !== null && v.hostId._id) {
      return v.hostId._id === user._id;
    }
    return v.hostId === user._id;
  });
  console.log('My pending:', myPending);

  // Calculate average wait time for today's checked-in visitors
  const checkedInToday = todaysVisitors.filter(v => v.status === 'checked_in' && v.checkInTime && v.createdAt);
  let avgWait = '-';
  if (checkedInToday.length > 0) {
    const totalWaitMs = checkedInToday.reduce((sum, v) => {
      const created = new Date(v.createdAt).getTime();
      const checkedIn = new Date(v.checkInTime).getTime();
      return sum + Math.max(checkedIn - created, 0);
    }, 0);
    const avgMs = totalWaitMs / checkedInToday.length;
    avgWait = (avgMs / 60000).toFixed(1) + ' min';
  }

  // Approve/Deny handlers with live refresh and logging
  const handleApprove = async (id: string) => {
    setActionLoading(id + '-approve');
    try {
      const res = await fetch(`/api/v1/visitor/${id}/approve`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to approve');
      console.log('Approved visitor', id);
      await fetchVisitors();
    } catch (err) {
      alert('Failed to approve visitor');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };
  const handleReject = async (id: string) => {
    setActionLoading(id + '-reject');
    try {
      const res = await fetch(`/api/v1/visitor/${id}/reject`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to reject');
      console.log('Rejected visitor', id);
      await fetchVisitors();
    } catch (err) {
      alert('Failed to reject visitor');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to get status badge
  function StatusBadge({ status }: { status?: string }) {
    let color = 'bg-yellow-200 text-yellow-800';
    let label = status;
    if (status === 'checked_in') {
      color = 'bg-green-200 text-green-800';
      label = 'Checked In';
    } else if (status === 'rejected') {
      color = 'bg-red-200 text-red-800';
      label = 'Rejected';
    } else if (status === 'pending') {
      color = 'bg-yellow-200 text-yellow-800';
      label = 'Pending';
    }
    return <span className={`text-xs px-2 py-1 rounded-full font-semibold ${color}`}>{label}</span>;
  }

  // Calculate weekly trends (last 7 days, Mon-Sun labels)
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDate = new Date();
  // Get the last 7 days, oldest first
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(todayDate, 6 - i));
  const weeklyCounts = last7Days.map(day => {
    const count = visitors.filter(v => v.checkInTime && isSameDay(new Date(v.checkInTime), day)).length;
    return {
      day: weekDays[day.getDay() === 0 ? 6 : day.getDay() - 1], // JS: 0=Sun, 1=Mon, ...
      count,
    };
  });
  const maxCount = Math.max(...weeklyCounts.map(d => d.count), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name || 'Admin'}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your visitors today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : todaysVisitors.length}</div>
            <p className="text-xs text-muted-foreground">
              {/* Placeholder for trend */}
              &nbsp;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : checkedIn.length}</div>
            <p className="text-xs text-muted-foreground">
              {/* Placeholder for on premises */}
              &nbsp;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgWait}</div>
            <p className="text-xs text-muted-foreground">
              {/* Placeholder for wait time */}
              &nbsp;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : pending.length}</div>
            <p className="text-xs text-muted-foreground">&nbsp;</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Section */}
      {myPending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Visitors requesting you as host. Approve or reject below.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myPending.map((visitor) => (
                <div key={visitor._id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200 gap-2">
                  <div>
                    <div className="font-medium">{visitor.name}</div>
                    <div className="text-sm text-muted-foreground">Purpose: {visitor.purpose}</div>
                    <div className="text-sm text-muted-foreground">Email: {visitor.email} | Phone: {visitor.phone}</div>
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <Button size="sm" variant="default" disabled={actionLoading === visitor._id + '-approve'} onClick={() => handleApprove(visitor._id)}>
                      {actionLoading === visitor._id + '-approve' ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button size="sm" variant="destructive" disabled={actionLoading === visitor._id + '-reject'} onClick={() => handleReject(visitor._id)}>
                      {actionLoading === visitor._id + '-reject' ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Visitors & Rejected Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Visitors */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Visitors</CardTitle>
            <CardDescription>Latest check-ins today (including rejected)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading visitors...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <div className="space-y-4">
                {todaysVisitors.map((visitor, index) => (
                  <div key={visitor._id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {visitor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{visitor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Visiting {typeof visitor.hostId === 'object' && visitor.hostId !== null
                            ? (visitor.hostId.name || '—')
                            : (typeof visitor.hostId === 'string' ? visitor.hostId : '—')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                      <StatusBadge status={visitor.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button className="btn-hero w-full mt-4" onClick={() => navigate('/admin/visitors')}>
              View All Visitors
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Trends (dynamic) */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Trends</CardTitle>
            <CardDescription>Visitor activity over the past 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple bar chart visualization */}
              <div className="grid grid-cols-7 gap-2 h-40">
                {weeklyCounts.map((data, index) => (
                  <div key={index} className="flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full bg-primary/20 rounded-t"
                      style={{ height: `${(data.count / maxCount) * 100}%` }}
                    ></div>
                    <span className="text-xs text-muted-foreground mt-2">{data.day}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  {/* Placeholder for trend vs last week, can be improved */}
                  <span className="text-sm text-success">Weekly trend</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.location.href = 'http://localhost:8080/admin/analytics'}>
                  <Calendar className="w-4 h-4 mr-2" />
                  View Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-6 flex flex-col space-y-2" variant="outline" onClick={() => navigate('/admin/employees')}>
              <Users className="w-6 h-6" />
              <span>Add Employee</span>
            </Button>
            <Button className="h-auto p-6 flex flex-col space-y-2" variant="outline" onClick={() => navigate('/register-visitor')}>
              <UserCheck className="w-6 h-6" />
              <span>Register Visitor</span>
            </Button>
            <Button className="h-auto p-6 flex flex-col space-y-2" variant="outline" onClick={() => window.location.href = 'http://localhost:8080/admin/analytics'}>
              <BarChart3 className="w-6 h-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;