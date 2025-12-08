import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CreditCard, 
  Lock, 
  Check, 
  ArrowLeft,
  Shield,
  Zap,
  Crown,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Payment.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const planFromState = location.state?.plan || 'monthly';
  
  const [selectedPlan, setSelectedPlan] = useState(planFromState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const plans = {
    monthly: {
      price: 4.99,
      variantId: '1136851', // From LemonSqueezy Dashboard
      period: 'month',
      savings: null,
      description: 'Billed monthly'
    },
    yearly: {
      price: 49.99,
      variantId: '1136852', // From LemonSqueezy Dashboard
      period: 'year',
      savings: '17%',
      description: 'Billed annually - Save $9.89'
    }
  };

  const features = [
    'Unlimited tool usage',
    'Batch processing for all tools',
    'Advanced PDF manipulation',
    'Priority customer support',
    'Ad-free experience',
    'Early access to new features',
    'Download history & analytics',
    'Custom presets & templates'
  ];

  const handleCheckout = async () => {
    setError('');
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      
      // Call backend to create LemonSqueezy checkout
      const response = await fetch(`${API_URL}/lemonsqueezy/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          variantId: plans[selectedPlan].variantId,
          plan: selectedPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create checkout. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Redirect to LemonSqueezy checkout
      window.location.href = data.checkoutUrl;

    } catch (err) {
      console.error('Checkout error:', err);
      setError('An error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="auth-required-payment">
            <Lock size={64} />
            <h2>Login Required</h2>
            <p>Please log in to upgrade your account.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user.isPremium) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="already-premium">
            <Crown size={64} />
            <h2>You're Already Premium!</h2>
            <p>You already have an active premium subscription.</p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="payment-header">
          <h1>Upgrade to Premium</h1>
          <p>Unlock unlimited access to all features</p>
        </div>

        <div className="payment-layout">
          {/* Left Column - Plan Selection */}
          <div className="payment-form-section">
            {/* Plan Selection */}
            <div className="section-card">
              <h2>Select Plan</h2>
              <div className="plan-options">
                <label 
                  className={`plan-option ${selectedPlan === 'monthly' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value="monthly"
                    checked={selectedPlan === 'monthly'}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  />
                  <div className="plan-option-content">
                    <div className="plan-option-header">
                      <span className="plan-name">Monthly</span>
                      <span className="plan-price">
                        ${plans.monthly.price}
                        <span className="plan-period">/{plans.monthly.period}</span>
                      </span>
                    </div>
                    <p className="plan-description">{plans.monthly.description}</p>
                  </div>
                </label>

                <label 
                  className={`plan-option ${selectedPlan === 'yearly' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value="yearly"
                    checked={selectedPlan === 'yearly'}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  />
                  <div className="plan-option-content">
                    <div className="plan-option-header">
                      <span className="plan-name">Yearly</span>
                      <span className="plan-price">
                        ${plans.yearly.price}
                        <span className="plan-period">/{plans.yearly.period}</span>
                      </span>
                    </div>
                    <p className="plan-description">{plans.yearly.description}</p>
                    {plans.yearly.savings && (
                      <span className="savings-badge">Save {plans.yearly.savings}</span>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Checkout Info */}
            <div className="section-card">
              <h2>Secure Checkout</h2>
              
              {error && (
                <div className="error-message">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className="checkout-info">
                <div className="info-item">
                  <Shield size={20} />
                  <div>
                    <strong>Secure Payment Processing</strong>
                    <p>Powered by LemonSqueezy - Your payment information is encrypted and secure</p>
                  </div>
                </div>

                <div className="info-item">
                  <CreditCard size={20} />
                  <div>
                    <strong>Multiple Payment Methods</strong>
                    <p>Credit card, debit card, and more payment options available</p>
                  </div>
                </div>

                <div className="info-item">
                  <Lock size={20} />
                  <div>
                    <strong>Tax & VAT Included</strong>
                    <p>All taxes automatically calculated and included at checkout</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                className="submit-payment-btn"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner-small"></div>
                    Loading Checkout...
                  </>
                ) : (
                  <>
                    <ExternalLink size={20} />
                    Continue to Secure Checkout - ${plans[selectedPlan].price}
                  </>
                )}
              </button>

              <p className="payment-terms">
                By continuing, you agree to our Terms of Service and Privacy Policy.
                Your subscription will auto-renew until cancelled. Powered by LemonSqueezy.
              </p>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-item">
                <span>Plan</span>
                <strong>{selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Premium</strong>
              </div>

              <div className="summary-item">
                <span>Billing Cycle</span>
                <strong>{plans[selectedPlan].description}</strong>
              </div>

              {selectedPlan === 'yearly' && (
                <div className="summary-item savings">
                  <span>Savings</span>
                  <strong className="savings-text">Save {plans.yearly.savings}</strong>
                </div>
              )}

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Total Due Today</span>
                <div className="total-amount">
                  <span className="currency">$</span>
                  <span className="amount">{plans[selectedPlan].price}</span>
                </div>
              </div>

              <div className="renewal-note">
                <Zap size={14} />
                <span>Auto-renews {selectedPlan === 'monthly' ? 'monthly' : 'annually'}</span>
              </div>

              <p className="tax-note">
                + applicable taxes (calculated at checkout)
              </p>
            </div>

            <div className="features-card">
              <h3>What's Included</h3>
              <ul className="features-list">
                {features.map((feature, idx) => (
                  <li key={idx}>
                    <Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="guarantee-badge">
              <Shield size={24} />
              <div>
                <strong>30-Day Money Back Guarantee</strong>
                <p>Cancel anytime within 30 days for a full refund</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;