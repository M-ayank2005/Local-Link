const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    category: {
      type: String,
      enum: ['drill', 'ladder', 'projector', 'tent', 'tool', 'appliance', 'sports', 'other'],
      required: [true, 'Please select a category'],
    },
    condition: {
      type: String,
      enum: ['new', 'good', 'fair'],
      required: [true, 'Please specify condition'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Please set a price per day'],
      min: 0,
    },
    depositAmount: {
      type: Number,
      required: [true, 'Please set a deposit amount'],
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    rules: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    // GeoJSON Point — coordinates: [longitude, latitude]
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    availableFrom: {
      type: Date,
      required: true,
    },
    availableTo: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

resourceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Resource', resourceSchema);
