const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// Create a Stripe Checkout session for subscription/payment
exports.createCheckoutSession = async (req, res) => {
  try {
    const { priceId, customerEmail, successUrl, cancelUrl } = req.body;
    if (!priceId || !customerEmail || !successUrl || !cancelUrl) {
      return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    res.json({ status: 'success', url: session.url });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Handle Stripe webhook events
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder');
  } catch (err) {
    return res.status(400).json({ status: 'error', message: `Webhook Error: ${err.message}` });
  }
  // Handle event types (subscription, invoice, payment, etc.)
  switch (event.type) {
    case 'checkout.session.completed':
      // TODO: Update subscription status in DB
      break;
    case 'invoice.paid':
      // TODO: Mark invoice as paid
      break;
    case 'invoice.payment_failed':
      // TODO: Handle failed payment
      break;
    // ... handle other events as needed
    default:
      break;
  }
  res.json({ received: true });
};

// List invoices for a customer
exports.getInvoices = async (req, res) => {
  try {
    const { customerId } = req.query;
    if (!customerId) {
      return res.status(400).json({ status: 'error', message: 'Missing customerId' });
    }
    const invoices = await stripe.invoices.list({ customer: customerId, limit: 20 });
    res.json({ status: 'success', data: invoices.data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}; 