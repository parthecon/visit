import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function KioskIndex() {
  const navigate = useNavigate();
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      <div className="relative z-10 w-full flex items-center justify-center px-4 py-20">
        <div className="glass-card max-w-lg w-full mx-auto p-10 shadow-2xl flex flex-col items-center gap-8 relative overflow-visible">
          {/* Floating Elements attached to card */}
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full animate-bounce pointer-events-none"></div>
          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-secondary/10 rounded-full animate-pulse pointer-events-none"></div>
          <div className="space-y-4 w-full flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-center leading-tight">
              Welcome to <span className="text-gradient">Visitify Kiosk</span>
            </h1>
            <p className="text-xl text-muted-foreground text-center max-w-md">
              Please select an option below to check in or check out as a visitor.
            </p>
            <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
              <Button
                size="lg"
                className="btn-hero w-full text-xl"
                onClick={() => navigate("/kiosk/checkin")}
              >
                Visitor Check-In
              </Button>
              <Button
                size="lg"
                className="btn-hero-outline w-full text-xl"
                onClick={() => navigate("/kiosk/checkout")}
              >
                Visitor Check-Out
              </Button>
            </div>
          </div>
          {/* Illustration / Mock Dashboard UI (stats only) */}
          <div className="w-full">
            <div className="bg-gradient-card rounded-xl p-6 space-y-4">
              {/* Mock Dashboard UI Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Today's Visitors</h3>
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              </div>
              {/* Remove the list of mock visitors here */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">24</div>
                  <div className="text-sm text-muted-foreground">Today</div>
                </div>
                <div className="text-center p-4 bg-secondary/5 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">156</div>
                  <div className="text-sm text-muted-foreground">This Week</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 