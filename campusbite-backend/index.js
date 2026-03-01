require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Import Models
const Vendor = require('./models/Vendor');
const Menu = require('./models/Menu');
const Order = require('./models/Order');
const Campus = require('./models/Campus');
const CollegeAdmin = require('./models/CollegeAdmin');
const Otp = require('./models/Otp');
const GlobalSettings = require('./models/GlobalSettings');
const StockImage = require('./models/StockImage');
const axios = require('axios'); // For future SMS gateway integration

const app = express();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH"]
  }
});

// Database Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusbite';
console.log('Attempting to connect to:', mongoURI.split('@')[1] || 'Local DB');

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000
}).then(async () => {
  console.log('✅ Connected to MongoDB successfully');
  await seedDatabase();
  
  // Set up Automatic Canteen Suspension Cron Job
  // Runs every day at Midnight (00:00) server time
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily subscription check...');
    try {
      const now = new Date();
      const result = await Vendor.updateMany(
        { 
          role: 'vendor', 
          'subscription.status': 'Active', 
          'subscription.validUntil': { $lt: now } 
        },
        { 
          $set: { 'subscription.status': 'Suspended' } 
        }
      );
      console.log(`Suspended ${result.modifiedCount} vendor(s) due to expired subscriptions.`);
    } catch (err) {
      console.error('Error in subscription cron job:', err);
    }
  });

}).catch(err => console.error('❌ MongoDB Connection Error:', err));

// Initial Mock Data
const mockCampuses = [
  { name: 'GGI Campus', code: 'GGI001', logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200' }
];

const mockVendors = [
  { vendorId: 'cb-super-admin', name: 'Super Admin', password: 'campusbite_super_2024', description: 'System Administrator', role: 'superadmin' },
  { vendorId: 'canteen-a', name: 'Canteen A', password: 'canteenA_pass789', description: 'Main Cafeteria', image: 'https://images.unsplash.com/photo-1567529854338-fc097b962123?w=800', subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table', 'hostel', 'classroom'], deliveryCharge: 20, tableServiceCharge: 10, hostelServiceCharge: 15 },
  { vendorId: 'canteen-b', name: 'Canteen B', password: 'southside_b456', description: 'South Side Cafe', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800', subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table'], deliveryCharge: 20, tableServiceCharge: 10, hostelServiceCharge: 15 },
  { vendorId: 'stationery', name: 'Stationery', password: 'stationery_login12', description: 'Pens, Books & more', image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800', subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'hostel'], deliveryCharge: 25, tableServiceCharge: 0, hostelServiceCharge: 20 },
  { vendorId: 'canteen-c', name: 'Canteen C', password: 'juicecorner_c99', description: 'The Juice Corner', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800', subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table', 'hostel', 'classroom'], deliveryCharge: 20, tableServiceCharge: 10, hostelServiceCharge: 15 }
];

const mockMenuItems = [
  // Canteen A
  { menuId: 1, vendorId: 'canteen-a', name: 'Lunch Combo', description: 'Burger + Fries + Drink', price: 199, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', category: 'Combos', prepTime: 15 },
  { menuId: 8, vendorId: 'canteen-a', name: 'French Fries', description: 'Crispy golden fries', price: 59, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', category: 'Snacks', prepTime: 8 },
  { menuId: 9, vendorId: 'canteen-a', name: 'Veg Burger', description: 'Classic veg patty', price: 89, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', category: 'Burgers', prepTime: 12 },
  
  // Canteen B
  { menuId: 2, vendorId: 'canteen-b', name: 'Breakfast Special', description: 'Sandwich + Coffee', price: 149, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400', category: 'Combos', prepTime: 10 },
  { menuId: 10, vendorId: 'canteen-b', name: 'Club Sandwich', description: 'Triple layer goodness', price: 129, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', category: 'Snacks', prepTime: 10 },
  
  // Canteen C
  { menuId: 3, vendorId: 'canteen-c', name: 'Mango Shake', description: 'Fresh mango blended', price: 99, image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400', category: 'Drinks', prepTime: 5 },
  { menuId: 11, vendorId: 'canteen-c', name: 'Cold Coffee', description: 'Creamy cold brew', price: 79, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400', category: 'Drinks', prepTime: 5 },
  
  // Stationery
  { menuId: 4, vendorId: 'stationery', name: 'Blue Pen', description: 'Smooth ink ball pen', price: 10, image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400', category: 'Stationery', prepTime: 1 },
  { menuId: 5, vendorId: 'stationery', name: 'Notebook', description: '100 pages ruled', price: 40, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', category: 'Books', prepTime: 1 }
];

const mockStockImages = [
  { name: 'Classic Burger', category: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800' },
  { name: 'Veg Burger', category: 'Burgers', image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800' },
  { name: 'Chicken Burger', category: 'Burgers', image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800' },
  { name: 'Cheese Burger', category: 'Burgers', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800' },
  { name: 'French Fries', category: 'Snacks', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800' },
  { name: 'Samosa', category: 'Snacks', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800' },
  { name: 'Onion Rings', category: 'Snacks', image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800' },
  { name: 'Paneer Tikka', category: 'Snacks', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800' },
  { name: 'Masala Dosa', category: 'Snacks', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800' },
  { name: 'Chai', category: 'Drinks', image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800' },
  { name: 'Cold Coffee', category: 'Drinks', image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800' },
  { name: 'Mango Shake', category: 'Drinks', image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800' },
  { name: 'Coca Cola', category: 'Drinks', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800' },
  { name: 'Lemonade', category: 'Drinks', image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f4d?w=800' },
  { name: 'Notebook', category: 'Books', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800' },
  { name: 'Blue Pen', category: 'Stationery', image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800' }
];

async function seedDatabase() {
  // Seed Campus First
  if (await Campus.countDocuments() === 0) {
    console.log('🌱 Seeding Campuses...');
    await Campus.insertMany(mockCampuses);
  }
  const defaultCampus = await Campus.findOne();

  const vendorCount = await Vendor.countDocuments();
  if (vendorCount === 0) {
    console.log('🌱 Seeding Vendors...');
    const vendorsToSeed = mockVendors.map(v => ({
      ...v,
      campusId: v.role === 'superadmin' ? null : defaultCampus?._id
    }));
    await Vendor.insertMany(vendorsToSeed);
  } else {
    // Migration: Ensure all existing vendors have a loginToken
    const vendors = await Vendor.find({ loginToken: { $exists: false } });
    if (vendors.length > 0) {
      console.log(`🌱 Backfilling loginTokens for ${vendors.length} vendors...`);
      for (const vendor of vendors) {
        vendor.loginToken = crypto.randomBytes(8).toString('hex');
        await vendor.save();
      }
    }
  }
  
  const menuCount = await Menu.countDocuments();
  if (menuCount === 0) {
    console.log('🌱 Seeding Menu Items...');
    await Menu.insertMany(mockMenuItems);
  }

  // Seed Stock Images
  if (await StockImage.countDocuments() === 0) {
    console.log('🌱 Seeding Stock Images...');
    await StockImage.insertMany(mockStockImages);
  }

  // Backfill QR Tokens for existing campuses
  console.log('🌱 Backfilling QR tokens...');
  const campuses = await Campus.find({ qrToken: { $exists: false } });
  for (const campus of campuses) {
    // Legacy support for GGI and LPU hardcoded tokens
    if (campus.name.includes('GGI')) {
      campus.qrToken = 'g7k9x2m4';
    } else if (campus.name.includes('LPU')) {
      campus.qrToken = 'l3p8v5n1';
    } else {
      campus.qrToken = crypto.randomBytes(4).toString('hex');
    }
    await campus.save();
  }

  // Backfill Login Tokens for existing vendors
  console.log('🌱 Backfilling vendor tokens...');
  const vendorsToBackfill = await Vendor.find({ loginToken: { $exists: false } });
  for (const v of vendorsToBackfill) {
    v.loginToken = crypto.randomBytes(8).toString('hex');
    await v.save();
  }

  // Security Fix: Update old superadmin credentials if they exist
  await Vendor.updateOne(
    { vendorId: 'admin', role: 'superadmin' },
    { $set: { vendorId: 'cb-super-admin', password: 'campusbite_super_2024' } }
  );

  // Pre-seed a College Admin
  if (await CollegeAdmin.countDocuments() === 0) {
    if (defaultCampus) {
      console.log('🌱 Seeding Mock College Admin...');
      await CollegeAdmin.create({
        adminId: 'collegeadmin',
        password: 'password123',
        name: 'GGI Operations',
        campusId: defaultCampus._id
      });
    }
  }

  // Migration: Ensure all existing vendors have numeric fields
  console.log('🌱 Checking for service charge updates...');
  await Vendor.updateMany(
    { deliveryCharge: { $exists: false } },
    { $set: { deliveryCharge: 20 } }
  );
  await Vendor.updateMany(
    { tableServiceCharge: { $exists: false } },
    { $set: { tableServiceCharge: 10 } }
  );
  await Vendor.updateMany(
    { hostelServiceCharge: { $exists: false } },
    { $set: { hostelServiceCharge: 15 } }
  );

  // Migration: Backfill images for existing vendors that have no image set
  const vendorImageMap = {
    'canteen-a': 'https://images.unsplash.com/photo-1567529854338-fc097b962123?w=800',
    'canteen-b': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
    'stationery': 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800',
    'canteen-c': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
  };
  for (const [vendorId, imageUrl] of Object.entries(vendorImageMap)) {
    await Vendor.updateOne(
      { vendorId, $or: [{ image: { $exists: false } }, { image: null }, { image: '' }] },
      { $set: { image: imageUrl } }
    );
  }
  console.log('✅ Vendor image migration complete');
}

// Socket.io Handshake
io.on('connection', async (socket) => {
  console.log('User connected:', socket.id);

  // Send initial data to connected clients
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const orders = await Order.find({ createdAt: { $gte: startOfDay } }).sort({ createdAt: 1 });
    const menuItems = await Menu.find();
    socket.emit('initial_orders', orders);
    socket.emit('initial_menu', menuItems);
  } catch(err) {
    console.error('Socket initial data error:', err);
  }

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// --- API Endpoints ---

// Global Platform Settings — persisted in MongoDB (survives server restarts)
// GET platform settings (kiosk + superadmin read on load)
app.get('/api/settings/platform', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne({ key: 'global' });
    if (!settings) {
      // First time: create default document (disabled)
      const created = await GlobalSettings.create({ key: 'global', platformFeeEnabled: false });
      return res.json(created);
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching platform settings' });
  }
});

// PATCH platform settings (superadmin toggle — persists to DB + broadcasts via socket)
app.patch('/api/settings/platform', async (req, res) => {
  const { platformFeeEnabled } = req.body;
  if (typeof platformFeeEnabled !== 'boolean') {
    return res.status(400).json({ message: 'platformFeeEnabled must be a boolean' });
  }
  try {
    const updated = await GlobalSettings.findOneAndUpdate(
      { key: 'global' },
      { platformFeeEnabled },
      { new: true, upsert: true } // create if doesn't exist, return updated doc
    );
    // Broadcast to ALL connected clients instantly
    io.emit('platform_settings_updated', updated);
    console.log(`✅ Platform fee ${platformFeeEnabled ? 'ENABLED' : 'DISABLED'} — saved to DB & broadcast`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating platform settings' });
  }
});

// 0. Vendor Login (New API for Admin)
app.post('/api/login', async (req, res) => {
  const { vendorId, password, token } = req.body;
  try {
    let user = await Vendor.findOne({ vendorId }).populate('campusId');
    let isCollegeAdmin = false;

    if (!user) {
      user = await CollegeAdmin.findOne({ adminId: vendorId }).populate('campusId');
      if (user) isCollegeAdmin = true;
    }

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // STRICT TOKEN CHECK FOR VENDORS
    // Vendors MUST login via the secret token link
    if (user.role === 'vendor' && !isCollegeAdmin) {
      if (!token || user.loginToken !== token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
    }

    // Check Subscription Logic for Regular Vendors
    if (!isCollegeAdmin && user.role === 'vendor') {
      const now = new Date();
      if (user.subscription.validUntil < now || user.subscription.status === 'Suspended') {
        // Auto-suspend if expired
        if (user.subscription.status !== 'Suspended') {
          user.subscription.status = 'Suspended';
          await user.save();
        }
        return res.status(403).json({ message: 'Your subscription is suspended or expired. Please contact support.' });
      }
    }

    // Don't send password back
    const { password: _, ...userData } = user.toObject();
    
    // Normalize ID field for the frontend store
    if (isCollegeAdmin) {
      userData.vendorId = userData.adminId;
    }

    res.json({ success: true, vendor: userData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Super Admin Routes ---
// GET Global Analytics
app.get('/api/superadmin/analytics', async (req, res) => {
  try {
    const { campusId } = req.query;
    
    // Base filter
    const vendorFilter = { role: 'vendor' };
    const orderFilter = {};
    if (campusId) {
      vendorFilter.campusId = campusId;
      orderFilter.campusId = campusId;
    }

    const totalCampuses = await Campus.countDocuments();
    const totalCanteens = await Vendor.countDocuments(vendorFilter);
    
    // Orders today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    orderFilter.createdAt = { $gte: startOfDay };
    
    const totalOrdersToday = await Order.countDocuments(orderFilter);

    // Subscriptions stats
    const activeSubscriptions = await Vendor.countDocuments({
      ...vendorFilter,
      'subscription.status': 'Active'
    });

    // Calculate revenue for today
    const todayOrders = await Order.find({
      ...orderFilter,
      status: 'Completed'
    });
    const revenueToday = todayOrders.reduce((sum, order) => sum + order.total, 0);

    // Mock monthly revenue for now, normally requires aggregating past 30 days
    const monthlyRevenue = revenueToday * 30 || 154200; 

    res.json({
      success: true,
      analytics: {
        totalCampuses,
        totalCanteens,
        totalOrdersToday,
        activeSubscriptions,
        monthlyRevenue
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: err.message });
  }
});

// GET All Campuses
app.get('/api/campuses', async (req, res) => {
  try {
    const campuses = await Campus.find();
    
    // Count canteens per campus
    const campusesWithCounts = await Promise.all(campuses.map(async (campus) => {
      const canteensCount = await Vendor.countDocuments({ campusId: campus._id, role: 'vendor' });
      return { ...campus.toObject(), canteensCount };
    }));
    
    res.json({ success: true, campuses: campusesWithCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch campuses', error: err.message });
  }
});

// Verify Campus Token (Kiosk Identification)
app.get('/api/campuses/verify-token', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required' });

    const campus = await Campus.findOne({ qrToken: token });
    if (!campus) {
      return res.status(404).json({ success: false, message: 'Invalid token' });
    }

    res.json({ success: true, campus });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification failed', error: err.message });
  }
});

// CREATE Campus
app.post('/api/campuses', async (req, res) => {
  try {
    const { name, code, logo } = req.body;
    const qrToken = crypto.randomBytes(4).toString('hex'); // Generate unique random token
    const campus = new Campus({ name, code, logo, qrToken });
    await campus.save();
    res.json({ success: true, campus: { ...campus.toObject(), canteensCount: 0 } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create campus', error: err.message });
  }
});

// Dynamic Registration for Colleges
app.post('/api/register-campus', async (req, res) => {
  try {
    const { campusName, campusCode, adminName, adminId, email, password } = req.body;

    // Check if Campus code or Admin ID/Email already exists
    const existingCampus = await Campus.findOne({ code: campusCode });
    if (existingCampus) return res.status(400).json({ success: false, message: 'Campus code already exists' });

    const existingAdmin = await CollegeAdmin.findOne({ $or: [{ adminId }, { email }] });
    if (existingAdmin) return res.status(400).json({ success: false, message: 'Admin ID or Email already exists' });

    // 1. Create Campus
    const qrToken = crypto.randomBytes(4).toString('hex');
    const newCampus = new Campus({
      name: campusName,
      code: campusCode,
      qrToken
    });
    const savedCampus = await newCampus.save();

    // 2. Create College Admin
    // Note: Password hashing should be implemented with bcrypt for production
    const newAdmin = new CollegeAdmin({
      adminId,
      password, // Should be hashed
      name: adminName,
      email,
      campusId: savedCampus._id
    });
    await newAdmin.save();

    res.status(201).json({ 
      success: true, 
      message: 'Campus and Admin registered successfully',
      campus: savedCampus,
      admin: { adminId, name: adminName, email }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
});

// Get all vendors (with metrics)
app.get('/api/vendors', async (req, res) => {
  try {
    const { campusId } = req.query;
    const filter = { role: 'vendor' };
    if (campusId) filter.campusId = campusId;

    const vendors = await Vendor.find(filter).populate('campusId', 'name').select('-password');
    
    // Attach today's metrics
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const vendorsWithMetrics = await Promise.all(vendors.map(async (v) => {
      const ordersToday = await Order.countDocuments({ vendorId: v.vendorId, createdAt: { $gte: startOfDay } });
      const completedOrders = await Order.find({ vendorId: v.vendorId, createdAt: { $gte: startOfDay }, status: 'Completed' });
      const revenueToday = completedOrders.reduce((sum, o) => sum + o.total, 0);
      
      return { ...v.toObject(), ordersToday, revenueToday };
    }));

    res.json({ success: true, vendors: vendorsWithMetrics });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch vendors', error: err.message });
  }
});

// Verify Vendor Token
app.get('/api/vendors/verify-token', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required' });

    const vendor = await Vendor.findOne({ loginToken: token })
      .populate('campusId', 'name logo');
    
    if (!vendor) return res.status(404).json({ success: false, message: 'Invalid token' });

    res.json({ success: true, vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// CREATE Vendor (Canteen)
app.post('/api/vendors', async (req, res) => {
  try {
    const { name, vendorId, password, description, campusId, image } = req.body;
    
    // Check if vendorId already exists
    const existingVendor = await Vendor.findOne({ vendorId });
    if (existingVendor) {
      return res.status(400).json({ success: false, message: 'Vendor ID already exists' });
    }

    // Set subscription valid for 1 year by default
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);

    const loginToken = crypto.randomBytes(8).toString('hex');
    const vendor = new Vendor({
      name,
      vendorId,
      password,
      description,
      campusId,
      image: image || '',
      role: 'vendor',
      loginToken, // Add the generated loginToken
      subscription: {
        status: 'Active',
        validUntil: validUntil.toISOString()
      }
    });

    await vendor.save();
    res.status(201).json({ success: true, vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create canteen', error: err.message });
  }
});

// Update vendor subscription
app.patch('/api/vendors/:id/subscription', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, validUntil } = req.body;
    
    const vendor = await Vendor.findById(id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    if (status) vendor.subscription.status = status;
    if (validUntil) vendor.subscription.validUntil = new Date(validUntil);
    
    await vendor.save();
    res.json({ success: true, message: 'Subscription updated successfully', vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update subscription', error: err.message });
  }
});

// Update vendor supported services
app.patch('/api/vendors/:id/services', async (req, res) => {
  try {
    const { id } = req.params;
    const { supportedServices, deliveryCharge, tableServiceCharge, hostelServiceCharge } = req.body;
    
    // id could be _id or vendorId depending on frontend state. In the Admin app, currentVendor uses vendorId for standard operations, but let's check both for safety.
    let vendor;
    if (mongoose.isValidObjectId(id)) {
      vendor = await Vendor.findById(id);
    }
    if (!vendor) {
      vendor = await Vendor.findOne({ vendorId: id });
    }

    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    if (Array.isArray(supportedServices)) {
      vendor.supportedServices = supportedServices;
    }
    
    if (deliveryCharge !== undefined) vendor.deliveryCharge = deliveryCharge;
    if (tableServiceCharge !== undefined) vendor.tableServiceCharge = tableServiceCharge;
    if (hostelServiceCharge !== undefined) vendor.hostelServiceCharge = hostelServiceCharge;

    await vendor.save();
    // Broadcast the change so connected kiosks update seamlessly
    io.emit('vendor_services_updated', vendor);
    
    res.json({ success: true, message: 'Services updated successfully', vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update services', error: err.message });
  }
});

// --- OTP VERIFICATION SYSTEM ---
// 1. Send OTP
app.post('/api/otp/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    // Generate random 4-digit code
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Delete existing OTP for this phone to avoid clashes
    await Otp.deleteMany({ phone });

    // Save to DB
    const newOtp = new Otp({ phone, otp: otpCode });
    await newOtp.save();

    // LOG TO CONSOLE FOR TESTING (User can read this in their backend terminal)
    console.log('\n----------------------------------------');
    console.log(`🚀 [OTP SERVICE] Verification Code for ${phone}: ${otpCode}`);
    console.log('----------------------------------------\n');

    res.json({ 
      success: true, 
      message: 'OTP Sent successfully!',
      timestamp: new Date()
    });
  } catch (err) {
    console.error('OTP Send Error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// 2. Verify OTP
app.post('/api/otp/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const record = await Otp.findOne({ phone, otp });

    if (record) {
      // Code is valid
      await Otp.deleteMany({ phone }); // Use once and delete
      res.json({ success: true, message: 'Number verified successfully' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }
  } catch (err) {
    console.error('OTP Verify Error:', err);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});
// -----------------------------

// 1. Submit New Order (From Kiosk)
app.post('/api/orders', async (req, res) => {
  try {
    const { paymentMethod, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify Razorpay signature for Online payments
    let initialPaymentStatus = 'Pending';
    let specificPaymentMethod = paymentMethod;

    if (paymentMethod === 'Online') {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Missing payment verification details' });
      }

      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature !== expectedSign) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
      
      initialPaymentStatus = 'Paid';

      // Fetch specific payment method from Razorpay
      try {
        const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
        if (paymentDetails && paymentDetails.method) {
          // Map to enum-friendly values
          const methodMap = {
            'card': 'Card',
            'upi': 'UPI',
            'netbanking': 'Netbanking',
            'wallet': 'Wallet'
          };
          specificPaymentMethod = methodMap[paymentDetails.method] || 'Online';
        }
      } catch (err) {
        console.error('Error fetching Razorpay payment details:', err);
        // Fallback to "Online" if fetch fails
      }
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const orderCount = await Order.countDocuments({ createdAt: { $gte: startOfDay } });
    const tokenNumber = orderCount + 1;
    
    // Assigning vendorId to the order based on the first item's vendorId
    // Standard kiosk behavior should ideally bundle items per vendor, or handle multi-vendor carts
    // Simplified vendor identification for mock
    const vendorId = req.body.items && req.body.items.length > 0 ? req.body.items[0].item.vendorId : null;
    
    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'VendorId is required for order creation' });
    }

    const newOrder = new Order({
      ...req.body,
      orderId: Date.now(),
      tokenNumber,
      vendorId,
      paymentMethod: specificPaymentMethod,
      paymentStatus: initialPaymentStatus,
    });
    
    const savedOrder = await newOrder.save();
    
    // Broadcast to all connected Admins
    io.emit('new_order_pulse', savedOrder);
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Update Order Status (From Admin)
app.patch('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const order = await Order.findOne({ orderId: parseInt(id) || id });
    if (!order) return res.status(404).send('Order not found');
    
    order.status = status;
    await order.save();
    
    io.emit('order_status_update', { id: order.orderId, status });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2b. Update Order Payment Status (From Admin)
app.patch('/api/orders/:id/payment', async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;
  
  try {
    const order = await Order.findOne({ orderId: parseInt(id) || id });
    if (!order) return res.status(404).send('Order not found');
    
    order.paymentStatus = paymentStatus;
    await order.save();
    
    // Emit a specific event or generic update so UI can refresh it
    io.emit('order_payment_update', { id: order.orderId, paymentStatus });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Clear Orders (Reset for day)
app.post('/api/orders/reset', async (req, res) => {
  try {
    await Order.deleteMany({});
    io.emit('initial_orders', []);
    res.send('Orders reset');
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// --- MENU API Endpoints ---
app.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await Menu.find();
    res.json(menuItems);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    // Auto-generate menuId based on current count
    const count = await Menu.countDocuments();
    const newItem = new Menu({
      ...req.body,
      menuId: count + 1 // Simple auto-increment for mock
    });
    const saved = await newItem.save();
    io.emit('menu_updated', saved);
    res.json({ success: true, item: saved });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stock-images', async (req, res) => {
  try {
    const images = await StockImage.find();
    res.json(images);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body; 
  
  try {
    const item = await Menu.findOneAndUpdate(
      { menuId: parseInt(id) || id }, 
      { $set: updates }, 
      { new: true }
    );
    
    if (!item) return res.status(404).send('Item not found');
    
    io.emit('menu_updated', item);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUBSCRIPTION & RAZORPAY ROUTES ---

// 1. Create Razorpay Order
app.post('/api/ordering/subscriptions/create-order', async (req, res) => {
  try {
    const { vendorId } = req.body;
    
    // Define subscription amount (e.g., ₹999)
    const amount = 999 * 100; // in paise
    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${vendorId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: 'Error creating Razorpay order' });
  }
});

// 2. Verify Payment & Update Subscription
app.post('/api/ordering/subscriptions/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, vendorId } = req.body;
    console.log('Verifying Payment:', { razorpay_order_id, razorpay_payment_id, vendorId });

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    console.log('Signature Check:', { received: razorpay_signature, expected: expectedSign });

    if (razorpay_signature === expectedSign) {
      // Payment Verified!
      const vendor = await Vendor.findOne({ vendorId });
      if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

      // Extend subscription by 1 year
      const currentExpiry = vendor.subscription?.validUntil || new Date();
      const newExpiry = new Date(currentExpiry);
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);

      vendor.subscription = {
        status: 'Active',
        validUntil: newExpiry
      };

      await vendor.save();
      res.json({ message: "Subscription renewed successfully!", validUntil: newExpiry });
    } else {
      res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
});

// 3. Create Razorpay Order for User (Kiosk) Orders
app.post('/api/ordering/create-kiosk-order', async (req, res) => {
  try {
    const { amount } = req.body; // Amount should be passed from frontend in INR (Rupees)
    
    // Razorpay requires amount in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Kiosk Order Error:', error);
    res.status(500).json({ message: 'Error creating Razorpay order for cart' });
  }
});

// --- DEBUG / EMERGENCY ROUTES ---
app.post('/api/debug/reset-db', async (req, res) => {
  const { secret } = req.body;
  if (secret !== 'campusbite_secret_2024') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    console.log('🚨 EMERGENCY RESET TRIGGERED');
    await Campus.deleteMany({});
    await Vendor.deleteMany({});
    await Menu.deleteMany({});
    await Order.deleteMany({});
    await CollegeAdmin.deleteMany({});
    
    await seedDatabase();
    res.json({ success: true, message: 'Database reset and re-seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend Shared Brain running on http://localhost:${PORT}`);
});
