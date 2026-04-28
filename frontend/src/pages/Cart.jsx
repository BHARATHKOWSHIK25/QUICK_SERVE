import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import './Cart.css';

export default function Cart() {
  const { cartItems, restaurantName, totalItems, totalPrice, addItem, removeItem, clearCart, restaurantId } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState(localStorage.getItem('userName') || '');
  const [phone, setPhone] = useState(localStorage.getItem('userPhone') || '');
  const [placing, setPlacing] = useState(false);

  const gst = Math.round(totalPrice * 0.05);
  const convenience = totalItems > 0 ? 10 : 0;
  const grandTotal = totalPrice + gst + convenience;

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim()) {
      alert('Please enter your name and phone number.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    setPlacing(true);
    localStorage.setItem('userName', name);
    localStorage.setItem('userPhone', phone);
    try {
      const res = await api.createOrder({
        restaurantId,
        items: cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        customerName: name,
        customerPhone: phone,
      });
      clearCart();
      navigate(`/payment/${res.order.id}`);
    } catch (err) {
      alert('Failed to place order: ' + err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (totalItems === 0) return (
    <div className="page-wrapper cart-page">
      <div className="container">
        <div className="empty-state" style={{ minHeight: '70vh' }}>
          <span className="empty-icon">🛒</span>
          <h3>Your cart is empty</h3>
          <p>Add items from a restaurant to get started.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>
            Browse Restaurants
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-wrapper cart-page">
      <div className="container">
        <h1 className="page-title font-display">Your Cart</h1>
        <p className="cart-from">📍 From <strong>{restaurantName}</strong></p>

        <div className="cart-layout">
          {/* ── Left: Items ── */}
          <div className="cart-left">
            <div className="card" style={{ padding: '1.25rem' }}>
              <div className="cart-items-header">
                <h2 className="fw-700">Order Items</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => { if(window.confirm('Clear cart?')) clearCart(); }}>
                  🗑 Clear All
                </button>
              </div>
              <div className="divider" />

              {cartItems.map(item => (
                <div key={item.id} className="cart-item" id={`cart-item-${item.id}`}>
                  <div className="cart-item-left">
                    <div className={`veg-dot ${item.isVeg ? 'veg' : 'nonveg'}`} />
                    <div>
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price">₹{item.price} × {item.quantity}</div>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <div className="cart-qty-control">
                      <button onClick={() => removeItem(item.id)} aria-label="decrease">−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => addItem(item, restaurantId, restaurantName)} aria-label="increase">+</button>
                    </div>
                    <span className="cart-item-total">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}

              <div className="divider" />
              <button className="btn btn-outline btn-sm" onClick={() => navigate(`/restaurant/${restaurantId}`)}>
                + Add more items
              </button>
            </div>
          </div>

          {/* ── Right: Summary ── */}
          <div className="cart-right">
            {/* Customer Info */}
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
              <h2 className="fw-700 mb-4">Your Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    id="customer-name"
                    className="input-field"
                    placeholder="e.g. Ravi Kumar"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">Phone Number</label>
                  <input
                    id="customer-phone"
                    className="input-field"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    type="tel"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {/* Bill Details */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <h2 className="fw-700 mb-4">Bill Details</h2>
              <div className="bill-row"><span>Item Total</span><span>₹{totalPrice}</span></div>
              <div className="bill-row"><span>GST (5%)</span><span>₹{gst}</span></div>
              <div className="bill-row"><span>Platform Fee</span><span>₹{convenience}</span></div>
              <div className="divider" />
              <div className="bill-row total">
                <span>Total Payable</span>
                <span>₹{grandTotal}</span>
              </div>

              <div className="savings-note">
                🎉 You're saving queue time worth <strong>15-30 minutes</strong>!
              </div>

              <div className="upi-info-box">
                <span className="upi-icons">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/HDFC_Bank_Logo.svg/120px-HDFC_Bank_Logo.svg.png" alt="upi" style={{height:16,filter:'brightness(2)',display:'none'}} />
                </span>
                <span>💳 Payment via UPI — GPay, PhonePe, Paytm</span>
              </div>

              <button
                id="place-order-btn"
                className="btn btn-primary btn-full btn-lg mt-4"
                onClick={handlePlaceOrder}
                disabled={placing}
              >
                {placing ? '⏳ Placing Order…' : `Proceed to Pay ₹${grandTotal} →`}
              </button>

              <p className="secure-note">🔒 100% Secure & Encrypted Payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
