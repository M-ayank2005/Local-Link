const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const TOKEN_COOKIE_NAME = 'token';

const setAuthCookie = (res, token) => {
  res.cookie(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookie = (res) => {
  res.cookie(TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
  });
};

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
    setAuthCookie(res, token);

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
    setAuthCookie(res, token);

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

exports.updateMyProfile = async (req, res) => {
  try {
    const { fullName, phone, profileImage, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: user._id } });
      if (existingPhone) {
        return res.status(400).json({ message: 'Phone number is already in use' });
      }
      user.phone = phone.trim();
    }

    if (typeof fullName === 'string') {
      user.fullName = fullName.trim();
    }

    if (typeof profileImage === 'string') {
      user.profileImage = profileImage;
    }

    if (address && typeof address === 'object') {
      user.address = {
        street: address.street || user.address?.street || '',
        city: address.city || user.address?.city || '',
        state: address.state || user.address?.state || '',
        pincode: address.pincode || user.address?.pincode || '',
      };
    }

    await user.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: serializeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    const resetTokenRaw = crypto.randomBytes(32).toString('hex');
    const resetTokenHashed = crypto.createHash('sha256').update(resetTokenRaw).digest('hex');

    user.resetPasswordToken = resetTokenHashed;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    return res.status(200).json({
      message: 'Password reset token generated',
      resetToken: resetTokenRaw,
      resetPath: `/landing?resetToken=${resetTokenRaw}`,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'token and newPassword are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpire +password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.logoutUser = async (_req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ message: 'Logged out successfully' });
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
