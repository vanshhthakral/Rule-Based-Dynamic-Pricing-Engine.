import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { mockHotels } from '../data/mockHotels';
import { ArrowLeft, CreditCard, Sparkles, Info, Activity } from 'lucide-react';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const routeState = routeLocation.state || {};
  const [hotel, setHotel] = useState(null);
  const [checkInDate, setCheckInDate] = useState(() => {
    if (routeState.checkInDate) return routeState.checkInDate;
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    if (routeState.checkOutDate) return routeState.checkOutDate;
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  
  const [pricingData, setPricingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const durationDays = (() => {
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    const diff = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
    return Number.isFinite(diff) && diff > 0 ? diff : 1;
  })();

  useEffect(() => {
    const foundHotel = mockHotels.find(h => h.id === id);
    setHotel(foundHotel);
    
    if (foundHotel) {
      // Fetch dynamic price from Flask ML API
      const fetchPrice = async () => {
        try {
          // Use current real-world time for dynamic inputs
          const now = new Date();
          const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
          
          const ml = foundHotel.ml;
          const response = await fetch('/api/calculate-price', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base_price: foundHotel.pricing.basePrice,
              day_of_week: currentDay,
              hotel: ml.hotel,
              season: ml.season,
              adults: ml.adults,
              children: ml.children,
              babies: ml.babies,
              market_segment: ml.market_segment,
              lead_time: ml.lead_time,
              duration_days: durationDays,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
          }
          
          const data = await response.json();
          setPricingData(data);
          setLoading(false);
        } catch (err) {
          setError(err.message);
          setLoading(false);
        }
      };
      
      fetchPrice();
    }
  }, [id, durationDays]);

  if (!hotel) {
    return (
      <div className="container" style={{paddingTop: '100px'}}>
        <h2>Loading...</h2>
      </div>
    );
  }

  const { name, image, location, pricing } = hotel;
  const { currency } = pricing;

  return (
    <div className="booking-page">
      <div className="container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back
        </button>

        <h1 className="booking-title">Confirm and pay</h1>

        <div className="booking-layout">
          <div className="booking-form-section">
            <div className="payment-alert">
              <Sparkles className="text-primary" size={24} />
              <div>
                <h4>Smart Pricing Active</h4>
                <p>This reservation is powered by our real-time AI pricing engine to ensure fair market value.</p>
              </div>
            </div>

            <h2 className="section-heading">Your trip</h2>
            <div className="trip-details">
              <div className="trip-item">
                <strong>Dates</strong>
                <span>{checkInDate} - {checkOutDate}</span>
              </div>
              <div className="trip-item">
                <strong>Guests</strong>
                <span>2 guests</span>
              </div>
              <div className="trip-item">
                <strong>Duration</strong>
                <span>{durationDays} day(s)</span>
              </div>
            </div>

            <hr className="divider" />

            <h2 className="section-heading">Pay with</h2>
            <div className="payment-options">
              <div className="payment-card">
                <CreditCard size={20} />
                <span>Credit or debit card</span>
              </div>
            </div>

            <hr className="divider" />
            <button className="btn btn-primary btn-block confirm-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Reservation'}
            </button>
          </div>

          <div className="booking-summary-section">
            <div className="summary-card">
              <div className="summary-hotel">
                <img src={image} alt={name} className="summary-img" />
                <div className="summary-hotel-info">
                  <span className="summary-hotel-name">{name}</span>
                  <span className="summary-hotel-location">{location}</span>
                </div>
              </div>

              <hr className="divider" />

              {loading ? (
                <div className="pricing-loading-state">
                  <div className="pulse-loader"></div>
                  <h3>Calculating real-time price...</h3>
                  <p>Analyzing current demand and local factors</p>
                </div>
              ) : error ? (
                <div className="pricing-error-state">
                  <p>Unable to fetch dynamic pricing: {error}</p>
                </div>
              ) : pricingData && (
                <div className="pricing-results">
                  <div className="demand-level-container">
                    <span className="demand-label"><Activity size={16}/> Current Demand Level:</span>
                    <span className={`demand-badge badge-${pricingData.predicted_demand.toLowerCase()}`}>
                      {pricingData.predicted_demand}
                    </span>
                  </div>

                  <h3 className="price-details-title">Price Breakdown</h3>
                  
                  <div className="price-breakdown-list">
                    <div className="breakdown-item base-item">
                      <span>Base Price</span>
                      <span>{currency}{pricingData.base_price.toFixed(2)}</span>
                    </div>
                    
                    {pricingData.applied_rules.map((rule, idx) => (
                      <div key={idx} className="breakdown-item rule-item">
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>

                  <hr className="divider" />

                  <div className="total-row">
                    <span>Total ({pricingData.duration_days || durationDays} day(s))</span>
                    <span className="final-highlight-price">{currency}{(pricingData.total_price ?? pricingData.final_price).toFixed(2)}</span>
                  </div>

                  <div className="explanation-box">
                    <h4><Info size={16}/> Why this price?</h4>
                    <p>{pricingData.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
