// Force seed all the new real canteen vendors and menu items
require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('./models/Vendor');
const Menu = require('./models/Menu');
const Campus = require('./models/Campus');
const crypto = require('crypto');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusbite';

async function forceSeed() {
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB...');

  const campus = await Campus.findOne();
  if (!campus) {
    console.error('No campus found! Make sure backend has run at least once.');
    process.exit(1);
  }
  console.log(`Using campus: ${campus.name} (${campus._id})`);

  // Remove old non-superadmin vendors and all menus
  await Vendor.deleteMany({ role: 'vendor' });
  await Menu.deleteMany({});
  console.log('Cleared old vendors (role=vendor) and menus.');

  const newVendors = [
    { vendorId: 'barley-bites', name: 'Barley Bites', password: 'barley_2024', description: 'Burgers, Pizzas, Sandwiches & More', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', role: 'vendor', campusId: campus._id, loginToken: crypto.randomBytes(8).toString('hex'), subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table', 'hostel', 'classroom'], deliveryCharge: 20, tableServiceCharge: 10, hostelServiceCharge: 15 },
    { vendorId: 'khao-gali', name: 'Khao Gali', password: 'khao_2024', description: 'Chinese, Momos & Indian Mains', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800', role: 'vendor', campusId: campus._id, loginToken: crypto.randomBytes(8).toString('hex'), subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table', 'hostel', 'classroom'], deliveryCharge: 20, tableServiceCharge: 10, hostelServiceCharge: 15 },
    { vendorId: 'nescafe-outlet', name: 'NESCAFE', password: 'nescafe_2024', description: 'Hot & Cold Beverages', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800', role: 'vendor', campusId: campus._id, loginToken: crypto.randomBytes(8).toString('hex'), subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table', 'hostel', 'classroom'], deliveryCharge: 15, tableServiceCharge: 5, hostelServiceCharge: 15 },
    { vendorId: 'bambukat', name: 'BAMBUKAT', password: 'bambukat_2024', description: 'Punjabi Paranthas & Street Food', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', role: 'vendor', campusId: campus._id, loginToken: crypto.randomBytes(8).toString('hex'), subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table', 'hostel', 'classroom'], deliveryCharge: 20, tableServiceCharge: 10, hostelServiceCharge: 15 },
    { vendorId: 'barqat', name: 'BARQAT', password: 'barqat_2024', description: 'Biryani & Curries', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800', role: 'vendor', campusId: campus._id, loginToken: crypto.randomBytes(8).toString('hex'), subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table', 'hostel', 'classroom'], deliveryCharge: 20, tableServiceCharge: 10, hostelServiceCharge: 15 },
    { vendorId: 'havmor', name: 'HAVMOR', password: 'havmor_2024', description: 'Ice Cream Scoops & Shakes', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800', role: 'vendor', campusId: campus._id, loginToken: crypto.randomBytes(8).toString('hex'), subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'table'], deliveryCharge: 15, tableServiceCharge: 5, hostelServiceCharge: 15 },
    { vendorId: 'stationery', name: 'Stationery', password: 'stationery_login12', description: 'Pens, Books & more', image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800', role: 'vendor', campusId: campus._id, loginToken: crypto.randomBytes(8).toString('hex'), subscription: { status: 'Active', validUntil: new Date('2030-01-01') }, supportedServices: ['counter', 'hostel'], deliveryCharge: 25, tableServiceCharge: 0, hostelServiceCharge: 20 },
  ];

  await Vendor.insertMany(newVendors);
  console.log(`✅ Seeded ${newVendors.length} vendors.`);

  const menuItems = [
    // BARLEY BITES
    { menuId: 101, vendorId: 'barley-bites', name: 'Chicken Burger', description: 'Juicy chicken patty', price: 60, category: 'Burger', prepTime: 10 },
    { menuId: 102, vendorId: 'barley-bites', name: 'Egg Burger', description: 'Egg patty with mayo', price: 50, category: 'Burger', prepTime: 8 },
    { menuId: 103, vendorId: 'barley-bites', name: 'Noodles Burger', description: 'Noodle-filled burger', price: 40, category: 'Burger', prepTime: 10 },
    { menuId: 104, vendorId: 'barley-bites', name: 'Punjabi Burger', description: 'Spicy Punjabi style', price: 30, category: 'Burger', prepTime: 8 },
    { menuId: 105, vendorId: 'barley-bites', name: 'Chicken Sandwich', description: 'Grilled chicken sandwich', price: 60, category: 'Sandwich (Grilled)', prepTime: 8 },
    { menuId: 106, vendorId: 'barley-bites', name: 'Egg Sandwich', description: 'Egg & cheese grilled', price: 40, category: 'Sandwich (Grilled)', prepTime: 6 },
    { menuId: 107, vendorId: 'barley-bites', name: 'Aloo Sandwich', description: 'Spiced potato grilled', price: 30, category: 'Sandwich (Grilled)', prepTime: 6 },
    { menuId: 108, vendorId: 'barley-bites', name: 'Butter Jam Maska Bun', description: 'Classic bun with butter & jam', price: 20, category: 'Sandwich (Grilled)', prepTime: 3 },
    { menuId: 109, vendorId: 'barley-bites', name: 'Chicken Tandoori Tikka Pizza', description: 'Tandoori chicken pizza', price: 160, category: 'Pizza', prepTime: 20 },
    { menuId: 110, vendorId: 'barley-bites', name: "Farmers' Pizza", description: 'Fresh garden veggies', price: 150, category: 'Pizza', prepTime: 18 },
    { menuId: 111, vendorId: 'barley-bites', name: 'Paneer Tikka Pizza', description: 'Marinated paneer pizza', price: 150, category: 'Pizza', prepTime: 18 },
    { menuId: 112, vendorId: 'barley-bites', name: 'Cheese & Corn Pizza', description: 'Cheese and sweet corn', price: 130, category: 'Pizza', prepTime: 15 },
    { menuId: 113, vendorId: 'barley-bites', name: 'Margherita Pizza', description: 'Classic tomato and basil', price: 100, category: 'Pizza', prepTime: 15 },
    { menuId: 114, vendorId: 'barley-bites', name: 'Classic French Fries (Large)', description: 'Crispy salted fries', price: 60, category: 'Fries', prepTime: 8 },
    { menuId: 115, vendorId: 'barley-bites', name: 'Peri Peri Fries (Large)', description: 'Spicy peri peri fries', price: 60, category: 'Fries', prepTime: 8 },
    { menuId: 116, vendorId: 'barley-bites', name: 'Classic French Fries (Small)', description: 'Crispy salted fries', price: 40, category: 'Fries', prepTime: 6 },
    { menuId: 117, vendorId: 'barley-bites', name: 'Peri Peri Fries (Small)', description: 'Spicy peri peri fries', price: 40, category: 'Fries', prepTime: 6 },
    { menuId: 118, vendorId: 'barley-bites', name: 'Monister', description: 'Energy drink', price: 125, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 119, vendorId: 'barley-bites', name: 'Coke 1 Liter', description: 'Coca-Cola 1 litre', price: 50, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 120, vendorId: 'barley-bites', name: 'Coke (400ml)', description: 'Chilled Coca-Cola', price: 40, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 121, vendorId: 'barley-bites', name: 'Lays', description: 'Classic salted chips', price: 20, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 122, vendorId: 'barley-bites', name: 'Coke (Small)', description: 'Chilled Coca-Cola can', price: 20, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 123, vendorId: 'barley-bites', name: 'Water Bottle (1L)', description: 'Packaged drinking water', price: 20, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 124, vendorId: 'barley-bites', name: 'Charge@15', description: 'Energy drink', price: 15, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 125, vendorId: 'barley-bites', name: 'Biscuits (Pack)', description: 'Assorted biscuit pack', price: 10, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 126, vendorId: 'barley-bites', name: 'Water Bottle (500ml)', description: 'Packaged drinking water', price: 10, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 127, vendorId: 'barley-bites', name: 'Biscuit (Single)', description: 'Single biscuit', price: 5, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 128, vendorId: 'barley-bites', name: 'Munch', description: 'Chocolate wafer bar', price: 5, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 129, vendorId: 'barley-bites', name: 'Chicken Hot Dog', description: 'Grilled chicken in bun', price: 60, category: 'Hot Dog', prepTime: 8 },
    { menuId: 130, vendorId: 'barley-bites', name: 'Egg Hot Dog', description: 'Egg & sausage in bun', price: 40, category: 'Hot Dog', prepTime: 6 },
    { menuId: 131, vendorId: 'barley-bites', name: 'Veg Hot Dog', description: 'Veg sausage in bun', price: 30, category: 'Hot Dog', prepTime: 6 },
    { menuId: 132, vendorId: 'barley-bites', name: 'White Sauce Pasta', description: 'Creamy white sauce pasta', price: 80, category: 'MAGGI&PAZZTA', prepTime: 12 },
    { menuId: 133, vendorId: 'barley-bites', name: 'Red Sauce Pasta', description: 'Tangy tomato pasta', price: 80, category: 'MAGGI&PAZZTA', prepTime: 12 },
    { menuId: 134, vendorId: 'barley-bites', name: 'Veggie Maggi', description: 'Maggi with vegetables', price: 45, category: 'MAGGI&PAZZTA', prepTime: 8 },
    { menuId: 135, vendorId: 'barley-bites', name: 'Plain Maggi', description: 'Classic Maggi noodles', price: 35, category: 'MAGGI&PAZZTA', prepTime: 8 },
    // NESCAFE
    { menuId: 201, vendorId: 'nescafe-outlet', name: 'Caffe Frappe', description: 'Chilled frappe coffee', price: 50, category: 'Cold Beverages', prepTime: 5 },
    { menuId: 202, vendorId: 'nescafe-outlet', name: 'Mocha Frappe', description: 'Chocolate mocha frappe', price: 50, category: 'Cold Beverages', prepTime: 5 },
    { menuId: 203, vendorId: 'nescafe-outlet', name: 'Cold Chocolate', description: 'Rich cold chocolate', price: 50, category: 'Cold Beverages', prepTime: 5 },
    { menuId: 204, vendorId: 'nescafe-outlet', name: 'Ice Tea', description: 'Refreshing ice tea', price: 50, category: 'Cold Beverages', prepTime: 5 },
    { menuId: 205, vendorId: 'nescafe-outlet', name: 'Cold Coffee', description: 'Creamy cold coffee', price: 50, category: 'Cold Beverages', prepTime: 5 },
    { menuId: 206, vendorId: 'nescafe-outlet', name: 'Cafe Latte', description: 'Espresso with steamed milk', price: 40, category: 'Hot Beverages', prepTime: 5 },
    { menuId: 207, vendorId: 'nescafe-outlet', name: 'Cafe Mocha', description: 'Coffee with chocolate', price: 40, category: 'Hot Beverages', prepTime: 5 },
    { menuId: 208, vendorId: 'nescafe-outlet', name: 'Cappuccino', description: 'Frothy espresso and milk foam', price: 30, category: 'Hot Beverages', prepTime: 5 },
    { menuId: 209, vendorId: 'nescafe-outlet', name: 'Hot Chocolate', description: 'Rich warm chocolate', price: 30, category: 'Hot Beverages', prepTime: 5 },
    { menuId: 210, vendorId: 'nescafe-outlet', name: 'Espresso', description: 'Bold espresso shot', price: 30, category: 'Hot Beverages', prepTime: 3 },
    { menuId: 211, vendorId: 'nescafe-outlet', name: 'Punjabi Chai', description: 'Desi masala chai', price: 15, category: 'Hot Beverages', prepTime: 5 },
    // KHAO GALI
    { menuId: 301, vendorId: 'khao-gali', name: 'Chicken Fried Rice', description: 'Wok tossed rice', price: 150, category: 'Mains', prepTime: 15 },
    { menuId: 302, vendorId: 'khao-gali', name: 'Chilli Chicken (Full)', description: 'Spicy crispy chilli chicken', price: 150, category: 'Mains', prepTime: 15 },
    { menuId: 303, vendorId: 'khao-gali', name: 'Veg Manchurian (Full)', description: 'Veg in Manchurian sauce', price: 140, category: 'Mains', prepTime: 12 },
    { menuId: 304, vendorId: 'khao-gali', name: 'Hakka Noodles (Full)', description: 'Tossed noodles', price: 110, category: 'Mains', prepTime: 12 },
    { menuId: 305, vendorId: 'khao-gali', name: 'Veg Fried Rice (Full)', description: 'Stir-fried rice', price: 90, category: 'Mains', prepTime: 12 },
    { menuId: 306, vendorId: 'khao-gali', name: 'Chilli Chicken (Half)', description: 'Crispy chilli chicken half', price: 80, category: 'Mains', prepTime: 12 },
    { menuId: 307, vendorId: 'khao-gali', name: 'Hakka Noodles (Half)', description: 'Tossed noodles half', price: 70, category: 'Mains', prepTime: 10 },
    { menuId: 308, vendorId: 'khao-gali', name: 'Veg Manchurian (Half)', description: 'Manchurian half plate', price: 70, category: 'Mains', prepTime: 10 },
    { menuId: 309, vendorId: 'khao-gali', name: 'Veg Fried Rice (Half)', description: 'Fried rice half plate', price: 60, category: 'Mains', prepTime: 10 },
    { menuId: 310, vendorId: 'khao-gali', name: 'Steamed Chicken Momos', description: 'Juicy steamed dumplings', price: 90, category: 'Steamed Momos', prepTime: 15 },
    { menuId: 311, vendorId: 'khao-gali', name: 'Steamed Paneer Momos', description: 'Paneer steamed dumplings', price: 80, category: 'Steamed Momos', prepTime: 15 },
    { menuId: 312, vendorId: 'khao-gali', name: 'Steamed Veg Momos', description: 'Veg steamed dumplings', price: 70, category: 'Steamed Momos', prepTime: 12 },
    { menuId: 313, vendorId: 'khao-gali', name: 'Fried Chicken Momos', description: 'Crispy chicken dumplings', price: 100, category: 'Fried Momos', prepTime: 15 },
    { menuId: 314, vendorId: 'khao-gali', name: 'Fried Paneer Momos', description: 'Crispy paneer dumplings', price: 90, category: 'Fried Momos', prepTime: 15 },
    { menuId: 315, vendorId: 'khao-gali', name: 'Fried Veg Momos', description: 'Crispy veg dumplings', price: 80, category: 'Fried Momos', prepTime: 12 },
    { menuId: 316, vendorId: 'khao-gali', name: 'Chicken Wings (Full)', description: 'Crispy chicken wings full', price: 150, category: 'Chicken Sides', prepTime: 15 },
    { menuId: 317, vendorId: 'khao-gali', name: 'Chicken Strips (Full)', description: 'Crispy chicken strips full', price: 150, category: 'Chicken Sides', prepTime: 15 },
    { menuId: 318, vendorId: 'khao-gali', name: 'Chicken Wings (Half)', description: 'Crispy chicken wings half', price: 80, category: 'Chicken Sides', prepTime: 12 },
    { menuId: 319, vendorId: 'khao-gali', name: 'Chicken Strips (Half)', description: 'Crispy chicken strips half', price: 80, category: 'Chicken Sides', prepTime: 12 },
    { menuId: 320, vendorId: 'khao-gali', name: 'Bread Omelette', description: 'Masala egg with bread', price: 60, category: 'Eggs', prepTime: 8 },
    { menuId: 321, vendorId: 'khao-gali', name: 'Egg Bhurji', description: 'Spicy scrambled eggs', price: 50, category: 'Eggs', prepTime: 8 },
    { menuId: 322, vendorId: 'khao-gali', name: 'Masala Omelette', description: 'Fluffy masala omelette', price: 40, category: 'Eggs', prepTime: 6 },
    { menuId: 323, vendorId: 'khao-gali', name: 'Boiled Egg (2 pcs)', description: 'Plain boiled eggs', price: 40, category: 'Eggs', prepTime: 5 },
    { menuId: 324, vendorId: 'khao-gali', name: 'Bread Slice', description: 'Toasted bread slices', price: 15, category: 'Eggs', prepTime: 2 },
    // BAMBUKAT
    { menuId: 401, vendorId: 'bambukat', name: 'Paneer Parantha', description: 'Stuffed paneer parantha', price: 55, category: 'Paranthas', prepTime: 10 },
    { menuId: 402, vendorId: 'bambukat', name: 'Aloo Parantha', description: 'Classic potato parantha', price: 45, category: 'Paranthas', prepTime: 8 },
    { menuId: 403, vendorId: 'bambukat', name: 'Mix Parantha', description: 'Mixed veggie parantha', price: 45, category: 'Paranthas', prepTime: 8 },
    { menuId: 404, vendorId: 'bambukat', name: 'Gobi Parantha', description: 'Cauliflower parantha', price: 45, category: 'Paranthas', prepTime: 8 },
    { menuId: 405, vendorId: 'bambukat', name: 'Raita', description: 'Fresh curd with veggies', price: 25, category: 'Add Ons', prepTime: 2 },
    { menuId: 406, vendorId: 'bambukat', name: 'Dahi', description: 'Plain yogurt', price: 20, category: 'Add Ons', prepTime: 2 },
    { menuId: 407, vendorId: 'bambukat', name: 'Butter', description: 'Fresh butter', price: 15, category: 'Add Ons', prepTime: 1 },
    { menuId: 408, vendorId: 'bambukat', name: 'Tawa Parantha', description: 'Plain tawa parantha', price: 25, category: 'Breads', prepTime: 5 },
    { menuId: 409, vendorId: 'bambukat', name: 'Tawa Roti', description: 'Plain tawa roti', price: 15, category: 'Breads', prepTime: 3 },
    { menuId: 410, vendorId: 'bambukat', name: 'Mix Veg Pakoras', description: 'Crispy veg pakoras', price: 40, category: 'Punjabi Street Food', prepTime: 8 },
    { menuId: 411, vendorId: 'bambukat', name: 'Stuffed Patty', description: 'Spiced potato patty', price: 30, category: 'Punjabi Street Food', prepTime: 6 },
    { menuId: 412, vendorId: 'bambukat', name: 'Samosa', description: 'Crispy potato samosa', price: 20, category: 'Punjabi Street Food', prepTime: 5 },
    { menuId: 413, vendorId: 'bambukat', name: 'Bread Pakora', description: 'Batter fried bread pakora', price: 20, category: 'Punjabi Street Food', prepTime: 6 },
    { menuId: 414, vendorId: 'bambukat', name: 'Patty', description: 'Crispy potato patty', price: 20, category: 'Punjabi Street Food', prepTime: 5 },
    // BARQAT
    { menuId: 501, vendorId: 'barqat', name: 'Chicken Biryani (Full)', description: 'Aromatic dum biryani', price: 150, category: 'Biryani', prepTime: 20 },
    { menuId: 502, vendorId: 'barqat', name: 'Egg Biryani (Full)', description: 'Flavourful egg biryani', price: 130, category: 'Biryani', prepTime: 18 },
    { menuId: 503, vendorId: 'barqat', name: 'Paneer Biryani (Full)', description: 'Rich paneer biryani', price: 130, category: 'Biryani', prepTime: 18 },
    { menuId: 504, vendorId: 'barqat', name: 'Veg Biryani', description: 'Mixed vegetable biryani', price: 90, category: 'Biryani', prepTime: 15 },
    { menuId: 505, vendorId: 'barqat', name: 'Chicken Biryani (Half)', description: 'Half plate chicken biryani', price: 80, category: 'Biryani', prepTime: 15 },
    { menuId: 506, vendorId: 'barqat', name: 'Egg Biryani (Half)', description: 'Half plate egg biryani', price: 70, category: 'Biryani', prepTime: 12 },
    { menuId: 507, vendorId: 'barqat', name: 'Paneer Biryani (Half)', description: 'Half plate paneer biryani', price: 70, category: 'Biryani', prepTime: 12 },
    { menuId: 508, vendorId: 'barqat', name: 'Chicken Curry (Full)', description: 'Spicy chicken curry', price: 150, category: 'Curries', prepTime: 15 },
    { menuId: 509, vendorId: 'barqat', name: 'Butter Chicken (Full)', description: 'Creamy butter chicken', price: 150, category: 'Curries', prepTime: 15 },
    { menuId: 510, vendorId: 'barqat', name: 'Kadhai Chicken (Full)', description: 'Spiced kadhai chicken', price: 150, category: 'Curries', prepTime: 15 },
    { menuId: 511, vendorId: 'barqat', name: 'Chicken Curry (Half)', description: 'Chicken curry half', price: 80, category: 'Curries', prepTime: 12 },
    { menuId: 512, vendorId: 'barqat', name: 'Butter Chicken (Half)', description: 'Butter chicken half', price: 80, category: 'Curries', prepTime: 12 },
    { menuId: 513, vendorId: 'barqat', name: 'Kadhai Chicken (Half)', description: 'Kadhai chicken half', price: 80, category: 'Curries', prepTime: 12 },
    { menuId: 514, vendorId: 'barqat', name: 'Paneer Masala', description: 'Paneer in tomato gravy', price: 80, category: 'Curries', prepTime: 12 },
    { menuId: 515, vendorId: 'barqat', name: 'Dal Makhani', description: 'Slow cooked black lentils', price: 60, category: 'Curries', prepTime: 10 },
    { menuId: 516, vendorId: 'barqat', name: 'Jeera Rice', description: 'Basmati rice with cumin', price: 50, category: 'Curries', prepTime: 8 },
    // HAVMOR
    { menuId: 601, vendorId: 'havmor', name: 'Nutty Belgian Dark Chocolate', description: 'Rich dark chocolate with nuts', price: 70, category: 'Scoops', prepTime: 3 },
    { menuId: 602, vendorId: 'havmor', name: 'Black Current', description: 'Tangy black current', price: 60, category: 'Scoops', prepTime: 3 },
    { menuId: 603, vendorId: 'havmor', name: 'Cookies & Cream', description: 'Classic cookies and cream', price: 60, category: 'Scoops', prepTime: 3 },
    { menuId: 604, vendorId: 'havmor', name: 'Butter Scotch', description: 'Creamy butter scotch', price: 50, category: 'Scoops', prepTime: 3 },
    { menuId: 605, vendorId: 'havmor', name: 'American Nuts', description: 'Nutty caramel ice cream', price: 50, category: 'Scoops', prepTime: 3 },
    { menuId: 606, vendorId: 'havmor', name: 'Chocolate', description: 'Classic chocolate scoop', price: 50, category: 'Scoops', prepTime: 3 },
    { menuId: 607, vendorId: 'havmor', name: 'Real Mango', description: 'Fresh mango ice cream', price: 50, category: 'Scoops', prepTime: 3 },
    { menuId: 608, vendorId: 'havmor', name: 'Strawberry', description: 'Fresh strawberry scoop', price: 40, category: 'Scoops', prepTime: 3 },
    { menuId: 609, vendorId: 'havmor', name: 'Vanilla', description: 'Classic creamy vanilla', price: 30, category: 'Scoops', prepTime: 3 },
    { menuId: 610, vendorId: 'havmor', name: 'Oreo Shake', description: 'Thick Oreo milkshake', price: 100, category: 'Shakes', prepTime: 5 },
    { menuId: 611, vendorId: 'havmor', name: 'Dark Chocolate Shake', description: 'Dark chocolate milkshake', price: 100, category: 'Shakes', prepTime: 5 },
    { menuId: 612, vendorId: 'havmor', name: 'Black Current Shake', description: 'Black current milkshake', price: 90, category: 'Shakes', prepTime: 5 },
    { menuId: 613, vendorId: 'havmor', name: 'Butter Scotch Shake', description: 'Butter scotch milkshake', price: 80, category: 'Shakes', prepTime: 5 },
    { menuId: 614, vendorId: 'havmor', name: 'Mango Shake', description: 'Fresh mango milkshake', price: 80, category: 'Shakes', prepTime: 5 },
    { menuId: 615, vendorId: 'havmor', name: 'Cold Coffee Shake', description: 'Chilled coffee shake', price: 70, category: 'Shakes', prepTime: 5 },
    { menuId: 616, vendorId: 'havmor', name: 'Strawberry Shake', description: 'Fresh strawberry shake', price: 70, category: 'Shakes', prepTime: 5 },
    { menuId: 617, vendorId: 'havmor', name: 'Chocolate Shake', description: 'Classic choc milkshake', price: 70, category: 'Shakes', prepTime: 5 },
    { menuId: 618, vendorId: 'havmor', name: 'Banana Shake', description: 'Fresh banana milkshake', price: 60, category: 'Shakes', prepTime: 5 },
    { menuId: 619, vendorId: 'havmor', name: 'Vanilla Shake', description: 'Classic vanilla shake', price: 60, category: 'Shakes', prepTime: 5 },
    // STATIONERY
    { menuId: 700, vendorId: 'stationery', name: 'Blue Pen', description: 'Smooth ink ball pen', price: 10, category: 'Stationery', prepTime: 1 },
    { menuId: 701, vendorId: 'stationery', name: 'Notebook', description: '100 pages ruled', price: 40, category: 'Books', prepTime: 1 },
  ];

  await Menu.insertMany(menuItems);
  console.log(`✅ Seeded ${menuItems.length} menu items.`);

  console.log('\n🎉 Done! Restart the kiosk page to see all canteens.');
  await mongoose.disconnect();
}

forceSeed().catch(err => { console.error(err); process.exit(1); });
