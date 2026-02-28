const mongoose = require('mongoose');

const collegeAdminSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  campusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: true
  },
  role: {
    type: String,
    enum: ['collegeadmin'],
    default: 'collegeadmin'
  }
}, { timestamps: true });

module.exports = mongoose.model('CollegeAdmin', collegeAdminSchema);
