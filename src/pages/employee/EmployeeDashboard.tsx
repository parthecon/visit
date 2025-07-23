import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, CheckCircle, LogOut, Calendar as CalendarIcon, AlertTriangle, UserCheck, Download, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import HostDropdown from '@/components/visitor/HostDropdown';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Visitor {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  purpose?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: string;
  aadhar?: string;
  gender?: string;
  isPreRegistered?: boolean;
  date?: string;
  timeSlot?: string;
}

const EmployeeDashboard: React.FC = () => {
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showReject, setShowReject] = useState<{ id: string, name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Pre-registration form state
  const [preRegOpen, setPreRegOpen] = useState(false);
  // Add gender and purpose options
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];
  const purposeOptions = [
    { label: 'Interview', value: 'interview' },
    { label: 'Meeting', value: 'meeting' },
    { label: 'Delivery', value: 'delivery' },
    { label: 'Other', value: 'other' },
  ];

  // Add react-hook-form for pre-registration
  const preRegForm = useForm({
    defaultValues: {
      mobile: '',
      name: '',
      aadhar: '',
      gender: '',
      purpose: '',
      date: '', // new field
      timeSlot: '', // new field
    },
  });
  const { handleSubmit: handlePreRegSubmit, reset: resetPreReg, control: preRegControl } = preRegForm;
  const [preRegLoading, setPreRegLoading] = useState(false);
  const [preRegError, setPreRegError] = useState<string | null>(null);
  const [preRegSuccess, setPreRegSuccess] = useState<string | null>(null);

  // Update time slots to 3-hour intervals
  const timeSlots = [
    '09:00-12:00',
    '12:00-15:00',
    '15:00-18:00',
  ];

  const onPreRegister = async (data: any) => {
    setPreRegLoading(true);
    setPreRegError(null);
    setPreRegSuccess(null);
    try {
      const payload = {
        name: data.name,
        phone: data.mobile,
        aadhar: data.aadhar,
        gender: data.gender,
        hostId: user?._id, // host is always the logged-in employee
        purpose: data.purpose,
        date: data.date, // include date
        timeSlot: data.timeSlot, // include time slot
        status: 'approved', // default to approved
        isPreRegistered: true,
        preRegisteredBy: user?._id,
        companyId: user?.company?._id,
      };
      const res = await fetch('/api/v1/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok || result.status !== 'success') {
        setPreRegError(result.message || 'Failed to pre-register visitor');
        return;
      }
      setPreRegSuccess('Visitor pre-registered successfully!');
      setVisitors(vs => [result.data, ...vs]);
      resetPreReg();
      setTimeout(() => setSelectedSidebar('visitors'), 1200);
    } catch (err: any) {
      setPreRegError(err.message || 'Failed to pre-register visitor');
    } finally {
      setPreRegLoading(false);
    }
  };

  useEffect(() => {
    async function fetchVisitors() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/visitor?hostId=${user?._id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch visitors');
        setVisitors(data.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch visitors');
      } finally {
        setLoading(false);
      }
    }
    if (user?._id) fetchVisitors();
  }, [user?._id]);

  // Sort visitors by latest request/check-in time first
  const sortedVisitors = [...visitors].sort((a, b) => {
    const aTime = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
    const bTime = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
    return bTime - aTime;
  });

  // Search filter
  const searchFilter = (v: Visitor) =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.phone?.includes(search) ||
    v.purpose?.toLowerCase().includes(search.toLowerCase());
  const filteredVisitors = sortedVisitors.filter(searchFilter);

  // Approve visitor
  async function handleApprove(visitorId: string) {
    setActionLoading(visitorId + '-approve');
    try {
      const res = await fetch(`/api/v1/visitor/${visitorId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to approve visitor');
      setVisitors(vs => vs.map(v => v._id === visitorId ? { ...v, ...data.data } : v));
      toast({ title: 'Visitor approved' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  }

  // Reject visitor
  async function handleReject(visitorId: string, reason: string) {
    setActionLoading(visitorId + '-reject');
    try {
      const res = await fetch(`/api/v1/visitor/${visitorId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to reject visitor');
      setVisitors(vs => vs.map(v => v._id === visitorId ? { ...v, ...data.data } : v));
      toast({ title: 'Visitor rejected' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
      setShowReject(null);
      setRejectReason('');
    }
  }

  // Real notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState<string | null>(null);

  // Fetch notifications (manual and polling)
  async function fetchNotifications(showLoading = true) {
    if (showLoading) setNotifLoading(true);
    setNotifError(null);
    try {
      const res = await fetch('/api/v1/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Failed to fetch notifications');
      setNotifications(data.data || []);
    } catch (err: any) {
      setNotifError(err.message || 'Failed to fetch notifications');
    } finally {
      if (showLoading) setNotifLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(false), 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  function dismissNotification(id: string) {
    setNotifications(n => n.filter(notif => notif._id !== id));
  }

  // Export CSV handler
  function exportVisitorsCSV() {
    if (!visitors.length) return;
    const headers = ['Name', 'Email', 'Phone', 'Purpose', 'Check-In', 'Check-Out', 'Status'];
    const rows = visitors.map(v => [
      v.name,
      v.email || '',
      v.phone || '',
      v.purpose || '',
      v.checkInTime ? new Date(v.checkInTime).toLocaleString() : '',
      v.checkOutTime ? new Date(v.checkOutTime).toLocaleString() : '',
      v.status || ''
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(x => `"${(x || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visitors.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  const navigate = useNavigate();

  const [filter, setFilter] = useState('all');
  const [customDate, setCustomDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [modalFilter, setModalFilter] = useState(filter);
  const [modalCustomDate, setModalCustomDate] = useState(customDate);
  const [selectedSidebar, setSelectedSidebar] = useState<'visitors' | 'settings' | 'pre_register'>('visitors');

  // Stat cards
  const total = visitors.length;
  const pendingCount = visitors.filter(v => v.status === 'pending').length;
  const approvedCount = visitors.filter(v => v.status === 'approved').length;
  const rejectedCount = visitors.filter(v => v.status === 'rejected').length;
  const preRegisteredCount = visitors.filter(v => v.isPreRegistered && v.status === 'approved').length;

  const statTiles = [
    { label: 'Total Visitors', value: total, icon: <User className="w-6 h-6" />, color: 'bg-blue-100 text-blue-600', tooltip: 'Total number of visitors.' },
    { label: 'Pending', value: pendingCount, icon: <AlertTriangle className="w-6 h-6" />, color: 'bg-yellow-100 text-yellow-600', tooltip: 'Visitors pending your approval.' },
    { label: 'Approved', value: approvedCount, icon: <CheckCircle className="w-6 h-6" />, color: 'bg-green-100 text-green-600', tooltip: 'Visitors you have approved.' },
    { label: 'Rejected', value: rejectedCount, icon: <XCircle className="w-6 h-6" />, color: 'bg-red-100 text-red-600', tooltip: 'Visitors you have rejected.' },
    { label: 'Pre-Registered', value: preRegisteredCount, icon: <CalendarIcon className="w-6 h-6" />, color: 'bg-purple-100 text-purple-600', tooltip: 'Visitors you have pre-registered.' },
  ];

  // Filtering logic (must be here before any use of filteredVisitors)
  const now = new Date();
  const filteredVisitorsByFilter = filteredVisitors.filter((v: any) => {
    // Search filter
    const matchesSearch =
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.phone?.includes(search) ||
      v.purpose?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    let dateField = v.checkInTime || v.createdAt;
    if (!dateField) return false;
    const date = new Date(dateField);
    if (filter === 'today') {
      return date.toDateString() === now.toDateString();
    }
    if (filter === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo && date <= now;
    }
    if (filter === 'monthly') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return date >= monthAgo && date <= now;
    }
    if (filter === 'custom' && customDate) {
      const selected = new Date(customDate);
      return (
        date.getFullYear() === selected.getFullYear() &&
        date.getMonth() === selected.getMonth() &&
        date.getDate() === selected.getDate()
      );
    }
    return true;
  });

  // Modal filtering logic
  const modalFilteredVisitors = visitors.filter((v: any) => {
    const matchesSearch =
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.phone?.includes(search) ||
      v.purpose?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (modalFilter === 'all') return true;
    let dateField = v.checkInTime || v.createdAt;
    if (!dateField) return false;
    const date = new Date(dateField);
    if (modalFilter === 'today') {
      return date.toDateString() === now.toDateString();
    }
    if (modalFilter === 'weekly') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo && date <= now;
    }
    if (modalFilter === 'monthly') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return date >= monthAgo && date <= now;
    }
    if (modalFilter === 'custom' && modalCustomDate) {
      const selected = new Date(modalCustomDate);
      return (
        date.getFullYear() === selected.getFullYear() &&
        date.getMonth() === selected.getMonth() &&
        date.getDate() === selected.getDate()
      );
    }
    return true;
  });

  const [selectedTile, setSelectedTile] = useState(statTiles[0].label);

  const rightPanelTile = statTiles.find(tile => tile.label === selectedTile) || statTiles[0];
  let rightPanelList: any[] = [];
  if (rightPanelTile.label === 'Total Visitors') rightPanelList = filteredVisitorsByFilter;
  if (rightPanelTile.label === 'Pending') rightPanelList = filteredVisitorsByFilter.filter(v => v.status === 'pending');
  if (rightPanelTile.label === 'Approved') rightPanelList = filteredVisitorsByFilter.filter(v => v.status === 'approved');
  if (rightPanelTile.label === 'Rejected') rightPanelList = filteredVisitorsByFilter.filter(v => v.status === 'rejected');
  if (rightPanelTile.label === 'Pre-Registered') rightPanelList = filteredVisitorsByFilter.filter(v => v.status === 'scheduled' || v.status === 'pre_registered');

  const rightPanelContent = (
    <div className="flex flex-col h-full p-2 sm:p-4">
      <div className="text-base sm:text-lg font-semibold mb-2">{rightPanelTile.label} Details</div>
      <div className="text-xs sm:text-sm text-gray-500 mb-4">{rightPanelTile.tooltip}</div>
      <div className="flex-1 overflow-auto">
        {rightPanelTile.label === 'Pre-Registered' ? (
          visitors.filter(v => v.isPreRegistered && v.status === 'approved').length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No pre-registered visitors yet.</div>
          ) : (
            <ul className="space-y-4">
              {visitors.filter(v => v.isPreRegistered && v.status === 'approved')
                .sort((a, b) => {
                  const aDate = a.date ? new Date(a.date).getTime() : 0;
                  const bDate = b.date ? new Date(b.date).getTime() : 0;
                  return bDate - aDate;
                })
                .slice(0, 4)
                .map(v => (
                  <li key={v._id} className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="font-semibold text-gray-900 text-base mb-1 truncate">{v.name || '-'}</span>
                    <span className="text-xs text-gray-700 mb-0.5">Time Slot: <span className="font-medium">{v.timeSlot || '-'}</span></span>
                    <span className="text-xs text-gray-700 mb-0.5">Date: <span className="font-medium">{v.date || '-'}</span></span>
                    <span className="text-xs text-gray-700">Purpose: <span className="font-medium">{v.purpose || '-'}</span></span>
                  </li>
                ))}
            </ul>
          )
        ) : rightPanelList.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No data available.</div>
        ) : (
          <ul className="space-y-2">
            {rightPanelList.slice(0, 4).map((v: any) => (
              <li key={v._id} className="flex flex-col border-b last:border-b-0 pb-2">
                <span className="font-medium text-gray-900 truncate">{v.name}</span>
                <span className="text-xs text-gray-500 truncate">{v.purpose || '-'}</span>
                <span className="text-xs text-gray-400">{v.status}</span>
                {rightPanelTile.label === 'Pending' && (
                  <div className="flex gap-2 mt-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="rounded-full bg-green-100 text-green-700 hover:bg-green-200 p-2"
                            onClick={() => handleApprove(v._id)}
                            disabled={actionLoading === v._id + '-approve'}
                            aria-label="Approve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Approve</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="rounded-full bg-red-100 text-red-700 hover:bg-red-200 p-2"
                            onClick={() => setShowReject({ id: v._id, name: v.name })}
                            aria-label="Reject"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Reject</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout
      user={user}
      onLogout={logout}
      title="Employee Dashboard"
      rightPanel={selectedSidebar === 'visitors' ? rightPanelContent : undefined}
      selectedSidebar={selectedSidebar}
      onSidebarSelect={setSelectedSidebar}
    >
      {selectedSidebar === 'settings' ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-8 py-10 w-full max-w-md flex flex-col items-center">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-blue-100 text-blue-600 rounded-full p-4 mb-3">
                <User className="w-12 h-12" />
              </div>
              <div className="text-2xl font-bold mb-1 text-center">{user?.name || '-'}</div>
              <div className="text-sm text-gray-400 mb-2 text-center">Employee Profile</div>
            </div>
            <div className="w-full flex flex-col gap-6">
              <div>
                <div className="uppercase text-xs tracking-wider text-gray-400 font-semibold">Email</div>
                <div className="mt-1 text-lg font-bold text-gray-900 bg-gray-50 rounded-lg px-4 py-2 border border-gray-100">{user?.email || '-'}</div>
              </div>
              <div>
                <div className="uppercase text-xs tracking-wider text-gray-400 font-semibold">Phone</div>
                <div className="mt-1 text-lg font-bold text-gray-900 bg-gray-50 rounded-lg px-4 py-2 border border-gray-100">{user?.phone || '-'}</div>
              </div>
              <div>
                <div className="uppercase text-xs tracking-wider text-gray-400 font-semibold">Role</div>
                <div className="mt-1 text-lg font-bold text-gray-900 bg-gray-50 rounded-lg px-4 py-2 border border-gray-100">{user?.role || '-'}</div>
              </div>
            </div>
            <div className="w-full border-t border-gray-100 mt-10 pt-4 text-xs text-gray-400 text-center">Contact admin to update your details.</div>
          </div>
        </div>
      ) : selectedSidebar === 'pre_register' ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-0">
          <div className="w-full max-w-3xl p-2 sm:p-4 md:p-10 bg-white/90 rounded-3xl border border-gray-100 shadow-2xl flex flex-col justify-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-4 sm:mb-6 md:mb-8 text-center text-purple-700 tracking-tight">Pre-Register Visitor</div>
            <FormProvider {...preRegForm}>
              <form onSubmit={handlePreRegSubmit(onPreRegister)} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6" aria-describedby="preRegDesc">
                <span id="preRegDesc" className="sr-only">Fill out the form to pre-register a visitor. All fields are required.</span>
                <div className="flex flex-col gap-2">
                  <FormField name="mobile" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-semibold text-gray-700">Mobile No.</FormLabel>
                      <Input placeholder="Enter mobile number" {...field} className="text-sm md:text-base py-2 md:py-3 h-10 md:h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-purple-200 w-full" />
                    </FormItem>
                  )} />
                  <FormField name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-semibold text-gray-700">Name</FormLabel>
                      <Input placeholder="Enter name" {...field} className="text-sm md:text-base py-2 md:py-3 h-10 md:h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-purple-200 w-full" />
                    </FormItem>
                  )} />
                  <FormField name="aadhar" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-semibold text-gray-700">Aadhar No.</FormLabel>
                      <Input placeholder="Enter Aadhar number" {...field} className="text-sm md:text-base py-2 md:py-3 h-10 md:h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-purple-200 w-full" />
                    </FormItem>
                  )} />
                  <FormField name="gender" control={preRegControl} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-semibold text-gray-700">Gender</FormLabel>
                      <div className="flex gap-3 md:gap-8 mt-1">
                        {genderOptions.map((option) => (
                          <label key={option.value} className="flex items-center gap-2 cursor-pointer text-sm md:text-base">
                            <input
                              type="radio"
                              value={option.value}
                              checked={field.value === option.value}
                              onChange={() => field.onChange(option.value)}
                              className="accent-purple-600 w-4 h-4 md:w-5 md:h-5"
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </FormItem>
                  )} />
                </div>
                <div className="flex flex-col gap-2">
                  {/* Host display, fixed for employee */}
                  <div>
                    <FormLabel className="text-sm md:text-base font-semibold text-gray-700">Host</FormLabel>
                    <div className="text-sm md:text-base font-bold text-gray-800 bg-gray-50 rounded-lg px-3 md:px-4 py-2 md:py-3 border border-gray-100 w-full">{user?.name || '-'}</div>
                  </div>
                  <FormField name="purpose" control={preRegControl} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-semibold text-gray-700">Purpose of Visit</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} defaultValue="">
                        <SelectTrigger className="text-sm md:text-base py-2 md:py-3 h-10 md:h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-purple-200 w-full">
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          {purposeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-sm md:text-base">{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-semibold text-gray-700">Date</FormLabel>
                      <Input type="date" {...field} className="text-sm md:text-base py-2 md:py-3 h-10 md:h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-purple-200 w-full" min={new Date().toISOString().split('T')[0]} />
                    </FormItem>
                  )} />
                  <FormField name="timeSlot" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm md:text-base font-semibold text-gray-700">Time Slot</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} defaultValue="">
                        <SelectTrigger className="text-sm md:text-base py-2 md:py-3 h-10 md:h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-purple-200 w-full">
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot} className="text-sm md:text-base">{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
                <div className="md:col-span-2">
                  {preRegError && <div className="text-red-600 text-sm md:text-base mt-2 text-center">{preRegError}</div>}
                  {preRegSuccess && <div className="text-green-700 text-sm md:text-base mt-2 text-center">{preRegSuccess}</div>}
                  <div className="flex gap-2 justify-end mt-4 md:mt-6">
                    <Button type="submit" disabled={preRegLoading} className="h-10 md:h-12 px-6 md:px-8 text-sm md:text-base bg-purple-600 text-white hover:bg-purple-700 w-full md:w-auto">{preRegLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pre-Register'}</Button>
                  </div>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <TooltipProvider>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-4 sm:mb-8 mt-2 w-full">
              {statTiles.map(tile => (
                <Tooltip key={tile.label}>
                  <TooltipTrigger asChild>
                    <button
                      className={`flex flex-col items-center justify-center gap-2 p-4 sm:p-5 w-full h-28 sm:h-32 bg-white rounded-2xl shadow-sm border border-gray-100 transition ring-2 ring-transparent hover:ring-blue-200 focus:ring-blue-400 ${selectedTile === tile.label ? 'ring-blue-500' : ''}`}
                      onClick={() => setSelectedTile(tile.label)}
                      type="button"
                    >
                      <div className={`${tile.color} rounded-full p-2 sm:p-3 flex items-center justify-center`}>{tile.icon}</div>
                      <div className="text-xs sm:text-sm text-gray-500 text-center truncate w-full max-w-[120px]">{tile.label}</div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900 text-center">{tile.value}</div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{tile.tooltip}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
          {/* Filter Tabs and Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div className="flex gap-2 items-center">
              {['All', 'Today', 'Weekly', 'Monthly'].map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filter === tab.toLowerCase() ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
                  onClick={() => { setFilter(tab.toLowerCase()); setShowDatePicker(false); }}
                >
                  {tab}
                </button>
              ))}
              <Button variant={filter === 'custom' ? 'default' : 'outline'} size="icon" className="ml-2" onClick={() => setShowDatePicker(v => !v)}>
                <CalendarIcon className="w-5 h-5" />
              </Button>
              {showDatePicker && (
                <input
                  type="date"
                  className="ml-2 px-2 py-1 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={customDate}
                  onChange={e => { setCustomDate(e.target.value); setFilter('custom'); }}
                  max={now.toISOString().slice(0, 10)}
                />
              )}
            </div>
            <Input
              placeholder="Search by name, phone, or purpose..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
          {/* My Visitors Table */}
          <Card className="shadow-xl rounded-2xl border-0 bg-white/90 w-full">
            <CardHeader className="pb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base sm:text-lg md:text-xl font-semibold tracking-tight">My Visitors</CardTitle>
              <Button variant="outline" className="gap-2 w-full sm:w-auto" size="sm" onClick={exportVisitorsCSV} disabled={!filteredVisitorsByFilter.length}>
                <Download className="w-4 h-4" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin w-5 h-5" /> Loading visitors...</div>
              ) : error ? (
                <div className="text-red-600">{error}</div>
              ) : filteredVisitorsByFilter.filter(v => v.status !== 'pending').length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-gray-400">
                  <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 mb-2" />
                  <div className="font-medium text-sm sm:text-base">No visitors found.</div>
                  <div className="text-xs sm:text-sm mt-1">All your visitors will appear here.</div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
                    <table className="min-w-[600px] w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-700">
                          <th className="px-2 sm:px-4 py-2 text-left font-semibold">Name</th>
                          <th className="px-2 sm:px-4 py-2 text-left font-semibold">Aadhar</th>
                          <th className="px-2 sm:px-4 py-2 text-left font-semibold">Gender</th>
                          <th className="px-2 sm:px-4 py-2 text-left font-semibold">Purpose</th>
                          <th className="px-2 sm:px-4 py-2 text-left font-semibold">Check-In</th>
                          <th className="px-2 sm:px-4 py-2 text-left font-semibold">Check-Out</th>
                          <th className="px-2 sm:px-4 py-2 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVisitorsByFilter.filter(v => v.status !== 'pending').slice(0, 2).map((v, i) => (
                          <tr key={v._id} className={
                            `border-b transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/40`}
                          >
                            <td className="px-2 sm:px-4 py-2 font-medium text-gray-900">{v.name}</td>
                            <td className="px-2 sm:px-4 py-2">{v.aadhar || '-'}</td>
                            <td className="px-2 sm:px-4 py-2">{v.gender || '-'}</td>
                            <td className="px-2 sm:px-4 py-2">{v.purpose || '-'}</td>
                            <td className="px-2 sm:px-4 py-2">{v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString() : '-'}</td>
                            <td className="px-2 sm:px-4 py-2">{v.checkOutTime ? new Date(v.checkOutTime).toLocaleTimeString() : '-'}</td>
                            <td className="px-2 sm:px-4 py-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold
                                ${v.status === 'checked_in' ? 'bg-blue-100 text-blue-700' :
                                  v.status === 'checked_out' ? 'bg-green-100 text-green-700' :
                                  v.status === 'approved' ? 'bg-yellow-100 text-yellow-700' :
                                  v.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-600'}`}
                              >
                                {v.status === 'checked_in' && <CheckCircle className="w-3 h-3 mr-1 text-blue-500" />}
                                {v.status === 'checked_out' && <LogOut className="w-3 h-3 mr-1 text-green-500" />}
                                {v.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1 text-yellow-500" />}
                                {v.status === 'rejected' && <XCircle className="w-3 h-3 mr-1 text-red-500" />}
                                {v.status || '-'}
                              </span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="default" onClick={() => navigate(`/gate-pass/${v._id}`, { state: v })} className="w-full sm:w-auto mt-2">View Gate Pass</Button>
                                </TooltipTrigger>
                                <TooltipContent>View Gate Pass</TooltipContent>
                              </Tooltip>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end mt-4 gap-2 w-full">
                    <Button variant="outline" onClick={() => setShowAllModal(true)} className="w-full sm:w-auto">
                      Expand
                    </Button>
                    <Button
                      className="bg-purple-600 text-white hover:bg-purple-700 w-full sm:w-auto"
                      onClick={() => setSelectedSidebar('pre_register')}
                    >
                      Pre-Register Visitor
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          {/* Reject Reason Dialog */}
          <Dialog open={!!showReject} onOpenChange={v => { if (!v) setShowReject(null); }}>
            <DialogContent className="max-w-md w-full rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Reject Visitor</DialogTitle>
              </DialogHeader>
              <div className="mb-4">Are you sure you want to reject <span className="font-semibold">{showReject?.name}</span>?</div>
              <Input
                placeholder="Optional comment (reason)"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="mb-4"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowReject(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => showReject && handleReject(showReject.id, rejectReason)} disabled={actionLoading === (showReject?.id + '-reject')}>
                  {actionLoading === (showReject?.id + '-reject') ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Reject
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Pre-Registration Dialog (now only accessible from header) */}
          <Dialog open={preRegOpen} onOpenChange={setPreRegOpen}>
            <DialogContent className="max-w-md w-full rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">Pre-Register Visitor</DialogTitle>
              </DialogHeader>
              <FormProvider {...preRegForm}>
                <form onSubmit={handlePreRegSubmit(onPreRegister)} className="space-y-3" aria-describedby="preRegDesc">
                  <span id="preRegDesc" className="sr-only">Fill out the form to pre-register a visitor. All fields are required.</span>
                  <FormField name="mobile" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs md:text-sm lg:text-xs">Mobile No.</FormLabel>
                      <Input placeholder="Enter mobile number" {...field} className="text-xs md:text-sm py-2 h-9" />
                    </FormItem>
                  )} />
                  <FormField name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs md:text-sm lg:text-xs">Name</FormLabel>
                      <Input placeholder="Enter name" {...field} className="text-xs md:text-sm py-2 h-9" />
                    </FormItem>
                  )} />
                  <FormField name="aadhar" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs md:text-sm lg:text-xs">Aadhar No.</FormLabel>
                      <Input placeholder="Enter Aadhar number" {...field} className="text-xs md:text-sm py-2 h-9" />
                    </FormItem>
                  )} />
                  <FormField name="gender" control={preRegControl} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs md:text-sm lg:text-xs">Gender</FormLabel>
                      <div className="flex gap-4 mt-1">
                        {genderOptions.map((option) => (
                          <label key={option.value} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              value={option.value}
                              checked={field.value === option.value}
                              onChange={() => field.onChange(option.value)}
                              className="accent-primary w-4 h-4"
                            />
                            <span className="text-xs md:text-sm lg:text-xs">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </FormItem>
                  )} />
                  {/* Remove HostDropdown, show host as fixed */}
                  <div>
                    <FormLabel className="text-xs md:text-sm lg:text-xs">Host</FormLabel>
                    <div className="text-sm font-semibold text-gray-700 bg-gray-50 rounded px-3 py-2 border border-gray-100">{user?.name || '-'}</div>
                  </div>
                  <FormField name="purpose" control={preRegControl} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs md:text-sm lg:text-xs">Purpose of Visit</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} defaultValue="">
                        <SelectTrigger className="text-xs md:text-sm py-2 h-9">
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          {purposeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-xs md:text-sm">{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  {/* Add date field */}
                  <FormField name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs md:text-sm lg:text-xs">Date</FormLabel>
                      <Input type="date" {...field} className="text-xs md:text-sm py-2 h-9" min={new Date().toISOString().split('T')[0]} />
                    </FormItem>
                  )} />
                  {/* Add time slot field */}
                  <FormField name="timeSlot" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs md:text-sm lg:text-xs">Time Slot</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} defaultValue="">
                        <SelectTrigger className="text-xs md:text-sm py-2 h-9">
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot} className="text-xs md:text-sm">{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  {preRegError && <div className="text-red-600 text-sm mt-1">{preRegError}</div>}
                  {preRegSuccess && <div className="text-green-700 text-sm mt-1">{preRegSuccess}</div>}
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setPreRegOpen(false)} disabled={preRegLoading}>Cancel</Button>
                    <Button type="submit" disabled={preRegLoading}>{preRegLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pre-Register'}</Button>
                  </DialogFooter>
                </form>
              </FormProvider>
            </DialogContent>
          </Dialog>
          <Dialog open={showAllModal} onOpenChange={setShowAllModal}>
            <DialogContent className="max-w-3xl w-full rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">All Visitors</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <div className="flex gap-2 items-center">
                  {['All', 'Today', 'Weekly', 'Monthly'].map(tab => (
                    <button
                      key={tab}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${modalFilter === tab.toLowerCase() ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
                      onClick={() => { setModalFilter(tab.toLowerCase()); setModalCustomDate(''); }}
                    >
                      {tab}
                    </button>
                  ))}
                  <Button variant={modalFilter === 'custom' ? 'default' : 'outline'} size="icon" className="ml-2" onClick={() => setModalFilter('custom')}>
                    <CalendarIcon className="w-5 h-5" />
                  </Button>
                  {modalFilter === 'custom' && (
                    <input
                      type="date"
                      className="ml-2 px-2 py-1 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={modalCustomDate}
                      onChange={e => setModalCustomDate(e.target.value)}
                      max={now.toISOString().slice(0, 10)}
                    />
                  )}
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white max-h-[60vh]">
                <table className="min-w-[600px] w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700">
                      <th className="px-2 sm:px-4 py-2 text-left font-semibold">Name</th>
                      <th className="px-2 sm:px-4 py-2 text-left font-semibold">Aadhar</th>
                      <th className="px-2 sm:px-4 py-2 text-left font-semibold">Gender</th>
                      <th className="px-2 sm:px-4 py-2 text-left font-semibold">Purpose</th>
                      <th className="px-2 sm:px-4 py-2 text-left font-semibold">Check-In</th>
                      <th className="px-2 sm:px-4 py-2 text-left font-semibold">Check-Out</th>
                      <th className="px-2 sm:px-4 py-2 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalFilteredVisitors
                      .filter(v => v.status !== 'pending')
                      .sort((a, b) => {
                        const aTime = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
                        const bTime = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
                        return bTime - aTime;
                      })
                      .map((v, i) => (
                        <tr key={v._id} className={
                          `border-b transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/40`}
                        >
                          <td className="px-2 sm:px-4 py-2 font-medium text-gray-900">{v.name}</td>
                          <td className="px-2 sm:px-4 py-2">{v.aadhar || '-'}</td>
                          <td className="px-2 sm:px-4 py-2">{v.gender || '-'}</td>
                          <td className="px-2 sm:px-4 py-2">{v.purpose || '-'}</td>
                          <td className="px-2 sm:px-4 py-2">{v.checkInTime ? new Date(v.checkInTime).toLocaleTimeString() : '-'}</td>
                          <td className="px-2 sm:px-4 py-2">{v.checkOutTime ? new Date(v.checkOutTime).toLocaleTimeString() : '-'}</td>
                          <td className="px-2 sm:px-4 py-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold
                              ${v.status === 'checked_in' ? 'bg-blue-100 text-blue-700' :
                                v.status === 'checked_out' ? 'bg-green-100 text-green-700' :
                                v.status === 'approved' ? 'bg-yellow-100 text-yellow-700' :
                                v.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-600'}`}
                            >
                              {v.status === 'checked_in' && <CheckCircle className="w-3 h-3 mr-1 text-blue-500" />}
                              {v.status === 'checked_out' && <LogOut className="w-3 h-3 mr-1 text-green-500" />}
                              {v.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1 text-yellow-500" />}
                              {v.status === 'rejected' && <XCircle className="w-3 h-3 mr-1 text-red-500" />}
                              {v.status || '-'}
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="sm" variant="default" onClick={() => navigate(`/gate-pass/${v._id}`, { state: v })} className="w-full sm:w-auto mt-2">View Gate Pass</Button>
                              </TooltipTrigger>
                              <TooltipContent>View Gate Pass</TooltipContent>
                            </Tooltip>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAllModal(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </DashboardLayout>
  );
};

export default EmployeeDashboard; 