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
const Otp = require('./models/Otp');
const Volunteer = require('./models/Volunteer');
const GlobalSettings = require('./models/GlobalSettings');
const StockImage = require('./models/StockImage');
const Combo = require('./models/Combo');
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
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
  // Real Campus Canteens
  { vendorId: 'barley-bites', name: 'Barley Bites', password: 'barley_2024', description: 'Burgers, Pizzas, Sandwiches & More', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table', 'hostel', 'classroom'], deliveryCharge: 20, tableServiceCharge: 10, hostelServiceCharge: 15 },
  { vendorId: 'khao-gali', name: 'Khao Gali', password: 'khao_2024', description: 'Chinese, Momos & Indian Mains', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table', 'hostel', 'classroom'], deliveryCharge: 20, tableServiceCharge: 10, hostelServiceCharge: 15 },
  { vendorId: 'nescafe-outlet', name: 'NESCAFE', password: 'nescafe_2024', description: 'Hot & Cold Beverages', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table', 'hostel', 'classroom'], deliveryCharge: 15, tableServiceCharge: 5, hostelServiceCharge: 15 },
  { vendorId: 'bambukat', name: 'BAMBUKAT', password: 'bambukat_2024', description: 'Punjabi Paranthas & Street Food', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table', 'hostel', 'classroom'], deliveryCharge: 20, tableServiceCharge: 10, hostelServiceCharge: 15 },
  { vendorId: 'barqat', name: 'BARQAT', password: 'barqat_2024', description: 'Biryani & Curries', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800', subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table', 'hostel', 'classroom'], deliveryCharge: 20, tableServiceCharge: 10, hostelServiceCharge: 15 },
  { vendorId: 'havmor', name: 'HAVMOR', password: 'havmor_2024', description: 'Ice Cream Scoops & Shakes', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800', subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table'], deliveryCharge: 15, tableServiceCharge: 5, hostelServiceCharge: 15 },
  // Legacy & Stationery
  { vendorId: 'stationery', name: 'Stationery', password: 'stationery_login12', description: 'Pens, Books & more', image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800', subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'hostel'], deliveryCharge: 25, tableServiceCharge: 0, hostelServiceCharge: 20 },
];

const mockMenuItems = [
  // ── BARLEY BITES ──────────────────────────────────────────────────────────
  // Burger
  { menuId: 101, vendorId: 'barley-bites', name: 'Chicken Burger', description: 'Juicy chicken patty with fresh veggies', price: 60, category: 'Burger', prepTime: 10 },
  { menuId: 102, vendorId: 'barley-bites', name: 'Egg Burger', description: 'Egg patty with mayo & veggies', price: 50, category: 'Burger', prepTime: 8 },
  { menuId: 103, vendorId: 'barley-bites', name: 'Noodles Burger', description: 'Unique noodle-filled burger', price: 40, category: 'Burger', prepTime: 10 },
  { menuId: 104, vendorId: 'barley-bites', name: 'Punjabi Burger', description: 'Spicy Punjabi style burger', price: 30, category: 'Burger', prepTime: 8 },
  // Sandwich (Grilled)
  { menuId: 105, vendorId: 'barley-bites', name: 'Chicken Sandwich', description: 'Grilled chicken with cheese & sauce', price: 60, category: 'Sandwich (Grilled)', prepTime: 8 },
  { menuId: 106, vendorId: 'barley-bites', name: 'Egg Sandwich', description: 'Egg & cheese grilled sandwich', price: 40, category: 'Sandwich (Grilled)', prepTime: 6 },
  { menuId: 107, vendorId: 'barley-bites', name: 'Aloo Sandwich', description: 'Spiced potato grilled sandwich', price: 30, category: 'Sandwich (Grilled)', prepTime: 6 },
  { menuId: 108, vendorId: 'barley-bites', name: 'Butter Jam Maska Bun', description: 'Classic bun with butter & jam', price: 20, category: 'Sandwich (Grilled)', prepTime: 3 },
  // Pizza
  { menuId: 109, vendorId: 'barley-bites', name: 'Chicken Tandoori Tikka Pizza', description: 'Spicy tandoori chicken on crispy base', price: 160, category: 'Pizza', prepTime: 20 },
  { menuId: 110, vendorId: 'barley-bites', name: "Farmers' Pizza", description: 'Fresh garden veggies on tomato base', price: 150, category: 'Pizza', prepTime: 18 },
  { menuId: 111, vendorId: 'barley-bites', name: 'Paneer Tikka Pizza', description: 'Marinated paneer with peppers', price: 150, category: 'Pizza', prepTime: 18 },
  { menuId: 112, vendorId: 'barley-bites', name: 'Cheese & Corn Pizza', description: 'Loaded cheese with sweet corn', price: 130, category: 'Pizza', prepTime: 15 },
  { menuId: 113, vendorId: 'barley-bites', name: 'Margherita Pizza', description: 'Classic tomato, basil & mozzarella', price: 100, category: 'Pizza', prepTime: 15 },
  // Fries
  { menuId: 114, vendorId: 'barley-bites', name: 'Classic French Fries (Large)', description: 'Golden crispy salted fries', price: 60, category: 'Fries', prepTime: 8 },
  { menuId: 115, vendorId: 'barley-bites', name: 'Peri Peri Fries (Large)', description: 'Spicy peri peri seasoned fries', price: 60, category: 'Fries', prepTime: 8 },
  { menuId: 116, vendorId: 'barley-bites', name: 'Classic French Fries (Small)', description: 'Golden crispy salted fries', price: 40, category: 'Fries', prepTime: 6 },
  { menuId: 117, vendorId: 'barley-bites', name: 'Peri Peri Fries (Small)', description: 'Spicy peri peri seasoned fries', price: 40, category: 'Fries', prepTime: 6 },
  // Chips & Biscuits
  { menuId: 118, vendorId: 'barley-bites', name: 'Monister', description: 'Energy drink', price: 125, category: 'Chips & Biscuits', prepTime: 1 },
  { menuId: 119, vendorId: 'barley-bites', name: 'Coke 1 Liter', description: 'Coca-Cola 1 litre bottle', price: 50, category: 'Chips & Biscuits', prepTime: 1 },
  { menuId: 120, vendorId: 'barley-bites', name: 'Coke (400ml)', description: 'Chilled Coca-Cola', price: 40, category: 'Chips & Biscuits', prepTime: 1 },
  { menuId: 121, vendorId: 'barley-bites', name: 'Lays', description: 'Classic salted chips', price: 20, category: 'Chips & Biscuits', prepTime: 1 },
  { menuId: 122, vendorId: 'barley-bites', name: 'Coke (Small)', description: 'Chilled Coca-Cola can', price: 20, category: 'Chips & Biscuits', prepTime: 1 },
  { menuId: 123, vendorId: 'barley-bites', name: 'Water Bottle (1L)', description: 'Packaged drinking water', price: 20, category: 'Chips & Biscuits', prepTime: 1 },
  { menuId: 124, vendorId: 'barley-bites', name: 'Charge@15', description: 'Energy drink', price: 15, category: 'Chips & Biscuits', prepTime: 1 },
  { menuId: 125, vendorId: 'barley-bites', name: 'Biscuits (Pack)', description: 'Assorted biscuit pack', price: 10, category: 'Chips & Biscuits', prepTime: 1 },
  { menuId: 126, vendorId: 'barley-bites', name: 'Water Bottle (500ml)', description: 'Packaged drinking water', price: 10, category: 'Chips & Biscuits', prepTime: 1 },
  { menuId: 127, vendorId: 'barley-bites', name: 'Biscuit (Single)', description: 'Single biscuit', price: 5, category: 'Chips & Biscuits', prepTime: 1 },
  { menuId: 128, vendorId: 'barley-bites', name: 'Munch', description: 'Chocolate wafer bar', price: 5, category: 'Chips & Biscuits', prepTime: 1 },
  // Hot Dog
  { menuId: 129, vendorId: 'barley-bites', name: 'Chicken Hot Dog', description: 'Grilled chicken sausage in bun', price: 60, category: 'Hot Dog', prepTime: 8 },
  { menuId: 130, vendorId: 'barley-bites', name: 'Egg Hot Dog', description: 'Egg & sausage in soft bun', price: 40, category: 'Hot Dog', prepTime: 6 },
  { menuId: 131, vendorId: 'barley-bites', name: 'Veg Hot Dog', description: 'Veg sausage with mustard', price: 30, category: 'Hot Dog', prepTime: 6 },
  // MAGGI & PASTA
  { menuId: 132, vendorId: 'barley-bites', name: 'White Sauce Pasta', description: 'Creamy white sauce pasta', price: 80, category: 'MAGGI&PAZZTA', prepTime: 12 },
  { menuId: 133, vendorId: 'barley-bites', name: 'Red Sauce Pasta', description: 'Tangy tomato pasta', price: 80, category: 'MAGGI&PAZZTA', prepTime: 12 },
  { menuId: 134, vendorId: 'barley-bites', name: 'Veggie Maggi', description: 'Maggi with mixed vegetables', price: 45, category: 'MAGGI&PAZZTA', prepTime: 8 },
  { menuId: 135, vendorId: 'barley-bites', name: 'Plain Maggi', description: 'Classic Maggi noodles', price: 35, category: 'MAGGI&PAZZTA', prepTime: 8 },

  // ── NESCAFE ───────────────────────────────────────────────────────────────
  // Cold Beverages
  { menuId: 201, vendorId: 'nescafe-outlet', name: 'Caffe Frappe', description: 'Chilled frappe coffee', price: 50, category: 'Cold Beverages', prepTime: 5 },
  { menuId: 202, vendorId: 'nescafe-outlet', name: 'Mocha Frappe', description: 'Chocolate mocha frappe', price: 50, category: 'Cold Beverages', prepTime: 5 },
  { menuId: 203, vendorId: 'nescafe-outlet', name: 'Cold Chocolate', description: 'Rich cold chocolate drink', price: 50, category: 'Cold Beverages', prepTime: 5 },
  { menuId: 204, vendorId: 'nescafe-outlet', name: 'Ice Tea', description: 'Refreshing chilled ice tea', price: 50, category: 'Cold Beverages', prepTime: 5 },
  { menuId: 205, vendorId: 'nescafe-outlet', name: 'Cold Coffee', description: 'Creamy chilled coffee', price: 50, category: 'Cold Beverages', prepTime: 5 },
  // Hot Beverages
  { menuId: 206, vendorId: 'nescafe-outlet', name: 'Cafe Latte', description: 'Smooth espresso with steamed milk', price: 40, category: 'Hot Beverages', prepTime: 5 },
  { menuId: 207, vendorId: 'nescafe-outlet', name: 'Cafe Mocha', description: 'Coffee with chocolate', price: 40, category: 'Hot Beverages', prepTime: 5 },
  { menuId: 208, vendorId: 'nescafe-outlet', name: 'Cappuccino', description: 'Frothy espresso and milk foam', price: 30, category: 'Hot Beverages', prepTime: 5 },
  { menuId: 209, vendorId: 'nescafe-outlet', name: 'Hot Chocolate', description: 'Rich warm chocolate drink', price: 30, category: 'Hot Beverages', prepTime: 5 },
  { menuId: 210, vendorId: 'nescafe-outlet', name: 'Espresso', description: 'Strong bold espresso shot', price: 30, category: 'Hot Beverages', prepTime: 3 },
  { menuId: 211, vendorId: 'nescafe-outlet', name: 'Punjabi Chai', description: 'Desi masala chai', price: 15, category: 'Hot Beverages', prepTime: 5 },

  // ── KHAO GALI ─────────────────────────────────────────────────────────────
  // Mains
  { menuId: 301, vendorId: 'khao-gali', name: 'Chicken Fried Rice', description: 'Wok tossed rice with chicken', price: 150, category: 'Mains', prepTime: 15 },
  { menuId: 302, vendorId: 'khao-gali', name: 'Chilli Chicken (Full)', description: 'Spicy crispy chilli chicken', price: 150, category: 'Mains', prepTime: 15 },
  { menuId: 303, vendorId: 'khao-gali', name: 'Veg Manchurian (Full)', description: 'Veg balls in spicy Manchurian sauce', price: 140, category: 'Mains', prepTime: 12 },
  { menuId: 304, vendorId: 'khao-gali', name: 'Hakka Noodles (Full)', description: 'Tossed noodles with veggies', price: 110, category: 'Mains', prepTime: 12 },
  { menuId: 305, vendorId: 'khao-gali', name: 'Veg Fried Rice (Full)', description: 'Stir-fried rice with vegetables', price: 90, category: 'Mains', prepTime: 12 },
  { menuId: 306, vendorId: 'khao-gali', name: 'Chilli Chicken (Half)', description: 'Spicy crispy chilli chicken half plate', price: 80, category: 'Mains', prepTime: 12 },
  { menuId: 307, vendorId: 'khao-gali', name: 'Hakka Noodles (Half)', description: 'Tossed noodles half plate', price: 70, category: 'Mains', prepTime: 10 },
  { menuId: 308, vendorId: 'khao-gali', name: 'Veg Manchurian (Half)', description: 'Veg Manchurian half plate', price: 70, category: 'Mains', prepTime: 10 },
  { menuId: 309, vendorId: 'khao-gali', name: 'Veg Fried Rice (Half)', description: 'Stir-fried rice half plate', price: 60, category: 'Mains', prepTime: 10 },
  // Steamed Momos
  { menuId: 310, vendorId: 'khao-gali', name: 'Steamed Chicken Momos', description: 'Juicy chicken filled steamed dumplings', price: 90, category: 'Steamed Momos', prepTime: 15 },
  { menuId: 311, vendorId: 'khao-gali', name: 'Steamed Paneer Momos', description: 'Paneer filled steamed dumplings', price: 80, category: 'Steamed Momos', prepTime: 15 },
  { menuId: 312, vendorId: 'khao-gali', name: 'Steamed Veg Momos', description: 'Mixed veg steamed dumplings', price: 70, category: 'Steamed Momos', prepTime: 12 },
  // Fried Momos
  { menuId: 313, vendorId: 'khao-gali', name: 'Fried Chicken Momos', description: 'Crispy fried chicken dumplings', price: 100, category: 'Fried Momos', prepTime: 15 },
  { menuId: 314, vendorId: 'khao-gali', name: 'Fried Paneer Momos', description: 'Crispy fried paneer dumplings', price: 90, category: 'Fried Momos', prepTime: 15 },
  { menuId: 315, vendorId: 'khao-gali', name: 'Fried Veg Momos', description: 'Crispy fried veg dumplings', price: 80, category: 'Fried Momos', prepTime: 12 },
  // Chicken Sides
  { menuId: 316, vendorId: 'khao-gali', name: 'Chicken Wings (Full)', description: 'Crispy spiced chicken wings full plate', price: 150, category: 'Chicken Sides', prepTime: 15 },
  { menuId: 317, vendorId: 'khao-gali', name: 'Chicken Strips (Full)', description: 'Crispy chicken strips full plate', price: 150, category: 'Chicken Sides', prepTime: 15 },
  { menuId: 318, vendorId: 'khao-gali', name: 'Chicken Wings (Half)', description: 'Crispy chicken wings half plate', price: 80, category: 'Chicken Sides', prepTime: 12 },
  { menuId: 319, vendorId: 'khao-gali', name: 'Chicken Strips (Half)', description: 'Crispy chicken strips half plate', price: 80, category: 'Chicken Sides', prepTime: 12 },
  // Eggs
  { menuId: 320, vendorId: 'khao-gali', name: 'Bread Omelette', description: 'Masala egg omelette with bread', price: 60, category: 'Eggs', prepTime: 8 },
  { menuId: 321, vendorId: 'khao-gali', name: 'Egg Bhurji', description: 'Spicy scrambled eggs', price: 50, category: 'Eggs', prepTime: 8 },
  { menuId: 322, vendorId: 'khao-gali', name: 'Masala Omelette', description: 'Fluffy masala egg omelette', price: 40, category: 'Eggs', prepTime: 6 },
  { menuId: 323, vendorId: 'khao-gali', name: 'Boiled Egg (2 pcs)', description: 'Plain boiled eggs', price: 40, category: 'Eggs', prepTime: 5 },
  { menuId: 324, vendorId: 'khao-gali', name: 'Bread Slice', description: 'Toasted bread slices', price: 15, category: 'Eggs', prepTime: 2 },

  // ── BAMBUKAT ──────────────────────────────────────────────────────────────
  // Paranthas
  { menuId: 401, vendorId: 'bambukat', name: 'Paneer Parantha', description: 'Stuffed paneer parantha with butter', price: 55, category: 'Paranthas', prepTime: 10 },
  { menuId: 402, vendorId: 'bambukat', name: 'Aloo Parantha', description: 'Classic potato stuffed parantha', price: 45, category: 'Paranthas', prepTime: 8 },
  { menuId: 403, vendorId: 'bambukat', name: 'Mix Parantha', description: 'Mixed veggie stuffed parantha', price: 45, category: 'Paranthas', prepTime: 8 },
  { menuId: 404, vendorId: 'bambukat', name: 'Gobi Parantha', description: 'Cauliflower stuffed parantha', price: 45, category: 'Paranthas', prepTime: 8 },
  // Add Ons
  { menuId: 405, vendorId: 'bambukat', name: 'Raita', description: 'Fresh curd with veggies', price: 25, category: 'Add Ons', prepTime: 2 },
  { menuId: 406, vendorId: 'bambukat', name: 'Dahi', description: 'Plain yogurt', price: 20, category: 'Add Ons', prepTime: 2 },
  { menuId: 407, vendorId: 'bambukat', name: 'Butter', description: 'Fresh butter', price: 15, category: 'Add Ons', prepTime: 1 },
  // Breads
  { menuId: 408, vendorId: 'bambukat', name: 'Tawa Parantha', description: 'Plain tawa parantha', price: 25, category: 'Breads', prepTime: 5 },
  { menuId: 409, vendorId: 'bambukat', name: 'Tawa Roti', description: 'Plain tawa roti', price: 15, category: 'Breads', prepTime: 3 },
  // Punjabi Street Food
  { menuId: 410, vendorId: 'bambukat', name: 'Mix Veg Pakoras', description: 'Crispy mixed veg pakoras', price: 40, category: 'Punjabi Street Food', prepTime: 8 },
  { menuId: 411, vendorId: 'bambukat', name: 'Stuffed Patty', description: 'Spiced stuffed potato patty', price: 30, category: 'Punjabi Street Food', prepTime: 6 },
  { menuId: 412, vendorId: 'bambukat', name: 'Samosa', description: 'Crispy potato samosa', price: 20, category: 'Punjabi Street Food', prepTime: 5 },
  { menuId: 413, vendorId: 'bambukat', name: 'Bread Pakora', description: 'Batter fried bread pakora', price: 20, category: 'Punjabi Street Food', prepTime: 6 },
  { menuId: 414, vendorId: 'bambukat', name: 'Patty', description: 'Crispy potato patty', price: 20, category: 'Punjabi Street Food', prepTime: 5 },

  // ── BARQAT ────────────────────────────────────────────────────────────────
  // Biryani
  { menuId: 501, vendorId: 'barqat', name: 'Chicken Biryani (Full)', description: 'Aromatic dum chicken biryani', price: 150, category: 'Biryani', prepTime: 20 },
  { menuId: 502, vendorId: 'barqat', name: 'Egg Biryani (Full)', description: 'Flavourful egg biryani', price: 130, category: 'Biryani', prepTime: 18 },
  { menuId: 503, vendorId: 'barqat', name: 'Paneer Biryani (Full)', description: 'Rich paneer biryani', price: 130, category: 'Biryani', prepTime: 18 },
  { menuId: 504, vendorId: 'barqat', name: 'Veg Biryani', description: 'Mixed vegetable biryani', price: 90, category: 'Biryani', prepTime: 15 },
  { menuId: 505, vendorId: 'barqat', name: 'Chicken Biryani (Half)', description: 'Half plate chicken biryani', price: 80, category: 'Biryani', prepTime: 15 },
  { menuId: 506, vendorId: 'barqat', name: 'Egg Biryani (Half)', description: 'Half plate egg biryani', price: 70, category: 'Biryani', prepTime: 12 },
  { menuId: 507, vendorId: 'barqat', name: 'Paneer Biryani (Half)', description: 'Half plate paneer biryani', price: 70, category: 'Biryani', prepTime: 12 },
  // Curries
  { menuId: 508, vendorId: 'barqat', name: 'Chicken Curry (Full)', description: 'Spicy chicken curry full plate', price: 150, category: 'Curries', prepTime: 15 },
  { menuId: 509, vendorId: 'barqat', name: 'Butter Chicken (Full)', description: 'Creamy butter chicken full plate', price: 150, category: 'Curries', prepTime: 15 },
  { menuId: 510, vendorId: 'barqat', name: 'Kadhai Chicken (Full)', description: 'Spiced kadhai chicken full plate', price: 150, category: 'Curries', prepTime: 15 },
  { menuId: 511, vendorId: 'barqat', name: 'Chicken Curry (Half)', description: 'Spicy chicken curry half plate', price: 80, category: 'Curries', prepTime: 12 },
  { menuId: 512, vendorId: 'barqat', name: 'Butter Chicken (Half)', description: 'Creamy butter chicken half plate', price: 80, category: 'Curries', prepTime: 12 },
  { menuId: 513, vendorId: 'barqat', name: 'Kadhai Chicken (Half)', description: 'Spiced kadhai chicken half plate', price: 80, category: 'Curries', prepTime: 12 },
  { menuId: 514, vendorId: 'barqat', name: 'Paneer Masala', description: 'Paneer in rich tomato gravy', price: 80, category: 'Curries', prepTime: 12 },
  { menuId: 515, vendorId: 'barqat', name: 'Dal Makhani', description: 'Slow cooked black lentils', price: 60, category: 'Curries', prepTime: 10 },
  { menuId: 516, vendorId: 'barqat', name: 'Jeera Rice', description: 'Basmati rice with cumin', price: 50, category: 'Curries', prepTime: 8 },

  // ── HAVMOR ────────────────────────────────────────────────────────────────
  // Scoops
  { menuId: 601, vendorId: 'havmor', name: 'Nutty Belgian Dark Chocolate', description: 'Rich dark chocolate with nuts', price: 70, category: 'Scoops', prepTime: 3 },
  { menuId: 602, vendorId: 'havmor', name: 'Black Current', description: 'Tangy black current ice cream', price: 60, category: 'Scoops', prepTime: 3 },
  { menuId: 603, vendorId: 'havmor', name: 'Cookies & Cream', description: 'Classic cookies and cream flavour', price: 60, category: 'Scoops', prepTime: 3 },
  { menuId: 604, vendorId: 'havmor', name: 'Butter Scotch', description: 'Creamy butter scotch scoop', price: 50, category: 'Scoops', prepTime: 3 },
  { menuId: 605, vendorId: 'havmor', name: 'American Nuts', description: 'Nutty caramel ice cream', price: 50, category: 'Scoops', prepTime: 3 },
  { menuId: 606, vendorId: 'havmor', name: 'Chocolate', description: 'Classic chocolate scoop', price: 50, category: 'Scoops', prepTime: 3 },
  { menuId: 607, vendorId: 'havmor', name: 'Real Mango', description: 'Fresh mango ice cream', price: 50, category: 'Scoops', prepTime: 3 },
  { menuId: 608, vendorId: 'havmor', name: 'Strawberry', description: 'Fresh strawberry scoop', price: 40, category: 'Scoops', prepTime: 3 },
  { menuId: 609, vendorId: 'havmor', name: 'Vanilla', description: 'Classic creamy vanilla', price: 30, category: 'Scoops', prepTime: 3 },
  // Shakes
  { menuId: 610, vendorId: 'havmor', name: 'Oreo Shake', description: 'Thick Oreo milkshake', price: 100, category: 'Shakes', prepTime: 5 },
  { menuId: 611, vendorId: 'havmor', name: 'Dark Chocolate Shake', description: 'Rich dark chocolate milkshake', price: 100, category: 'Shakes', prepTime: 5 },
  { menuId: 612, vendorId: 'havmor', name: 'Black Current Shake', description: 'Black current milkshake', price: 90, category: 'Shakes', prepTime: 5 },
  { menuId: 613, vendorId: 'havmor', name: 'Butter Scotch Shake', description: 'Butter scotch milkshake', price: 80, category: 'Shakes', prepTime: 5 },
  { menuId: 614, vendorId: 'havmor', name: 'Mango Shake', description: 'Fresh mango milkshake', price: 80, category: 'Shakes', prepTime: 5 },
  { menuId: 615, vendorId: 'havmor', name: 'Cold Coffee Shake', description: 'Chilled coffee milkshake', price: 70, category: 'Shakes', prepTime: 5 },
  { menuId: 616, vendorId: 'havmor', name: 'Strawberry Shake', description: 'Fresh strawberry milkshake', price: 70, category: 'Shakes', prepTime: 5 },
  { menuId: 617, vendorId: 'havmor', name: 'Chocolate Shake', description: 'Classic chocolate milkshake', price: 70, category: 'Shakes', prepTime: 5 },
  { menuId: 618, vendorId: 'havmor', name: 'Banana Shake', description: 'Fresh banana milkshake', price: 60, category: 'Shakes', prepTime: 5 },
  { menuId: 619, vendorId: 'havmor', name: 'Vanilla Shake', description: 'Classic vanilla milkshake', price: 60, category: 'Shakes', prepTime: 5 },

  // ── STATIONERY ────────────────────────────────────────────────────────────
  { menuId: 700, vendorId: 'stationery', name: 'Blue Pen', description: 'Smooth ink ball pen', price: 10, category: 'Stationery', prepTime: 1 },
  { menuId: 701, vendorId: 'stationery', name: 'Notebook', description: '100 pages ruled', price: 40, category: 'Books', prepTime: 1 },
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
  const { vendorId, password } = req.body;
  try {
    let user = await Vendor.findOne({ vendorId }).populate('campusId');

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check Subscription Logic for Regular Vendors
    if (user.role === 'vendor') {
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

// New Vendor Self-Registration
app.post('/api/vendors/register', async (req, res) => {
  try {
    const { vendorId, password, name, campusName, description } = req.body;

    // 1. Check if vendorId already exists
    const existingVendor = await Vendor.findOne({ vendorId });
    if (existingVendor) {
      return res.status(400).json({ success: false, message: 'Vendor ID already exists' });
    }

    // 2. Map Campus Name to ID (Find or Create)
    let campus = await Campus.findOne({ name: { $regex: new RegExp(`^${campusName}$`, 'i') } });
    if (!campus) {
      // Create a skeleton campus if not found
      const qrToken = crypto.randomBytes(4).toString('hex');
      campus = new Campus({
        name: campusName,
        code: campusName.toUpperCase().replace(/\s+/g, '_').substring(0, 10),
        qrToken
      });
      await campus.save();
    }

    // 3. Create Vendor
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    const loginToken = crypto.randomBytes(8).toString('hex');

    const vendor = new Vendor({
      name,
      vendorId,
      password,
      description: description || 'No description provided',
      campusId: campus._id,
      role: 'vendor',
      loginToken,
      subscription: {
        status: 'Active',
        validUntil
      }
    });

    await vendor.save();
    const { password: _, ...userData } = vendor.toObject();
    res.status(201).json({ success: true, vendor: userData });

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

// Update vendor details (General)
app.patch('/api/vendors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    let vendor;
    if (mongoose.isValidObjectId(id)) {
      vendor = await Vendor.findById(id);
    }
    if (!vendor) {
      vendor = await Vendor.findOne({ vendorId: id });
    }

    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

    // Prevent direct password updates here for security
    delete updateData.password;

    Object.assign(vendor, updateData);
    await vendor.save();
    
    res.json({ success: true, message: 'Vendor updated successfully', vendor });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update vendor', error: err.message });
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
      
      // Check if volunteer already exists
      const volunteer = await Volunteer.findOne({ phone }).populate('campus');
      
      res.json({ 
        success: true, 
        message: 'Number verified successfully',
        volunteer: volunteer // Will be null for new users
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }
  } catch (err) {
    console.error('OTP Verify Error:', err);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// --- VOLUNTEER SYSTEM ROUTES ---

// 1. Onboard / Register Volunteer
app.post('/api/volunteer/onboard', async (req, res) => {
  try {
    const { name, phone, rollNo, gender, campusId, hostel, roomNo } = req.body;

    // Check if already registered
    const existing = await Volunteer.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This phone number is already registered' });
    }

    const volunteer = new Volunteer({
      name,
      phone,
      rollNo,
      gender,
      campus: campusId,
      hostel,
      roomNo,
      status: 'Pending' // Always starts as pending
    });

    await volunteer.save();
    res.status(201).json({ success: true, volunteer });
  } catch (err) {
    console.error('Volunteer Onboarding Error:', err);
    res.status(500).json({ success: false, message: 'Failed to register volunteer' });
  }
});

// 2. Get Volunteer Profile
app.get('/api/volunteer/profile/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const volunteer = await Volunteer.findOne({ phone }).populate('campus');
    
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    res.json({ success: true, volunteer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

// 3. Update Bank Details
app.patch('/api/volunteer/bank', async (req, res) => {
  try {
    const { phone, bankDetails } = req.body;
    const volunteer = await Volunteer.findOneAndUpdate(
      { phone },
      { $set: { bankDetails } },
      { new: true }
    );

    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    res.json({ success: true, volunteer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update bank details' });
  }
});

// 4. Submit Resignation
app.patch('/api/volunteer/resign', async (req, res) => {
  try {
    const { phone, resignation } = req.body;
    const volunteer = await Volunteer.findOneAndUpdate(
      { phone },
      { $set: { resignation: { ...resignation, isSubmitted: true } } },
      { new: true }
    );

    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    res.json({ success: true, volunteer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit resignation' });
  }
});

// 5. Update Status (Superadmin usage)
app.patch('/api/volunteer/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const volunteer = await Volunteer.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ success: true, volunteer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
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

// --- COMBOS API Endpoints ---
app.get('/api/combos', async (req, res) => {
  try {
    const { vendorId } = req.query;
    const filter = vendorId ? { vendorId } : {};
    const combos = await Combo.find(filter);
    res.json({ success: true, combos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/combos', async (req, res) => {
  try {
    const combo = new Combo(req.body);
    await combo.save();
    io.emit('combos_updated', { type: 'create', combo });
    res.status(201).json({ success: true, combo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/combos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const combo = await Combo.findByIdAndUpdate(id, req.body, { new: true });
    if (!combo) return res.status(404).json({ success: false, message: 'Combo not found' });
    io.emit('combos_updated', { type: 'update', combo });
    res.json({ success: true, combo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/combos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const combo = await Combo.findByIdAndDelete(id);
    if (!combo) return res.status(404).json({ success: false, message: 'Combo not found' });
    io.emit('combos_updated', { type: 'delete', id });
    res.json({ success: true, message: 'Combo deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    const { amount, vendorId } = req.body; 
    
    const vendor = await Vendor.findOne({ vendorId });
    
    // Razorpay requires amount in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    if (vendor && vendor.razorpayAccountId) {
      const platformFee = 1; // Fixed platform fee
      const vendorShare = amount - platformFee;
      
      options.transfers = [
        {
          account: vendor.razorpayAccountId,
          amount: Math.round(vendorShare * 100),
          currency: "INR"
        }
      ];
    }

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Kiosk Order Error:', error);
    res.status(500).json({ message: 'Error creating Razorpay order' });
  }
});

// --- VOLUNTEER ONBOARDING & MANAGEMENT ---

// 1. Submit Onboarding Data
app.post('/api/volunteers/onboard', async (req, res) => {
  try {
    const { phone, name, dob, collegeName, aadhaarNumber, aadhaarFront, aadhaarBack, collegeIdCard } = req.body;

    if (!phone || !name) {
      return res.status(400).json({ success: false, message: 'Phone and Name are required' });
    }

    // Find or create campus if needed
    let campus = await Campus.findOne({ name: { $regex: new RegExp(`^${collegeName}$`, 'i') } });
    if (!campus) {
      campus = await Campus.findOne(); 
    }

    const volunteerData = {
      name,
      phone,
      dob,
      collegeName,
      aadhaarNumber,
      aadhaarFront,
      aadhaarBack,
      idCardPhoto: collegeIdCard,
      status: 'Pending',
      campus: campus?._id,
      rollNo: 'TBD',
      gender: 'Other',
      hostel: 'TBD',
    };

    const volunteer = await Volunteer.findOneAndUpdate(
      { phone },
      volunteerData,
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Onboarding details submitted for review', volunteer });
  } catch (err) {
    console.error('Onboarding submission error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit onboarding details' });
  }
});

// 2. Get Pending Volunteers
app.get('/api/volunteers/pending', async (req, res) => {
  try {
    const pending = await Volunteer.find({ status: 'Pending' }).populate('campus', 'name');
    res.json({ success: true, volunteers: pending });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending requests' });
  }
});

// 3. Approve/Reject Volunteer
app.patch('/api/volunteers/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const volunteer = await Volunteer.findById(id);
    if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer not found' });

    volunteer.status = status;
    if (status === 'Approved') {
      volunteer.isActive = true;
      if (!volunteer.volunteerId) {
        // Generate a simple unique ID (e.g., CB001, CB002...)
        const count = await Volunteer.countDocuments({ status: 'Approved' });
        volunteer.volunteerId = `CB${String(count + 1).padStart(5, '0')}`;
      }
    }

    await volunteer.save();
    res.json({ success: true, message: `Volunteer status updated to ${status}`, volunteer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
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
    await Combo.deleteMany({});
    
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
