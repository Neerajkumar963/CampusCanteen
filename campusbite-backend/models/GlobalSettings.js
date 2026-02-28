const mongoose = require('mongoose');

const GlobalSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  platformFeeEnabled: { type: Boolean, default: false },
  platformFeeAmount: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('GlobalSettings', GlobalSettingsSchema);
