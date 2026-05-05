import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import HotelList from './components/HotelList';
import HotelDetail from './components/HotelDetail';
import BookingConfirmation from './components/BookingConfirmation';
import ReviewManagementDashboard from './components/ReviewManagementDashboard';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const [searchLocation, setSearchLocation] = useState('');

  return (
    <AuthProvider>
      <div className="app-container">
        <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={
              <>
                <HeroSection onSearch={setSearchLocation} />
                <HotelList searchLocation={searchLocation} />
              </>
            } />
            <Route path="/hotel/:id" element={<HotelDetail />} />
            <Route path="/reserve/:id" element={<BookingConfirmation />} />
            <Route path="/admin/reviews" element={<ReviewManagementDashboard />} />
            <Route path="*" element={
              <div style={{ padding: '100px 0', textAlign: 'center', color: 'white' }}>
                <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
                <h2>Page Not Found</h2>
                <p style={{ margin: '1rem 0 2rem', opacity: 0.7 }}>The page you are looking for doesn't exist.</p>
                <Link to="/" className="btn btn-primary" style={{ display: 'inline-block' }}>Back to Home</Link>
              </div>
            } />
          </Routes>
          
          <footer style={{ padding: '4rem 0 2rem', backgroundColor: '#1a1b1e', color: '#9ca3af', borderTop: '1px solid #2d2e32' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
                  <span className="theme-logo-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>AURÉVA</span>
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>Experience extraordinary stays with our intelligent dynamic pricing engine. Book with confidence.</p>
              </div>
              
              <div>
                <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Quick Links</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li><Link to="/" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#9ca3af'}>Hotels</Link></li>
                  <li><a href="#about" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#9ca3af'}>About Us</a></li>
                  <li><a href="#contact" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#9ca3af'}>Contact</a></li>
                </ul>
              </div>

              <div>
                <h4 style={{ color: 'white', fontWeight: 600, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Legal</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <li><a href="#privacy" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#9ca3af'}>Privacy Policy</a></li>
                  <li><a href="#terms" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='white'} onMouseOut={e => e.target.style.color='#9ca3af'}>Terms of Service</a></li>
                </ul>
              </div>
            </div>
            
            <div className="container" style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid #2d2e32' }}>
              <p style={{ fontSize: '0.9rem' }}>© {new Date().getFullYear()} AURÉVA Dynamic Pricing Engine Demo. All rights reserved.</p>
            </div>
          </footer>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
      </div>
    </AuthProvider>
  );
}

export default App;
