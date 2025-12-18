import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import './CancelSubscriptionModal.css';

function CancelSubscriptionModal({ isOpen, onClose, onConfirm, subscriptionEndDate }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleCancel = async () => {
    setLoading(true);
    try {
      await onConfirm(reason);
      onClose();
    } catch (error) {
      console.error('Cancel error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <div className="warning-icon">
            <AlertTriangle size={48} />
          </div>
          <h2>Cancel Subscription</h2>
        </div>

        <div className="modal-body">
          <p className="warning-text">
            Are you sure you want to cancel your premium subscription?
          </p>

          <div className="info-box">
            <h4>What happens when you cancel:</h4>
            <ul>
              <li>✓ You'll keep premium access until {subscriptionEndDate}</li>
              <li>✓ No more charges after the current period</li>
              <li>✗ You'll lose access to premium features after {subscriptionEndDate}</li>
              <li>✗ Your usage history will be saved but limited</li>
            </ul>
          </div>

          <div className="reason-section">
            <label htmlFor="cancel-reason">
              Why are you canceling? (Optional)
            </label>
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Help us improve by sharing your feedback..."
              rows={3}
            />
          </div>

          <div className="alternative-box">
            <h4>💡 Before you go...</h4>
            <p>
              Need help? Contact our support team at{' '}
              <a href="mailto:support@litetools.com">support@litetools.com</a>
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Keep Subscription
          </button>
          <button
            className="btn-danger"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? 'Canceling...' : 'Yes, Cancel Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelSubscriptionModal;