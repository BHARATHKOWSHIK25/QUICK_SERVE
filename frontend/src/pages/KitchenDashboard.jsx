import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './KitchenDashboard.css';

const statusColors = {
  preparing: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b', label: '🍳 Preparing' },
  ready:     { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  text: '#22c55e', label: '✅ Ready' },
  delivered: { bg: 'rgba(100,116,139,0.1)',border: 'rgba(100,116,139,0.3)',text: '#64748b', label: '📦 Delivered' },
};

export default function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchOrders = async () => {
    try {
      const res = await api.getKitchenOrders();
      setOrders(res.orders || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Kitchen Manager — Quick Serve";
    fetchOrders();
    const interval = setInterval(fetchOrders, 6000); // Auto-refresh every 6s
    return () => {
      clearInterval(interval);
      document.title = "Quick Serve — Order Food. Skip the Queue. Guntur";
    };
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await api.updateKitchenOrder(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
    } catch (err) {
      alert('Failed to update: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders     = orders.filter(o => o.status === 'ready');
  const deliveredOrders = orders.filter(o => o.status === 'delivered').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const timeSince = (iso) => {
    const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (diff < 1) return 'Just now';
    return `${diff} min${diff > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="page-wrapper kitchen-page">
      <div className="container">
        {/* ── Header ── */}
        <div className="kitchen-header">
          <div>
            <div className="kitchen-badge">👨‍🍳 Kitchen Mode</div>
            <h1 className="page-title font-display" style={{marginTop:'0.5rem'}}>Kitchen Dashboard</h1>
            <p className="text-muted">Real-time incoming orders · Auto-refreshes every 6s</p>
          </div>
          <div className="kitchen-header-right">
            <div className="refresh-info">
              🔄 Last refresh: {lastRefresh.toLocaleTimeString()}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={fetchOrders}>Refresh Now</button>
          </div>
        </div>

        {/* Stats */}
        <div className="kitchen-stats">
          <div className="k-stat">
            <span className="k-stat-value" style={{color:'var(--yellow)'}}>{preparingOrders.length}</span>
            <span className="k-stat-label">Preparing</span>
          </div>
          <div className="k-stat">
            <span className="k-stat-value" style={{color:'var(--green)'}}>{readyOrders.length}</span>
            <span className="k-stat-label">Ready</span>
          </div>
          <div className="k-stat">
            <span className="k-stat-value" style={{color:'var(--accent)'}}>{preparingOrders.length + readyOrders.length}</span>
            <span className="k-stat-label">Total Active</span>
          </div>
          <div className="k-stat">
            <span className="k-stat-value" style={{color:'var(--text-muted)'}}>{deliveredOrders.length}</span>
            <span className="k-stat-label">History</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-screen">
            <div className="spinner" /><span>Loading kitchen orders…</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🍽️</span>
            <h3>No active orders</h3>
            <p>Orders will appear here automatically as customers place and pay for their orders.</p>
            <div className="demo-flow-note">
              <strong>💡 Demo Flow:</strong> Go to Home → Select restaurant → Add items → Cart → Simulate Payment → Come back here!
            </div>
          </div>
        ) : (
          <div className="kitchen-columns">
            {/* ── Preparing Column ── */}
            <div className="kitchen-col">
              <div className="col-header preparing-header">
                <span>🍳 Preparing</span>
                <span className="col-count">{preparingOrders.length}</span>
              </div>
              {preparingOrders.length === 0 ? (
                <div className="col-empty">No orders preparing. Tap "Start Preparing" on incoming orders.</div>
              ) : (
                preparingOrders.map(order => (
                  <OrderCard key={order.id} order={order} updating={updating} updateStatus={updateStatus} timeSince={timeSince} />
                ))
              )}
            </div>

            {/* ── Ready Column ── */}
            <div className="kitchen-col">
              <div className="col-header ready-header">
                <span>✅ Ready for Pickup</span>
                <span className="col-count">{readyOrders.length}</span>
              </div>
              {readyOrders.length === 0 ? (
                <div className="col-empty">No orders ready yet. Mark orders as ready when done.</div>
              ) : (
                readyOrders.map(order => (
                  <OrderCard key={order.id} order={order} updating={updating} updateStatus={updateStatus} timeSince={timeSince} />
                ))
              )}
            </div>

            {/* ── History Column ── */}
            <div className="kitchen-col">
              <div className="col-header" style={{borderColor: 'rgba(100,116,139,0.3)', background: 'rgba(100,116,139,0.05)', color: '#64748b'}}>
                <span>📦 Delivered (History)</span>
                <span className="col-count" style={{background: '#64748b'}}>{deliveredOrders.length}</span>
              </div>
              {deliveredOrders.length === 0 ? (
                <div className="col-empty">No order history yet.</div>
              ) : (
                deliveredOrders.map(order => (
                  <OrderCard key={order.id} order={order} updating={updating} updateStatus={updateStatus} timeSince={timeSince} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, updating, updateStatus, timeSince }) {
  const s = statusColors[order.status] || statusColors.preparing;
  const isUpdating = updating === order.id;

  return (
    <div
      className={`order-card ${order.status}`}
      id={`kitchen-order-${order.id}`}
      style={{ borderColor: s.border, background: s.bg + '33' }}
    >
      <div className="order-card-header">
        <div className="order-meta">
          <span className="order-number font-display">#{order.id}</span>
          <span className="order-time">{timeSince(order.createdAt)}</span>
        </div>
        <span className="order-status-pill" style={{ background: s.bg, color: s.text, borderColor: s.border }}>
          {s.label}
        </span>
      </div>

      <div className="order-restaurant">{order.restaurantName}</div>
      <div className="order-customer">👤 {order.customerName} · 📞 {order.customerPhone}</div>

      <div className="order-items">
        {order.items.map((item, i) => (
          <div key={i} className="kitchen-item">
            <span className="kitchen-item-name">{item.name}</span>
            <span className="kitchen-item-qty">× {item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="order-footer">
        <span className="order-total">₹{Math.round(order.total * 1.05 + 10)}</span>
        <div className="order-actions">
          {order.status === 'preparing' && (
            <button
              className="btn btn-green btn-sm"
              id={`mark-ready-${order.id}`}
              onClick={() => updateStatus(order.id, 'ready')}
              disabled={isUpdating}
            >
              {isUpdating ? '⏳ …' : '✅ Mark Ready'}
            </button>
          )}
          {order.status === 'ready' && (
            <button
              className="btn btn-ghost btn-sm"
              id={`mark-delivered-${order.id}`}
              onClick={() => updateStatus(order.id, 'delivered')}
              disabled={isUpdating}
            >
              {isUpdating ? '⏳ …' : '📦 Delivered'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
