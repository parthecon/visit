import { useState } from "react";

export default function KioskCheckOut() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/visitor/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail: input })
      });
      if (!res.ok) throw new Error("Check-out failed. Please try again.");
      setSuccessMsg("You have been checked out. Thank you!");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Visitor Check-Out</h2>
        {successMsg ? (
          <div className="text-green-600 text-center text-lg font-semibold py-8">{successMsg}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              required
              placeholder="Enter your phone or email"
              className="input"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Checking Out..." : "Check Out"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 