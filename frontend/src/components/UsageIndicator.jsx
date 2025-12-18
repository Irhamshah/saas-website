import React from 'react';
import { AlertCircle } from 'lucide-react';
import './UsageIndicator.css';

/**
 * Reusable Usage Indicator Component
 * Shows usage limits for free users
 */
function UsageIndicator({ 
  usageCount, 
  usageRemaining, 
  usagePercentage, 
  isPremium 
}) {
  // Don't show for premium users
  if (isPremium) {
    return null;
  }

  const limitReached = usageRemaining <= 0;

  return (
    <div className={`usage-indicator ${limitReached ? 'limit-reached' : ''}`}>
      <div className="usage-header">
        <AlertCircle size={18} />
        <span>Free Monthly Limit: {usageRemaining} uses remaining</span>
      </div>
      <div className="usage-bar">
        <div
          className="usage-fill"
          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
        />
      </div>
      {limitReached && (
        <p className="usage-text">
          Upgrade to Premium for unlimited access!
        </p>
      )}
    </div>
  );
}

export default UsageIndicator;