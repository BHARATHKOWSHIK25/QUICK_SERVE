import React from 'react';
import { useCart } from '../context/CartContext';
import './MenuItem.css';

export default function MenuItem({ item, restaurantId, restaurantName }) {
  const { addItem, removeItem, getQuantity } = useCart();
  const qty = getQuantity(item.id);

  // Fallback category emojis for images
  const catEmojis = {
    'Pizzas': '🍕',
    'Burgers': '🍔',
    'Chinese': '🍜',
    'South Indian': '🍛',
    'Desserts': '🍦',
    'Beverages': '🥤'
  };
  const fallbackEmoji = catEmojis[item.category] || '🍽️';

  return (
    <div className={`menu-item-card ${item.popular ? 'popular' : ''}`} id={`item-${item.id}`}>
      <div className="mi-img-wrap">
        {item.image ? (
          <img src={item.image} alt={item.name} className="mi-img" />
        ) : (
          <span className="mi-img-placeholder">{fallbackEmoji}</span>
        )}
        <div className={`veg-indicator ${item.isVeg ? 'veg' : 'nonveg'}`} />
      </div>

      <div className="mi-content">
        <div className="mi-header">
          <span className="mi-name">{item.name}</span>
          <span className="mi-price">₹{item.price}</span>
        </div>
        
        <p className="mi-desc">{item.description}</p>
        
        <div className="mi-footer">
          {item.popular && <span className="mi-popular-tag">🔥 Bestseller</span>}
          
          <div className="mi-actions">
            {qty === 0 ? (
              <button
                className="mi-add-btn"
                id={`add-${item.id}`}
                onClick={() => addItem(item, restaurantId, restaurantName)}
              >
                ADD
              </button>
            ) : (
              <div className="mi-qty-control">
                <button onClick={() => removeItem(item.id)} id={`dec-${item.id}`} aria-label="Decrease">−</button>
                <span>{qty}</span>
                <button onClick={() => addItem(item, restaurantId, restaurantName)} id={`inc-${item.id}`} aria-label="Increase">+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
