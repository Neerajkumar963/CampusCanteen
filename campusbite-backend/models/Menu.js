const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  menuId: {
    type: Number,
    required: true,
    unique: true
  },
  vendorId: {
    type: String, // References Vendor.vendorId
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  image: String,
  category: String,
  available: {
    type: Boolean,
    default: true
  },
  prepTime: {
    type: Number,
    default: 10 // Minutes
  }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
