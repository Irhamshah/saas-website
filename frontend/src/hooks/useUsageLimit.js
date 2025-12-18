import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Custom hook for tracking usage limits
 * @param {string} toolId - Unique identifier for the tool (e.g., 'pdf-merge', 'image-compress')
 * @param {number} limit - Maximum uses per month (default: 3)
 * @returns {object} { usageCount, usageRemaining, usagePercentage, canUse, incrementUsage, resetError }
 */
export function useUsageLimit(toolId, limit = 3) {
  const { user } = useAuth();
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUsageLimit();
  }, [toolId]);

  const checkUsageLimit = async () => {
    setLoading(true);
    
    // Get usage from localStorage (client-side tracking)
    const currentMonth = new Date().getMonth();
    const storageKey = `usage_${currentMonth}`;
    const usage = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const localCount = usage[toolId] || 0;
    setUsageCount(localCount);

    // If user is logged in, sync with server
    if (user) {
      try {
        const response = await axios.get(`${API_URL}/analytics/usage/${toolId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const serverCount = response.data.count || 0;
        
        // Use the higher count to prevent bypassing
        const actualCount = Math.max(localCount, serverCount);
        setUsageCount(actualCount);
        
        // Update localStorage to match server
        usage[toolId] = actualCount;
        localStorage.setItem(storageKey, JSON.stringify(usage));
      } catch (error) {
        console.error('Error fetching usage:', error);
        // Fall back to local count
      }
    }
    
    setLoading(false);
  };

  const incrementUsage = async () => {
    // Update localStorage
    const currentMonth = new Date().getMonth();
    const storageKey = `usage_${currentMonth}`;
    const usage = JSON.parse(localStorage.getItem(storageKey) || '{}');
    usage[toolId] = (usage[toolId] || 0) + 1;
    localStorage.setItem(storageKey, JSON.stringify(usage));
    setUsageCount(usage[toolId]);

    // If user is logged in, track on server
    if (user) {
      try {
        await axios.post(
          `${API_URL}/analytics/track`,
          { toolId: toolId },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
      } catch (error) {
        console.error('Error tracking usage:', error);
      }
    }
  };

  const showLimitError = () => {
    toast.error(
      `Free limit reached! You've used this tool ${limit} times this month. Upgrade to Premium for unlimited access.`,
      { duration: 5000 }
    );
  };

  // Calculate derived values
  const isPremium = user?.isPremium || false;
  const usageRemaining = Math.max(0, limit - usageCount);
  const usagePercentage = (usageCount / limit) * 100;
  const canUse = isPremium || usageCount < limit;

  return {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    loading,
    incrementUsage,
    showLimitError,
    checkUsageLimit, // Expose for manual refresh
  };
}