// Backend LemonSqueezy Routes (routes/lemonsqueezy.js)
// PUT THIS AT THE VERY TOP (BEFORE ANY OTHER IMPORTS!)
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import crypto from 'crypto';
import User from '../models/user.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const LEMONSQUEEZY_API_KEY = process.env.LEMONSQUEEZY_API_KEY;
const LEMONSQUEEZY_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID;
const LEMONSQUEEZY_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

// 🔍 DEBUG: Log configuration when routes load
console.log('\n🍋 ═══════════════════════════════════════════════════════');
console.log('🍋 LEMONSQUEEZY ROUTES LOADED');
console.log('🍋 ═══════════════════════════════════════════════════════');
console.log('📋 Configuration Check:');
console.log('   API Key:', LEMONSQUEEZY_API_KEY ? `✅ Set (${LEMONSQUEEZY_API_KEY.length} chars)` : '❌ UNDEFINED');
if (LEMONSQUEEZY_API_KEY) {
  console.log('   API Key Preview:', LEMONSQUEEZY_API_KEY.substring(0, 30) + '...');
}
console.log('   Store ID:', LEMONSQUEEZY_STORE_ID ? `✅ Set (${LEMONSQUEEZY_STORE_ID})` : '❌ UNDEFINED');
console.log('   Webhook Secret:', LEMONSQUEEZY_WEBHOOK_SECRET ? '✅ Set' : '❌ UNDEFINED');
console.log('🍋 ═══════════════════════════════════════════════════════\n');

/**
 * POST /api/lemonsqueezy/create-checkout
 * Create a LemonSqueezy checkout URL
 */
router.post('/create-checkout', protect, async (req, res) => {
  console.log('\n🛒 ═══════════════════════════════════════════════════════');
  console.log('🛒 CREATE CHECKOUT REQUEST RECEIVED');
  console.log('🛒 ═══════════════════════════════════════════════════════');
  
  try {
    const { variantId, plan } = req.body;
    const user = req.user; // Already the full user document from protect middleware

    console.log('📋 Request Details:');
    console.log('   User Email:', user.email);
    console.log('   Plan:', plan);
    console.log('   Variant ID:', variantId);
    console.log('   Store ID:', LEMONSQUEEZY_STORE_ID);

    // Verify configuration
    if (!LEMONSQUEEZY_API_KEY) {
      console.error('❌ ERROR: LEMONSQUEEZY_API_KEY is undefined!');
      console.error('   This means dotenv is not loaded or .env is missing the key');
      return res.status(500).json({ error: 'Server configuration error: API key not set' });
    }

    if (!LEMONSQUEEZY_STORE_ID) {
      console.error('❌ ERROR: LEMONSQUEEZY_STORE_ID is undefined!');
      return res.status(500).json({ error: 'Server configuration error: Store ID not set' });
    }

    console.log('✅ Configuration verified');

    // Prepare request body
    const requestBody = {
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: user.email,
            name: user.name || user.email.split('@')[0],
            custom: {
              user_id: user._id.toString(),
              plan: plan,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: LEMONSQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: variantId,
            },
          },
        },
      },
    };

    console.log('📡 Calling LemonSqueezy API...');
    console.log('   Endpoint: https://api.lemonsqueezy.com/v1/checkouts');
    console.log('   Method: POST');
    console.log('   Auth: Bearer ' + LEMONSQUEEZY_API_KEY.substring(0, 20) + '...');

    // Create checkout with LemonSqueezy API
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log('📥 LemonSqueezy Response:');
    console.log('   Status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.error('❌ LemonSqueezy API Error:');
      console.error('   Status:', response.status);
      console.error('   Response:', JSON.stringify(data, null, 2));
      
      if (data.errors && data.errors[0]) {
        const error = data.errors[0];
        console.error('\n⚠️  Error Details:');
        console.error('   Title:', error.title);
        console.error('   Status:', error.status);
        console.error('   Detail:', error.detail);
        
        if (error.detail === 'Unauthenticated.') {
          console.error('\n🔥 AUTHENTICATION FAILED!');
          console.error('   Your API key is being sent but LemonSqueezy rejected it.');
          console.error('   This usually means:');
          console.error('   1. The API key is invalid/expired');
          console.error('   2. The API key was deleted from the dashboard');
          console.error('   3. The API key has the wrong permissions');
          console.error('\n   Steps to fix:');
          console.error('   1. Go to https://app.lemonsqueezy.com/settings/api');
          console.error('   2. DELETE the old API key');
          console.error('   3. CREATE a new API key');
          console.error('   4. COPY the entire new key (500+ characters)');
          console.error('   5. UPDATE LEMONSQUEEZY_API_KEY in your .env');
          console.error('   6. RESTART your server');
        }
      }
      
      console.log('🛒 ═══════════════════════════════════════════════════════\n');
      return res.status(500).json({ 
        error: 'Failed to create checkout',
        details: data.errors || data,
      });
    }

    console.log('✅ Checkout created successfully!');
    console.log('   Checkout URL:', data.data.attributes.url);
    console.log('🛒 ═══════════════════════════════════════════════════════\n');

    // Return checkout URL
    res.json({
      success: true,
      checkoutUrl: data.data.attributes.url,
    });

  } catch (error) {
    console.error('💥 Unexpected Error:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    console.log('🛒 ═══════════════════════════════════════════════════════\n');
    res.status(500).json({ error: 'Failed to create checkout' });
  }
});

/**
 * POST /api/lemonsqueezy/webhooks
 * Handle LemonSqueezy webhooks
 */
router.post('/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-signature'];
    const rawBody = req.body.toString('utf8');
    
    const hmac = crypto.createHmac('sha256', LEMONSQUEEZY_WEBHOOK_SECRET);
    const digest = hmac.update(rawBody).digest('hex');

    if (signature !== digest) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse the webhook data
    const event = JSON.parse(rawBody);
    const eventName = event.meta.event_name;
    const eventData = event.data;

    console.log(`Received LemonSqueezy webhook: ${eventName}`);

    // Handle different event types
    switch (eventName) {
      case 'subscription_created':
        await handleSubscriptionCreated(eventData);
        break;

      case 'subscription_updated':
        await handleSubscriptionUpdated(eventData);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(eventData);
        break;

      case 'subscription_resumed':
        await handleSubscriptionResumed(eventData);
        break;

      case 'subscription_expired':
        await handleSubscriptionExpired(eventData);
        break;

      case 'subscription_payment_success':
        await handlePaymentSuccess(eventData);
        break;

      case 'subscription_payment_failed':
        await handlePaymentFailed(eventData);
        break;

      default:
        console.log(`Unhandled event type: ${eventName}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

/**
 * POST /api/lemonsqueezy/cancel-subscription
 * Cancel a subscription
 */
router.post('/cancel-subscription', protect, async (req, res) => {
  try {
    const user = req.user; // Already the full user document

    if (!user || !user.subscriptionId) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel subscription via LemonSqueezy API
    const response = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${user.subscriptionId}`,
      {
        method: 'PATCH',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'Authorization': `Bearer ${LEMONSQUEEZY_API_KEY}`,
        },
        body: JSON.stringify({
          data: {
            type: 'subscriptions',
            id: user.subscriptionId,
            attributes: {
              cancelled: true,
            },
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Cancel subscription error:', data);
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }

    // Update user
    user.subscriptionStatus = 'cancelled';
    await user.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * GET /api/lemonsqueezy/customer-portal
 * Get customer portal URL
 */
router.get('/customer-portal', protect, async (req, res) => {
  try {
    const user = req.user; // Already the full user document

    if (!user || !user.customerId) {
      return res.status(404).json({ error: 'No customer account found' });
    }

    // Get customer portal URL
    const portalUrl = `https://app.lemonsqueezy.com/my-orders`;

    res.json({
      success: true,
      portalUrl: portalUrl,
    });

  } catch (error) {
    console.error('Get customer portal error:', error);
    res.status(500).json({ error: 'Failed to get customer portal' });
  }
});

// Webhook event handlers
async function handleSubscriptionCreated(data) {
  try {
    const userId = data.attributes.custom_data?.user_id;
    if (!userId) {
      console.error('No user_id in subscription data');
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return;
    }

    user.isPremium = true;
    user.subscriptionId = data.id;
    user.customerId = data.attributes.customer_id.toString();
    user.subscriptionStatus = data.attributes.status;
    user.subscriptionEndDate = new Date(data.attributes.renews_at);
    await user.save();

    console.log(`Subscription created for user: ${user.email}`);
  } catch (error) {
    console.error('handleSubscriptionCreated error:', error);
  }
}

async function handleSubscriptionUpdated(data) {
  try {
    const user = await User.findOne({ subscriptionId: data.id });
    if (!user) {
      console.error('User not found for subscription:', data.id);
      return;
    }

    user.subscriptionStatus = data.attributes.status;
    user.subscriptionEndDate = new Date(data.attributes.renews_at);
    user.isPremium = data.attributes.status === 'active';
    await user.save();

    console.log(`Subscription updated for user: ${user.email}`);
  } catch (error) {
    console.error('handleSubscriptionUpdated error:', error);
  }
}

async function handleSubscriptionCancelled(data) {
  try {
    const user = await User.findOne({ subscriptionId: data.id });
    if (!user) return;

    user.subscriptionStatus = 'cancelled';
    user.subscriptionEndDate = new Date(data.attributes.ends_at);
    // Keep isPremium true until ends_at date
    await user.save();

    console.log(`Subscription cancelled for user: ${user.email}`);
  } catch (error) {
    console.error('handleSubscriptionCancelled error:', error);
  }
}

async function handleSubscriptionResumed(data) {
  try {
    const user = await User.findOne({ subscriptionId: data.id });
    if (!user) return;

    user.subscriptionStatus = 'active';
    user.isPremium = true;
    user.subscriptionEndDate = new Date(data.attributes.renews_at);
    await user.save();

    console.log(`Subscription resumed for user: ${user.email}`);
  } catch (error) {
    console.error('handleSubscriptionResumed error:', error);
  }
}

async function handleSubscriptionExpired(data) {
  try {
    const user = await User.findOne({ subscriptionId: data.id });
    if (!user) return;

    user.isPremium = false;
    user.subscriptionStatus = 'expired';
    await user.save();

    console.log(`Subscription expired for user: ${user.email}`);
  } catch (error) {
    console.error('handleSubscriptionExpired error:', error);
  }
}

async function handlePaymentSuccess(data) {
  try {
    const user = await User.findOne({ subscriptionId: data.id });
    if (!user) return;

    user.subscriptionEndDate = new Date(data.attributes.renews_at);
    user.isPremium = true;
    user.subscriptionStatus = 'active';
    await user.save();

    console.log(`Payment succeeded for user: ${user.email}`);
  } catch (error) {
    console.error('handlePaymentSuccess error:', error);
  }
}

async function handlePaymentFailed(data) {
  try {
    const user = await User.findOne({ subscriptionId: data.id });
    if (!user) return;

    user.subscriptionStatus = 'past_due';
    await user.save();

    console.log(`Payment failed for user: ${user.email}`);
  } catch (error) {
    console.error('handlePaymentFailed error:', error);
  }
}

export default router;