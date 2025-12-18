import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './PaymentSuccess.css';

function PaymentSuccess() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Refresh user data to get updated premium status
    const fetchUserData = async () => {
      try {
        await refreshUser();
        setLoading(false);
      } catch (error) {
        console.error('Error refreshing user:', error);
        setLoading(false);
      }
    };

    fetchUserData();

    // Add confetti effect (optional)
    // You can use a library like canvas-confetti here
  }, [refreshUser]);

  return (
    <div className="payment-success-page">
      <div className="container">
        <div className="success-content">
          {/* Success Icon with Animation */}
          <div className="success-icon-wrapper">
            <div className="success-icon">
              <CheckCircle size={80} />
            </div>
            <div className="success-sparkle sparkle-1">
              <Sparkles size={20} />
            </div>
            <div className="success-sparkle sparkle-2">
              <Sparkles size={16} />
            </div>
            <div className="success-sparkle sparkle-3">
              <Sparkles size={18} />
            </div>
          </div>

          {/* Main Message */}
          <h1>Welcome to LiteTools Premium!</h1>
          <p className="success-message">
            Your payment has been processed successfully.
          </p>

          {/* Premium Badge */}
          <div className="premium-badge">
            <Crown size={24} />
            <span>Premium Member</span>
          </div>

          {/* Status */}
          {loading ? (
            <div className="status-loading">
              <div className="spinner"></div>
              <p>Activating your premium account...</p>
            </div>
          ) : user?.isPremium ? (
            <div className="status-success">
              <Zap size={20} />
              <span>Your account is now premium!</span>
            </div>
          ) : (
            <div className="status-pending">
              <Shield size={20} />
              <span>Premium activation in progress (refresh in a few seconds)</span>
            </div>
          )}

          {/* What's Next Section */}
          <div className="next-steps">
            <h3>What You Get with Premium:</h3>
            <ul className="benefits-list">
              <li>
                <CheckCircle size={18} />
                <span>Unlimited access to all tools</span>
              </li>
              <li>
                <CheckCircle size={18} />
                <span>Batch processing for all tools</span>
              </li>
              <li>
                <CheckCircle size={18} />
                <span>Ad-free experience</span>
              </li>
              <li>
                <CheckCircle size={18} />
                <span>Priority customer support</span>
              </li>
              <li>
                <CheckCircle size={18} />
                <span>Early access to new features</span>
              </li>
              <li>
                <CheckCircle size={18} />
                <span>Download history & analytics</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="success-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/profile')}
            >
              <Crown size={20} />
              Go to Profile
              <ArrowRight size={20} />
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              Explore Premium Tools
            </button>
          </div>

          {/* Receipt Note */}
          <div className="receipt-note">
            <p>
              📧 A receipt has been sent to <strong>{user?.email}</strong>
            </p>
            <p className="help-text">
              Need help? <a href="mailto:support@litetools.com">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;