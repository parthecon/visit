import React, { useEffect, useState } from 'react';
import { User, CheckCircle, LogOut, Calendar, AlertTriangle, UserCircle, Settings as SettingsIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ReceptionistSidebar from '@/components/layout/ReceptionistSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// Import necessary hooks and UI components for the form
import { useForm, FormProvider } from 'react-hook-form';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import HostDropdown from '@/components/visitor/HostDropdown';

interface Visitor {
  _id: string;
  name: string;
  hostId?: { _id: string; name: string } | string;
  purpose?: string;
  status?: string;
  phone?: string;
  aadhar?: string;
  gender?: string;
  isPreRegistered?: boolean;
  date?: string;
  timeSlot?: string;
}

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const ReceptionistDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [selectedTile, setSelectedTile] = useState<string>('total');
  const [search, setSearch] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSidebar, setSelectedSidebar] = useState<'visitors' | 'settings' | 'pre_register'>('visitors');
  // Remove preRegOpen and Dialog/modal logic

  // Add state for employees
  const [employees, setEmployees] = useState<{ _id: string; name: string }[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVisitors() {
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
    }
    fetchVisitors();
  }, []);

  // Fetch employees for host dropdown
  useEffect(() => {
    async function fetchEmployees() {
      setEmployeesLoading(true);
      setEmployeesError(null);
      try {
        const res = await fetch('/api/v1/employee');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch employees');
        setEmployees((data.data || []).map((e: any) => ({ _id: e._id, name: e.name })));
      } catch (err: any) {
        setEmployeesError(err.message || 'Failed to fetch employees');
      } finally {
        setEmployeesLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  // Sort visitors by latest check-in/request time first
  const sortedVisitors = [...visitors].sort((a: any, b: any) => {
    const aTime = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
    const bTime = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
    return bTime - aTime;
  });

  // Stat cards
  const total = visitors.length;
  const checkedIn = visitors.filter(v => v.status === 'checked_in').length;
  const checkedOut = visitors.filter(v => v.status === 'checked_out').length;
  const preRegisteredCount = visitors.filter(v => v.isPreRegistered && v.status === 'approved').length;
  const missed = visitors.filter(v => v.status === 'missed').length;

  // Only show top 4 latest visitors in main table
  const top4Visitors = sortedVisitors.slice(0, 4);
  const now = new Date();
  const filteredVisitors = top4Visitors.filter((v: any) => {
    // Search filter
    const matchesSearch =
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      (typeof v.hostId === 'object' && v.hostId?.name?.toLowerCase().includes(search.toLowerCase())) ||
      (typeof v.hostId === 'string' && v.hostId?.toLowerCase().includes(search.toLowerCase())) ||
      v.purpose?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'all') return true; // Show all statuses for 'All'
    // For date-based filters, use checkInTime or createdAt
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

  async function handleCheckout(visitor: Visitor) {
    setCheckoutLoading(visitor._id);
    try {
      const res = await fetch('/api/v1/visitor/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneOrEmail: (visitor as any).email || (visitor as any).phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to check out visitor');
      setVisitors(vs => vs.map(v => v._id === visitor._id ? { ...v, status: 'checked_out' } : v));
    } catch (err) {
      // Optionally show error
      alert('Failed to check out visitor');
    } finally {
      setCheckoutLoading(null);
    }
  }

  function handleViewAllVisitors() {
    navigate('/admin/visitors');
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // Stat card data
  const statTiles = [
    {
      key: 'total',
      label: 'Total Visitors',
      value: total,
      icon: <User className="w-6 h-6" />, 
      color: 'bg-blue-100 text-blue-600',
      tooltip: 'Total number of visitors in the system.',
      list: visitors,
    },
    {
      key: 'checked_in',
      label: 'Checked In',
      value: checkedIn,
      icon: <CheckCircle className="w-6 h-6" />, 
      color: 'bg-green-100 text-green-600',
      tooltip: 'Visitors currently checked in.',
      list: visitors.filter(v => v.status === 'checked_in'),
    },
    {
      key: 'checked_out',
      label: 'Checked Out',
      value: checkedOut,
      icon: <LogOut className="w-6 h-6" />, 
      color: 'bg-red-100 text-red-600',
      tooltip: 'Visitors who have checked out.',
      list: visitors.filter(v => v.status === 'checked_out'),
    },
    {
      key: 'pre_scheduled',
      label: 'Pre-Registered',
      value: preRegisteredCount,
      icon: <Calendar className="w-6 h-6" />, 
      color: 'bg-purple-100 text-purple-600',
      tooltip: 'Visitors you have pre-registered.',
      list: visitors.filter(v => v.isPreRegistered && v.status === 'approved'),
    },
    {
      key: 'missed',
      label: 'Missed Visits',
      value: missed,
      icon: <AlertTriangle className="w-6 h-6" />, 
      color: 'bg-yellow-100 text-yellow-600',
      tooltip: 'Visitors who missed their visit.',
      list: visitors.filter(v => v.status === 'missed'),
    },
  ];

  const selectedStat = statTiles.find(tile => tile.key === selectedTile) || statTiles[0];
  const rightPanelList = selectedStat.list.slice(0, 4);

  // Right panel content
  const rightPanelContent = (
    <div className="flex flex-col h-full p-2 sm:p-4">
      <div className="text-base sm:text-lg font-semibold mb-2">{selectedStat.label} Details</div>
      <div className="text-xs sm:text-sm text-gray-500 mb-4">{selectedStat.tooltip}</div>
      <div className="flex-1 overflow-auto">
        {selectedStat.key === 'pre_scheduled' ? (
          selectedStat.list.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">No pre-registered visitors yet.</div>
          ) : (
            <ul className="space-y-4">
              {selectedStat.list
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // Gender and purpose options
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
  const timeSlots = [
    '09:00-12:00',
    '12:00-15:00',
    '15:00-18:00',
  ];
  // Pre-register form state
  const preRegForm = useForm({
    defaultValues: {
      mobile: '',
      name: '',
      aadhar: '',
      gender: '',
      purpose: '',
      date: '',
      timeSlot: '',
      host: user?.name || user?._id, // Default to current user's name or ID
    },
  });
  const { handleSubmit: handlePreRegSubmit, reset: resetPreReg, control: preRegControl } = preRegForm;
  const [preRegLoading, setPreRegLoading] = useState(false);
  const [preRegError, setPreRegError] = useState<string | null>(null);
  const [preRegSuccess, setPreRegSuccess] = useState<string | null>(null);

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
        hostId: data.host, // Use the host field from the form
        purpose: data.purpose,
        date: data.date,
        timeSlot: data.timeSlot,
        status: 'approved',
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
      resetPreReg();
      setTimeout(() => setPreRegSuccess(null), 1200);
    } catch (err: any) {
      setPreRegError(err.message || 'Failed to pre-register visitor');
    } finally {
      setPreRegLoading(false);
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={handleLogout}
      title="Receptionist Dashboard"
      rightPanel={selectedSidebar === 'visitors' ? rightPanelContent : null}
      search={search}
      setSearch={setSearch}
      selectedSidebar={selectedSidebar}
      onSidebarSelect={(v) => {
        setSelectedSidebar(v);
      }}
    >
      {selectedSidebar === 'pre_register' ? (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-0">
          <div className="w-full max-w-3xl p-10 bg-white/90 rounded-3xl border border-gray-100 shadow-2xl flex flex-col justify-center">
            <div className="text-3xl font-extrabold mb-8 text-center text-purple-700 tracking-tight">Pre-Register Visitor</div>
            <FormProvider {...preRegForm}>
              <form onSubmit={handlePreRegSubmit(onPreRegister)} className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-describedby="preRegDesc">
                <span id="preRegDesc" className="sr-only">Fill out the form to pre-register a visitor. All fields are required.</span>
                <div className="flex flex-col gap-2">
                  <FormField name="mobile" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-700">Mobile No.</FormLabel>
                      <Input placeholder="Enter mobile number" {...field} className="text-base py-3 h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-purple-200" />
                    </FormItem>
                  )} />
                  <FormField name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-700">Name</FormLabel>
                      <Input placeholder="Enter name" {...field} className="text-base py-3 h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-purple-200" />
                    </FormItem>
                  )} />
                  <FormField name="aadhar" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-700">Aadhar No.</FormLabel>
                      <Input placeholder="Enter Aadhar number" {...field} className="text-base py-3 h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-purple-200" />
                    </FormItem>
                  )} />
                  <FormField name="gender" control={preRegControl} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-700">Gender</FormLabel>
                      <div className="flex gap-8 mt-1">
                        {genderOptions.map((option) => (
                          <label key={option.value} className="flex items-center gap-2 cursor-pointer text-base">
                            <input
                              type="radio"
                              value={option.value}
                              checked={field.value === option.value}
                              onChange={() => field.onChange(option.value)}
                              className="accent-purple-600 w-5 h-5"
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </FormItem>
                  )} />
                </div>
                <div className="flex flex-col gap-2">
                  {/* Host editable for receptionist */}
                  <FormField name="host" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-700">Host</FormLabel>
                      <HostDropdown value={field.value} onChange={field.onChange} />
                    </FormItem>
                  )} />
                  <FormField name="purpose" control={preRegControl} render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-700">Purpose of Visit</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} defaultValue="">
                        <SelectTrigger className="text-base py-3 h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-purple-200">
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          {purposeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-base">{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-700">Date</FormLabel>
                      <Input type="date" {...field} className="text-base py-3 h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-purple-200" min={new Date().toISOString().split('T')[0]} />
                    </FormItem>
                  )} />
                  <FormField name="timeSlot" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold text-gray-700">Time Slot</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} defaultValue="">
                        <SelectTrigger className="text-base py-3 h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-purple-200">
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot} className="text-base">{slot}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>
                <div className="md:col-span-2">
                  {preRegError && <div className="text-red-600 text-base mt-2 text-center">{preRegError}</div>}
                  {preRegSuccess && <div className="text-green-700 text-base mt-2 text-center">{preRegSuccess}</div>}
                  <div className="flex gap-2 justify-end mt-6">
                    <Button type="submit" disabled={preRegLoading} className="h-12 px-8 text-base bg-purple-600 text-white hover:bg-purple-700 w-full md:w-auto">{preRegLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pre-Register'}</Button>
                  </div>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      ) : selectedSidebar === 'settings' ? (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-8 py-10 w-full max-w-md flex flex-col items-center">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-blue-100 text-blue-600 rounded-full p-4 mb-3">
                <UserCircle className="w-12 h-12" />
              </div>
              <div className="text-2xl font-bold mb-1 text-center">{user?.name || '-'}</div>
              <div className="text-sm text-gray-400 mb-2 text-center">Receptionist Profile</div>
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
      ) : (
        // Only render the rest of the dashboard if not in pre_register mode
        <>
          {/* Stat Cards */}
          <TooltipProvider>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-8 mt-2">
              {statTiles.map(tile => (
                <Tooltip key={tile.key}>
                  <TooltipTrigger asChild>
                    <button
                      className={`flex flex-col items-center justify-center gap-2 p-5 w-full h-32 bg-white rounded-2xl shadow-sm border border-gray-100 transition ring-2 ring-transparent hover:ring-blue-200 focus:ring-blue-400 ${selectedTile === tile.key ? 'ring-blue-500' : ''}`}
                      onClick={() => setSelectedTile(tile.key)}
                    >
                      <div className={`${tile.color} rounded-full p-3 flex items-center justify-center`}>{tile.icon}</div>
                      <div className="text-xs text-gray-500 text-center truncate w-full max-w-[120px]">{tile.label}</div>
                      <div className="text-2xl font-bold text-gray-900 text-center">{tile.value}</div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{tile.tooltip}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 items-center">
            {FILTERS.map(tab => (
              <button
                key={tab.value}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${filter === tab.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
                onClick={() => { setFilter(tab.value); setShowDatePicker(false); }}
              >
                {tab.label}
              </button>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`flex items-center justify-center px-3 py-2 rounded-lg font-medium text-sm transition-colors ${filter === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
                  onClick={() => setShowDatePicker(v => !v)}
                  aria-label="Filter by date"
                  type="button"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Filter by specific date</TooltipContent>
            </Tooltip>
            {showDatePicker && (
              <input
                type="date"
                className="ml-2 px-2 py-1 rounded border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={customDate}
                onChange={e => {
                  setCustomDate(e.target.value);
                  setFilter('custom');
                }}
                max={now.toISOString().slice(0, 10)}
              />
            )}
          </div>
          {/* Visitors Table */}
          <div className="min-h-[340px] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 p-0 overflow-auto">
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">Loading visitors...</div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center text-red-500">{error}</div>
            ) : filteredVisitors.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
                <User className="w-10 h-10 mb-2" />
                <div className="font-medium text-base">No visitors found.</div>
            </div>
          ) : (
              <>
                <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                      <th className="px-6 py-3 text-left font-semibold">Name</th>
                      <th className="px-6 py-3 text-left font-semibold">Host</th>
                      <th className="px-6 py-3 text-left font-semibold">Purpose</th>
                      <th className="px-6 py-3 text-left font-semibold">Status</th>
                      <th className="px-6 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                    {filteredVisitors.map((v, i) => (
                      <tr key={v._id} className={`border-b transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/40`}>
                        <td className="px-6 py-3 font-medium text-gray-900">{v.name}</td>
                        <td className="px-6 py-3">{typeof v.hostId === 'object' && v.hostId !== null ? v.hostId.name || '-' : (typeof v.hostId === 'string' && v.hostId !== 'N/A' && v.hostId !== '' ? v.hostId : '-')}</td>
                        <td className="px-6 py-3">{v.purpose || '-'}</td>
                        <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold
                          ${v.status === 'checked_in' ? 'bg-blue-100 text-blue-700' :
                            v.status === 'checked_out' ? 'bg-green-100 text-green-700' :
                            v.status === 'approved' ? 'bg-yellow-100 text-yellow-700' :
                            v.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'}`}
                        >
                            {v.status}
                        </span>
                      </td>
                        <td className="px-6 py-3">
                          <button className="text-blue-600 hover:underline text-xs mr-2" onClick={() => navigate(`/gate-pass/${v._id}`, { state: v })}>View Gate Pass</button>
                          {v.status !== 'checked_out' && (
                            <button
                              className="text-green-600 hover:underline text-xs disabled:opacity-50"
                              disabled={checkoutLoading === v._id}
                              onClick={() => handleCheckout(v)}
                            >
                              {checkoutLoading === v._id ? 'Checking Out...' : 'Check Out'}
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                <div className="flex justify-end p-4">
                  <button
                    className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    onClick={handleViewAllVisitors}
                  >
                    View All Visitors
                  </button>
            </div>
              </>
            )}
                    </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default ReceptionistDashboard; 