import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, FileText, Image, FileCode, Code, DollarSign, RefreshCw, Sparkles, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header({ setShowAuthModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  const categories = [
    { path: '/text-tools', name: 'Text', icon: FileText },
    { path: '/image-tools', name: 'Image', icon: Image },
    { path: '/pdf-tools', name: 'PDF', icon: FileCode },
    { path: '/developer-tools', name: 'Developer', icon: Code },
    { path: '/financial-tools', name: 'Financial', icon: DollarSign },
    { path: '/converters', name: 'Convert', icon: RefreshCw },
    { path: '/generators', name: 'Generate', icon: Sparkles },
  ];

  const isActive = (path) => location.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [userDropdownOpen]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const handleDashboard = () => {
    setUserDropdownOpen(false);
    navigate('/dashboard');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">TT</div>
          <span className="logo-text">TinyTools</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.path}
                to={category.path}
                className={`nav-link ${isActive(category.path) ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{category.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions - User Dropdown */}
        <div className="header-actions">
          <Link to="/pricing" className="pricing-link">
            Pricing
          </Link>

          {user ? (
            <div className="user-menu" ref={dropdownRef}>
              <button 
                className="user-button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="user-avatar">
                  <User size={18} />
                </div>
                <span className="user-name">{user.name || user.email}</span>
                <ChevronDown size={16} className={`chevron ${userDropdownOpen ? 'open' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        <User size={24} />
                      </div>
                      <div className="user-details">
                        <div className="user-name-large">{user.name || 'User'}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-items">
                    {/* <button 
                      className="dropdown-item"
                      onClick={handleDashboard}
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </button> */}

                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/profile');
                      }}
                    >
                      <User size={18} />
                      <span>Profile</span>
                    </button>

                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/pricing');
                      }}
                    >
                      <DollarSign size={18} />
                      <span>Pricing</span>
                    </button>

                    <button 
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={() => setShowAuthModal(true)}>
              <User size={18} />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="mobile-nav">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.path}
                to={category.path}
                className={`mobile-nav-link ${isActive(category.path) ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={20} />
                <span>{category.name}</span>
              </Link>
            );
          })}
          
          <div className="mobile-divider"></div>

          <Link
            to="/pricing"
            className="mobile-nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <DollarSign size={20} />
            <span>Pricing</span>
          </Link>

          {/* Mobile Auth Actions */}
          {user ? (
            <>
              <div className="mobile-user-info">
                <div className="user-avatar-mobile">
                  <User size={20} />
                </div>
                <div className="mobile-user-details">
                  <div className="mobile-user-name">{user.name || 'User'}</div>
                  <div className="mobile-user-email">{user.email}</div>
                </div>
              </div>

              {/* <button 
                className="mobile-nav-link" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </button> */}

              <button 
                className="mobile-nav-link" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/profile');
                }}
              >
                <User size={20} />
                <span>Profile</span>
              </button>

              <button 
                className="mobile-nav-link" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/pricing');
                }}
              >
                <DollarSign size={20} />
                <span>Pricing</span>
              </button>

              <button 
                className="mobile-nav-link logout" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button 
              className="mobile-login-btn" 
              onClick={() => {
                setMobileMenuOpen(false);
                setShowAuthModal(true);
              }}
            >
              <User size={20} />
              <span>Login</span>
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;