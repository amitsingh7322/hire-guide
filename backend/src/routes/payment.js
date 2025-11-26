const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/auth');

// Create payment intent
router.post('/create-intent', authenticate, paymentController.createPaymentIntent);

// Webhook (no auth - verified by Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Get payment status
router.get('/status/:paymentIntentId', authenticate, paymentController.getPaymentStatus);

// Refund payment
router.post('/refund', authenticate, paymentController.refundPayment);

module.exports = router;
