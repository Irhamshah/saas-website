import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Activity, 
  Calendar, 
  TrendingUp, 
  FileText,
  Image,
  Code,
  Lock,
  Zap,
  Clock
} from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="auth-required">
            <div className="auth-required-icon">
              <Lock size={48} />
            </div>
            <h2>Authentication Required</h2>
            <p>Please log in to access your dashboard and view your account details.</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/')}
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      icon: <Activity />, 
      label: 'Tools Used', 
      value: '24',
      color: '#2D5BFF'
    },
    { 
      icon: <Calendar />, 
      label: 'Days Active', 
      value: '12',
      color: '#10B981'
    },
    { 
      icon: <TrendingUp />, 
      label: 'Files Processed', 
      value: '156',
      color: '#F59E0B'
    }
  ];

  const recentActivity = [
    {
      icon: <FileText />,
      title: 'PDF Merge',
      time: '2 hours ago'
    },
    {
      icon: <Image />,
      title: 'Image Compressor',
      time: '5 hours ago'
    },
    {
      icon: <Code />,
      title: 'JSON Formatter',
      time: '1 day ago'
    }
  ];

  const quickActions = [
    { icon: <FileText />, label: 'Text Tools', path: '/text-tools' },
    { icon: <Image />, label: 'Image Tools', path: '/image-tools' },
    { icon: <Code />, label: 'Developer', path: '/developer-tools' }
  ];

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-title-section">
            <h1>Dashboard</h1>
            <p>Welcome back, {user.name || user.email}!</p>
          </div>
          {user.isPremium && (
            <div className="premium-indicator">
              <Crown size={20} />
              <span>Premium Member</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
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
          {/* Account Information */}
          <div className="dashboard-section">
            <h2>Account Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Plan</span>
                <span className="info-value">
                  {user.isPremium ? (
                    <>
                      <Crown size={16} color="#FFD700" />
                      Premium
                    </>
                  ) : (
                    'Free'
                  )}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-section">
            <h2>Recent Activity</h2>
            {recentActivity.length > 0 ? (
              <div className="activity-list">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="activity-item">
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-time">
                        <Clock size={12} /> {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Activity size={32} />
                </div>
                <h3>No activity yet</h3>
                <p>Start using tools to see your activity here</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  className="quick-action-btn"
                  onClick={() => navigate(action.path)}
                >
                  <div className="quick-action-icon">{action.icon}</div>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upgrade Section (if not premium) */}
          {!user.isPremium && (
            <div className="dashboard-section upgrade-section">
              <h2>Upgrade to Premium</h2>
              <p>Unlock unlimited access to all tools and features with no restrictions.</p>
              <ul className="upgrade-features">
                <li>Remove all usage limits</li>
                <li>Batch processing for all tools</li>
                <li>Advanced PDF manipulation</li>
                <li>Priority customer support</li>
                <li>Ad-free experience</li>
                <li>Early access to new features</li>
              </ul>
              <button 
                className="upgrade-button"
                onClick={() => navigate('/pricing')}
              >
                <Zap size={20} />
                Upgrade Now - $4.99/month
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;