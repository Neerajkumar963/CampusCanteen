// Merge all stall items under ONE single canteen vendor
require('dotenv').config();
const mongoose = require('mongoose');
const Vendor = require('./models/Vendor');
const Menu = require('./models/Menu');
const Campus = require('./models/Campus');
const crypto = require('crypto');

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusbite';

const CANTEEN_VENDOR_ID = 'campus-canteen';

async function merge() {
  await mongoose.connect(mongoURI);
  console.log('Connected...');

  const campus = await Campus.findOne();
  if (!campus) { console.error('No campus found!'); process.exit(1); }
  console.log(`Campus: ${campus.name}`);

  // Remove all existing non-superadmin vendors and all menus
  await Vendor.deleteMany({ role: 'vendor' });
  await Menu.deleteMany({});
  console.log('Cleared old vendors & menus.');

  // Create ONE unified canteen vendor
  await Vendor.create({
    vendorId: CANTEEN_VENDOR_ID,
    name: 'Campus Canteen',
    password: 'canteen_2024',
    description: 'Burgers, Pizza, Momos, Biryani, Beverages & More',
    image: 'https://images.unsplash.com/photo-1567529854338-fc097b962123?w=800',
    role: 'vendor',
    campusId: campus._id,
    loginToken: crypto.randomBytes(8).toString('hex'),
    subscription: { status: 'Active', validUntil: new Date('2030-01-01') },
    supportedServices: ['counter', 'table', 'hostel', 'classroom'],
    deliveryCharge: 20,
    tableServiceCharge: 10,
    hostelServiceCharge: 15,
  });
  // Image pools based on categories
  const POOLS = {
    'Burger': [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80'
    ],
    'Sandwich (Grilled)': [
      'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80',
      'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=600&q=80'
    ],
    'Pizza': [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80'
    ],
    'Fries': [
      'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&q=80',
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80'
    ],
    'Hot Dog': [
      'https://images.unsplash.com/photo-1612392062631-94b7c6234e2c?w=600&q=80',
      'https://images.unsplash.com/photo-1619734086067-24bf8889ea7d?w=600&q=80'
    ],
    'MAGGI & PASTA': [
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
      'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&q=80'
    ],
    'Cold Beverages': [
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80',
      'https://images.unsplash.com/photo-1595981234058-a9302fb97229?w=600&q=80'
    ],
    'Hot Beverages': [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
      'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=600&q=80'
    ],
    'Mains': [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
      'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&q=80'
    ],
    'Steamed Momos': [
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
      'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80'
    ],
    'Fried Momos': [
      'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80',
      'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=80'
    ],
    'Chicken Sides': [
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c8?w=600&q=80',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80'
    ],
    'Eggs': [
      'https://images.unsplash.com/photo-1607690424560-35d967d421c2?w=600&q=80',
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80'
    ],
    'Paranthas': [
      'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80'
    ],
    'Biryani': [
      'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&q=80',
      'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&q=80'
    ],
    'Curries': [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
      'https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=600&q=80'
    ],
    'Scoops': [
      'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&q=80',
      'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&q=80'
    ],
    'Shakes': [
      'https://images.unsplash.com/photo-1572490122747-3968b75c2905?w=600&q=80',
      'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=80'
    ],
    'default': ['https://images.unsplash.com/photo-1567529854338-fc097b962123?w=600&q=80']
  };

  const getImg = (item) => {
    const pool = POOLS[item.category] || POOLS['default'];
    return pool[item.menuId % pool.length];
  };

  // All menu items under CANTEEN_VENDOR_ID
  const items = [
    // ── Burger ───────────────────────────────────────────────────────────────
    { menuId: 101, name: 'Chicken Burger', description: 'Juicy chicken patty with fresh veggies', price: 60, category: 'Burger', prepTime: 10 },
    { menuId: 102, name: 'Egg Burger', description: 'Egg patty with mayo & veggies', price: 50, category: 'Burger', prepTime: 8 },
    { menuId: 103, name: 'Noodles Burger', description: 'Unique noodle-filled burger', price: 40, category: 'Burger', prepTime: 10 },
    { menuId: 104, name: 'Punjabi Burger', description: 'Spicy Punjabi style burger', price: 30, category: 'Burger', prepTime: 8 },
    // ── Sandwich (Grilled) ───────────────────────────────────────────────────
    { menuId: 105, name: 'Chicken Sandwich', description: 'Grilled chicken with cheese & sauce', price: 60, category: 'Sandwich (Grilled)', prepTime: 8 },
    { menuId: 106, name: 'Egg Sandwich', description: 'Egg & cheese grilled sandwich', price: 40, category: 'Sandwich (Grilled)', prepTime: 6 },
    { menuId: 107, name: 'Aloo Sandwich', description: 'Spiced potato grilled sandwich', price: 30, category: 'Sandwich (Grilled)', prepTime: 6 },
    { menuId: 108, name: 'Butter Jam Maska Bun', description: 'Classic bun with butter & jam', price: 20, category: 'Sandwich (Grilled)', prepTime: 3 },
    // ── Pizza ────────────────────────────────────────────────────────────────
    { menuId: 109, name: 'Chicken Tandoori Tikka Pizza', description: 'Spicy tandoori chicken on crispy base', price: 160, category: 'Pizza', prepTime: 20 },
    { menuId: 110, name: "Farmers' Pizza", description: 'Fresh garden veggies on tomato base', price: 150, category: 'Pizza', prepTime: 18 },
    { menuId: 111, name: 'Paneer Tikka Pizza', description: 'Marinated paneer with peppers', price: 150, category: 'Pizza', prepTime: 18 },
    { menuId: 112, name: 'Cheese & Corn Pizza', description: 'Loaded cheese with sweet corn', price: 130, category: 'Pizza', prepTime: 15 },
    { menuId: 113, name: 'Margherita Pizza', description: 'Classic tomato, basil & mozzarella', price: 100, category: 'Pizza', prepTime: 15 },
    // ── Fries ────────────────────────────────────────────────────────────────
    { menuId: 114, name: 'Classic French Fries (Large)', description: 'Golden crispy salted fries', price: 60, category: 'Fries', prepTime: 8 },
    { menuId: 115, name: 'Peri Peri Fries (Large)', description: 'Spicy peri peri seasoned fries', price: 60, category: 'Fries', prepTime: 8 },
    { menuId: 116, name: 'Classic French Fries (Small)', description: 'Golden crispy salted fries', price: 40, category: 'Fries', prepTime: 6 },
    { menuId: 117, name: 'Peri Peri Fries (Small)', description: 'Spicy peri peri seasoned fries', price: 40, category: 'Fries', prepTime: 6 },
    // ── Chips & Biscuits ─────────────────────────────────────────────────────
    { menuId: 118, name: 'Monister', description: 'Energy drink', price: 125, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 119, name: 'Coke 1 Liter', description: 'Coca-Cola 1 litre bottle', price: 50, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 120, name: 'Coke (400ml)', description: 'Chilled Coca-Cola', price: 40, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 121, name: 'Lays', description: 'Classic salted chips', price: 20, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 122, name: 'Coke (Small)', description: 'Chilled Coca-Cola can', price: 20, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 123, name: 'Water Bottle (1L)', description: 'Packaged drinking water', price: 20, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 124, name: 'Charge@15', description: 'Energy drink', price: 15, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 125, name: 'Biscuits (Pack)', description: 'Assorted biscuit pack', price: 10, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 126, name: 'Water Bottle (500ml)', description: 'Packaged drinking water', price: 10, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 127, name: 'Biscuit (Single)', description: 'Single biscuit', price: 5, category: 'Chips & Biscuits', prepTime: 1 },
    { menuId: 128, name: 'Munch', description: 'Chocolate wafer bar', price: 5, category: 'Chips & Biscuits', prepTime: 1 },
    // ── Hot Dog ──────────────────────────────────────────────────────────────
    { menuId: 129, name: 'Chicken Hot Dog', description: 'Grilled chicken sausage in bun', price: 60, category: 'Hot Dog', prepTime: 8 },
    { menuId: 130, name: 'Egg Hot Dog', description: 'Egg & sausage in soft bun', price: 40, category: 'Hot Dog', prepTime: 6 },
    { menuId: 131, name: 'Veg Hot Dog', description: 'Veg sausage with mustard', price: 30, category: 'Hot Dog', prepTime: 6 },
    // ── MAGGI & PASTA ────────────────────────────────────────────────────────
    { menuId: 132, name: 'White Sauce Pasta', description: 'Creamy white sauce pasta', price: 80, category: 'MAGGI & PASTA', prepTime: 12 },
    { menuId: 133, name: 'Red Sauce Pasta', description: 'Tangy tomato pasta', price: 80, category: 'MAGGI & PASTA', prepTime: 12 },
    { menuId: 134, name: 'Veggie Maggi', description: 'Maggi with mixed vegetables', price: 45, category: 'MAGGI & PASTA', prepTime: 8 },
    { menuId: 135, name: 'Plain Maggi', description: 'Classic Maggi noodles', price: 35, category: 'MAGGI & PASTA', prepTime: 8 },
    // ── Cold Beverages ───────────────────────────────────────────────────────
    { menuId: 201, name: 'Caffe Frappe', description: 'Chilled frappe coffee', price: 50, category: 'Cold Beverages', prepTime: 5 },
    { menuId: 202, name: 'Mocha Frappe', description: 'Chocolate mocha frappe', price: 50, category: 'Cold Beverages', prepTime: 5 },
    { menuId: 203, name: 'Cold Chocolate', description: 'Rich cold chocolate drink', price: 50, category: 'Cold Beverages', prepTime: 5 },
    { menuId: 204, name: 'Ice Tea', description: 'Refreshing chilled ice tea', price: 50, category: 'Cold Beverages', prepTime: 5 },
    { menuId: 205, name: 'Cold Coffee', description: 'Creamy chilled coffee', price: 50, category: 'Cold Beverages', prepTime: 5 },
    // ── Hot Beverages ────────────────────────────────────────────────────────
    { menuId: 206, name: 'Cafe Latte', description: 'Smooth espresso with steamed milk', price: 40, category: 'Hot Beverages', prepTime: 5 },
    { menuId: 207, name: 'Cafe Mocha', description: 'Coffee with chocolate', price: 40, category: 'Hot Beverages', prepTime: 5 },
    { menuId: 208, name: 'Cappuccino', description: 'Frothy espresso and milk foam', price: 30, category: 'Hot Beverages', prepTime: 5 },
    { menuId: 209, name: 'Hot Chocolate', description: 'Rich warm chocolate drink', price: 30, category: 'Hot Beverages', prepTime: 5 },
    { menuId: 210, name: 'Espresso', description: 'Strong bold espresso shot', price: 30, category: 'Hot Beverages', prepTime: 3 },
    { menuId: 211, name: 'Punjabi Chai', description: 'Desi masala chai', price: 15, category: 'Hot Beverages', prepTime: 5 },
    // ── Mains ────────────────────────────────────────────────────────────────
    { menuId: 301, name: 'Chicken Fried Rice', description: 'Wok tossed rice with chicken', price: 150, category: 'Mains', prepTime: 15 },
    { menuId: 302, name: 'Chilli Chicken (Full)', description: 'Spicy crispy chilli chicken', price: 150, category: 'Mains', prepTime: 15 },
    { menuId: 303, name: 'Veg Manchurian (Full)', description: 'Veg balls in Manchurian sauce', price: 140, category: 'Mains', prepTime: 12 },
    { menuId: 304, name: 'Hakka Noodles (Full)', description: 'Tossed noodles with veggies', price: 110, category: 'Mains', prepTime: 12 },
    { menuId: 305, name: 'Veg Fried Rice (Full)', description: 'Stir-fried rice with vegetables', price: 90, category: 'Mains', prepTime: 12 },
    { menuId: 306, name: 'Chilli Chicken (Half)', description: 'Chilli chicken half plate', price: 80, category: 'Mains', prepTime: 12 },
    { menuId: 307, name: 'Hakka Noodles (Half)', description: 'Tossed noodles half plate', price: 70, category: 'Mains', prepTime: 10 },
    { menuId: 308, name: 'Veg Manchurian (Half)', description: 'Veg Manchurian half plate', price: 70, category: 'Mains', prepTime: 10 },
    { menuId: 309, name: 'Veg Fried Rice (Half)', description: 'Stir-fried rice half plate', price: 60, category: 'Mains', prepTime: 10 },
    // ── Steamed Momos ────────────────────────────────────────────────────────
    { menuId: 310, name: 'Steamed Chicken Momos', description: 'Juicy chicken steamed dumplings', price: 90, category: 'Steamed Momos', prepTime: 15 },
    { menuId: 311, name: 'Steamed Paneer Momos', description: 'Paneer steamed dumplings', price: 80, category: 'Steamed Momos', prepTime: 15 },
    { menuId: 312, name: 'Steamed Veg Momos', description: 'Mixed veg steamed dumplings', price: 70, category: 'Steamed Momos', prepTime: 12 },
    // ── Fried Momos ──────────────────────────────────────────────────────────
    { menuId: 313, name: 'Fried Chicken Momos', description: 'Crispy fried chicken dumplings', price: 100, category: 'Fried Momos', prepTime: 15 },
    { menuId: 314, name: 'Fried Paneer Momos', description: 'Crispy fried paneer dumplings', price: 90, category: 'Fried Momos', prepTime: 15 },
    { menuId: 315, name: 'Fried Veg Momos', description: 'Crispy fried veg dumplings', price: 80, category: 'Fried Momos', prepTime: 12 },
    // ── Chicken Sides ────────────────────────────────────────────────────────
    { menuId: 316, name: 'Chicken Wings (Full)', description: 'Crispy spiced chicken wings', price: 150, category: 'Chicken Sides', prepTime: 15 },
    { menuId: 317, name: 'Chicken Strips (Full)', description: 'Crispy chicken strips', price: 150, category: 'Chicken Sides', prepTime: 15 },
    { menuId: 318, name: 'Chicken Wings (Half)', description: 'Crispy chicken wings half', price: 80, category: 'Chicken Sides', prepTime: 12 },
    { menuId: 319, name: 'Chicken Strips (Half)', description: 'Crispy chicken strips half', price: 80, category: 'Chicken Sides', prepTime: 12 },
    // ── Eggs ─────────────────────────────────────────────────────────────────
    { menuId: 320, name: 'Bread Omelette', description: 'Masala egg omelette with bread', price: 60, category: 'Eggs', prepTime: 8 },
    { menuId: 321, name: 'Egg Bhurji', description: 'Spicy scrambled eggs', price: 50, category: 'Eggs', prepTime: 8 },
    { menuId: 322, name: 'Masala Omelette', description: 'Fluffy masala egg omelette', price: 40, category: 'Eggs', prepTime: 6 },
    { menuId: 323, name: 'Boiled Egg (2 pcs)', description: 'Plain boiled eggs', price: 40, category: 'Eggs', prepTime: 5 },
    { menuId: 324, name: 'Bread Slice', description: 'Toasted bread slices', price: 15, category: 'Eggs', prepTime: 2 },
    // ── Paranthas ────────────────────────────────────────────────────────────
    { menuId: 401, name: 'Paneer Parantha', description: 'Stuffed paneer parantha with butter', price: 55, category: 'Paranthas', prepTime: 10 },
    { menuId: 402, name: 'Aloo Parantha', description: 'Classic potato stuffed parantha', price: 45, category: 'Paranthas', prepTime: 8 },
    { menuId: 403, name: 'Mix Parantha', description: 'Mixed veggie stuffed parantha', price: 45, category: 'Paranthas', prepTime: 8 },
    { menuId: 404, name: 'Gobi Parantha', description: 'Cauliflower stuffed parantha', price: 45, category: 'Paranthas', prepTime: 8 },
    // ── Add Ons ──────────────────────────────────────────────────────────────
    { menuId: 405, name: 'Raita', description: 'Fresh curd with veggies', price: 25, category: 'Add Ons', prepTime: 2 },
    { menuId: 406, name: 'Dahi', description: 'Plain yogurt', price: 20, category: 'Add Ons', prepTime: 2 },
    { menuId: 407, name: 'Butter', description: 'Fresh butter', price: 15, category: 'Add Ons', prepTime: 1 },
    // ── Breads ───────────────────────────────────────────────────────────────
    { menuId: 408, name: 'Tawa Parantha', description: 'Plain tawa parantha', price: 25, category: 'Breads', prepTime: 5 },
    { menuId: 409, name: 'Tawa Roti', description: 'Plain tawa roti', price: 15, category: 'Breads', prepTime: 3 },
    // ── Punjabi Street Food ──────────────────────────────────────────────────
    { menuId: 410, name: 'Mix Veg Pakoras', description: 'Crispy mixed veg pakoras', price: 40, category: 'Punjabi Street Food', prepTime: 8 },
    { menuId: 411, name: 'Stuffed Patty', description: 'Spiced stuffed potato patty', price: 30, category: 'Punjabi Street Food', prepTime: 6 },
    { menuId: 412, name: 'Samosa', description: 'Crispy potato samosa', price: 20, category: 'Punjabi Street Food', prepTime: 5 },
    { menuId: 413, name: 'Bread Pakora', description: 'Batter fried bread pakora', price: 20, category: 'Punjabi Street Food', prepTime: 6 },
    { menuId: 414, name: 'Patty', description: 'Crispy potato patty', price: 20, category: 'Punjabi Street Food', prepTime: 5 },
    // ── Biryani ──────────────────────────────────────────────────────────────
    { menuId: 501, name: 'Chicken Biryani (Full)', description: 'Aromatic dum chicken biryani', price: 150, category: 'Biryani', prepTime: 20 },
    { menuId: 502, name: 'Egg Biryani (Full)', description: 'Flavourful egg biryani', price: 130, category: 'Biryani', prepTime: 18 },
    { menuId: 503, name: 'Paneer Biryani (Full)', description: 'Rich paneer biryani', price: 130, category: 'Biryani', prepTime: 18 },
    { menuId: 504, name: 'Veg Biryani', description: 'Mixed vegetable biryani', price: 90, category: 'Biryani', prepTime: 15 },
    { menuId: 505, name: 'Chicken Biryani (Half)', description: 'Half plate chicken biryani', price: 80, category: 'Biryani', prepTime: 15 },
    { menuId: 506, name: 'Egg Biryani (Half)', description: 'Half plate egg biryani', price: 70, category: 'Biryani', prepTime: 12 },
    { menuId: 507, name: 'Paneer Biryani (Half)', description: 'Half plate paneer biryani', price: 70, category: 'Biryani', prepTime: 12 },
    // ── Curries ──────────────────────────────────────────────────────────────
    { menuId: 508, name: 'Chicken Curry (Full)', description: 'Spicy chicken curry', price: 150, category: 'Curries', prepTime: 15 },
    { menuId: 509, name: 'Butter Chicken (Full)', description: 'Creamy butter chicken', price: 150, category: 'Curries', prepTime: 15 },
    { menuId: 510, name: 'Kadhai Chicken (Full)', description: 'Spiced kadhai chicken', price: 150, category: 'Curries', prepTime: 15 },
    { menuId: 511, name: 'Chicken Curry (Half)', description: 'Chicken curry half plate', price: 80, category: 'Curries', prepTime: 12 },
    { menuId: 512, name: 'Butter Chicken (Half)', description: 'Butter chicken half plate', price: 80, category: 'Curries', prepTime: 12 },
    { menuId: 513, name: 'Kadhai Chicken (Half)', description: 'Kadhai chicken half plate', price: 80, category: 'Curries', prepTime: 12 },
    { menuId: 514, name: 'Paneer Masala', description: 'Paneer in rich tomato gravy', price: 80, category: 'Curries', prepTime: 12 },
    { menuId: 515, name: 'Dal Makhani', description: 'Slow cooked black lentils', price: 60, category: 'Curries', prepTime: 10 },
    { menuId: 516, name: 'Jeera Rice', description: 'Basmati rice with cumin', price: 50, category: 'Curries', prepTime: 8 },
    // ── Scoops ───────────────────────────────────────────────────────────────
    { menuId: 601, name: 'Nutty Belgian Dark Chocolate', description: 'Rich dark chocolate with nuts', price: 70, category: 'Scoops', prepTime: 3 },
    { menuId: 602, name: 'Black Current', description: 'Tangy black current ice cream', price: 60, category: 'Scoops', prepTime: 3 },
    { menuId: 603, name: 'Cookies & Cream', description: 'Classic cookies and cream', price: 60, category: 'Scoops', prepTime: 3 },
    { menuId: 604, name: 'Butter Scotch', description: 'Creamy butter scotch scoop', price: 50, category: 'Scoops', prepTime: 3 },
    { menuId: 605, name: 'American Nuts', description: 'Nutty caramel ice cream', price: 50, category: 'Scoops', prepTime: 3 },
    { menuId: 606, name: 'Chocolate', description: 'Classic chocolate scoop', price: 50, category: 'Scoops', prepTime: 3 },
    { menuId: 607, name: 'Real Mango', description: 'Fresh mango ice cream', price: 50, category: 'Scoops', prepTime: 3 },
    { menuId: 608, name: 'Strawberry', description: 'Fresh strawberry scoop', price: 40, category: 'Scoops', prepTime: 3 },
    { menuId: 609, name: 'Vanilla', description: 'Classic creamy vanilla', price: 30, category: 'Scoops', prepTime: 3 },
    // ── Shakes ───────────────────────────────────────────────────────────────
    { menuId: 610, name: 'Oreo Shake', description: 'Thick Oreo milkshake', price: 100, category: 'Shakes', prepTime: 5 },
    { menuId: 611, name: 'Dark Chocolate Shake', description: 'Rich dark chocolate milkshake', price: 100, category: 'Shakes', prepTime: 5 },
    { menuId: 612, name: 'Black Current Shake', description: 'Black current milkshake', price: 90, category: 'Shakes', prepTime: 5 },
    { menuId: 613, name: 'Butter Scotch Shake', description: 'Butter scotch milkshake', price: 80, category: 'Shakes', prepTime: 5 },
    { menuId: 614, name: 'Mango Shake', description: 'Fresh mango milkshake', price: 80, category: 'Shakes', prepTime: 5 },
    { menuId: 615, name: 'Cold Coffee Shake', description: 'Chilled coffee milkshake', price: 70, category: 'Shakes', prepTime: 5 },
    { menuId: 616, name: 'Strawberry Shake', description: 'Fresh strawberry milkshake', price: 70, category: 'Shakes', prepTime: 5 },
    { menuId: 617, name: 'Chocolate Shake', description: 'Classic chocolate milkshake', price: 70, category: 'Shakes', prepTime: 5 },
    { menuId: 618, name: 'Banana Shake', description: 'Fresh banana milkshake', price: 60, category: 'Shakes', prepTime: 5 },
    { menuId: 619, name: 'Vanilla Shake', description: 'Classic vanilla milkshake', price: 60, category: 'Shakes', prepTime: 5 },
  ].map(item => ({ ...item, vendorId: CANTEEN_VENDOR_ID, available: true, image: getImg(item) }));

  await Menu.insertMany(items);
  console.log(`✅ Seeded ${items.length} menu items under "Campus Canteen".`);
  console.log('\n🎉 Done! Hard-refresh the kiosk to see one canteen with all categories in sidebar.');
  await mongoose.disconnect();
}

merge().catch(err => { console.error(err); process.exit(1); });
