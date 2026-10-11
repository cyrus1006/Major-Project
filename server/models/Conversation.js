const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: false },
);

const conversationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    messages: [messageSchema],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
