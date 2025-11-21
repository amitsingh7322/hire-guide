const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../models/db');

// Create payment intent for booking
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId, bookingType } = req.body; // 'guide' or 'hotel'

    let booking;
    let amount;

    if (bookingType === 'guide') {
      const result = await db.query(
        'SELECT * FROM bookings WHERE id = $1 AND tourist_id = $2',
        [bookingId, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      booking = result.rows;
      amount = Math.round(booking.total_amount * 100); // Convert to paise
    } else if (bookingType === 'hotel') {
      const result = await db.query(
        'SELECT * FROM hotel_bookings WHERE id = $1 AND tourist_id = $2',
        [bookingId, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Hotel booking not found' });
      }

      booking = result.rows;
      amount = Math.round(booking.total_amount * 100);
    } else {
      return res.status(400).json({ error: 'Invalid booking type' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      metadata: {
        bookingId,
        bookingType,
        userId: req.user.id,
      },
      description: `TourSpot Connect - ${bookingType === 'guide' ? 'Guide' : 'Hotel'} Booking`,
    });

    // Update booking with payment intent ID
    const table = bookingType === 'guide' ? 'bookings' : 'hotel_bookings';
    await db.query(
      `UPDATE ${table} SET payment_intent_id = $1 WHERE id = $2`,
      [paymentIntent.id, bookingId]
    );

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount / 100,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

// Stripe webhook handler
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  try {
    const { bookingId, bookingType } = paymentIntent.metadata;

    const table = bookingType === 'guide' ? 'bookings' : 'hotel_bookings';

    await db.query(
      `UPDATE ${table} 
       SET payment_status = 'paid', 
           status = 'confirmed',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [bookingId]
    );

    console.log(`✅ Payment successful for ${bookingType} booking ${bookingId}`);

    // TODO: Send confirmation email to tourist
    // TODO: Send notification to guide/hotel owner
  } catch (error) {
    console.error('Handle payment success error:', error);
  }
}

// Handle payment failure
async function handlePaymentFailure(paymentIntent) {
  try {
    const { bookingId, bookingType } = paymentIntent.metadata;

    const table = bookingType === 'guide' ? 'bookings' : 'hotel_bookings';

    await db.query(
      `UPDATE ${table} 
       SET payment_status = 'failed'
       WHERE id = $1`,
      [bookingId]
    );

    console.log(`❌ Payment failed for ${bookingType} booking ${bookingId}`);
  } catch (error) {
    console.error('Handle payment failure error:', error);
  }
}

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};

// Refund payment
exports.refundPayment = async (req, res) => {
  try {
    const { bookingId, bookingType, reason } = req.body;

    const table = bookingType === 'guide' ? 'bookings' : 'hotel_bookings';

    // Get booking
    const result = await db.query(
      `SELECT payment_intent_id, total_amount FROM ${table} WHERE id = $1`,
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows;

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: booking.payment_intent_id,
      reason: 'requested_by_customer',
      metadata: { reason },
    });

    // Update booking status
    await db.query(
      `UPDATE ${table} 
       SET status = 'refunded', payment_status = 'refunded'
       WHERE id = $1`,
      [bookingId]
    );

    res.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
};

module.exports = exports;
