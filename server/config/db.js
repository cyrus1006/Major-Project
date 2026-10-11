const mongoose = require('mongoose');

const connectDatabase = async () => {
  const mongoUri = 'mongodb://127.0.0.1:27017/ai_nutrition_advisor';

  if (!mongoUri) {
    return false;
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log('MongoDB connected successfully.');
  return true;
};

module.exports = {
  connectDatabase,
};
