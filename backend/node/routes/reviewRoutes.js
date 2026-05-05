const express = require('express');
const router = express.Router();
const { getHotelReviews, createReview, replyToReview, getAllReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/hotel/:hotelId', getHotelReviews);
router.post('/', protect, createReview);
router.post('/:id/reply', protect, replyToReview);
router.get('/', protect, getAllReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
