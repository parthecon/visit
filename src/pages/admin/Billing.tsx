import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, CreditCard, FileText, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data for UI skeleton
const plans = [
  { name: 'Starter', price: 0, id: 'starter', limits: { visitors: 100, employees: 10 }, description: 'Basic visitor management', status: 'Active' },
  { name: 'Basic', price: 1999, id: 'basic', limits: { visitors: 500, employees: 50 }, description: 'SMS alerts, 3 locations', status: '' },
  { name: 'Professional', price: 5999, id: 'pro', limits: { visitors: 2000, employees: 200 }, description: 'Badge printing, 10 locations', status: '' },
  { name: 'Enterprise', price: 'Custom', id: 'enterprise', limits: { visitors: 'Unlimited', employees: 'Unlimited' }, description: 'Custom integrations', status: '' },
];
const addOns = [
  { name: 'Additional 1,000 visitors', price: 750, id: 'addon-visitors' },
  { name: 'Badge printer rental', price: 999, id: 'addon-badge' },
  { name: 'WhatsApp Integration', price: 1000, id: 'addon-whatsapp' },
];
const invoices = [
  { date: '2024-05-01', amount: 1999, status: 'Paid', plan: 'Basic', link: '#' },
  { date: '2024-04-01', amount: 1999, status: 'Paid', plan: 'Basic', link: '#' },
];

export default function Billing() {
  // Placeholder for backend data
  const [currentPlan, setCurrentPlan] = useState(plans[0]);
  const [usage, setUsage] = useState({ visitors: 40, employees: 8 });
  const [autoRenew, setAutoRenew] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userEmail] = useState('admin@example.com'); // TODO: Replace with real user email from auth

  // Placeholder: Fetch real data from backend here
  useEffect(() => {
    // fetch('/api/v1/billing/overview') ...
  }, []);

  const handleUpgrade = async (planId) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, customerEmail: userEmail }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        toast.success('Redirecting to payment...');
        window.location.href = data.short_url;
      } else {
        toast.error(data.message || 'Failed to start payment');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Current Plan Overview */}
      <Card className="rounded-xl shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-semibold">Current Plan</CardTitle>
            <CardDescription>Manage your Visitify subscription and billing</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {currentPlan.status === 'Active' && <CheckCircle className="text-green-500 w-5 h-5" />}
            <span className="text-sm font-medium text-green-700">{currentPlan.status}</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="text-2xl font-bold">{currentPlan.name}</div>
            <div className="text-gray-500">₹{currentPlan.price}/mo</div>
            <div className="text-xs text-gray-400 mt-1">{currentPlan.description}</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm">Visitors this month: <span className="font-semibold">{usage.visitors} / {currentPlan.limits.visitors}</span></div>
            <div className="text-sm">Employees: <span className="font-semibold">{usage.employees} / {currentPlan.limits.employees}</span></div>
            <div className="text-sm">Next Billing: <span className="font-semibold">2024-06-01</span></div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">Auto-renew</span>
              <input type="checkbox" checked={autoRenew} onChange={e => setAutoRenew(e.target.checked)} className="accent-blue-600 w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison / Upgrade */}
      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Change or Upgrade Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className={`rounded-xl border p-4 shadow-sm flex flex-col gap-2 ${plan.id === currentPlan.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{plan.name}</span>
                  {plan.id === currentPlan.id && <span className="text-xs bg-blue-600 text-white rounded px-2 py-0.5 ml-2">Active</span>}
                </div>
                <div className="text-2xl font-bold">{plan.price === 0 ? 'Free' : `₹${plan.price}/mo`}</div>
                <div className="text-xs text-gray-500">{plan.description}</div>
                <div className="text-xs text-gray-400">Visitors: {plan.limits.visitors} | Employees: {plan.limits.employees}</div>
                <Button className="mt-2" disabled={plan.id === currentPlan.id || loading} variant={plan.id === currentPlan.id ? 'outline' : 'default'}
                  onClick={plan.id !== currentPlan.id && plan.id !== 'enterprise' ? () => handleUpgrade(plan.id) : undefined}>
                  {plan.id === 'enterprise' ? 'Contact Sales' : plan.id === currentPlan.id ? 'Current Plan' : loading ? 'Processing...' : 'Upgrade'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add-ons (only for higher plans) */}
      {currentPlan.id !== 'starter' && (
        <Card className="rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Optional Add-ons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {addOns.map(addon => (
                <div key={addon.id} className="rounded-lg border p-4 flex flex-col gap-1 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{addon.name}</span>
                  </div>
                  <div className="text-sm text-gray-700">₹{addon.price}/mo</div>
                  <Button className="mt-2" size="sm">Enable</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method (optional for Razorpay) */}
      <Card className="rounded-xl shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-semibold">Payment Method</CardTitle>
            <CardDescription>Manage your saved card or UPI</CardDescription>
          </div>
          <CreditCard className="w-5 h-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-sm">Card ending in 1234</div>
            <Button size="sm" variant="outline">Update</Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices & Billing History */}
      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Invoices & Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Plan</th>
                  <th className="px-4 py-2 text-left">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-2">{inv.date}</td>
                    <td className="px-4 py-2">₹{inv.amount}</td>
                    <td className="px-4 py-2">
                      {inv.status === 'Paid' ? (
                        <span className="text-green-600 font-medium">Paid</span>
                      ) : (
                        <span className="text-red-600 font-medium">Failed</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{inv.plan}</td>
                    <td className="px-4 py-2">
                      <a href={inv.link} className="text-blue-600 underline flex items-center gap-1"><FileText className="w-4 h-4" />Download</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 