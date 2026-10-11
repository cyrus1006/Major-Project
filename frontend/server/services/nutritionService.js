const activityMultipliers = {
  Sedentary: 1.2,
  'Lightly Active': 1.375,
  'Moderately Active': 1.55,
  'Very Active': 1.725,
  'Extremely Active': 1.9,
};

const goalAdjustments = {
  'Weight Loss': -300,
  'Weight Maintenance': 0,
  'Muscle Gain': 220,
};

const getBmiCategory = (bmi) => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

const calculateNutrition = (profile = {}) => {
  const age = Number(profile.age ?? 28);
  const heightCm = Number(profile.height ?? 170);
  const weightKg = Number(profile.weight ?? 68);
  const gender = profile.gender || 'male';
  const activityLevel = profile.activityLevel || 'Moderately Active';
  const goal = profile.fitnessGoal || 'Weight Maintenance';

  const heightInMeters = heightCm / 100;
  const bmi = Number((weightKg / (heightInMeters * heightInMeters)).toFixed(1));

  const bmrFormula =
    gender.toLowerCase() === 'female'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
      : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;

  const bmr = Math.round(bmrFormula);
  const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
  const dailyCalories = Math.max(
    1500,
    Math.min(4000, Math.round(tdee + (goalAdjustments[goal] ?? 0))),
  );

  const protein = Math.round(Math.max(80, weightKg * 1.8));
  const carbohydrates = Math.round((dailyCalories * 0.45) / 4);
  const fat = Math.round((dailyCalories * 0.25) / 9);
  const fiber = Math.round(Math.max(25, weightKg * 0.3));

  return {
    bmi,
    bmiCategory: getBmiCategory(bmi),
    bmr,
    tdee,
    dailyCalories,
    protein,
    carbohydrates,
    fat,
    fiber,
    goal,
    activityLevel,
    message: 'Approximate nutrition targets based on your profile. These are educational estimates and not medical advice.',
  };
};

module.exports = {
  calculateNutrition,
};
