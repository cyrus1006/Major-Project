const mongoose = require('mongoose');

const progressEntrySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    weight: { type: Number, required: true },
    bmi: { type: Number, required: true },
    date: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.models.ProgressEntry || mongoose.model('ProgressEntry', progressEntrySchema);
