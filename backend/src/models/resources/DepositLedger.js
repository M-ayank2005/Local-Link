const mongoose = require('mongoose');

// Immutable audit trail — one document per deposit state transition.
// Events: held → released | forfeited | partial_refund
const depositLedgerSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'ResourceBooking',
    required: true,
  },
  renter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  event: {
    type: String,
    enum: ['held', 'released', 'forfeited', 'partial_refund'],
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

module.exports = mongoose.model('DepositLedger', depositLedgerSchema);
