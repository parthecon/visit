import CheckInForm from "@/components/visitor/CheckInForm";
import { useState } from "react";

export default function KioskCheckIn() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      <div className="relative z-10 w-full flex items-center justify-center px-4 py-20">
        <div className="glass-card max-w-lg w-full mx-auto p-10 shadow-2xl flex flex-col items-center gap-8 relative overflow-visible">
          {/* Floating Elements attached to card */}
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full animate-bounce pointer-events-none"></div>
          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-secondary/10 rounded-full animate-pulse pointer-events-none"></div>
          <h2 className="text-4xl md:text-5xl font-bold text-center leading-tight mb-4">
            <span className="text-gradient">Visitor Check-In</span>
          </h2>
          {successMsg ? (
            <div className="text-green-600 text-center text-lg font-semibold py-8">{successMsg}</div>
          ) : (
            <CheckInForm onSuccess={setSuccessMsg} />
          )}
        </div>
      </div>
    </section>
  );
} 