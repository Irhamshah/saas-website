import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');

// @route   POST /api/subscription/create
// @desc    Create a subscription
// @access  Private
router.post('/create', protect, async (req, res) => {
  try {
    const { paymentMethodId } = req.body;
    const user = await User.findById(req.user._id);

    // Create or retrieve Stripe customer
    let customerId = user.customerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
      customerId = customer.id;
      user.customerId = customerId;
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: process.env.STRIPE_PRICE_ID || 'price_premium_monthly'
        }
      ],
      expand: ['latest_invoice.payment_intent']
    });

    // Update user
    user.isPremium = true;
    user.subscriptionId = subscription.id;
    user.subscriptionStatus = subscription.status;
    user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
    await user.save();

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      user: user
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/subscription/cancel
// @desc    Cancel a subscription
// @access  Private
router.post('/cancel', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.subscriptionId) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(
      user.subscriptionId,
      { cancel_at_period_end: true }
    );

    user.subscriptionStatus = 'canceled';
    await user.save();

    res.json({
      message: 'Subscription will be canceled at the end of the billing period',
      subscription
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/subscription/status
// @desc    Get subscription status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.subscriptionId) {
      return res.json({
        isPremium: false,
        status: null
      });
    }

    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);

    res.json({
      isPremium: user.isPremium,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/subscription/webhook
// @desc    Handle Stripe webhooks
// @access  Public (but verified)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
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
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      const user = await User.findOne({ subscriptionId: subscription.id });
      
      if (user) {
        user.subscriptionStatus = subscription.status;
        user.isPremium = subscription.status === 'active';
        user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
        await user.save();
      }
      break;

    case 'invoice.payment_failed':
      const invoice = event.data.object;
      const failedUser = await User.findOne({ customerId: invoice.customer });
      
      if (failedUser) {
        failedUser.subscriptionStatus = 'past_due';
        await failedUser.save();
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default router;
