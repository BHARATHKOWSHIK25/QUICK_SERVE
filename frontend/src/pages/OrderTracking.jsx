import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import './OrderTracking.css';

const STEPS = [
  { key: 'placed',    icon: '📋', label: 'Order Placed',    desc: 'Payment received, notifying kitchen' },
  { key: 'preparing', icon: '🍳', label: 'Preparing',        desc: 'Chef is preparing your order right now' },
  { key: 'ready',     icon: '✅', label: 'Ready for Pickup', desc: 'Your food is ready! Come collect it' },
  { key: 'delivered', icon: '🎉', label: 'Delivered',        desc: 'Enjoyed your meal? Rate us!' },
];

const statusIndex = (status) => STEPS.findIndex(s => s.key === status);

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.getOrder(orderId);
      setOrder(res.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [refresh]);

  if (loading) return (
    <div className="page-wrapper loading-screen">
      <div className="spinner" /><span>Loading your order…</span>
    </div>
  );
  if (!order) return (
    <div className="page-wrapper empty-state">
      <span className="empty-icon">❌</span><h3>Order not found</h3>
      <button className="btn btn-outline mt-4" onClick={() => navigate('/')}>Go Home</button>
    </div>
  );

  const currentStep = statusIndex(order.status);
  const isReady = order.status === 'ready' || order.status === 'delivered';

  const qrValue = JSON.stringify({
    orderId: order.id,
    restaurant: order.restaurantName,
    customer: order.customerName,
    status: order.status,
    txnId: order.transactionId,
  });

  return (
    <div className="page-wrapper tracking-page">
      <div className="container">
        {/* ── Header ── */}
        <div className="tracking-header">
          <div>
            <div className="tracking-badge">
              {order.status === 'ready' ? '🎉 Your food is READY!' : '🔄 Tracking your order'}
            </div>
            <h1 className="page-title font-display" style={{marginTop:'0.5rem'}}>Order #{order.id}</h1>
            <p className="text-muted">{order.restaurantName} · {order.customerName}</p>
          </div>
          <div className="tracking-actions">
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.restaurantName + ' Guntur')}`, '_blank')}
            >
              🗺️ Directions
            </button>
            <button className="btn btn-ghost btn-sm" onClick={refresh}>🔄 Refresh</button>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>🏠 Home</button>
          </div>
        </div>

        <div className="tracking-layout">
          {/* ── Left: Status Stepper ── */}
          <div className="tracking-left">
            <div className="card" style={{padding:'1.75rem'}}>
              <h2 className="fw-700 mb-6">Order Status</h2>
              <div className="stepper">
                {STEPS.map((step, i) => {
                  const isDone    = i < currentStep;
                  const isActive  = i === currentStep;
                  const isFuture  = i > currentStep;
                  return (
                    <div key={step.key} className={`step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''} ${isFuture ? 'future' : ''}`}>
                      <div className="step-icon-wrap">
                        <span className="step-icon">{step.icon}</span>
                        {isActive && <div className="step-pulse" />}
                      </div>
                      {i < STEPS.length - 1 && <div className={`step-line ${isDone ? 'done' : ''}`} />}
                      <div className="step-content">
                        <span className="step-label">{step.label}</span>
                        {isActive && <span className="step-desc">{step.desc}</span>}
                        {isActive && (
                          <span className="step-live">
                            {order.status === 'preparing' ? '⏱ Approx. 15-20 mins' : ''}
                            {order.status === 'ready' ? '⚡ Come pick it up now!' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Items */}
              <div className="divider" />
              <h3 className="fw-600 mb-2" style={{fontSize:'0.85rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em'}}>Your Items</h3>
              {order.items.map((item, i) => (
                <div key={i} className="tracking-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="divider" />
              <div className="tracking-item" style={{fontWeight:700}}>
                <span>Grand Total Paid</span>
                <span>₹{Math.round(order.total * 1.05 + 10)}</span>
              </div>
            </div>
          </div>

          {/* ── Right: QR Code ── */}
          <div className="tracking-right">
            {isReady ? (
              <div className="card qr-ready-card">
                <div className="qr-ready-badge">🎉 Ready!</div>
                <h2 className="font-display" style={{fontSize:'1.5rem', fontWeight:800, marginBottom:'0.5rem'}}>Show this QR</h2>
                <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'1.5rem'}}>
                  Show this QR code at the counter to collect your order
                </p>
                <div className="qr-display">
                  <QRCodeSVG
                    value={qrValue}
                    size={220}
                    bgColor="transparent"
                    fgColor="#22c55e"
                    level="H"
                  />
                </div>
                <div className="qr-order-info">
                  <div className="qr-info-row"><span>Order ID</span><strong>#{order.id}</strong></div>
                  <div className="qr-info-row"><span>Name</span><strong>{order.customerName}</strong></div>
                  <div className="qr-info-row"><span>Restaurant</span><strong>{order.restaurantName}</strong></div>
                  {order.transactionId && <div className="qr-info-row"><span>TXN</span><strong style={{fontSize:'0.7rem', fontFamily:'monospace'}}>{order.transactionId}</strong></div>}
                </div>
                <button 
                  className="btn btn-primary btn-full mt-4" 
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.restaurantName + ' Guntur')}`, '_blank')}
                >
                  🗺️ Get Directions
                </button>
                <p style={{fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'1rem'}}>✅ Payment Confirmed & Verified</p>
              </div>
            ) : (
              <div className="card qr-waiting-card">
                <div className="waiting-animation">
                  <div className="waiting-ring" />
                  <span className="waiting-icon">🍳</span>
                </div>
                <h3 style={{fontWeight:700, marginBottom:'0.5rem', textAlign:'center'}}>Kitchen is working on it!</h3>
                <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', textAlign:'center', lineHeight:1.6}}>
                  Your QR code will appear here when the order is ready for pickup. This page auto-refreshes every 5 seconds.
                </p>
                <div className="live-pulse-dot">
                  <span className="pulse-dot" /> Live tracking
                </div>

                <div className="pending-qr">
                  <QRCodeSVG
                    value={qrValue}
                    size={160}
                    bgColor="transparent"
                    fgColor="rgba(255,107,43,0.4)"
                    level="H"
                  />
                  <span className="qr-lock">🔒 Unlocks when ready</span>
                </div>
                <button 
                  className="btn btn-outline btn-full mt-6" 
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.restaurantName + ' Guntur')}`, '_blank')}
                >
                  🗺️ Get Directions
                </button>
              </div>
            )}

            {/* Kitchen Shortcut */}
            <div className="kitchen-shortcut" onClick={() => navigate('/kitchen')}>
              <span>👨‍🍳 View Kitchen Dashboard</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
