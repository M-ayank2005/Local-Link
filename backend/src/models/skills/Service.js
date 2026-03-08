const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a service title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a service category'],
      enum: [
        'electrician',
        'plumber',
        'carpenter',
        'tutor',
        'cleaner',
        'painter',
        'mechanic',
        'helper',
        'cook',
        'driver',
        'other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Please provide a service description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Please specify price per hour'],
      min: [0, 'Price cannot be negative'],
    },
    pricePerVisit: {
      type: Number,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    serviceRadius: {
      type: Number,
      default: 5, // km
    },
    availability: {
      monday: { isAvailable: { type: Boolean, default: true }, slots: [{ start: String, end: String }] },
      tuesday: { isAvailable: { type: Boolean, default: true }, slots: [{ start: String, end: String }] },
      wednesday: { isAvailable: { type: Boolean, default: true }, slots: [{ start: String, end: String }] },
      thursday: { isAvailable: { type: Boolean, default: true }, slots: [{ start: String, end: String }] },
      friday: { isAvailable: { type: Boolean, default: true }, slots: [{ start: String, end: String }] },
      saturday: { isAvailable: { type: Boolean, default: true }, slots: [{ start: String, end: String }] },
      sunday: { isAvailable: { type: Boolean, default: false }, slots: [{ start: String, end: String }] },
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experience: {
      type: Number,
      default: 0, // years
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    images: [
      {
        type: String,
      },
    ],
    languages: [
      {
        type: String,
        default: 'Hindi',
      },
    ],
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ location: '2dsphere' });
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ provider: 1 });

module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema);
