const mongoose = require('mongoose');
const User = require('./models/User');
const Review = require('./models/Review');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://127.0.0.1:27017/aureva';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing reviews
    await Review.deleteMany({});
    
    // Create a dummy user if not exists
    let user = await User.findOne({ email: 'admin@aureva.com' });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      user = await User.create({
        name: 'Admin User',
        email: 'admin@aureva.com',
        password: hashedPassword
      });
      console.log('Dummy user created');
    }

    const reviews = [
      {
        hotelId: '1',
        userId: user._id,
        userName: 'John Doe',
        rating: 5,
        title: 'Amazing experience!',
        description: 'The stay was absolutely wonderful. The staff was very attentive and the dynamic pricing gave me a great deal for my weekend stay.',
        stayDate: new Date('2024-03-15'),
        helpfulCount: 12,
        verifiedBooking: true,
        adminReply: {
          text: 'Thank you John! We are glad you enjoyed the pricing and our service.',
          date: new Date('2024-03-16'),
          adminName: 'Hotel Manager'
        }
      },
      {
        hotelId: '1',
        userId: user._id,
        userName: 'Sarah Smith',
        rating: 4,
        title: 'Very comfortable stay',
        description: 'Rooms were clean and the location is perfect. Highly recommend for business trips.',
        stayDate: new Date('2024-03-10'),
        helpfulCount: 5,
        verifiedBooking: true
      },
      {
        hotelId: '2',
        userId: user._id,
        userName: 'Mike Ross',
        rating: 5,
        title: 'Stunning views',
        description: 'Waking up to the ocean view was the highlight of my trip. Worth every penny.',
        stayDate: new Date('2024-03-01'),
        helpfulCount: 8,
        verifiedBooking: true
      }
    ];

    await Review.insertMany(reviews);
    console.log('Dummy reviews added');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
