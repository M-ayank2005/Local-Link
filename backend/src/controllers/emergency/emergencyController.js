const BloodDonor = require('../../models/emergency/BloodDonor');
const MedicineStock = require('../../models/emergency/MedicineStock');

const defaultBloodDonors = [
  { name: 'Aarav Mehta', bloodGroup: 'A+', locality: 'Indirapuram', availability: 'Available now', distanceKm: 1.8 },
  { name: 'Sneha Verma', bloodGroup: 'B+', locality: 'Vaishali', availability: 'Available in 30 mins', distanceKm: 3.1 },
  { name: 'Rohan Singh', bloodGroup: 'O-', locality: 'Raj Nagar', availability: 'Available now', distanceKm: 2.4 },
  { name: 'Fatima Khan', bloodGroup: 'AB+', locality: 'Kaushambi', availability: 'Busy, call later', distanceKm: 4.2 },
  { name: 'Nikhil Jain', bloodGroup: 'O+', locality: 'Indirapuram', availability: 'Available now', distanceKm: 1.2 },
];

const defaultMedicineStock = [
  { medicine: 'Remdesivir', store: 'City Care Pharmacy', locality: 'Vaishali', availability: 'In stock', eta: 'Pickup now' },
  { medicine: 'Oxygen Cylinder', store: 'Life Support Hub', locality: 'Indirapuram', availability: 'Limited stock', eta: '30 mins' },
  { medicine: 'Insulin', store: 'MediQuick', locality: 'Raj Nagar', availability: 'In stock', eta: 'Pickup now' },
  { medicine: 'Dolo 650', store: 'Wellness Plus', locality: 'Kaushambi', availability: 'In stock', eta: '15 mins' },
  { medicine: 'Ventolin Inhaler', store: 'BreatheEasy Pharma', locality: 'Indirapuram', availability: 'Out of stock', eta: 'Restock tonight' },
];

let isSeeded = false;

const ensureEmergencySeedData = async () => {
  if (isSeeded) {
    return;
  }

  const [bloodCount, medicineCount] = await Promise.all([
    BloodDonor.countDocuments(),
    MedicineStock.countDocuments(),
  ]);

  if (bloodCount === 0) {
    await BloodDonor.insertMany(defaultBloodDonors);
  }

  if (medicineCount === 0) {
    await MedicineStock.insertMany(defaultMedicineStock);
  }

  isSeeded = true;
};

exports.getEmergencyOverview = async (_req, res) => {
  try {
    await ensureEmergencySeedData();

    const [totalBloodDonors, totalMedicineEntries, bloodLocalities, medicineLocalities] = await Promise.all([
      BloodDonor.countDocuments({ isActive: true }),
      MedicineStock.countDocuments({ isActive: true }),
      BloodDonor.distinct('locality', { isActive: true }),
      MedicineStock.distinct('locality', { isActive: true }),
    ]);

    return res.status(200).json({
      message: 'Emergency overview fetched',
      stats: {
        totalBloodDonors,
        totalMedicineEntries,
        bloodLocalities: bloodLocalities.length,
        medicineLocalities: medicineLocalities.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getBloodNetwork = async (req, res) => {
  try {
    await ensureEmergencySeedData();

    const { bloodGroup, locality } = req.query;
    const query = { isActive: true };

    if (bloodGroup && bloodGroup !== 'ALL') {
      query.bloodGroup = bloodGroup;
    }

    if (locality && locality !== 'ALL') {
      query.locality = locality;
    }

    const donors = await BloodDonor.find(query).sort({ distanceKm: 1, createdAt: -1 });
    const localities = await BloodDonor.distinct('locality', { isActive: true });

    return res.status(200).json({
      message: 'Blood network fetched',
      donors,
      filters: {
        localities,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMedicineNetwork = async (req, res) => {
  try {
    await ensureEmergencySeedData();

    const { q, locality } = req.query;
    const query = { isActive: true };

    if (q && q.trim()) {
      query.medicine = { $regex: q.trim(), $options: 'i' };
    }

    if (locality && locality !== 'ALL') {
      query.locality = locality;
    }

    const medicines = await MedicineStock.find(query).sort({ createdAt: -1 });
    const localities = await MedicineStock.distinct('locality', { isActive: true });

    return res.status(200).json({
      message: 'Medicine network fetched',
      medicines,
      filters: {
        localities,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
