import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register } = useContext(AuthContext);
  
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      document.body.style.overflow = 'auto';
      setIsAnimating(false);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let success = false;
    
    if (isLogin) {
      success = await login(formData.email, formData.password);
    } else {
      success = await register(formData.name, formData.email, formData.password);
    }
    
    setIsSubmitting(false);
    if (success) {
      handleClose();
    }
  };

  return createPortal(
    <div className={`auth-backdrop ${isAnimating ? 'active' : ''}`} onClick={handleClose}>
      <div 
        className={`auth-modal-container ${isAnimating ? 'active' : ''}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="auth-close-btn" onClick={handleClose}>
          <X size={20} />
        </button>

        <div className="auth-split-layout">
          {/* Left Form Side */}
          <div className="auth-form-side">
            <div className="auth-logo-mobile">
              <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>AURÉVA</span>
            </div>

            <div className="auth-header">
              <h2 className="auth-title">{isLogin ? 'Login' : 'Create an Account'}</h2>
              <p className="auth-subtitle">
                {isLogin 
                  ? 'Enter your credentials to get in.' 
                  : 'Join AURÉVA to unlock exclusive dynamic pricing deals.'}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <input 
                      type="text" 
                      name="name"
                      placeholder="John Doe" 
                      value={formData.name}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <input 
                    type="email" 
                    name="email"
                    placeholder="hello@example.com" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={handleChange}
                    required 
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="auth-form-options">
                  <label className="remember-me">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#forgot" className="forgot-password">Forgot password?</a>
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Please wait...' : (isLogin ? 'Login' : 'Sign Up')}
              </button>

              <div className="auth-socials">
                <button type="button" className="social-btn">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                  Continue with Google
                </button>
              </div>

              <div className="auth-footer-toggle">
                {isLogin ? (
                  <p>Don't have an account? <button type="button" onClick={() => setIsLogin(false)}>Create one</button></p>
                ) : (
                  <p>Already have an account? <button type="button" onClick={() => setIsLogin(true)}>Log in</button></p>
                )}
              </div>
            </form>
          </div>

          {/* Right Image Side */}
          <div className="auth-image-side">
            <div className="auth-image-overlay">
              <span className="theme-logo-text auth-logo-image" style={{ fontSize: '2rem', fontWeight: 800 }}>AURÉVA</span>
              <h3 className="auth-image-title">Experience Extraordinary Stays</h3>
              <p className="auth-image-subtitle">Discover dynamic pricing that works for you.</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;
