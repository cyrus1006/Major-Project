const mongoose = require('mongoose');

const defaultProfile = {
  name: 'Admin User',
  age: 28,
  gender: 'Male',
  height: 176,
  weight: 72,
  activityLevel: 'Moderately Active',
  fitnessGoal: 'Weight Maintenance',
  dietaryPreference: 'Vegetarian',
  allergies: 'None',
  foodPreferences: 'Rice, dal, paneer, fruits',
  mealPreference: 'Balanced meals',
  lifestyleInfo: 'Office worker with light evening exercise',
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profile: { type: mongoose.Schema.Types.Mixed, default: defaultProfile },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
