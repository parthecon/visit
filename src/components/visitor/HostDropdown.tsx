import { useEffect, useState } from "react";

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

  if (loading) return <div className="input">Loading hosts...</div>;
  if (error) return <div className="input text-red-600">{error}</div>;

  return (
    <select
      name="host"
      required
      className="input"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">Select Host</option>
      {hosts.map(host => (
        <option key={host._id} value={host._id}>
          {host.name} ({host.role.replace("company_admin", "Admin")})
        </option>
      ))}
    </select>
  );
} 