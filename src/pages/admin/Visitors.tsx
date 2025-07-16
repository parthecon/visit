import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

interface Visitor {
  _id: string;
  name: string;
  phone: string;
  email: string;
  hostId?: { name: string } | string;
  purpose: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: string;
  [key: string]: any;
}

function StatusBadge({ status }: { status?: string }) {
  let color = 'bg-gray-200 text-gray-700';
  let label = status;
  if (status === 'checked_in') {
    color = 'bg-green-200 text-green-800';
    label = 'Checked In';
  } else if (status === 'checked_out') {
    color = 'bg-gray-300 text-gray-700';
    label = 'Checked Out';
  } else if (status === 'pending') {
    color = 'bg-yellow-200 text-yellow-800';
    label = 'Pending';
  } else if (status === 'approved') {
    color = 'bg-blue-200 text-blue-800';
    label = 'Approved';
  } else if (status === 'rejected') {
    color = 'bg-red-200 text-red-800';
    label = 'Rejected';
  }
  return <span className={`text-xs px-2 py-1 rounded-full font-semibold ${color}`}>{label}</span>;
}

export default function Visitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Counts
  const total = visitors.length;
  const checkedIn = visitors.filter(v => v.status === 'checked_in').length;
  const checkedOut = visitors.filter(v => v.status === 'checked_out').length;
  const present = checkedIn; // Present = checked_in (not checked_out)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4 text-center">All Visitors</h1>
      {/* Counts summary */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
          <span className="font-semibold">Total:</span>
          <span className="text-lg font-bold">{total}</span>
        </div>
        <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
          <span className="font-semibold text-green-800">Checked In:</span>
          <span className="text-lg font-bold text-green-800">{checkedIn}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg">
          <span className="font-semibold text-gray-700">Checked Out:</span>
          <span className="text-lg font-bold text-gray-700">{checkedOut}</span>
        </div>
        <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg">
          <span className="font-semibold text-blue-800">Present:</span>
          <span className="text-lg font-bold text-blue-800">{present}</span>
        </div>
      </div>
      {loading && <div className="text-center py-8">Loading visitors...</div>}
      {error && <div className="text-center text-red-600 py-8">{error}</div>}
      {!loading && !error && (
        <Accordion type="multiple" className="space-y-4">
          {visitors.map((visitor) => (
            <AccordionItem
              key={visitor._id}
              value={visitor._id}
              className="border border-border rounded-lg px-6"
            >
              <AccordionTrigger className="flex flex-col md:flex-row md:items-center md:justify-between text-left hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{visitor.name}</span>
                  <StatusBadge status={visitor.status} />
                </div>
                <span className="text-sm text-muted-foreground">
                  Check-In: {visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString() : '—'}
                  {' | '}Check-Out: {visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleString() : '—'}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                  <div><span className="font-medium">Name:</span> {visitor.name}</div>
                  <div><span className="font-medium">Phone:</span> {visitor.phone}</div>
                  <div><span className="font-medium">Email:</span> {visitor.email}</div>
                  <div><span className="font-medium">Host:</span> {typeof visitor.hostId === 'object' && visitor.hostId !== null ? (visitor.hostId.name || '—') : (typeof visitor.hostId === 'string' ? visitor.hostId : '—')}</div>
                  <div><span className="font-medium">Purpose:</span> {visitor.purpose}</div>
                  <div><span className="font-medium">Status:</span> <StatusBadge status={visitor.status} /></div>
                  <div><span className="font-medium">Check-In Time:</span> {visitor.checkInTime ? new Date(visitor.checkInTime).toLocaleString() : '—'}</div>
                  <div><span className="font-medium">Check-Out Time:</span> {visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleString() : '—'}</div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
} 