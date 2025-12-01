import React from 'react';
import { Check, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './PricingPage.css';

function PricingPage() {
  const { user } = useAuth();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Access to all basic tools',
        'Client-side processing',
        'No sign-up required',
        'Ad-supported'
      ],
      cta: 'Current Plan',
      current: !user?.isPremium
    },
    {
      name: 'Premium',
      price: '$4.99',
      period: 'per month',
      popular: true,
      features: [
        'All free features',
        'Remove all ads',
        'Batch processing',
        'Advanced PDF tools',
        'Invoice & receipt templates',
        'Export to multiple formats',
        'Unlimited usage',
        'Early access to new tools'
      ],
      cta: user?.isPremium ? 'Current Plan' : 'Upgrade Now',
      current: user?.isPremium
    }
  ];

  return (
    <div className="pricing-page">
      <div className="container">
        <div className="pricing-header">
          <h1>Choose Your <span className="gradient-text">Plan</span></h1>
          <p>Start free, upgrade when you need more power</p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, idx) => (
            <div key={idx} className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.current ? 'current' : ''}`}>
              {plan.popular && (
                <div className="popular-badge">
                  <Zap size={14} />
                  <span>MOST POPULAR</span>
                </div>
              )}
              
              <h2>{plan.name}</h2>
              <div className="price">
                <span className="amount">{plan.price}</span>
                <span className="period">/{plan.period}</span>
              </div>

              <ul className="features">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <Check size={18} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`btn-${plan.popular ? 'primary' : 'secondary'} cta-btn`}
                disabled={plan.current}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="pricing-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Can I cancel anytime?</h3>
              <p>Yes, you can cancel your subscription at any time. No questions asked.</p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards, debit cards, and digital wallets via Stripe.</p>
            </div>
            <div className="faq-item">
              <h3>Is there a free trial?</h3>
              <p>You can use all basic tools for free forever. Premium features require a subscription.</p>
            </div>
            <div className="faq-item">
              <h3>Do I need to install anything?</h3>
              <p>No! All tools run directly in your browser. Your data never leaves your device for basic tools.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
