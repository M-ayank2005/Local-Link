const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.ObjectId,
      ref: 'Resource',
      required: true,
    },
    renter: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    totalRent: {
      type: Number,
      required: true,
    },
    depositAmount: {
      type: Number,
      required: true,
    },
    // Deposit state machine: held → released | forfeited | partial_refund
    depositStatus: {
      type: String,
      enum: ['held', 'released', 'forfeited', 'partial_refund'],
      default: 'held',
    },
    // Booking lifecycle status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'returned', 'cancelled'],
      default: 'confirmed',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online'],
      default: 'cash',
    },
    // ML no-show risk score stored at booking time
    mlNoShowProbability: {
      type: Number,
      default: null,
    },
    mlRiskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', null],
      default: null,
    },
    depositLedger: {
      type: mongoose.Schema.ObjectId,
      ref: 'DepositLedger',
    },
    returnNotes: {
      type: String,
      default: '',
    },
    returnCondition: {
      type: String,
      enum: ['good', 'damaged', null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
