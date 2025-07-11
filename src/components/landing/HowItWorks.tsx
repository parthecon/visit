import React from 'react';
import { Building2, Users, QrCode } from 'lucide-react';

const steps = [
  {
    icon: Building2,
    title: 'Sign Up and Set Up Company',
    description: 'Create your account and configure your company settings, branding, and office locations.',
    step: '01',
  },
  {
    icon: Users,
    title: 'Add Receptionists and Employees',
    description: 'Invite your team members and assign appropriate roles and permissions for visitor management.',
    step: '02',
  },
  {
    icon: QrCode,
    title: 'Start Visitor Check-ins',
    description: 'Enable visitors to check-in using QR codes, tablets, or have receptionists manage the process.',
    step: '03',
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started with Visitify in just three simple steps. No technical expertise required.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-primary/30"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center group">
                {/* Step Number */}
                <div className="relative mx-auto w-20 h-20 mb-6">
                  <div className="w-full h-full bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.step}
                  </div>
                  {/* Pulse Animation */}
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                </div>

                {/* Icon */}
                <div className="icon-container mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">5 min</div>
            <div className="text-muted-foreground">Setup Time</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-secondary">99.9%</div>
            <div className="text-muted-foreground">Uptime</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary">24/7</div>
            <div className="text-muted-foreground">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};