import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Calendar, Shield, CreditCard, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import './Profile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    setFormData({
      name: user.name || '',
      email: user.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    if (user.isPremium) {
      fetchSubscriptionData();
    }
  }, [user, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchSubscriptionData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/subscription/info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptionData(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        {
          name: formData.name,
          email: formData.email
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      updateUser(response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Password changed successfully!');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/subscription/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      updateUser({ isPremium: false });
      toast.success('Subscription cancelled successfully');
      setSubscriptionData(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToPremium = () => {
    navigate('/pricing');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h1>{user.name || 'User'}</h1>
            <p>{user.email}</p>
            {user.isPremium && (
              <span className="premium-badge-large">
                ⭐ Premium Member
              </span>
            )}
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            Profile Settings
          </button>
          <button
            className={`tab-button ${activeTab === 'subscription' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscription')}
          >
            <CreditCard size={20} />
            Subscription
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Profile Information</h2>
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">
                    <User size={18} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <Mail size={18} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>

              <div className="divider" />

              <h2>Change Password</h2>
              <form onSubmit={handleChangePassword} className="profile-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">
                    <Shield size={18} />
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">
                    <Shield size={18} />
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    minLength={6}
                    disabled={loading}
                  />
                  <small>Minimum 6 characters</small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <Shield size={18} />
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    minLength={6}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Change Password'}
                </button>
              </form>

              <div className="divider" />

              <div className="danger-zone">
                <h2>Account Information</h2>
                <div className="account-stats">
                  <div className="stat-card">
                    <Calendar size={24} />
                    <div>
                      <p className="stat-label">Member Since</p>
                      <p className="stat-value">
                        {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <Shield size={24} />
                    <div>
                      <p className="stat-label">Account Type</p>
                      <p className="stat-value">
                        {user.isPremium ? 'Premium' : 'Free'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="subscription-section">
              <h2>Subscription Management</h2>
              
              {user.isPremium ? (
                <div className="subscription-active">
                  <div className="subscription-status">
                    <div className="status-icon success">
                      <Check size={32} />
                    </div>
                    <div>
                      <h3>Premium Active</h3>
                      <p>You have unlimited access to all tools</p>
                    </div>
                  </div>

                  <div className="subscription-details">
                    <h3>Plan Details</h3>
                    <div className="detail-row">
                      <span>Plan</span>
                      <strong>Premium Monthly</strong>
                    </div>
                    <div className="detail-row">
                      <span>Price</span>
                      <strong>$4.99/month</strong>
                    </div>
                    {subscriptionData?.nextBillingDate && (
                      <div className="detail-row">
                        <span>Next Billing</span>
                        <strong>
                          {new Date(subscriptionData.nextBillingDate).toLocaleDateString()}
                        </strong>
                      </div>
                    )}
                  </div>

                  <div className="premium-benefits">
                    <h3>Premium Benefits</h3>
                    <ul>
                      <li><Check size={18} /> Unlimited tool usage</li>
                      <li><Check size={18} /> No monthly limits</li>
                      <li><Check size={18} /> Access to all premium tools</li>
                      <li><Check size={18} /> Priority support</li>
                      <li><Check size={18} /> Early access to new features</li>
                    </ul>
                  </div>

                  <button
                    className="btn-danger"
                    onClick={handleCancelSubscription}
                    disabled={loading}
                  >
                    {loading ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                  <p className="cancel-note">
                    Your subscription will remain active until the end of the current billing period.
                  </p>
                </div>
              ) : (
                <div className="subscription-inactive">
                  <div className="subscription-status">
                    <div className="status-icon warning">
                      <AlertCircle size={32} />
                    </div>
                    <div>
                      <h3>Free Plan</h3>
                      <p>Upgrade to Premium for unlimited access</p>
                    </div>
                  </div>

                  <div className="free-limitations">
                    <h3>Current Limitations</h3>
                    <ul>
                      <li>3 uses per tool per month</li>
                      <li>Limited access to premium tools</li>
                      <li>Standard support</li>
                    </ul>
                  </div>

                  <div className="premium-benefits">
                    <h3>Upgrade to Premium</h3>
                    <ul>
                      <li><Check size={18} /> Unlimited tool usage</li>
                      <li><Check size={18} /> No monthly limits</li>
                      <li><Check size={18} /> Access to all premium tools</li>
                      <li><Check size={18} /> Priority support</li>
                      <li><Check size={18} /> Early access to new features</li>
                    </ul>
                  </div>

                  <div className="upgrade-pricing">
                    <div className="price">
                      <span className="currency">$</span>
                      <span className="amount">4.99</span>
                      <span className="period">/month</span>
                    </div>
                    <button
                      className="btn-primary btn-large"
                      onClick={handleUpgradeToPremium}
                    >
                      Upgrade to Premium
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;