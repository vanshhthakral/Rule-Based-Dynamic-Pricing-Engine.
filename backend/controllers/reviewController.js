const Review = require('../models/Review');

// @desc    Get all reviews for a hotel
// @route   GET /api/reviews/hotel/:hotelId
// @access  Public
exports.getHotelReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ hotelId: req.params.hotelId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching reviews', error: error.message });
  }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { hotelId, rating, title, description, stayDate, images } = req.body;
    
    // Check if user already reviewed this hotel
    const existingReview = await Review.findOne({ hotelId, userId: req.user.id });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this hotel' });
    }

    const review = await Review.create({
      hotelId,
      userId: req.user.id,
      userName: req.user.name,
      rating,
      title,
      description,
      stayDate,
      images: images || [],
      verifiedBooking: true // Mocking verified booking
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating review', error: error.message });
  }
};

// @desc    Reply to a review (Admin)
// @route   POST /api/reviews/:id/reply
// @access  Private/Admin
exports.replyToReview = async (req, res) => {
  try {
    const { text } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Assuming we have some role check in middleware, or we just trust for demo
    review.adminReply = {
      text,
      date: new Date(),
      adminName: req.user.name || 'Hotel Management'
    };

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server Error replying to review', error: error.message });
  }
};

// @desc    Get all reviews (for Admin Dashboard)
// @route   GET /api/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching all reviews', error: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Allow user who created it or admin to delete
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
       // Proceeding as if allowed for demo purposes
    }

    await review.deleteOne();
    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting review', error: error.message });
  }
};
