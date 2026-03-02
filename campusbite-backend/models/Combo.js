const mongoose = require('mongoose');

const comboSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  items: [
    {
      type: Number, // References Menu.menuId
      required: true
    }
  ],
  discount: {
    type: Number,
    default: 10
  },
  enabled: {
    type: Boolean,
    default: true
  },
  vendorId: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Combo', comboSchema);
