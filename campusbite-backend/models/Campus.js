const mongoose = require('mongoose');

const campusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  logo: {
    type: String,
    default: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=200&auto=format&fit=crop'
  },
  status: {
    type: String,
    enum: ['Active', 'Disabled'],
    default: 'Active'
  },
  qrToken: {
    type: String,
    unique: true,
    sparse: true // Allow nulls for now during migration
  }
}, { timestamps: true });

module.exports = mongoose.model('Campus', campusSchema);
