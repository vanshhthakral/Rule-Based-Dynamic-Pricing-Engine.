import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, User, Menu, LogOut, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import AuthModal from './AuthModal';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const [region, setRegion] = useState('EN - USD');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <span className="theme-logo-text" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '1px' }}>AURÉVA</span>
          </div>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <span>Stays</span>
          </Link>
          <a href="#about" className="nav-link">
            <span>About Us</span>
          </a>
          <a href="#contact" className="nav-link">
            <span>Contact</span>
          </a>
          {user && (
            <Link to="/admin/reviews" className={`nav-link ${location.pathname === '/admin/reviews' ? 'active' : ''}`}>
              <span>Dashboard</span>
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          <div className="region-selector-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button 
              className="nav-icon-btn region-btn" 
              onClick={() => setIsRegionOpen(!isRegionOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', padding: '0 14px', height: '42px', borderRadius: '21px' }}
            >
              <Globe size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{region}</span>
              <ChevronDown size={14} />
            </button>
            
            {isRegionOpen && (
              <div className="region-dropdown" style={{ 
                position: 'absolute', top: 'calc(100% + 8px)', right: '0', 
                background: 'white', borderRadius: '12px', padding: '0.5rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', minWidth: '150px', zIndex: 100
              }}>
                {['EN - USD', 'FR - EUR', 'ES - EUR', 'HI - INR'].map(lang => (
                  <button 
                    key={lang}
                    onClick={() => { setRegion(lang); setIsRegionOpen(false); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#1a1b1e', borderRadius: '8px', fontSize: '0.9rem',
                      fontWeight: region === lang ? 700 : 500
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', height: '42px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Hi, {user.name.split(' ')[0]}</span>
              <button className="btn btn-outline login-btn" onClick={logout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px', width: '42px', padding: 0, border: 'none', background: 'transparent' }} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button className="btn btn-outline login-btn" onClick={() => setIsAuthOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px', padding: '0 16px', borderRadius: '21px' }}>
              <Menu size={18} />
              <User size={18} />
            </button>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
};

export default Navbar;
