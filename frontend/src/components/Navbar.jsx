import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userPhone, setUserPhone] = useState(null);
  const [userName, setUserName] = useState(null);
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    setUserPhone(localStorage.getItem('userPhone'));
    setUserName(localStorage.getItem('userName'));
    
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, [location]);

  const applyTheme = (newTheme) => {
    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const handleThemeChange = () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAddress');
    setUserPhone(null);
    setUserName(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🍽️</span>
          <span className="logo-text font-display">
            Quick<span className="logo-accent">Serve</span>
          </span>
        </Link>

        {/* Location */}
        <div className="navbar-location hide-mobile">
          <span className="location-icon">📍</span>
          <span>Guntur, Andhra Pradesh</span>
        </div>

        {/* Nav Links */}
        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active-home' : ''}`} onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/sports" className={`nav-link ${location.pathname === '/sports' ? 'active-sports' : ''}`} onClick={() => setMobileOpen(false)}>Book Sports</Link>
          <Link to="/sports-dashboard" className="nav-link venue-link" onClick={() => setMobileOpen(false)}>Venue Manager</Link>
          <Link to="/kitchen" className="nav-link kitchen-link" onClick={() => setMobileOpen(false)}>
            Kitchen Manager
          </Link>
          {userPhone ? (
            <div className="nav-user-profile hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: '0.5rem', borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}>
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <span style={{color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.9rem', lineHeight: '1'}}>
                  👤 {userName || 'User'}
                </span>
                <span style={{color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.2rem'}}>
                  +91 {userPhone.slice(0, 3)}****{userPhone.slice(-3)}
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                style={{background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s'}}
                onMouseOver={(e) => { e.target.style.borderColor = 'var(--red)'; e.target.style.color = 'var(--red)'; }}
                onMouseOut={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active-home' : ''}`} onClick={() => setMobileOpen(false)}>Login</Link>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          className="theme-toggle-btn" 
          onClick={handleThemeChange} 
          style={{background: 'var(--bg-input)', border: '1px solid var(--border)', fontSize: '1.4rem', width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', marginLeft: 'auto', marginRight: '0.5rem', cursor: 'pointer', transition: 'var(--transition)'}}
          title={`Theme: ${theme}`}
        >
          {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'}
        </button>

        {/* Cart Button */}
        <button className="cart-btn" onClick={() => navigate('/cart')}>
          🛒
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </button>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setMobileOpen(v => !v)}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
