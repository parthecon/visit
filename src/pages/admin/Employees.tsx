import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
// @ts-ignore
import jwt_decode from 'jwt-decode';

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

interface PlanLimits {
  employees: number | 'Unlimited';
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planLimits, setPlanLimits] = useState<PlanLimits>({ employees: 10 }); // Default, will fetch real
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<Employee | null>(null);
  const [showDelete, setShowDelete] = useState<Employee | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Fetch employees
  useEffect(() => {
    async function fetchEmployees() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/v1/employee');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch employees');
        setEmployees(data.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch employees');
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  // Fetch plan limits (from billing API or user context)
  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await fetch('/api/v1/billing/overview');
        const data = await res.json();
        if (res.ok && data.status === 'success') {
          setPlanLimits(data.data.plan.limits);
        }
      } catch {}
    }
    fetchPlan();
  }, []);

  // Fetch current user (admin) for companyId
  useEffect(() => {
    async function fetchUser() {
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
          setCurrentUser(data.data.user);
        }
      } catch {}
    }
    fetchUser();
  }, []);

  const canAdd = planLimits.employees === 'Unlimited' || employees.length < planLimits.employees;

  // Add employee
  async function handleAdd(e?: React.FormEvent) {
    if (e) e.preventDefault();
    // Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.role.trim() || !form.password.trim()) {
      toast({ title: 'All fields are required', variant: 'destructive' });
      return;
    }
    setFormLoading(true);
    try {
      const payload = {
        ...form,
        companyId: currentUser?.company?._id || currentUser?.companyId,
      };
      const res = await fetch('/api/v1/employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add employee');
      setEmployees(e => [...e, data.data]);
      setShowAdd(false);
      setForm({ name: '', email: '', phone: '', role: '', password: '' });
      toast({ title: 'Employee added' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  }

  // Edit employee
  async function handleEdit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!showEdit) return;
    // Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.role.trim()) {
      toast({ title: 'Name, Email, and Role are required', variant: 'destructive' });
      return;
    }
    setFormLoading(true);
    try {
      const updates = { ...form };
      if (!updates.password) delete updates.password;
      const res = await fetch(`/api/v1/employee/${showEdit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update employee');
      setEmployees(e => e.map(emp => emp._id === showEdit._id ? data.data : emp));
      setShowEdit(null);
      setForm({ name: '', email: '', phone: '', role: '', password: '' });
      toast({ title: 'Employee updated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  }

  // Delete employee
  async function handleDelete() {
    if (!showDelete) return;
    setFormLoading(true);
    try {
      const res = await fetch(`/api/v1/employee/${showDelete._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete employee');
      setEmployees(e => e.filter(emp => emp._id !== showDelete._id));
      setShowDelete(null);
      toast({ title: 'Employee deleted' });
      setForm({ name: '', email: '', phone: '', role: '', password: '' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4 text-center">Employees</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg font-semibold">Manage Employees</CardTitle>
            <CardDescription>View, add, edit, or remove employees. Limit: {planLimits.employees === 'Unlimited' ? 'Unlimited' : `${planLimits.employees} employees`}</CardDescription>
          </div>
          <Button disabled={!canAdd} variant="default" className="flex items-center gap-2" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Add Employee
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading employees...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : employees.length === 0 ? (
            <div>No employees found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Phone</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp._id} className="border-b">
                      <td className="px-4 py-2">{emp.name}</td>
                      <td className="px-4 py-2">{emp.email}</td>
                      <td className="px-4 py-2">{emp.phone || '-'}</td>
                      <td className="px-4 py-2">{emp.role || '-'}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => { 
                          setShowEdit(emp); 
                          setForm({ name: emp.name, email: emp.email, phone: emp.phone || '', role: emp.role || '', password: '' }); 
                          setCurrentPassword('••••••••'); // Placeholder since we can't get actual password
                          setIsEditingPassword(false);
                        }}><Edit className="w-4 h-4" />Edit</Button>
                        <Button size="sm" variant="destructive" className="flex items-center gap-1" onClick={() => setShowDelete(emp)}><Trash2 className="w-4 h-4" />Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!canAdd && (
            <div className="text-red-600 mt-4">You have reached your employee limit for this plan. Upgrade to add more employees.</div>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
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
              <Label>Role</Label>
              <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
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

      {/* Edit Employee Dialog */}
      <Dialog open={!!showEdit} onOpenChange={v => { if (!v) setShowEdit(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
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
              <Label>Role</Label>
              <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
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

      {/* Delete Employee Dialog */}
      <Dialog open={!!showDelete} onOpenChange={v => { if (!v) setShowDelete(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
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

export default Employees; 