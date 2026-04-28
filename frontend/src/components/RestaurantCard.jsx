import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RestaurantCard.css';

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();

  return (
    <div
      className={`restaurant-card ${!restaurant.open ? 'closed' : ''}`}
      onClick={() => restaurant.open && navigate(`/restaurant/${restaurant.id}`)}
      role="button"
      tabIndex={0}
      id={`restaurant-${restaurant.id}`}
    >
      {/* Image */}
      <div className="rc-image-wrap">
        <img src={restaurant.image} alt={restaurant.name} className="rc-image" loading="lazy" />
        {!restaurant.open && <div className="rc-closed-overlay">Currently Closed</div>}
        {restaurant.isFeatured && <span className="rc-featured-badge">⭐ Featured</span>}
        <span className={`rc-veg-dot ${restaurant.isVeg ? 'veg' : 'nonveg'}`} title={restaurant.isVeg ? 'Pure Veg' : 'Non-Veg'} />
      </div>

      {/* Content */}
      <div className="rc-content">
        <div className="rc-top">
          <h3 className="rc-name">{restaurant.name}</h3>
          <span className="rc-rating">
            ⭐ {restaurant.rating}
          </span>
        </div>
        <p className="rc-subtitle">{restaurant.subtitle}</p>
        <p className="rc-cuisine">{restaurant.cuisine}</p>

        <div className="rc-meta">
          <span>📍 {restaurant.location}</span>
          <span>·</span>
          <span>🕐 {restaurant.deliveryTime}</span>
          <span>·</span>
          <span>₹{restaurant.priceForTwo} for two</span>
        </div>

        <div className="rc-footer">
          <span className="rc-reviews">{restaurant.reviewCount.toLocaleString()} reviews</span>
          <span className={`rc-tag ${restaurant.isVeg ? 'tag-veg' : 'tag-nonveg'}`}>
            {restaurant.isVeg ? '🟢 Pure Veg' : '🔴 Non-Veg'}
          </span>
        </div>
      </div>
    </div>
  );
}
