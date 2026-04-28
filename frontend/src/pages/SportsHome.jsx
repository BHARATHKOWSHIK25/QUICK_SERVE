import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SportsCard from '../components/SportsCard';
import { api } from '../services/api';
import './SportsHome.css';

const CATEGORIES = ['All', 'Cricket', 'Football', 'Badminton', 'Swimming'];

const CATEGORY_ICONS = {
  All: '🏟️', Cricket: '🏏', Football: '⚽', Badminton: '🏸', Swimming: '🏊'
};

export default function SportsHome() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getServices();
      let filtered = res.services || [];
      
      if (activeCategory !== 'All') {
        // filter based on the category name
        filtered = filtered.filter(s => s.name.toLowerCase().includes(activeCategory.toLowerCase()) || s.icon === CATEGORY_ICONS[activeCategory]);
      }
      
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(s =>
          s.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q)
        );
      }
      
      setServices(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => { 
    document.title = "Book Sports — Quick Serve";
    fetchServices();
    return () => {
      document.title = "Quick Serve — Order Food. Skip the Queue. Guntur";
    };
  }, [fetchServices]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  return (
    <div className="home page-wrapper sports-home">
      {/* ── Domino's Style Header ── */}
      <section className="dominos-header-section">
        <div className="container">
          
          <h1 className="section-title text-center" style={{marginBottom: '1rem', marginTop: '0.5rem', fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 800}}>
            Book Your Turf, <span style={{color: 'var(--blue)'}}>Play Instantly</span>
          </h1>

          {/* Promotional Banners Carousel */}
          <div className="dominos-banners scroll-row">
            <div className="promo-banner bg-blue">
              <div className="promo-content">
                <h3>New Turfs!</h3>
                <p>Check out latest additions</p>
              </div>
            </div>
            <div className="promo-banner bg-green">
              <div className="promo-content">
                <h3>Cashback Offer</h3>
                <p>Pay via UPI & Save</p>
              </div>
            </div>
            <div className="promo-banner bg-red">
              <div className="promo-content">
                <h3>Tournaments</h3>
                <p>Join and win prizes</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form className="search-bar" onSubmit={handleSearchSubmit} id="search-form" style={{marginTop: '1.5rem', marginBottom: '1rem'}}>
            <span className="search-icon">🔍</span>
            <input
              id="search-input"
              type="text"
              placeholder='Search for turfs, arenas, or locations...'
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="search-input"
            />
            {searchInput && (
              <button type="button" className="search-clear" onClick={clearSearch}>✕</button>
            )}
            <button type="submit" className="search-btn" style={{background: 'var(--blue)'}}>Search</button>
          </form>
          
        </div>
      </section>

      <div className="container">
        {/* ── Explore Sports (Domino's Style Categories) ── */}
        <section className="section dominos-categories-section">
          <div className="section-header">
            <h2 className="section-title">Explore Sports</h2>
          </div>
          <div className="dominos-categories scroll-row">
            {CATEGORIES.map(cat => (
              <div
                key={cat}
                className={`dominos-category-circle ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                <div className="circle-icon">{CATEGORY_ICONS[cat]}</div>
                <span className="circle-label">{cat}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sports Grid ── */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">
              {search ? `Results for "${search}"` : activeCategory === 'All' ? 'All Sports Venues' : `${activeCategory} Venues`}
            </h2>
            <span className="text-muted text-sm">{services.length} venues</span>
          </div>

          {loading ? (
            <div className="loading-screen">
              <div className="spinner" style={{borderColor: 'var(--blue)', borderRightColor: 'transparent'}} />
              <span>Finding the best venues near you…</span>
            </div>
          ) : services.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🏟️</span>
              <h3>No venues found</h3>
              <p>Try a different sport or remove the filters.</p>
              <button className="btn btn-outline mt-4" onClick={() => { setActiveCategory('All'); clearSearch(); }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="restaurant-grid">
              {services.map(s => <SportsCard key={s.id} service={s} />)}
            </div>
          )}
        </section>
        
        {/* Food Promo */}
        <section className="sports-promo" style={{background: 'linear-gradient(135deg, rgba(255, 107, 43, 0.1), rgba(255, 107, 43, 0.05))', borderColor: 'rgba(255, 107, 43, 0.3)'}}>
          <div className="sports-promo-content">
            <div>
              <h3 className="font-display" style={{fontSize:'1.5rem', fontWeight:800, marginBottom:'0.5rem'}}>
                🍔 Hungry after playing?
              </h3>
              <p style={{color:'var(--text-secondary)', fontSize:'0.9rem'}}>
                Order food in advance from top restaurants in Guntur so it's ready when you finish!
              </p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
              Order Food →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
