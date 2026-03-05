// Script to wipe old vendors & menu items so fresh seed data loads
const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusbite';

async function reset() {
  await mongoose.connect(mongoURI);
  console.log('Connected...');

  const Vendor = require('./models/Vendor');
  const Menu = require('./models/Menu');

  await Vendor.deleteMany({});
  await Menu.deleteMany({});
  
  console.log('✅ Cleared all vendors and menu items. Restart the backend to reseed.');
  await mongoose.disconnect();
}

reset().catch(console.error);
