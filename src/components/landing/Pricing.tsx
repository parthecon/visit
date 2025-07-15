import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: '₹0',
    period: ' (Free Trial)',
    description: 'For small offices or early-stage startups',
    features: [
      '1 location',
      '50 visitors/month',
      '10 employees',
      '1 receptionist',
      'Basic visitor check-in (manual & kiosk)',
      'Pre-registration (limited)',
      'Email notifications',
      'Standard badge template',
      '7 or 14-day free trial',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Basic',
    price: '₹1,999',
    period: '/month',
    description: 'For small teams and co-working spaces',
    features: [
      '1 location',
      '500 visitors/month',
      'Up to 50 employees',
      '2 receptionists',
      'Pre-registration + QR check-in',
      'SMS + Email notifications (India DLT compliant)',
      'Visitor photo & signature capture',
      'Custom visitor fields',
      'Badge printing',
      'Basic reports',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '₹5,999',
    period: '/month',
    description: 'For SMBs and IT companies with multiple offices',
    features: [
      'Up to 3 locations',
      '2,000 visitors/month',
      'Unlimited employees',
      'Receptionist dashboard',
      'Pre-approvals (via WhatsApp/Email/SMS)',
      'Slack/MS Teams notifications',
      'Google Calendar integration',
      'Watchlist alerts (internal security)',
      'Evacuation reports',
      'Custom badge design',
      'Advanced reports & exports (CSV, PDF)',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '(Starts at ₹14,999/month)',
    description: 'For large corporates, MNCs, tech parks, or secure facilities',
    features: [
      'Unlimited locations',
      'Unlimited visitors/month',
      'API access & webhooks',
      'WhatsApp Business integration',
      'SSO (Google Workspace, Azure AD, Okta)',
      'Biometric & RFID integrations (on request)',
      'NDA/digital document capture',
      'White-labeling options',
      'Dedicated account manager',
      '24x7 priority support',
      'Data storage in India (compliance with PDPB)',
      'Onboarding & training included',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const addons = [
  { name: 'Additional 1,000 visitors/month', price: '₹750' },
  { name: 'Additional kiosk/tablet device', price: '₹500/month' },
  { name: 'WhatsApp integration', price: '₹1,000/month' },
  { name: 'SMS Credits (India DLT-compliant)', price: '₹0.12/SMS' },
  { name: 'On-site setup/training (Metro cities)', price: '₹4,999 one-time' },
  { name: 'Badge printer rental', price: '₹999/month' },
  { name: 'NDA/ID Scan Storage (1 year retention)', price: '₹1,000/month/location' },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Start free and scale as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card relative ${
                plan.popular ? 'ring-2 ring-primary shadow-2xl scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.name === 'Enterprise' ? (
                <Link
                  to="/contact"
                  className={`w-full ${plan.popular ? 'btn-hero' : 'btn-hero-outline'} flex justify-center items-center py-3 rounded-xl font-semibold text-lg transition-all duration-300`}
                >
                  {plan.cta}
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className={`w-full ${plan.popular ? 'btn-hero' : 'btn-hero-outline'} flex justify-center items-center py-3 rounded-xl font-semibold text-lg transition-all duration-300`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Add-Ons Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h3 className="text-2xl font-bold mb-4 text-center">India-Specific Add-Ons</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border border-border rounded-lg">
              <thead>
                <tr className="bg-muted">
                  <th className="py-2 px-4 font-semibold">Add-on</th>
                  <th className="py-2 px-4 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {addons.map((addon, idx) => (
                  <tr key={idx} className="border-t border-border">
                    <td className="py-2 px-4">{addon.name}</td>
                    <td className="py-2 px-4">{addon.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Note */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.{' '}
            <a href="#faq" className="text-primary hover:underline">
              View FAQ
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};