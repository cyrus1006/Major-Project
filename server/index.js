require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

const { seedFoods } = require('./data/seedFoods');
const { connectDatabase } = require('./config/db');
const { calculateNutrition } = require('./services/nutritionService');
const { generateAiResponse } = require('./services/aiService');
const { okResponse, errorResponse } = require('./utils/response');
const User = require('./models/User');
const ProgressEntry = require('./models/ProgressEntry');
const Conversation = require('./models/Conversation');
const Food = require('./models/Food');
const MealPlan = require('./models/MealPlan');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URLS = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);
const DEFAULT_PROFILE = {
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

const foodCatalog = seedFoods.map((food) => ({
  ...food,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const users = [
  {
    id: 'admin-user',
    name: 'Admin User',
    email: 'admin@nutriai.com',
    passwordHash: bcrypt.hashSync('Admin@123', 10),
    role: 'admin',
    profile: DEFAULT_PROFILE,
    createdAt: new Date().toISOString(),
  },
];

const progressEntries = [
  {
    id: 'progress-1',
    userId: 'admin-user',
    weight: 72,
    bmi: 23.2,
    date: '2026-09-15',
    createdAt: '2026-09-15T08:00:00.000Z',
  },
  {
    id: 'progress-2',
    userId: 'admin-user',
    weight: 71.5,
    bmi: 23.1,
    date: '2026-09-22',
    createdAt: '2026-09-22T08:00:00.000Z',
  },
];

const conversations = [];
const mealPlans = [];

const isMongoConfigured = () => Boolean(process.env.MONGO_URI);

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  const plainUser = user.toObject ? user.toObject() : { ...user };
  const normalized = {
    ...plainUser,
    id: String(plainUser.id || plainUser._id || 'unknown-user'),
  };

  delete normalized._id;
  delete normalized.__v;

  return normalized;
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const safeUser = normalizeUser(user);
  if (!safeUser) {
    return null;
  }

  delete safeUser.passwordHash;
  return safeUser;
};

const signToken = (user) => {
  const userId = user.id || (user._id ? String(user._id) : 'unknown-user');

  return jwt.sign(
    {
      id: userId,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'nutriai-dev-secret',
    { expiresIn: '7d' },
  );
};

const getUserById = async (userId) => {
  if (isMongoConfigured()) {
    const user = await User.findById(userId).lean();
    return user ? normalizeUser(user) : null;
  }

  return users.find((item) => item.id === userId) || null;
};

const getUserByEmail = async (email) => {
  if (isMongoConfigured()) {
    const user = await User.findOne({ email: String(email).toLowerCase() }).lean();
    return user ? normalizeUser(user) : null;
  }

  return users.find((item) => item.email.toLowerCase() === String(email).toLowerCase()) || null;
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication token is missing or invalid.', 401);
  }

  const token = authHeader.split(' ')[1];
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'nutriai-dev-secret');
  } catch (error) {
    return errorResponse(res, 'Your session has expired or the token is invalid.', 401);
  }

  const user = isMongoConfigured()
    ? normalizeUser(await User.findById(decoded.id))
    : users.find((item) => item.id === decoded.id || item.email === decoded.email);

  if (!user) {
    return errorResponse(res, 'User not found for this token.', 401);
  }

  req.user = user;
  return next();
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return errorResponse(res, 'Admin access required.', 403);
  }

  next();
};

const generateMealPlan = (profile, mealCount = 5) => {
  const filteredFoods = foodCatalog.filter((food) => {
    const allergies = (profile.allergies || 'none').toLowerCase();
    const dietaryPreference = profile.dietaryPreference || 'Non-Vegetarian';

    if (food.allergens && food.allergens.some((item) => allergies.includes(item))) {
      return false;
    }

    if (dietaryPreference === 'Vegetarian' && !food.vegetarian) {
      return false;
    }

    if (dietaryPreference === 'Vegan' && !food.vegan) {
      return false;
    }

    if (dietaryPreference === 'Eggetarian' && !food.vegetarian && !food.containsEgg) {
      return false;
    }

    return true;
  });

  const mealTypes = ['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner'];

  return mealTypes.map((type, index) => {
    const items = filteredFoods.slice(index, index + 2).map((food) => ({
      name: food.name,
      quantity: `${food.servingSize}${food.servingUnit}`,
      calories: food.calories,
      protein: food.protein,
      carbohydrates: food.carbohydrates,
      fat: food.fat,
    }));

    const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = items.reduce((sum, item) => sum + item.carbohydrates, 0);
    const totalFat = items.reduce((sum, item) => sum + item.fat, 0);

    return {
      type,
      items,
      summary: {
        calories: totalCalories,
        protein: Number(totalProtein.toFixed(1)),
        carbohydrates: Number(totalCarbs.toFixed(1)),
        fat: Number(totalFat.toFixed(1)),
      },
    };
  }).slice(0, mealCount);
};

const validateInputs = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed.', 400, errors.array());
  }

  next();
};

const seedDemoData = async () => {
  if (!isMongoConfigured()) {
    return;
  }

  const adminExists = await User.findOne({ email: 'admin@nutriai.com' });
  if (!adminExists) {
    await User.create({
      name: 'Admin User',
      email: 'admin@nutriai.com',
      passwordHash: bcrypt.hashSync('Admin@123', 10),
      role: 'admin',
      profile: DEFAULT_PROFILE,
    });
  }

  const foodCount = await Food.countDocuments();
  if (foodCount === 0) {
    await Food.insertMany(
      seedFoods.map((food) => ({
        ...food,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    );
  }
};

app.use(
  cors({
    origin: CLIENT_URLS,
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    message: 'Too many requests. Please slow down and try again shortly.',
  }),
);

app.get('/api/health', (req, res) => {
  const databaseConnected = !isMongoConfigured() || mongoose.connection.readyState === 1;

  okResponse(res, 'AI Nutrition Advisor API is running', {
    status: databaseConnected ? 'ok' : 'degraded',
    database: isMongoConfigured()
      ? databaseConnected
        ? 'MongoDB connected'
        : 'MongoDB unavailable'
      : 'In-memory demo mode',
  }, databaseConnected ? 200 : 503);
});

app.post(
  '/api/auth/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.'),
  ],
  validateInputs,
  async (req, res) => {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email).toLowerCase();

    if (isMongoConfigured()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return errorResponse(res, 'An account with this email already exists.', 409);
      }

      const newUser = await User.create({
        name,
        email: normalizedEmail,
        passwordHash: bcrypt.hashSync(password, 10),
        role: 'user',
        profile: {
          name,
          age: 0,
          gender: 'Male',
          height: 0,
          weight: 0,
          activityLevel: 'Moderately Active',
          fitnessGoal: 'Weight Maintenance',
          dietaryPreference: 'Non-Vegetarian',
          allergies: 'None',
          foodPreferences: '',
          mealPreference: 'Balanced meals',
          lifestyleInfo: '',
        },
      });

      const token = signToken(newUser);
      return okResponse(res, 'User registered successfully.', {
        token,
        user: sanitizeUser(newUser),
      });
    }

    const existingUser = users.find((user) => user.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists.', 409);
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email: normalizedEmail,
      passwordHash: bcrypt.hashSync(password, 10),
      role: 'user',
      profile: {
        name,
        age: 0,
        gender: 'Male',
        height: 0,
        weight: 0,
        activityLevel: 'Moderately Active',
        fitnessGoal: 'Weight Maintenance',
        dietaryPreference: 'Non-Vegetarian',
        allergies: 'None',
        foodPreferences: '',
        mealPreference: 'Balanced meals',
        lifestyleInfo: '',
      },
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    const token = signToken(newUser);
    return okResponse(res, 'User registered successfully.', {
      token,
      user: sanitizeUser(newUser),
    });
  },
);

app.post(
  '/api/auth/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validateInputs,
  async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = String(email).toLowerCase();
    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      return errorResponse(res, 'No account found for this email.', 404);
    }

    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash || '');
    if (!isPasswordValid) {
      return errorResponse(res, 'Incorrect password. Please try again.', 401);
    }

    const token = signToken(user);
    return okResponse(res, 'Login successful.', {
      token,
      user: sanitizeUser(user),
    });
  },
);

app.get('/api/auth/me', authMiddleware, (req, res) => {
  okResponse(res, 'Profile loaded successfully.', {
    user: sanitizeUser(req.user),
  });
});

app.put('/api/users/profile', authMiddleware, async (req, res) => {
  const currentUser = await getUserById(req.user.id);

  if (!currentUser) {
    return errorResponse(res, 'User profile not found.', 404);
  }

  const profile = {
    ...currentUser.profile,
    ...req.body,
    name: req.body.name || currentUser.name,
  };

  if (isMongoConfigured()) {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          profile,
          name: profile.name || currentUser.name,
        },
      },
      { new: true },
    );

    return okResponse(res, 'Profile updated successfully.', {
      user: sanitizeUser(updatedUser),
    });
  }

  currentUser.profile = profile;
  currentUser.name = profile.name || currentUser.name;

  okResponse(res, 'Profile updated successfully.', {
    user: sanitizeUser(currentUser),
  });
});

app.get('/api/nutrition/analyze', authMiddleware, (req, res) => {
  const profile = {
    ...req.user.profile,
    ...req.query,
  };

  const data = calculateNutrition(profile);
  okResponse(res, 'Nutrition analysis calculated successfully.', data);
});

app.get('/api/foods', async (req, res) => {
  const { search = '', category = '', dietaryPreference = '' } = req.query;

  if (isMongoConfigured()) {
    let query = {};
    if (search) {
      query.name = { $regex: String(search), $options: 'i' };
    }
    if (category) {
      query.category = { $regex: `^${String(category)}$`, $options: 'i' };
    }
    if (dietaryPreference === 'Vegetarian') {
      query.vegetarian = true;
    }
    if (dietaryPreference === 'Vegan') {
      query.vegan = true;
    }

    const foods = await Food.find(query).lean();
    return okResponse(res, 'Food items fetched successfully.', {
      foods,
      total: foods.length,
    });
  }

  let results = [...foodCatalog];

  if (search) {
    results = results.filter((food) => food.name.toLowerCase().includes(String(search).toLowerCase()));
  }

  if (category) {
    results = results.filter((food) => food.category.toLowerCase() === String(category).toLowerCase());
  }

  if (dietaryPreference === 'Vegetarian') {
    results = results.filter((food) => food.vegetarian);
  }

  if (dietaryPreference === 'Vegan') {
    results = results.filter((food) => food.vegan);
  }

  return okResponse(res, 'Food items fetched successfully.', {
    foods: results,
    total: results.length,
  });
});

app.post('/api/meal-plans/generate', authMiddleware, async (req, res) => {
  const profile = {
    ...req.user.profile,
    ...req.body,
  };

  const meals = generateMealPlan(profile, 5);
  const targetCalories = calculateNutrition(profile).dailyCalories;
  const goal = profile.fitnessGoal || 'Weight Maintenance';

  if (isMongoConfigured()) {
    await MealPlan.create({
      userId: req.user.id,
      meals,
      targetCalories,
      goal,
    });
  } else {
    mealPlans.push({
      id: `meal-plan-${Date.now()}`,
      userId: req.user.id,
      meals,
      targetCalories,
      goal,
      createdAt: new Date().toISOString(),
    });
  }

  okResponse(res, 'Meal plan generated successfully.', {
    meals,
    targetCalories,
    goal,
  });
});

app.get('/api/progress', authMiddleware, async (req, res) => {
  if (isMongoConfigured()) {
    const userEntries = await ProgressEntry.find({ userId: req.user.id }).sort({ date: 1 }).lean();
    return okResponse(res, 'Progress records loaded successfully.', {
      entries: userEntries,
      latest: userEntries[userEntries.length - 1] || null,
    });
  }

  const userEntries = progressEntries.filter((entry) => entry.userId === req.user.id);

  okResponse(res, 'Progress records loaded successfully.', {
    entries: userEntries,
    latest: userEntries[userEntries.length - 1] || null,
  });
});

app.post('/api/progress', authMiddleware, async (req, res) => {
  const { weight, date } = req.body;

  if (!weight || Number(weight) <= 0) {
    return errorResponse(res, 'Weight must be a positive number.', 400);
  }

  const numericWeight = Number(weight);
  const entryDate = date || new Date().toISOString().slice(0, 10);
  const bmi = Number((numericWeight / (((req.user.profile.height || 170) / 100) ** 2)).toFixed(1));

  if (isMongoConfigured()) {
    const newEntry = await ProgressEntry.create({
      userId: req.user.id,
      weight: numericWeight,
      bmi,
      date: entryDate,
    });

    return okResponse(res, 'Progress record added successfully.', {
      entry: newEntry.toObject(),
    });
  }

  const newEntry = {
    id: `progress-${Date.now()}`,
    userId: req.user.id,
    weight: numericWeight,
    bmi,
    date: entryDate,
    createdAt: new Date().toISOString(),
  };

  progressEntries.push(newEntry);

  okResponse(res, 'Progress record added successfully.', {
    entry: newEntry,
  });
});

app.get('/api/ai/conversations', authMiddleware, async (req, res) => {
  if (isMongoConfigured()) {
    const entries = await Conversation.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    return okResponse(res, 'Conversation history loaded successfully.', { conversations: entries });
  }

  const entries = conversations.filter((item) => item.userId === req.user.id);
  okResponse(res, 'Conversation history loaded successfully.', { conversations: entries });
});

app.post('/api/ai/chat', authMiddleware, async (req, res) => {
  const { message } = req.body;

  if (!message || !String(message).trim()) {
    return errorResponse(res, 'Please enter a message for the AI advisor.', 400);
  }

  try {
    const aiReply = await generateAiResponse(req.user.profile, message);
    const conversation = {
      id: `chat-${Date.now()}`,
      userId: req.user.id,
      messages: [
        { role: 'user', content: message },
        { role: 'assistant', content: aiReply.reply },
      ],
      createdAt: new Date().toISOString(),
    };

    if (isMongoConfigured()) {
      const savedConversation = await Conversation.create({
        userId: req.user.id,
        messages: conversation.messages,
      });
      conversation.id = savedConversation._id.toString();
      return okResponse(res, 'AI advice generated successfully.', {
        answer: aiReply.reply,
        mode: aiReply.mode,
        conversation: savedConversation.toObject(),
      });
    }

    conversations.push(conversation);

    okResponse(res, 'AI advice generated successfully.', {
      answer: aiReply.reply,
      mode: aiReply.mode,
      conversation,
    });
  } catch (error) {
    return errorResponse(res, 'The AI advisor is temporarily unavailable. Please try again in a moment.', 503);
  }
});

app.get('/api/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  if (isMongoConfigured()) {
    const [totalUsers, foodItems, mealPlansCount, aiConversations, progressEntriesCount] = await Promise.all([
      User.countDocuments(),
      Food.countDocuments(),
      MealPlan.countDocuments(),
      Conversation.countDocuments(),
      ProgressEntry.countDocuments(),
    ]);

    return okResponse(res, 'Admin dashboard stats fetched successfully.', {
      totalUsers,
      foodItems,
      mealPlans: mealPlansCount,
      aiConversations,
      progressEntries: progressEntriesCount,
    });
  }

  okResponse(res, 'Admin dashboard stats fetched successfully.', {
    totalUsers: users.length,
    foodItems: foodCatalog.length,
    mealPlans: mealPlans.length,
    aiConversations: conversations.length,
    progressEntries: progressEntries.length,
  });
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  if (isMongoConfigured()) {
    const userDocs = await User.find({}).lean();
    return okResponse(res, 'Users retrieved successfully.', {
      users: userDocs.map((user) => sanitizeUser(user)),
    });
  }

  okResponse(res, 'Users retrieved successfully.', {
    users: users.map((user) => sanitizeUser(user)),
  });
});

app.use((req, res) => {
  errorResponse(res, 'API route not found.', 404);
});

app.use((error, req, res, next) => {
  console.error('Unhandled application error:', error);
  errorResponse(res, 'Something went wrong on the server. Please try again.', 500);
});

const startServer = async () => {
  const databaseConnected = await connectDatabase();

  if (databaseConnected) {
    await seedDemoData();
  } else {
    console.warn('No MONGO_URI configured. Running in in-memory demo mode; data will not persist.');
  }

  app.listen(PORT, () => {
    console.log(`AI Nutrition Advisor API running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exitCode = 1;
});
