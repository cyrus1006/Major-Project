const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    meals: { type: [mongoose.Schema.Types.Mixed], required: true },
    targetCalories: { type: Number, required: true },
    goal: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.models.MealPlan || mongoose.model('MealPlan', mealPlanSchema);
