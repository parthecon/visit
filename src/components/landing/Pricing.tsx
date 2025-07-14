import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for small offices getting started',
    features: [
      'Up to 50 visitors/month',
      'Basic check-in form',
      'Email notifications',
      'Basic reporting',
      'Single location',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Basic',
    price: '$29',
    period: '/month',
    description: 'Ideal for growing businesses',
    features: [
      'Up to 500 visitors/month',
      'Custom check-in forms',
      'SMS & Email notifications',
      'Advanced reporting',
      'Multiple locations',
      'Badge printing',
      'Pre-registration',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$79',
    period: '/month',
    description: 'For established companies',
    features: [
      'Up to 2,000 visitors/month',
      'Everything in Basic',
      'WhatsApp notifications',
      'Advanced analytics',
      'API access',
      'Custom branding',
      'Integrations (Slack, Teams)',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [
      'Unlimited visitors',
      'Everything in Professional',
      'Dedicated account manager',
      'Custom integrations',
      'SSO authentication',
      'Advanced security features',
      'SLA guarantee',
      '24/7 phone support',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
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
              <Button
                variant={plan.popular ? 'default' : 'outline'}
                className={`w-full ${plan.popular ? 'btn-hero' : ''}`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
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