import React from 'react';
import { 
  UserCheck, 
  BarChart3, 
  MessageSquare, 
  CreditCard, 
  Shield, 
  Clock 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: UserCheck,
    title: 'Self Check-in',
    description: 'Visitors can check themselves in using QR codes, tablets, or mobile devices. No more waiting in lines.',
  },
  {
    icon: BarChart3,
    title: 'Admin & Employee Dashboards',
    description: 'Comprehensive dashboards for admins and employees to track visitors, analytics, and manage operations.',
  },
  {
    icon: MessageSquare,
    title: 'SMS/WhatsApp Alerts',
    description: 'Instant notifications to hosts when their visitors arrive. Never miss an important meeting again.',
  },
  {
    icon: CreditCard,
    title: 'Badge Printing',
    description: 'Automatically print visitor badges with photos, QR codes, and access permissions.',
  },
  {
    icon: Shield,
    title: 'Analytics Reports',
    description: 'Detailed reports on visitor patterns, peak times, and security insights for better planning.',
  },
  {
    icon: Clock,
    title: 'Pre-Registration',
    description: 'Allow employees to pre-register visitors and send them QR codes for faster check-in.',
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything you need to manage visitors
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From self-service check-ins to comprehensive analytics, Visitify provides all the tools 
            your modern office needs.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group"
            >
              <div className="icon-container group-hover:scale-110 transition-transform duration-300 mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="glass-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to transform your front desk?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of companies that trust Visitify for their visitor management needs.
            </p>
            <Link to="/signup" className="btn-hero">
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};