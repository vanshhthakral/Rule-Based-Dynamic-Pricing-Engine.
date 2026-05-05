import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, TrendingUp, TrendingDown, Info } from 'lucide-react';
import './HotelCard.css';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  const { id, name, location, rating, reviews, image, amenities, pricing } = hotel;
  const { basePrice, currency, dynamicFactors } = pricing;
  const liveQuote = hotel.liveQuote;
  const currentPrice = liveQuote?.daily_rate ?? liveQuote?.final_price ?? hotel.computedPrice;
  const hasQuote = Number.isFinite(currentPrice);
  const demandLevel = String(liveQuote?.predicted_demand || '').toLowerCase();

  const isDiscounted = hasQuote && currentPrice < basePrice;
  const isSurged = hasQuote && currentPrice > basePrice;
  const percentDiff = hasQuote ? Math.round(Math.abs((currentPrice - basePrice) / basePrice * 100)) : 0;

  const handleClick = () => {
    navigate(`/hotel/${id}`);
  };

  return (
    <div className="hotel-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="hotel-image-container">
        <img src={image} alt={name} className="hotel-image" />
        <div className="hotel-badges">
          {isDiscounted && (
            <span className="badge badge-discount">
              <TrendingDown size={14} /> {percentDiff}% OFF
            </span>
          )}
          {isSurged && demandLevel && (
            <span className={`badge badge-demand badge-${demandLevel}`}>
              <TrendingUp size={14} /> {demandLevel.toUpperCase()} Demand
            </span>
          )}
        </div>
      </div>
      
      <div className="hotel-details">
        <div className="hotel-header">
          <h3 className="hotel-name">{name}</h3>
          <div className="hotel-rating">
            <Star size={16} className="star-icon" fill="currentColor" />
            <span>{rating}</span>
            <span className="reviews">({reviews})</span>
          </div>
        </div>
        
        <p className="hotel-location">
          <MapPin size={14} /> {location}
        </p>
        
        <div className="hotel-amenities">
          {amenities.slice(0, 3).map((amenity, index) => (
            <span key={index} className="amenity-tag">{amenity}</span>
          ))}
          {amenities.length > 3 && (
            <span className="amenity-tag">+{amenities.length - 3}</span>
          )}
        </div>
        
        <div className="hotel-footer">
          <div className="pricing-info">
            <div className="price-container">
              <span className={`current-price ${demandLevel === 'high' ? 'text-high' : demandLevel === 'medium' ? 'text-medium' : demandLevel === 'low' ? 'text-low' : ''}`}>
                {hasQuote ? `${currency}${currentPrice}` : '...'}
              </span>
              <span className="price-period">/ night</span>
            </div>
            
            {hasQuote && (isSurged || isDiscounted) && (
              <div className="dynamic-insight tooltip-trigger" onClick={(e) => e.stopPropagation()}>
                <Info size={14} />
                <span className="insight-text">
                  Dynamic pricing active
                </span>
                <div className="tooltip">
                  <strong>Demand:</strong> {demandLevel || dynamicFactors.tourist_level}<br/>
                  <strong>Season:</strong> {dynamicFactors.season}
                </div>
              </div>
            )}
          </div>
          
          <button className="btn btn-primary book-btn" onClick={(e) => { e.stopPropagation(); navigate(`/hotel/${id}`); }}>Book Now</button>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
