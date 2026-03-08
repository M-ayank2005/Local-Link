const mongoose = require('mongoose');

const medicineStockSchema = new mongoose.Schema(
  {
    medicine: { type: String, required: true, trim: true },
    store: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    availability: { type: String, required: true, trim: true },
    eta: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.MedicineStock || mongoose.model('MedicineStock', medicineStockSchema);
