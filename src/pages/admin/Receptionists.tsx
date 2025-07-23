import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Receptionist {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

const Receptionists: React.FC = () => {
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<Receptionist | null>(null);
  const [showDelete, setShowDelete] = useState<Receptionist | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Fetch receptionists
  async function fetchReceptionists() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/receptionist', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch receptionists');
      setReceptionists(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch receptionists');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReceptionists();
  }, []);

  // Add receptionist
  async function handleAdd(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast({ title: 'All fields are required', variant: 'destructive' });
      return;
    }
    setFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { ...form };
      const res = await fetch('/api/v1/receptionist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add receptionist');
      setReceptionists(e => [...e, data.data]);
      setShowAdd(false);
      setForm({ name: '', email: '', phone: '', password: '' });
      toast({ title: 'Receptionist added' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  }

  // Edit receptionist
  async function handleEdit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!showEdit) return;
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: 'Name and Email are required', variant: 'destructive' });
      return;
    }
    setFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      const updates = { ...form };
      if (!updates.password) delete updates.password;
      const res = await fetch(`/api/v1/receptionist/${showEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update receptionist');
      setReceptionists(e => e.map(r => r._id === showEdit._id ? data.data : r));
      setShowEdit(null);
      setForm({ name: '', email: '', phone: '', password: '' });
      toast({ title: 'Receptionist updated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  }

  // Delete receptionist
  async function handleDelete() {
    if (!showDelete) return;
    setFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/receptionist/${showDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete receptionist');
      setReceptionists(e => e.filter(r => r._id !== showDelete._id));
      setShowDelete(null);
      toast({ title: 'Receptionist deleted' });
      setForm({ name: '', email: '', phone: '', password: '' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4 text-center">Receptionists</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-semibold">Manage Receptionists</CardTitle>
            <CardDescription>View, add, edit, or remove receptionists.</CardDescription>
          </div>
          <Button variant="default" className="flex items-center gap-2" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Add Receptionist
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading receptionists...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : receptionists.length === 0 ? (
            <div>No receptionists found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receptionists.map(r => (
                    <tr key={r._id} className="border-b">
                      <td className="px-4 py-2">{r.name}</td>
                      <td className="px-4 py-2">{r.email}</td>
                      <td className="px-4 py-2">{r.phone || '-'}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => {
                          setShowEdit(r);
                          setForm({ name: r.name, email: r.email, phone: r.phone || '', password: '' });
                        }}><Edit className="w-4 h-4" />Edit</Button>
                        <Button size="sm" variant="destructive" className="flex items-center gap-1" onClick={() => setShowDelete(r)}><Trash2 className="w-4 h-4" />Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Receptionist Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Receptionist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={formLoading}>{formLoading ? 'Adding...' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Receptionist Dialog */}
      <Dialog open={!!showEdit} onOpenChange={v => { if (!v) setShowEdit(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Receptionist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  type={showEditPassword ? 'text' : 'password'}
                  placeholder="Leave blank to keep unchanged"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowEditPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={formLoading}>{formLoading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Receptionist Dialog */}
      <Dialog open={!!showDelete} onOpenChange={v => { if (!v) setShowDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Receptionist</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete {showDelete?.name}?</div>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>{formLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Receptionists; 