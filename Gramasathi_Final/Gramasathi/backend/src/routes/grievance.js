// routes/grievance.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Grievance from '../models/Grievance.js';
import upload from '../upload.js'; // multer config

const router = express.Router();

// 🛡️ Middleware to authenticate user
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid user' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Unauthorized', error: err.message });
  }
};

// ✅ POST /api/grievances — Submit grievance with optional image
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    console.log('📥 Form Body:', req.body);
    console.log('🖼️ Uploaded File:', req.file);

    const grievance = new Grievance({
      user: req.user._id,
      description: req.body.description,
      location: req.body.location,
      image: req.file ? req.file.filename : '', // Save only the filename
    });

    await grievance.save();
    res.status(201).json({ success: true, message: 'Grievance submitted', grievance });
  } catch (err) {
    console.error('❌ Grievance error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to save grievance', error: err.message });
  }
});

// ✅ GET /api/grievances — Only admins can access
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const grievances = await Grievance.find().populate('user', 'name email');
    res.status(200).json({ success: true, grievances });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch grievances', error: err.message });
  }
});

export default router;
