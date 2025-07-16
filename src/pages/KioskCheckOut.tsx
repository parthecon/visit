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
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Check-out failed. Please try again.");
      setSuccessMsg("You have been checked out. Thank you!");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      <div className="relative z-10 w-full flex items-center justify-center px-4 py-20">
        <div className="glass-card max-w-lg w-full mx-auto p-10 shadow-2xl flex flex-col items-center gap-8 relative overflow-visible">
          {/* Floating Elements attached to card */}
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full animate-bounce pointer-events-none"></div>
          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-secondary/10 rounded-full animate-pulse pointer-events-none"></div>
          <h2 className="text-4xl md:text-5xl font-bold text-center leading-tight mb-4">
            <span className="text-gradient">Visitor Check-Out</span>
          </h2>
          {successMsg ? (
            <div className="text-green-600 text-center text-lg font-semibold py-8">{successMsg}</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs mx-auto">
              <input
                type="text"
                required
                placeholder="Enter your phone or email"
                className="input w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
              />
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              <button type="submit" className="btn-hero w-full text-xl" disabled={loading}>
                {loading ? "Checking Out..." : "Check Out"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
} 