import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Smarter Visitor Management for{' '}
                <span className="text-gradient">Modern Offices</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Let your front desk run itself with visitor self-check-in, SMS alerts, and comprehensive dashboards.
              </p>
            </div>

           

            {/* Social Proof */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Trusted by 1,000+ companies</span>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-primary border-2 border-background"
                  />
                ))}
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                  +
                </div>
              </div>
            </div>
          </div>

          {/* Product Screenshot/Illustration */}
          <div className="relative">
            <div className="glass-card p-8 shadow-2xl">
              <div className="bg-gradient-card rounded-xl p-6 space-y-4">
                {/* Mock Dashboard UI */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Today's Visitors</h3>
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-card rounded-lg border">
                      <div className="w-10 h-10 bg-primary/20 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                        <div className="h-3 bg-muted/50 rounded w-16"></div>
                      </div>
                      <div className="w-6 h-6 bg-success/20 rounded text-success text-xs flex items-center justify-center">
                        ✓
                      </div>
                    </div>
                  ))}
                </div>

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
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-secondary/10 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};