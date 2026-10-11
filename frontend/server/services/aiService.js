const generateFallbackReply = (profile = {}, message = '') => {
  const goal = profile.fitnessGoal || 'Weight Maintenance';
  const dietaryPreference = profile.dietaryPreference || 'Non-Vegetarian';
  const allergies = profile.allergies || 'No major allergies listed';

  const lowerMessage = (message || '').toLowerCase();

  if (lowerMessage.includes('breakfast') || lowerMessage.includes('morning')) {
    return `For your goal of ${goal}, a breakfast with protein and fiber works well. Try oats with milk or yogurt, fruit, and a handful of nuts while keeping allergies in mind (${allergies}).`;
  }

  if (lowerMessage.includes('protein')) {
    return `To increase protein, focus on ${dietaryPreference === 'Vegetarian' ? 'paneer, dal, curd, soy, eggs, and lentils' : 'chicken, fish, eggs, paneer, curd, and dal'} while keeping your calorie target in view.`;
  }

  if (lowerMessage.includes('dinner') || lowerMessage.includes('post-workout') || lowerMessage.includes('workout')) {
    return `A post-workout or dinner option could be a balanced plate with lean protein, vegetables, and a smart carb source such as rice or roti. Keep portions aligned with your calorie target and avoid hidden ingredients from your allergies.`;
  }

  if (lowerMessage.includes('replace') || lowerMessage.includes('alternative') || lowerMessage.includes('instead')) {
    return `A good swap is to replace heavy carbs with another fiber-rich option that matches your dietary preference. For example, use rice with roti, or paneer with dal or tofu depending on your preferences and allergies.`;
  }

  return `Based on your ${goal.toLowerCase()} goal and ${dietaryPreference.toLowerCase()} preference, prioritize balanced meals with protein, fiber, and smart carbs. Keep your meals consistent with your daily calorie target, and manage allergies carefully.`;
};

const generateAiResponse = async (profile = {}, message = '') => {
  const aiEnabled = process.env.AI_PROVIDER_ENABLED === 'true';

  if (!aiEnabled) {
    return {
      success: true,
      reply: generateFallbackReply(profile, message),
      mode: 'fallback',
      message: 'AI advisor is in development-safe fallback mode. The app stays functional without an external AI key.',
    };
  }

  return {
    success: true,
    reply: `AI provider is enabled, but no live key is configured in this environment. Using the local nutrition guidance flow instead.`,
    mode: 'provider',
    message: 'AI provider is active; this stub keeps the flow ready for future integration.',
  };
};

module.exports = {
  generateAiResponse,
};
