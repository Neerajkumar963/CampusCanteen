const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  item: {
    id: Number,
    name: String,
    price: Number,
    category: String,
    image: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: Number,
    required: true,
    unique: true
  },
  vendorId: {
    type: String,
    required: true
  },
  tokenNumber: {
    type: Number,
    required: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Cash'],
    required: true
  },
  orderType: {
    type: String,
    enum: ['counter', 'table', 'hostel', 'classroom', 'Pickup', 'Table', 'Delivery'],
    required: true
  },
  serviceId: {
    type: String // Table Number or Block/Room Number
  },
  status: {
    type: String,
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },
  customerName: String,
  customerPhone: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
