import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
    const [mode, setMode] = useState(initialMode); // 'login' or 'register'
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'register') {
                // Validation for registration
                if (!formData.name.trim()) {
                    toast.error('Please enter your name');
                    setLoading(false);
                    return;
                }
                if (formData.password.length < 6) {
                    toast.error('Password must be at least 6 characters');
                    setLoading(false);
                    return;
                }
                if (formData.password !== formData.confirmPassword) {
                    toast.error('Passwords do not match');
                    setLoading(false);
                    return;
                }

                // Call register function
                await register(formData.email, formData.password, formData.name);
                toast.success('Account created successfully! 🎉');
                onClose();
            } else {
                // Call login function
                console.log('🔐 AuthModal: Calling login function');
                await login(formData.email, formData.password);
                console.log('✅ AuthModal: Login function returned successfully');
                toast.success('Welcome back! 👋');
                onClose();
            }
        } catch (error) {
            console.error('❌ AuthModal: Error during authentication:', error);
            toast.error(error.response?.data?.message || error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="auth-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="auth-modal"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="auth-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>

                    <div className="auth-header">
                        <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                        <p>
                            {mode === 'login'
                                ? 'Sign in to access your dashboard and premium features'
                                : 'Join LiteTools to unlock powerful productivity tools'}
                        </p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {mode === 'register' && (
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
                                    required
                                    disabled={loading}
                                />
                            </div>
                        )}

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
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                <Lock size={18} />
                                Password
                            </label>
                            <div className="password-input">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {mode === 'register' && (
                                <span className="input-hint">Minimum 6 characters</span>
                            )}
                        </div>

                        {mode === 'register' && (
                            <div className="form-group">
                                <label htmlFor="confirmPassword">
                                    <Lock size={18} />
                                    Confirm Password
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary auth-submit"
                            disabled={loading}
                        >
                            {loading
                                ? 'Processing...'
                                : mode === 'login'
                                    ? 'Sign In'
                                    : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="auth-switch">
                        <p>
                            {mode === 'login'
                                ? "Don't have an account?"
                                : 'Already have an account?'}
                        </p>
                        <button
                            type="button"
                            className="btn-text"
                            onClick={switchMode}
                            disabled={loading}
                        >
                            {mode === 'login' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>

                    {mode === 'register' && (
                        <div className="auth-benefits">
                            <h4>Why Join LiteTools?</h4>
                            <ul>
                                <li>✅ 3 free uses per tool per month</li>
                                <li>✅ Track your usage and history</li>
                                <li>✅ Upgrade to Premium for unlimited access</li>
                                <li>✅ Access dashboard and analytics</li>
                            </ul>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default AuthModal;