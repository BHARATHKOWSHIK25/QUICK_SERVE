import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SportsCard.css';

export default function SportsCard({ service }) {
  const navigate = useNavigate();
  
  // We'll map some random sports images from unsplash based on the name/icon
  const cricketImages = [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80',
    'https://images.unsplash.com/photo-1589801258579-18e091f4ca26?w=600&q=80',
    'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=600&q=80',
    'https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=600&q=80'
  ];
  
  const footballImages = [
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80',
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&q=80',
    'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&q=80',
    'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&q=80',
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80'
  ];

  const badmintonImages = [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80',
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
    'https://images.unsplash.com/photo-1628779238951-be2c9f2a59f4?w=600&q=80',
    'https://images.unsplash.com/photo-1599839619722-39751411ea63?w=600&q=80'
  ];

  const swimImages = [
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&q=80',
    'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&q=80',
    'https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=600&q=80',
    'https://images.unsplash.com/photo-1600965962102-9d260a71890d?w=600&q=80'
  ];

  const idNum = parseInt(service.id.replace('s', '')) || 0;
  let imageUrl = 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=600&q=80'; // generic turf

  if (service.name.toLowerCase().includes('cricket') || service.icon === '🏏') {
    imageUrl = cricketImages[idNum % cricketImages.length];
  } else if (service.name.toLowerCase().includes('football') || service.icon === '⚽') {
    imageUrl = footballImages[idNum % footballImages.length];
  } else if (service.name.toLowerCase().includes('badminton') || service.icon === '🏸') {
    imageUrl = badmintonImages[idNum % badmintonImages.length];
  } else if (service.name.toLowerCase().includes('swim') || service.icon === '🏊') {
    imageUrl = swimImages[idNum % swimImages.length];
  }

  return (
    <div
      className="sports-card"
      onClick={() => navigate(`/sports/${service.id}`)}
      role="button"
      tabIndex={0}
      id={`sportscard-${service.id}`}
    >
      {/* Image */}
      <div className="sc-image-wrap">
        <img src={imageUrl} alt={service.name} className="sc-image" loading="lazy" />
        <span className="sc-icon-badge">{service.icon}</span>
      </div>

      {/* Content */}
      <div className="sc-content">
        <div className="sc-top">
          <h3 className="sc-name">{service.name}</h3>
        </div>
        
        <div className="sc-meta">
          <span>📍 {service.location}</span>
          <span>·</span>
          <span style={{color: 'var(--accent)', fontWeight: 700}}>₹{service.pricePerHour}/hr</span>
        </div>

        <div className="sc-footer">
          <span className="sc-slots-tag">{service.slots.length} slots available</span>
          <button className="btn btn-outline btn-sm">Book Now</button>
        </div>
      </div>
    </div>
  );
}
