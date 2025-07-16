import React, { useState } from 'react';
import HostDropdown from './HostDropdown';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const COMPANY_ID = '664b2e1234567890abcdef12';

const PURPOSE_OPTIONS = [
  'Meeting',
  'Interview',
  'Delivery',
  'Other',
];

export default function CheckInForm({ onSuccess }: { onSuccess: (msg: string) => void }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    host: '',
    purpose: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handlePurposeChange = (value: string) => {
    setForm(f => ({ ...f, purpose: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email,
      hostId: form.host,
      purpose: form.purpose,
      companyId: COMPANY_ID,
    };
    try {
      const res = await fetch('/api/v1/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Check-in failed. Please try again.');
      onSuccess('Thank you. Your host has been notified.');
    } catch (err: any) {
      setError(err.message || 'Check-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs mx-auto">
      <input name="name" required placeholder="Full Name" className="input w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-lg" value={form.name} onChange={handleChange} />
      <input name="phone" required placeholder="Phone Number" className="input w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-lg" value={form.phone} onChange={handleChange} />
      <input name="email" required placeholder="Email Address" className="input w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-lg" value={form.email} onChange={handleChange} />
      <HostDropdown value={form.host} onChange={v => setForm(f => ({ ...f, host: v }))} />
      <Select value={form.purpose} onValueChange={handlePurposeChange} required>
        <SelectTrigger className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-lg input bg-white">
          <SelectValue placeholder="Purpose of Visit" />
        </SelectTrigger>
        <SelectContent className="rounded-lg border border-border bg-white shadow-lg text-lg">
          {PURPOSE_OPTIONS.map(option => (
            <SelectItem key={option} value={option} className="text-base">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      <button type="submit" className="btn-hero w-full text-xl" disabled={loading}>
        {loading ? 'Checking In...' : 'Check In'}
      </button>
    </form>
  );
} 