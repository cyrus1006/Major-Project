const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number,
    fiber: Number,
    servingSize: Number,
    servingUnit: String,
    vegetarian: Boolean,
    vegan: Boolean,
    containsEgg: Boolean,
    allergens: [String],
    cuisine: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Food || mongoose.model('Food', foodSchema);
