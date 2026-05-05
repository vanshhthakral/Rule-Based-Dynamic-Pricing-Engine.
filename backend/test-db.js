const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/aureva';

const test = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected');
    const user = await User.findOne({ email: 'admin@aureva.com' });
    console.log('User found:', user ? user.email : 'No user');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

test();
