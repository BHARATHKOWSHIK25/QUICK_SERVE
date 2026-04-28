import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './TurfDetails.css';

const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i);
  return {
    iso: d.toISOString().slice(0, 10),
    label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
  };
});

export default function TurfDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(DATES[0].iso);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [customerName, setCustomerName] = useState(localStorage.getItem('userName') || '');
  const [customerPhone, setCustomerPhone] = useState(localStorage.getItem('userPhone') || '');
  
  const [booking, setBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    api.getService(id)
      .then(res => setService(res.service))
      .catch(err => {
        console.error(err);
        navigate('/sports');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleBook = async () => {
    if (!selectedSlot) { alert('Please select a time slot.'); return; }
    if (!customerName.trim() || !customerPhone.trim()) { alert('Please fill in your name and phone.'); return; }
    if (customerPhone.replace(/\D/g, '').length < 10) { alert('Please enter a valid 10-digit phone number.'); return; }

    setBooking(true);
    localStorage.setItem('userName', customerName);
    localStorage.setItem('userPhone', customerPhone);
    try {
      const res = await api.createBooking({
        serviceId: service.id,
        slotTime: selectedSlot,
        date: selectedDate,
        customerName,
        customerPhone,
      });
      // Simulate payment for demo
      await api.payBooking(res.booking.id);
      setConfirmedBooking(res.booking);
    } catch (err) {
      alert('Booking failed: ' + err.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <div className="page-wrapper loading-screen"><div className="spinner" style={{borderColor: 'var(--blue)', borderRightColor: 'transparent'}} /><span>Loading turf details…</span></div>
  );

  if (!service) return null;

  if (confirmedBooking) return (
    <div className="page-wrapper turf-details-page">
      <div className="container">
        <div className="booking-success">
          <div className="success-icon">🎉</div>
          <h2 className="font-display" style={{fontSize:'1.8rem', fontWeight:800, marginBottom:'0.5rem'}}>Booking Confirmed!</h2>
          <p style={{color:'var(--text-secondary)', marginBottom:'1.5rem'}}>
            Your slot is reserved and payment is confirmed.
          </p>

          <div className="success-details">
            <div className="success-row"><span>Service</span><strong>{confirmedBooking.serviceName}</strong></div>
            <div className="success-row"><span>Venue</span><strong>{service.location}</strong></div>
            <div className="success-row"><span>Date</span><strong>{confirmedBooking.date}</strong></div>
            <div className="success-row"><span>Time Slot</span><strong>{confirmedBooking.slotTime}</strong></div>
            <div className="success-row"><span>Booking ID</span><strong style={{fontFamily:'monospace'}}>#{confirmedBooking.id}</strong></div>
            <div className="success-row"><span>Amount</span><strong>₹{confirmedBooking.price}</strong></div>
            <div className="success-row"><span>Status</span><strong style={{color:'var(--green)'}}>✅ Confirmed & Paid</strong></div>
          </div>

          <p style={{fontSize:'0.85rem', color:'var(--text-muted)', marginTop:'1.5rem', lineHeight:1.6}}>
            Show your Booking ID #{confirmedBooking.id} at the venue counter. No waiting—your slot is guaranteed!
          </p>

          <button className="btn btn-outline mt-6" style={{marginRight: '1rem'}} onClick={() => navigate('/sports')}>
            Back to Sports
          </button>
        </div>
      </div>
    </div>
  );

  // Generic cover image for turf
  const cricketImages = [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=80',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80',
    'https://images.unsplash.com/photo-1589801258579-18e091f4ca26?w=1200&q=80',
    'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=1200&q=80',
    'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=1200&q=80'
  ];

  const footballImages = [
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80',
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1200&q=80',
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&q=80',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&q=80',
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80'
  ];

  const badmintonImages = [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&q=80',
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1200&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    'https://images.unsplash.com/photo-1628779238951-be2c9f2a59f4?w=1200&q=80',
    'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=1200&q=80'
  ];

  const swimImages = [
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200&q=80',
    'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&q=80',
    'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=1200&q=80',
    'https://images.unsplash.com/photo-1600965962102-9d260a71890d?w=1200&q=80'
  ];

  const idNum = parseInt(service.id.replace('s', '')) || 0;
  let coverImage = 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=1200&q=80';
  
  if (service.name.toLowerCase().includes('cricket') || service.icon === '🏏') {
    coverImage = cricketImages[idNum % cricketImages.length];
  } else if (service.name.toLowerCase().includes('football') || service.icon === '⚽') {
    coverImage = footballImages[idNum % footballImages.length];
  } else if (service.name.toLowerCase().includes('badminton') || service.icon === '🏸') {
    coverImage = badmintonImages[idNum % badmintonImages.length];
  } else if (service.name.toLowerCase().includes('swim') || service.icon === '🏊') {
    coverImage = swimImages[idNum % swimImages.length];
  }

  return (
    <div className="page-wrapper turf-details-page">
      {/* Turf Cover Image */}
      <div className="turf-cover">
        <img src={coverImage} alt={service.name} className="turf-cover-img" />
        <div className="turf-cover-overlay">
          <div className="container">
            <button className="btn btn-ghost btn-sm turf-back-btn" onClick={() => navigate('/sports')}>
              ← Back to Venues
            </button>
            <div className="turf-header-content">
              <span className="turf-badge">{service.icon}</span>
              <h1 className="turf-title font-display">{service.name}</h1>
              <div className="turf-meta">
                <span>📍 {service.location}</span>
                <span className="turf-meta-dot">·</span>
                <span style={{color: 'var(--blue)', fontWeight: 'bold'}}>₹{service.pricePerHour}/hr</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="booking-layout">
          {/* ── Left: Slot Selection ── */}
          <div className="booking-left">
            <div className="card" style={{padding: '1.5rem'}}>
              <h2 className="fw-700 mb-4">Pick a Date</h2>
              <div className="date-chips scroll-row">
                {DATES.map(d => (
                  <button
                    key={d.iso}
                    className={`date-chip ${selectedDate === d.iso ? 'active sports-active' : ''}`}
                    onClick={() => { setSelectedDate(d.iso); setSelectedSlot(null); }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <h2 className="fw-700 mb-4 mt-6">Choose a Time Slot</h2>
              <div className="slot-grid">
                {service.slots.map(slot => (
                  <button
                    key={slot}
                    id={`slot-${slot}`}
                    className={`slot-btn ${selectedSlot === slot ? 'active sports-active' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              
              {service.slots.length === 0 && (
                <div className="text-muted">No slots available for this service.</div>
              )}
            </div>
          </div>

          {/* ── Right: Booking Summary ── */}
          <div className="booking-right">
            <div className="card" style={{padding:'1.5rem', position:'sticky', top:'calc(var(--navbar-height) + 1rem)'}}>
              <h2 className="fw-700 mb-4">Booking Summary</h2>

              <div className="summary-box">
                <div className="summary-service">{service.icon} {service.name}</div>
                <div className="summary-row"><span>Date</span><strong>{selectedDate}</strong></div>
                <div className="summary-row"><span>Time</span><strong>{selectedSlot || 'Not selected'}</strong></div>
                <div className="summary-row"><span>Duration</span><strong>1 Hour</strong></div>
                <div className="summary-row"><span>Venue</span><strong>{service.location}</strong></div>
                <div className="divider" />
                <div className="summary-row total-row">
                  <span>Total</span>
                  <strong style={{color: 'var(--blue)'}}>₹{service.pricePerHour}</strong>
                </div>
              </div>

              <div className="divider" />
              <h3 className="fw-600 mb-4" style={{fontSize:'0.85rem', color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em'}}>Your Details</h3>
              <div style={{display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.25rem'}}>
                <input id="booking-name"  className="input-field sports-input" placeholder="Your Name" value={customerName}  onChange={e => setCustomerName(e.target.value)} />
                <input id="booking-phone" className="input-field sports-input" placeholder="Phone Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} type="tel" maxLength={10} />
              </div>

              <button
                id="confirm-booking-btn"
                className="btn btn-primary btn-full btn-lg sports-btn"
                onClick={handleBook}
                disabled={booking || !selectedSlot}
                style={{background: 'var(--blue)', borderColor: 'var(--blue)'}}
              >
                {booking ? '⏳ Confirming…' : `Confirm & Pay ₹${service.pricePerHour}`}
              </button>
              <p className="secure-note" style={{textAlign:'center', fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.75rem'}}>
                🔒 Payment simulated · Slot guaranteed instantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
