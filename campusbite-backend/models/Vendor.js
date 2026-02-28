const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorId: {
    type: String,
    required: true,
    unique: true
  },
  loginToken: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  image: {
    type: String
  },
  role: {
    type: String,
    enum: ['vendor', 'superadmin'],
    default: 'vendor'
  },
  supportedServices: {
    type: [String],
    default: ['counter', 'table', 'hostel', 'classroom']
  },
  deliveryCharge: {
    type: Number,
    default: 20
  },
  tableServiceCharge: {
    type: Number,
    default: 10
  },
  hostelServiceCharge: {
    type: Number,
    default: 15
  },
  campusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus'
  },
  subscription: {
    status: {
      type: String,
      enum: ['Active', 'Suspended'],
      default: 'Active'
    },
    validUntil: {
      type: Date,
      default: () => {
        // Default to 1 month from now
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d;
      }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
