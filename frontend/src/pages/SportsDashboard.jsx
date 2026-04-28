import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './SportsDashboard.css';

const statusColors = {
  confirmed:  { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6', label: '📅 Confirmed' },
  'checked-in': { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#f59e0b', label: '🏃 Checked In' },
  completed:  { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  text: '#22c55e', label: '✅ Completed' },
};

export default function SportsDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchBookings = async () => {
    try {
      const res = await api.getSportsBookings();
      setBookings(res.bookings || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Venue Manager — Quick Serve";
    fetchBookings();
    const interval = setInterval(fetchBookings, 6000); // Auto-refresh every 6s
    return () => {
      clearInterval(interval);
      document.title = "Quick Serve — Order Food. Skip the Queue. Guntur";
    };
  }, []);

  const updateStatus = async (bookingId, newStatus) => {
    setUpdating(bookingId);
    try {
      const res = await api.updateSportsBooking(bookingId, newStatus);
      setBookings(prev => prev.map(b => b.id === bookingId ? res.booking : b));
    } catch (err) {
      alert('Failed to update: ' + err.message);
    } finally {
      setUpdating(null);
    }
  };

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const checkedInBookings = bookings.filter(b => b.status === 'checked-in');
  const completedBookings = bookings.filter(b => b.status === 'completed').sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

  const timeSince = (iso) => {
    const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (diff < 1) return 'Just now';
    return `${diff} min${diff > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="page-wrapper sports-dashboard-page">
      <div className="container">
        {/* ── Header ── */}
        <div className="kitchen-header">
          <div>
            <div className="kitchen-badge" style={{color: 'var(--blue)', background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)'}}>
              🏟️ Venue Manager
            </div>
            <h1 className="page-title font-display" style={{marginTop:'0.5rem'}}>Sports Dashboard</h1>
            <p className="text-muted">Manage turf bookings · Auto-refreshes every 6s</p>
          </div>
          <div className="kitchen-header-right">
            <div className="refresh-info">
              🔄 Last refresh: {lastRefresh.toLocaleTimeString()}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={fetchBookings}>Refresh Now</button>
          </div>
        </div>

        {/* Stats */}
        <div className="kitchen-stats">
          <div className="k-stat">
            <span className="k-stat-value" style={{color:'var(--blue)'}}>{confirmedBookings.length}</span>
            <span className="k-stat-label">Upcoming</span>
          </div>
          <div className="k-stat">
            <span className="k-stat-value" style={{color:'var(--yellow)'}}>{checkedInBookings.length}</span>
            <span className="k-stat-label">In Progress</span>
          </div>
          <div className="k-stat">
            <span className="k-stat-value" style={{color:'var(--green)'}}>{bookings.length}</span>
            <span className="k-stat-label">Total Bookings</span>
          </div>
          <div className="k-stat">
            <span className="k-stat-value" style={{color:'var(--text-muted)'}}>{completedBookings.length}</span>
            <span className="k-stat-label">History</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-screen">
            <div className="spinner" style={{borderColor: 'var(--blue)', borderRightColor: 'transparent'}} />
            <span>Loading active bookings…</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📅</span>
            <h3>No active bookings</h3>
            <p>Bookings will appear here automatically as customers book their slots.</p>
          </div>
        ) : (
          <div className="kitchen-columns">
            {/* ── Upcoming Column ── */}
            <div className="kitchen-col">
              <div className="col-header preparing-header" style={{borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)', color: 'var(--blue)'}}>
                <span>📅 Upcoming Slots</span>
                <span className="col-count" style={{background: 'var(--blue)'}}>{confirmedBookings.length}</span>
              </div>
              {confirmedBookings.length === 0 ? (
                <div className="col-empty">No upcoming bookings.</div>
              ) : (
                confirmedBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} updating={updating} updateStatus={updateStatus} timeSince={timeSince} />
                ))
              )}
            </div>

            {/* ── In Progress Column ── */}
            <div className="kitchen-col">
              <div className="col-header ready-header" style={{borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)', color: 'var(--yellow)'}}>
                <span>🏃 Currently Playing (Checked In)</span>
                <span className="col-count" style={{background: 'var(--yellow)'}}>{checkedInBookings.length}</span>
              </div>
              {checkedInBookings.length === 0 ? (
                <div className="col-empty">No one is currently playing. Check users in when they arrive.</div>
              ) : (
                checkedInBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} updating={updating} updateStatus={updateStatus} timeSince={timeSince} />
                ))
              )}
            </div>

            {/* ── Completed Column ── */}
            <div className="kitchen-col">
              <div className="col-header" style={{borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)', color: 'var(--green)'}}>
                <span>✅ Completed (History)</span>
                <span className="col-count" style={{background: 'var(--green)'}}>{completedBookings.length}</span>
              </div>
              {completedBookings.length === 0 ? (
                <div className="col-empty">No booking history yet.</div>
              ) : (
                completedBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} updating={updating} updateStatus={updateStatus} timeSince={timeSince} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking, updating, updateStatus, timeSince }) {
  const s = statusColors[booking.status] || statusColors.confirmed;
  const isUpdating = updating === booking.id;

  return (
    <div
      className={`order-card ${booking.status}`}
      id={`sports-booking-${booking.id}`}
      style={{ borderColor: s.border, background: s.bg + '33' }}
    >
      <div className="order-card-header">
        <div className="order-meta">
          <span className="order-number font-display">#{booking.id}</span>
          <span className="order-time">{timeSince(booking.createdAt)}</span>
        </div>
        <span className="order-status-pill" style={{ background: s.bg, color: s.text, borderColor: s.border }}>
          {s.label}
        </span>
      </div>

      <div className="order-restaurant">{booking.serviceName}</div>
      <div className="order-customer">👤 {booking.customerName} · 📞 {booking.customerPhone}</div>

      <div className="order-items">
        <div className="kitchen-item">
          <span className="kitchen-item-name">📅 Date: {booking.date}</span>
        </div>
        <div className="kitchen-item">
          <span className="kitchen-item-name">⏰ Slot: {booking.slotTime}</span>
        </div>
      </div>

      <div className="order-footer">
        <span className="order-total" style={{color: 'var(--blue)'}}>₹{booking.price} Paid</span>
        <div className="order-actions">
          {booking.status === 'confirmed' && (
            <button
              className="btn btn-sm"
              style={{background: 'var(--yellow)', color: '#000'}}
              id={`mark-checkin-${booking.id}`}
              onClick={() => updateStatus(booking.id, 'checked-in')}
              disabled={isUpdating}
            >
              {isUpdating ? '⏳ …' : '🏃 Check In'}
            </button>
          )}
          {booking.status === 'checked-in' && (
            <button
              className="btn btn-green btn-sm"
              id={`mark-completed-${booking.id}`}
              onClick={() => updateStatus(booking.id, 'completed')}
              disabled={isUpdating}
            >
              {isUpdating ? '⏳ …' : '✅ Completed'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
