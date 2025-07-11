import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How does the free trial work?',
    answer: 'You get 14 days of full access to all features in our Professional plan. No credit card required to start. After the trial, you can choose to upgrade or continue with our free plan.',
  },
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing adjustments.',
  },
  {
    question: 'What happens if I exceed my visitor limit?',
    answer: 'We\'ll notify you when you\'re approaching your limit. If you exceed it, we\'ll automatically suggest upgrading to the next plan, but your service won\'t be interrupted.',
  },
  {
    question: 'Do you offer custom integrations?',
    answer: 'Yes, our Enterprise plan includes custom integrations. We can connect with your existing systems, HR software, and security platforms.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade security, including SSL encryption, regular security audits, and compliance with GDPR and other privacy regulations.',
  },
  {
    question: 'Can I use Visitify for multiple locations?',
    answer: 'Yes, starting from our Basic plan, you can manage multiple office locations from a single dashboard.',
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'We offer email support for all plans, priority support for Professional plans, and 24/7 phone support for Enterprise customers.',
  },
  {
    question: 'Do you offer training for my team?',
    answer: 'Yes, we provide onboarding sessions for Professional and Enterprise plans, plus comprehensive documentation and video tutorials for all users.',
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Visitify
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-border rounded-lg px-6"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact Support */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help.
          </p>
          <Button variant="outline">Contact Support</Button>
        </div>
      </div>
    </section>
  );
};