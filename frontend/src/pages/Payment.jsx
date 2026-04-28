import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import './Payment.css';

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    api.getOrder(orderId)
      .then(res => {
        setOrder(res.order);
        if (res.order.paymentStatus === 'paid') {
          setPaid(true);
          navigate(`/order/${orderId}`);
        }
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [orderId, navigate]);

  const handleApplyPromo = () => {
    if (!promoCode) return;
    if (promoCode.toUpperCase() === 'WELCOME') {
      setDiscount(Math.round(order.total * 0.15));
      setPromoApplied(true);
    } else if (promoCode.toUpperCase() === 'BMS50') {
      setDiscount(50);
      setPromoApplied(true);
    } else {
      alert('Invalid Promo Code');
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied(false);
    setDiscount(0);
    setPromoCode('');
  };

  const handleSimulatePay = async () => {
    setPaying(true);
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 1800));
    try {
      await api.payOrder(orderId);
      setPaid(true);
      navigate(`/order/${orderId}`);
    } catch (err) {
      alert('Payment failed: ' + err.message);
      setPaying(false);
    }
  };

  const handleUPILink = () => {
    if (!order) return;
    const upiLink = `upi://pay?pa=quickserve@upi&pn=QuickServe&am=${order.total}&cu=INR&tn=Order${orderId}`;
    window.open(upiLink, '_blank');
    // After 4 seconds, allow simulated confirmation
    setTimeout(() => {
      if (window.confirm('✅ Payment completed in your UPI app? Click OK to confirm your order.')) {
        handleSimulatePay();
      }
    }, 4000);
  };

  if (loading) return (
    <div className="page-wrapper loading-screen">
      <div className="spinner" /><span>Loading payment…</span>
    </div>
  );

  if (!order) return null;

  const gst = Math.round(order.total * 0.05);
  const platform = 10;
  const grandTotal = Math.max(0, order.total + gst + platform - discount);

  const qrValue = JSON.stringify({
    orderId: order.id,
    restaurant: order.restaurantName,
    total: grandTotal,
    status: 'pending_payment',
  });

  return (
    <div className="page-wrapper payment-page">
      <div className="container">
        <h1 className="page-title font-display">Complete Payment</h1>
        <div className="payment-layout">
          {/* ── Left: Payment Options ── */}
          <div className="payment-left">
            <div className="card payment-card">
              <div className="order-summary-header">
                <span className="restaurant-tag">🍽️ {order.restaurantName}</span>
                <span className="order-id-tag">#{order.id}</span>
              </div>
              <button 
                className="btn btn-outline btn-sm mb-4" 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.restaurantName + ' Guntur')}`, '_blank')}
              >
                🗺️ Get Directions
              </button>

              <div className="payment-amount">
                <span className="amount-label">Total Payable</span>
                <span className="amount-value font-display">₹{grandTotal}</span>
                <span className="amount-breakdown">
                  ₹{order.total} + ₹{gst} GST + ₹{platform} fee {discount > 0 ? `- ₹${discount} discount` : ''}
                </span>
              </div>

              <div className="divider" />

              {/* ── UPI Button ── */}
              <button
                id="upi-btn"
                className="btn upi-btn"
                onClick={handleUPILink}
                disabled={paying}
              >
                <span className="upi-btn-icon">💳</span>
                <div>
                  <div className="upi-btn-label">Pay via UPI App</div>
                  <div className="upi-btn-sub">Opens GPay, PhonePe, Paytm…</div>
                </div>
                <span>→</span>
              </button>

              {/* Divider */}
              <div className="or-divider"><span>or</span></div>

              {/* ── Simulate Button (Demo) ── */}
              <button
                id="simulate-pay-btn"
                className="btn btn-primary btn-full"
                onClick={handleSimulatePay}
                disabled={paying}
              >
                {paying ? (
                  <>
                    <div className="spinner" style={{width:18,height:18,borderWidth:2}} />
                    Processing Payment…
                  </>
                ) : (
                  <>⚡ Simulate Payment Success (Demo)</>
                )}
              </button>

              <p className="demo-note">
                💡 Demo mode: Click above to simulate a successful UPI payment and see the full order flow.
              </p>
            </div>

            {/* ── Offers & Promocodes ── */}
            <div className="card" style={{padding:'1.25rem', marginTop:'1rem'}}>
              <h3 className="fw-600 mb-4" style={{fontSize:'0.9rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom: '1rem'}}>
                🎟️ Unlock Offers or Apply Promocodes
              </h3>
              <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
                <input 
                  type="text" 
                  placeholder="Enter Promo Code" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                  style={{flex: 1, padding: '0.6rem 0.8rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', color: 'var(--text-primary)', textTransform: 'uppercase'}}
                />
                <button 
                  className={`btn ${promoApplied ? 'btn-outline' : 'btn-primary'}`} 
                  onClick={promoApplied ? handleRemovePromo : handleApplyPromo}
                  style={{padding: '0.6rem 1rem'}}
                >
                  {promoApplied ? 'Remove' : 'Apply'}
                </button>
              </div>
              
              {promoApplied && (
                <div style={{color: 'var(--green, #10b981)', fontSize: '0.85rem', fontWeight: 600, marginTop: '-0.5rem'}}>
                  ✅ Promo applied successfully! You saved ₹{discount}.
                </div>
              )}
              
              {!promoApplied && (
                 <div style={{display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem'}}>
                   <div onClick={() => setPromoCode('WELCOME')} style={{border: '1px dashed var(--accent)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap'}}>
                      <strong style={{color: 'var(--accent)'}}>WELCOME</strong> <br/><span style={{color: 'var(--text-muted)'}}>15% OFF on your order</span>
                   </div>
                   <div onClick={() => setPromoCode('BMS50')} style={{border: '1px dashed var(--accent)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap'}}>
                      <strong style={{color: 'var(--accent)'}}>BMS50</strong> <br/><span style={{color: 'var(--text-muted)'}}>Flat ₹50 OFF</span>
                   </div>
                 </div>
              )}
            </div>

            {/* ── Items Summary ── */}
            <div className="card" style={{padding:'1.25rem', marginTop:'1rem'}}>
              <h3 className="fw-600 mb-4" style={{fontSize:'0.9rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                Order Summary
              </h3>
              {order.items.map((item, i) => (
                <div key={i} className="pay-item-row">
                  <span className="pay-item-name">{item.name} × {item.quantity}</span>
                  <span className="pay-item-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
              {discount > 0 && (
                <div className="pay-item-row" style={{color: 'var(--green, #10b981)'}}>
                  <span>Discount</span>
                  <span>- ₹{discount}</span>
                </div>
              )}
              <div className="divider" />
              <div className="pay-item-row" style={{fontWeight:700}}>
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
          </div>

          {/* ── Right: QR Code ── */}
          <div className="payment-right">
            <div className="card qr-card">
              <h3 className="qr-title font-display">Scan to Pay</h3>
              <p className="qr-subtitle">Use any UPI app to scan this QR</p>
              <div className="qr-container">
                <QRCodeSVG
                  value={qrValue}
                  size={200}
                  bgColor="transparent"
                  fgColor="#ff6b2b"
                  level="H"
                />
              </div>
              <div className="qr-apps">
                <span className="app-chip">GPay</span>
                <span className="app-chip">PhonePe</span>
                <span className="app-chip">Paytm</span>
                <span className="app-chip">BHIM</span>
              </div>
              <p className="qr-note">This QR will also serve as your order receipt after payment</p>

              <div className="important-note">
                <span>⚠️</span>
                <div>
                  <strong>Important:</strong> Your food will be prepared ONLY after payment confirmation.
                  Pre-ordering ensures zero wait time!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
