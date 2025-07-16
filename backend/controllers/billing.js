const razorpay = require('../utils/razorpay');
const Company = require('../models/Company');

// Create a Razorpay subscription
exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId, customerEmail } = req.body;
    if (!planId || !customerEmail) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    // Dummy mapping: all planIds map to the same dummy Razorpay plan_id
    const razorpayPlanId = 'plan_DUMMY123';

    // Create customer (for demo, always create new)
    const customer = await razorpay.customers.create({ email: customerEmail });

    // Create subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: 12,
      customer_id: customer.id,
    });

    res.json({ status: 'success', subscriptionId: subscription.id, short_url: subscription.short_url });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Fetch invoices for a customer
exports.getInvoices = async (req, res) => {
  try {
    const { customerId } = req.query;
    if (!customerId) {
      return res.status(400).json({ status: 'error', message: 'Missing customerId' });
    }
    const invoices = await razorpay.invoices.all({ customer_id: customerId });
    res.json({ status: 'success', data: invoices.items });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Webhook handler (for subscription/invoice events)
exports.handleWebhook = async (req, res) => {
  // Implement Razorpay webhook signature verification and event handling here
  res.json({ received: true });
}; 