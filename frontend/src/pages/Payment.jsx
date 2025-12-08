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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Payment.css';

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Get plan from navigation state or default to monthly
  const planFromState = location.state?.plan || 'monthly';
  
  const [selectedPlan, setSelectedPlan] = useState(planFromState);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    country: 'US',
    zipCode: ''
  });

  const plans = {
    monthly: {
      price: 4.99,
      period: 'month',
      savings: null,
      description: 'Billed monthly'
    },
    yearly: {
      price: 49.99,
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

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/[^\d]/g, '');
    value = value.substring(0, 16);
    value = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardDetails({ ...cardDetails, cardNumber: value });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/[^\d]/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardDetails({ ...cardDetails, expiryDate: value });
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    value = value.substring(0, 4);
    setCardDetails({ ...cardDetails, cvv: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Here you would integrate with your payment processor (Stripe, PayPal, etc.)
      console.log('Processing payment...', {
        plan: selectedPlan,
        amount: plans[selectedPlan].price,
        paymentMethod,
        cardDetails
      });

      // Simulate success
      setIsProcessing(false);
      
      // Navigate to success page or dashboard
      navigate('/payment-success', { 
        state: { 
          plan: selectedPlan, 
          amount: plans[selectedPlan].price 
        } 
      });
    }, 2000);
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
          {/* Left Column - Payment Form */}
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

            {/* Payment Method */}
            <div className="section-card">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <button
                  className={`payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={20} />
                  <span>Credit/Debit Card</span>
                </button>
              </div>
            </div>

            {/* Card Details Form */}
            <form onSubmit={handleSubmit} className="section-card">
              <h2>Card Details</h2>
              
              {error && (
                <div className="error-message">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>
                    <CreditCard size={16} />
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={handleCardNumberChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.cardName}
                    onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={handleExpiryChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Lock size={14} />
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={handleCvvChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <select
                    value={cardDetails.country}
                    onChange={(e) => setCardDetails({ ...cardDetails, country: e.target.value })}
                    required
                  >
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="SG">Singapore</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>ZIP/Postal Code</label>
                  <input
                    type="text"
                    placeholder="12345"
                    value={cardDetails.zipCode}
                    onChange={(e) => setCardDetails({ ...cardDetails, zipCode: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="security-note">
                <Shield size={16} />
                <span>Your payment information is secure and encrypted</span>
              </div>

              <button 
                type="submit" 
                className="submit-payment-btn"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner-small"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    Pay ${plans[selectedPlan].price} - Complete Purchase
                  </>
                )}
              </button>

              <p className="payment-terms">
                By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                Your subscription will auto-renew until cancelled.
              </p>
            </form>
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