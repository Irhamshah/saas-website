import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Crown, Activity, Calendar, TrendingUp } from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="auth-required">
            <h2>Please log in to view your dashboard</h2>
            <button className="btn-primary">Log In</button>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { icon: <Activity />, label: 'Tools Used', value: '24' },
    { icon: <Calendar />, label: 'Days Active', value: '12' },
    { icon: <TrendingUp />, label: 'Files Processed', value: '156' }
  ];

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, {user.name || user.email}</p>
          </div>
          {user.isPremium && (
            <div className="premium-indicator">
              <Crown size={20} />
              <span>Premium Member</span>
            </div>
          )}
        </div>

        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="stat-card">
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h2>Account Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Plan</span>
                <span className="info-value">{user.isPremium ? 'Premium' : 'Free'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {!user.isPremium && (
            <div className="dashboard-section upgrade-section">
              <h2>Upgrade to Premium</h2>
              <p>Unlock all features and remove ads</p>
              <ul className="upgrade-features">
                <li>✓ Remove all ads</li>
                <li>✓ Batch processing</li>
                <li>✓ Advanced PDF tools</li>
                <li>✓ Priority support</li>
              </ul>
              <button className="btn-secondary">Upgrade Now - $4.99/month</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
