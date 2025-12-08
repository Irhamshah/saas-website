import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Zap, User, LogOut, Settings, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './Authmodal';
import './Navigation.css';

function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('🧭 Navigation: User state changed:', user);
  }, [user]);

  const openAuthModal = (mode) => {
    console.log('🔓 Opening auth modal:', mode);
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    console.log('🚪 Logging out from Navigation');
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  console.log('🧭 Navigation rendering. User:', user ? user.email : 'null', 'Loading:', loading);

  if (loading) {
    return (
      <nav className="navigation">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <Zap size={28} />
            <span>LiteTools</span>
          </Link>
          <div className="nav-actions">
            <div className="loading-placeholder">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="navigation">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <Zap size={28} />
            <span>LiteTools</span>
          </Link>

          <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              Tools
            </Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            {user && (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  Profile
                </Link>
              </>
            )}
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <div className="user-menu-wrapper">
                  <button
                    className="user-menu-button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="user-avatar">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="user-name">{user.name || user.email}</span>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="user-menu-overlay"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="user-menu-dropdown">
                        <div className="user-menu-header">
                          <div className="user-avatar-large">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-info">
                            <p className="user-menu-name">{user.name || 'User'}</p>
                            <p className="user-menu-email">{user.email}</p>
                            {user.isPremium && (
                              <span className="premium-badge">
                                ⭐ Premium
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="user-menu-divider" />
                        
                        <Link
                          to="/profile"
                          className="user-menu-item"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings size={18} />
                          Manage Profile
                        </Link>
                        
                        <Link
                          to="/profile?tab=subscription"
                          className="user-menu-item"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <CreditCard size={18} />
                          {user.isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
                        </Link>
                        
                        <div className="user-menu-divider" />
                        
                        <button
                          className="user-menu-item logout-item"
                          onClick={handleLogout}
                        >
                          <LogOut size={18} />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  className="btn-secondary"
                  onClick={() => openAuthModal('login')}
                >
                  Sign In
                </button>
                <button
                  className="btn-primary"
                  onClick={() => openAuthModal('register')}
                >
                  Sign Up
                </button>
              </>
            )}

            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-links">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                Tools
              </Link>
              <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>
                Pricing
              </Link>
              {user && (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    Profile
                  </Link>
                </>
              )}
            </div>
            
            {user ? (
              <div className="mobile-menu-user">
                <div className="mobile-user-info">
                  <div className="user-avatar-large">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="mobile-user-name">{user.name || 'User'}</p>
                    <p className="mobile-user-email">{user.email}</p>
                    {user.isPremium && (
                      <span className="premium-badge">
                        ⭐ Premium
                      </span>
                    )}
                  </div>
                </div>
                
                <Link
                  to="/profile"
                  className="btn-secondary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  Manage Profile
                </Link>
                
                <button
                  className="btn-secondary"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mobile-menu-actions">
                <button
                  className="btn-secondary"
                  onClick={() => openAuthModal('login')}
                >
                  Sign In
                </button>
                <button
                  className="btn-primary"
                  onClick={() => openAuthModal('register')}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          console.log('🔒 Closing auth modal');
          setAuthModalOpen(false);
        }}
        initialMode={authModalMode}
      />
    </>
  );
}

export default Navigation;