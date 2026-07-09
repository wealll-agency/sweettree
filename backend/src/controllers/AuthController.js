import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { logActivity } from '../middleware/logger.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // First user is Super Admin
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'Super Admin' : 'Customer';

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role
    });

    if (user) {
      const token = generateToken(res, user._id);
      await logActivity(user._id, 'REGISTER', `User successfully registered with email: ${email}`, req);

      res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id);
      await logActivity(user._id, 'LOGIN', `User logged in`, req);

      res.json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res, next) => {
  try {
    if (req.user) {
      await logActivity(req.user._id, 'LOGOUT', `User logged out`, req);
    }
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      await logActivity(user._id, 'UPDATE_PROFILE', `User updated profile settings`, req);

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          addresses: updatedUser.addresses
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add address to profile
// @route   POST /api/auth/addresses
// @access  Private
export const addAddress = async (req, res, next) => {
  const { street, city, state, zipCode, country, isDefault } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (isDefault) {
        // Set all other addresses isDefault to false
        user.addresses.forEach(addr => addr.isDefault = false);
      }

      user.addresses.push({ street, city, state, zipCode, country, isDefault: isDefault || user.addresses.length === 0 });
      await user.save();
      await logActivity(user._id, 'ADD_ADDRESS', `Added address: ${street}, ${city}`, req);

      res.status(201).json({ success: true, addresses: user.addresses });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address from profile
// @route   DELETE /api/auth/addresses/:id
// @access  Private
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
      await user.save();
      await logActivity(req.user._id, 'DELETE_ADDRESS', `Deleted address ID: ${req.params.id}`, req);

      res.json({ success: true, addresses: user.addresses });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};
