const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  dob: {
    type: String
  },
  collegeName: {
    type: String
  },
  aadhaarNumber: {
    type: String
  },
  aadhaarFront: {
    type: String
  },
  aadhaarBack: {
    type: String
  },
  rollNo: {
    type: String,
    default: 'TBD'
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'TBD'],
    default: 'TBD'
  },
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus'
  },
  hostel: {
    type: String,
    default: 'TBD'
  },
  roomNo: {
    type: String
  },
  idCardPhoto: {
    type: String
  },
  volunteerId: {
    type: String,
    unique: true,
    sparse: true
  },
  selfie: {
    type: String
  },
  bankDetails: {
    holderName: String,
    accountNo: String,
    ifsc: String,
    bankName: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  earnings: {
    total: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 }
  },
  role: {
    type: String,
    default: 'Runner'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  resignation: {
    isSubmitted: { type: Boolean, default: false },
    reason: String,
    lwd: Date,
    remarks: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);
