const mongoose = require('mongoose');

const bloodDonorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    bloodGroup: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    availability: { type: String, required: true, trim: true },
    distanceKm: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.BloodDonor || mongoose.model('BloodDonor', bloodDonorSchema);
