import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import './Home.css';

const CATEGORIES = ['All', 'Hotels', 'Biryani', 'Multi Cuisine', 'Veg', 'Cafes'];

const CATEGORY_ICONS = {
  All: '🍽️', Hotels: '🏨', Biryani: '🍛', 'Multi Cuisine': '🌏', Veg: '🥦', Cafes: '☕'
};

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  const { orderType, setOrderType } = useCart();

  const handleOrderTypeSelect = (type) => {
    if (orderType === type) return;
    setOrderType(type);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (vegOnly) params.veg = 'true';
      if (search) params.search = search;
      const res = await api.getRestaurants(params);
      setRestaurants(res.restaurants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, vegOnly, search]);

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await api.getRestaurants({ featured: 'true' });
      setFeatured(res.restaurants || []);
    } catch (err) { /* Silently fail */ }
  }, []);

  useEffect(() => { fetchFeatured(); }, [fetchFeatured]);
  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  return (
    <div className="home page-wrapper">
      {/* ── Domino's Style Header ── */}
      <section className="dominos-header-section">
        <div className="container">
          
          {/* Segmented Control */}
          <div className="dominos-segmented-control">
            <button 
              className={`segment-btn ${orderType === 'take-away' ? 'active' : ''}`}
              onClick={() => handleOrderTypeSelect('take-away')}
            >
              Takeaway
            </button>
            <button 
              className={`segment-btn ${orderType === 'dine-in' ? 'active' : ''}`}
              onClick={() => handleOrderTypeSelect('dine-in')}
            >
              Dine-In
            </button>
          </div>
          <p className="delivery-note" style={{marginTop: '0.5rem', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)'}}>
            * Delivery not available. Choose Takeaway or Dine-In.
          </p>

          {/* Promotional Banners Carousel */}
          <div className="dominos-banners scroll-row">
            <div className="promo-banner bg-blue">
              <div className="promo-content">
                <h3>Get 15 - 20% OFF</h3>
                <p>On your first Takeaway</p>
              </div>
            </div>
            <div className="promo-banner bg-red">
              <div className="promo-content">
                <h3>Combo Deals</h3>
                <p>Save up to ₹150</p>
              </div>
            </div>
            <div className="promo-banner bg-green">
              <div className="promo-content">
                <h3>Cashback Offer</h3>
                <p>Pay via UPI</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form className="search-bar" onSubmit={handleSearchSubmit} id="search-form" style={{marginTop: '1.5rem', marginBottom: '1rem'}}>
            <span className="search-icon">🔍</span>
            <input
              id="search-input"
              type="text"
              placeholder='Search restaurants, cuisines, dishes...'
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="search-input"
            />
            {searchInput && (
              <button type="button" className="search-clear" onClick={clearSearch}>✕</button>
            )}
            <button type="submit" className="search-btn">Search</button>
          </form>
          
        </div>
      </section>

      <div className={`container main-content-area ${isRefreshing ? 'refresh-blink' : ''}`}>

        {/* ── Featured ── */}
        {featured.length > 0 && !search && activeCategory === 'All' && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">⭐ Featured Picks</h2>
              <button className="section-link" onClick={() => setActiveCategory('All')}>View all</button>
            </div>
            <div className="scroll-row featured-row">
              {featured.map(r => (
                <div key={r.id} className="featured-card-wrap">
                  <RestaurantCard restaurant={r} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Explore Menu (Domino's Style Categories) ── */}
        <section className="section dominos-categories-section">
          <div className="section-header">
            <h2 className="section-title">Explore Menu</h2>
            <button
              id="toggle-veg"
              className={`veg-toggle ${vegOnly ? 'active' : ''}`}
              onClick={() => setVegOnly(v => !v)}
              style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}}
            >
              {vegOnly ? '🟢' : '⚪'} Pure Veg
            </button>
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

        {/* ── Restaurant Grid ── */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">
              {search ? `Results for "${search}"` : activeCategory === 'All' ? 'All Restaurants' : activeCategory}
            </h2>
            <span className="text-muted text-sm">{restaurants.length} places</span>
          </div>

          {loading ? (
            <div className="loading-screen">
              <div className="spinner" />
              <span>Finding the best places near you…</span>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🍽️</span>
              <h3>No restaurants found</h3>
              <p>Try a different category or remove the filters.</p>
              <button className="btn btn-outline mt-4" onClick={() => { setActiveCategory('All'); setVegOnly(false); clearSearch(); }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="restaurant-grid">
              {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
            </div>
          )}
        </section>

        {/* ── Sports Booking Promo ── */}
        <section className="sports-promo">
          <div className="sports-promo-content">
            <div>
              <h3 className="font-display" style={{fontSize:'1.5rem', fontWeight:800, marginBottom:'0.5rem', color: '#ffffff'}}>
                🏏 Book Sports Venues Instantly
              </h3>
              <p style={{color:'rgba(255, 255, 255, 0.8)', fontSize:'0.9rem'}}>
                Cricket Turfs · Badminton Courts · Swimming Pools · Football Grounds in Guntur
              </p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/sports')}>
              Book Now →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
