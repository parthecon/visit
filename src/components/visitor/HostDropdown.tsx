import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Host {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function HostDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHosts() {
      setLoading(true);
      setError(null);
      try {
        const [empRes, adminRes] = await Promise.all([
          fetch("/api/v1/employee"),
          fetch("/api/v1/admin")
        ]);
        const empData = await empRes.json();
        const adminData = await adminRes.json();
        if (!empRes.ok || !adminRes.ok) throw new Error(empData.message || adminData.message || "Failed to fetch hosts");
        setHosts([...empData.data, ...adminData.data]);
      } catch (err: any) {
        setError(err.message || "Failed to load hosts");
      } finally {
        setLoading(false);
      }
    }
    fetchHosts();
  }, []);

  if (loading)
    return (
      <div className="input w-full px-4 py-3 rounded-lg border border-border text-lg">Loading hosts...</div>
    );
  if (error)
    return (
      <div className="input w-full px-4 py-3 rounded-lg border border-border text-lg text-red-600">{error}</div>
    );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-lg input bg-white">
        <SelectValue placeholder="Select Host" />
      </SelectTrigger>
      <SelectContent className="rounded-lg border border-border bg-white shadow-lg text-lg">
        {hosts.map((host) => (
          <SelectItem key={host._id} value={host._id} className="text-base">
            {host.name} ({host.role.replace("company_admin", "Admin")})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 