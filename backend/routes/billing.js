const express = require('express');
const { createCheckoutSession, handleWebhook, getInvoices } = require('../controllers/billing');
const router = express.Router();

router.post('/checkout', createCheckoutSession);
router.post('/webhook', handleWebhook);
router.get('/invoices', getInvoices);

module.exports = router; 