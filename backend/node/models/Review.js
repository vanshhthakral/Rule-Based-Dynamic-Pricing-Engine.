const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  hotelId: {
    type: String, // Storing as String to match mockHotels ID
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userAvatar: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  stayDate: {
    type: Date,
    required: true
  },
  images: [{
    type: String
  }],
  helpfulCount: {
    type: Number,
    default: 0
  },
  verifiedBooking: {
    type: Boolean,
    default: true
  },
  adminReply: {
    text: { type: String },
    date: { type: Date },
    adminName: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
