export const calculatePrice = (basePrice, factors) => {
  const { season, checkin_day, tourist_level } = factors;
  let price = basePrice;
  const breakdown = [{ rule: 'Base Price', value: price, change: '—' }];

  if (season === 'peak') {
    price *= 1.25;
    breakdown.push({ rule: 'Peak Season', value: Math.round(price), change: '+25%' });
  } else if (season === 'off') {
    price *= 0.80;
    breakdown.push({ rule: 'Off Season', value: Math.round(price), change: '-20%' });
  }

  if (checkin_day === 'weekend') {
    price *= 1.10;
    breakdown.push({ rule: 'Weekend', value: Math.round(price), change: '+10%' });
  }

  if (tourist_level === 'high') {
    price *= 1.20;
    breakdown.push({ rule: 'High Tourist Demand', value: Math.round(price), change: '+20%' });
  } else if (tourist_level === 'low') {
    price *= 0.90;
    breakdown.push({ rule: 'Low Tourist Demand', value: Math.round(price), change: '-10%' });
  }

  const maxPrice = basePrice * 1.50;
  const minPrice = basePrice * 0.70;
  
  let final = Math.min(maxPrice, Math.max(minPrice, price));
  final = Math.round(final);

  if (final !== Math.round(price)) {
    breakdown.push({ rule: 'Fairness Cap Applied', value: final, change: 'Capped' });
  }

  return { finalPrice: final, breakdown };
};

const exactHotels = [
  // Chandigarh
  {
    location: 'Chandigarh',
    name: 'Noura Chandigarh - The Green Escape',
    category: 'City',
    imagePrefix: '/Images/Chandigarh/Hotels/Noura Chandigarh - The Green Escape/',
    imageCount: 7,
    basePrice: 7200,
    season: 'normal'
  },
  {
    location: 'Chandigarh',
    name: 'Regenta place Panchkula Morni Hills',
    category: 'City',
    imagePrefix: '/Images/Chandigarh/Hotels/Regenta place Panchkula Morni Hills/',
    imageCount: 5,
    basePrice: 6800,
    season: 'peak'
  },
  {
    location: 'Chandigarh',
    name: 'Saltstayz Trinity',
    category: 'City',
    imagePrefix: '/Images/Chandigarh/Hotels/Saltstayz Trinity/',
    imageCount: 5,
    basePrice: 5400,
    season: 'off'
  },
  
  // Dehradun
  {
    location: 'Dehradun',
    name: 'Clarion',
    category: 'Mountains',
    imagePrefix: '/Images/Dehardun/Hotels/Clarion/',
    imageCount: 3,
    basePrice: 7600,
    season: 'normal'
  },
  {
    location: 'Dehradun',
    name: 'Hotel Doon Pride',
    category: 'Mountains',
    imagePrefix: '/Images/Dehardun/Hotels/Hotel Doon Pride/',
    imageCount: 5,
    basePrice: 4900,
    season: 'off'
  },
  {
    location: 'Dehradun',
    name: 'Pride Premier Solitaire',
    category: 'Mountains',
    imagePrefix: '/Images/Dehardun/Hotels/Pride Premier Solitaire/',
    imageCount: 4,
    basePrice: 8300,
    season: 'peak'
  },
  
  // Delhi
  {
    location: 'Delhi',
    name: 'Radisson Blu New Delhi Dwarka',
    category: 'City',
    imagePrefix: '/Images/Delhi/Hotels/Radisson Blu New Delhi Dwarka/',
    imageCount: 7,
    basePrice: 8700,
    season: 'normal'
  },
  {
    location: 'Delhi',
    name: 'The Leela Ambience Convention Hotel Delhi',
    category: 'City',
    imagePrefix: '/Images/Delhi/Hotels/The Leela Ambience Convention Hotel Delhi/',
    imageCount: 4,
    basePrice: 11200,
    season: 'peak'
  },
  {
    location: 'Delhi',
    name: 'Welcomhotel by ITC Hotels',
    category: 'City',
    imagePrefix: '/Images/Delhi/Hotels/Welcomhotel by ITC Hotels/',
    imageCount: 5,
    basePrice: 9400,
    season: 'normal'
  },
  
  // Rishikesh
  {
    location: 'Rishikesh',
    name: 'Hotel Lemon Tree',
    category: 'Mountains',
    imagePrefix: '/Images/Rishikesh/Hotel/Hotel Lemon Tree/',
    imageCount: 7,
    basePrice: 8800,
    season: 'peak'
  },
  {
    location: 'Rishikesh',
    name: 'Hotel Oak Leaf Rishikesh',
    category: 'Mountains',
    imagePrefix: '/Images/Rishikesh/Hotel/Hotel Oak Leaf Rishikesh/',
    imageCount: 6,
    basePrice: 6200,
    season: 'normal'
  },
  {
    location: 'Rishikesh',
    name: 'Hotel Vasundhara Palace',
    category: 'Mountains',
    imagePrefix: '/Images/Rishikesh/Hotel/Hotel Vasundhara Palace/',
    imageCount: 5,
    basePrice: 7100,
    season: 'off'
  }
];

/** Matches Kaggle Hotel Booking Demand `market_segment` values for ML API. */
const ML_MARKET_SEGMENTS = [
  'Direct', 'Online TA', 'Offline TA/TO', 'Groups', 'Corporate',
  'Complementary', 'Undefined', 'Aviation',
];

const kaggleHotelType = (category) => (category === 'Mountains' ? 'Resort Hotel' : 'City Hotel');

const generateHotels = () => {
  const hotels = [];
  let idCounter = 1;

  exactHotels.forEach(h => {
    // Generate an array of image paths
    const imagesArray = Array.from({ length: h.imageCount }, (_, i) => `${h.imagePrefix}${i + 1}.png`);
    
    const season = h.season;
    hotels.push({
      id: `h${idCounter}`,
      name: h.name,
      location: h.location,
      category: h.category,
      rating: (Math.random() * (5 - 4) + 4).toFixed(1),
      reviews: Math.floor(Math.random() * 1000) + 100,
      image: imagesArray[0], // primary image
      images: imagesArray, // all images
      amenities: ['Free WiFi', 'AC', 'Breakfast', 'Pool', 'Gym'].slice(0, 2 + Math.floor(Math.random() * 3)),
      pricing: {
        basePrice: h.basePrice,
        currency: '₹',
        dynamicFactors: {
          season,
          checkin_day: Math.random() > 0.7 ? 'weekend' : 'weekday',
          tourist_level: Math.random() > 0.6 ? 'high' : (Math.random() > 0.5 ? 'medium' : 'low')
        }
      },
      ml: {
        hotel: kaggleHotelType(h.category),
        season,
        market_segment: ML_MARKET_SEGMENTS[idCounter % ML_MARKET_SEGMENTS.length],
        adults: 2,
        children: idCounter % 4 === 0 ? 1 : 0,
        babies: 0,
        lead_time: 8 + (idCounter % 40),
      },
    });
    idCounter++;
  });

  return hotels;
};

export const mockHotels = generateHotels();
