const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const serializeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: user.isVerified,
  profileImage: user.profileImage,
  address: user.address,
  location: user.location,
  rating: user.rating,
  totalReviews: user.totalReviews,
  isActive: user.isActive,
});

exports.registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role,
      profileImage,
      address,
      location,
    } = req.body;

    if (!fullName || !email || !phone || !password || !role || !location?.coordinates) {
      return res.status(400).json({
        message: 'fullName, email, phone, password, role and location.coordinates are required',
      });
    }

    if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return res.status(400).json({ message: 'location.coordinates must be [longitude, latitude]' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with email or phone already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
      profileImage: profileImage || '',
      address: address || {},
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
    });

    const token = createToken(user._id);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user._id);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  return res.status(200).json({ user: serializeUser(req.user) });
};

exports.getAdminDashboard = async (_req, res) => {
  const totalUsers = await User.countDocuments();
  const totalResidents = await User.countDocuments({ role: 'resident' });
  const totalShopkeepers = await User.countDocuments({ role: 'shopkeeper' });
  const totalNGOs = await User.countDocuments({ role: 'ngo' });
  const totalServiceProviders = await User.countDocuments({ role: 'service_provider' });

  return res.status(200).json({
    message: 'Admin dashboard data',
    stats: {
      totalUsers,
      totalResidents,
      totalShopkeepers,
      totalNGOs,
      totalServiceProviders,
    },
  });
};
