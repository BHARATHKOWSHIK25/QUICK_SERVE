import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MenuItem from '../components/MenuItem';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import './Menu.css';

export default function Menu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { totalItems, totalPrice, restaurantId } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [rRes, mRes] = await Promise.all([api.getRestaurant(id), api.getMenu(id)]);
        setRestaurant(rRes.restaurant);
        setMenu(mRes.menu);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const categories = ['All', ...new Set(menu.map(item => item.category))];
  const filteredMenu = activeCategory === 'All' ? menu : menu.filter(i => i.category === activeCategory);

  if (loading) return (
    <div className="page-wrapper loading-screen">
      <div className="spinner" /><span>Loading menu…</span>
    </div>
  );

  if (!restaurant) return (
    <div className="page-wrapper empty-state">
      <span className="empty-icon">🍽️</span>
      <h3>Restaurant not found</h3>
      <button className="btn btn-outline mt-4" onClick={() => navigate('/')}>Go Home</button>
    </div>
  );

  const hasCart = totalItems > 0 && restaurantId === id;

  return (
    <div className="menu-page page-wrapper">
      {/* ── Restaurant Hero ── */}
      <div className="menu-hero">
        <img src={restaurant.image} alt={restaurant.name} className="menu-hero-img" />
        <div className="menu-hero-overlay">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="menu-hero-info">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="menu-restaurant-name font-display">{restaurant.name}</h1>
              <span className={`menu-veg-dot ${restaurant.isVeg ? 'veg' : 'nonveg'}`} />
            </div>
            <p className="menu-subtitle">{restaurant.subtitle}</p>
            <p className="menu-cuisine">{restaurant.cuisine}</p>
            <div className="menu-meta">
              <span className="menu-rating">⭐ {restaurant.rating} ({restaurant.reviewCount.toLocaleString()} reviews)</span>
              <span>·</span>
              <span>🕐 {restaurant.deliveryTime}</span>
              <span>·</span>
              <span>₹{restaurant.priceForTwo} for two</span>
              <span>·</span>
              <span>📍 {restaurant.location}</span>
            </div>
            {!restaurant.open && <span className="menu-closed-tag">Currently Closed</span>}
          </div>
        </div>
      </div>

      <div className="container menu-layout">
        {/* ── Left Sidebar Categories ── */}
        <aside className="menu-sidebar hide-mobile">
          <h3>Categories</h3>
          <ul className="sidebar-categories">
            {categories.map(cat => (
              <li 
                key={cat} 
                className={`sidebar-cat-item ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat} 
                <span className="count">{cat === 'All' ? menu.length : menu.filter(i => i.category === cat).length}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="menu-main">
          {/* Mobile Categories (Horizontal Scroll) */}
          <div className="menu-tabs-wrap hide-desktop">
            <div className="menu-tabs scroll-row">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`menu-tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  id={`tab-${cat.replace(/\s+/g, '-')}`}
                >
                  {cat}
                  <span className="menu-tab-count">
                    {cat === 'All' ? menu.length : menu.filter(i => i.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="menu-grid">
            {filteredMenu.length === 0 ? (
              <div className="empty-state"><span className="empty-icon">🍽️</span><h3>No items in this category</h3></div>
            ) : (
              filteredMenu.map(item => (
                <MenuItem key={item.id} item={item} restaurantId={id} restaurantName={restaurant.name} />
              ))
            )}
          </div>
        </main>
      </div>

      {/* ── Sticky Cart Bar ── */}
      {hasCart && (
        <div className="sticky-cart-bar" id="sticky-cart">
          <div className="container">
            <div className="sticky-cart-inner">
              <div className="sticky-cart-info">
                <span className="sticky-cart-qty">{totalItems} item{totalItems > 1 ? 's' : ''}</span>
                <span className="sticky-cart-name">from {restaurant.name}</span>
              </div>
              <div className="sticky-cart-right">
                <span className="sticky-cart-price">₹{totalPrice}</span>
                <button className="btn btn-primary" id="view-cart-btn" onClick={() => navigate('/cart')}>
                  View Cart →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
