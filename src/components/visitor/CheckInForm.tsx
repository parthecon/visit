import React, { useState } from 'react';
import HostDropdown from './HostDropdown';

const COMPANY_ID = '664b2e1234567890abcdef12';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" required placeholder="Full Name" className="input" value={form.name} onChange={handleChange} />
      <input name="phone" required placeholder="Phone Number" className="input" value={form.phone} onChange={handleChange} />
      <input name="email" required placeholder="Email Address" className="input" value={form.email} onChange={handleChange} />
      <HostDropdown value={form.host} onChange={v => setForm(f => ({ ...f, host: v }))} />
      <select name="purpose" required className="input" value={form.purpose} onChange={handleChange}>
        <option value="">Purpose of Visit</option>
        <option>Meeting</option>
        <option>Interview</option>
        <option>Delivery</option>
        <option>Other</option>
      </select>
      {error && <div className="text-red-600 text-sm text-center">{error}</div>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Checking In...' : 'Check In'}
      </button>
    </form>
  );
} 