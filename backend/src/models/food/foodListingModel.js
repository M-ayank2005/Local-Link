const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0 
  },
  quantity: {
    type: Number,
    required: true
  },
  ingredients: [String],
  temperatureLogs: [Number], 
  season: {
    type: String,
    enum: ['Summer', 'Winter', 'Monsoon'] 
  },
  expiryDate: {
    type: Date,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'picked_up', 'expired'],
    default: 'available'
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    default: null
  },
  carbonFootprintSaved: {
    type: Number, 
    default: 0
  }
}, { timestamps: true });

foodListingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('FoodListing', foodListingSchema);