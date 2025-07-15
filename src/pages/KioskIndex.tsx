import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function KioskIndex() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10 pointer-events-none"></div>
      <div className="max-w-2xl mx-auto px-4 py-20 z-10 relative">
        <div className="glass-card p-10 shadow-2xl flex flex-col items-center gap-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center leading-tight">
            Welcome to <span className="text-gradient">Visitify Kiosk</span>
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-md">
            Please select an option below to check in or check out as a visitor.
          </p>
          <div className="flex flex-col gap-6 w-full max-w-xs">
            <Button
              size="lg"
              className="w-full py-6 text-xl rounded-lg font-semibold shadow bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/kiosk/checkin")}
            >
              Visitor Check-In
            </Button>
            <Button
              size="lg"
              className="w-full py-6 text-xl rounded-lg font-semibold shadow bg-green-600 hover:bg-green-700"
              onClick={() => navigate("/kiosk/checkout")}
            >
              Visitor Check-Out
            </Button>
          </div>
        </div>
        {/* Floating Elements for Polish */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full animate-bounce"></div>
        <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-secondary/10 rounded-full animate-pulse"></div>
      </div>
    </section>
  );
} 