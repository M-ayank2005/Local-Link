const mongoose = require('mongoose');

const foodOrderSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodListing',
    required: true
  },
  claimer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['claimed', 'picked_up', 'cancelled'],
    default: 'claimed'
  },
  pickedUpAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('FoodOrder', foodOrderSchema);