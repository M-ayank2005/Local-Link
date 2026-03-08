const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.ObjectId,
      ref: 'Service',
      required: true,
    },
    booking: {
      type: mongoose.Schema.ObjectId,
      ref: 'Booking',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    images: [
      {
        type: String,
      },
    ],
    isVerified: {
      type: Boolean,
      default: true, // Verified if linked to a booking
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    response: {
      text: { type: String, default: null },
      respondedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews for the same booking
reviewSchema.index({ booking: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ service: 1, createdAt: -1 });
reviewSchema.index({ provider: 1 });

// Static method to calculate average rating for a service
reviewSchema.statics.calculateAverageRating = async function (serviceId) {
  const stats = await this.aggregate([
    { $match: { service: serviceId } },
    {
      $group: {
        _id: '$service',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Service').findByIdAndUpdate(serviceId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await mongoose.model('Service').findByIdAndUpdate(serviceId, {
      rating: 0,
      totalReviews: 0,
    });
  }
};

// Update rating after save
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.service);
});

// Update rating after remove
reviewSchema.post('remove', function () {
  this.constructor.calculateAverageRating(this.service);
});

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
