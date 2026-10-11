import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Dumbbell, HeartPulse, LogOut, Salad, Sparkles } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const baseProfile = {
  name: '',
  age: 28,
  gender: 'Male',
  height: 175,
  weight: 72,
  activityLevel: 'Moderately Active',
  fitnessGoal: 'Weight Maintenance',
  dietaryPreference: 'Vegetarian',
  allergies: 'None',
  foodPreferences: 'Rice, dal, paneer, fruits',
  lifestyleInfo: 'Office worker with regular walking and workouts',
};

export default function DashboardPage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState({
    dailyCalories: 2150,
    protein: 120,
    carbohydrates: 260,
    fat: 70,
    bmi: 23.4,
    bmiCategory: 'Healthy',
    message: 'Loading your nutrition insight...',
  });
  const [mealPlan, setMealPlan] = useState([]);
  const [progress, setProgress] = useState([]);
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState({ ...baseProfile, ...user?.profile, name: user?.name || user?.profile?.name || '' });
  const [status, setStatus] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatReply, setChatReply] = useState('Ask the AI advisor about breakfast, protein, recovery, or substitutions.');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [analysisRes, foodsRes, progressRes] = await Promise.all([
          api.get('/nutrition/analyze'),
          api.get('/foods', { params: { dietaryPreference: user?.profile?.dietaryPreference || 'Vegetarian' } }),
          api.get('/progress'),
        ]);

        setAnalysis(analysisRes.data?.data || analysisRes.data || {});
        setFoods((foodsRes.data?.data?.foods || foodsRes.data?.foods || []).slice(0, 5));
        setProgress(progressRes.data?.data?.entries || progressRes.data?.entries || []);
      } catch (error) {
        console.warn('Dashboard data unavailable, showing default values.', error);
      }
    };

    if (user) {
      loadDashboard();
    }
  }, [user]);

  useEffect(() => {
    if (user?.profile) {
      setForm({ ...baseProfile, ...user.profile, name: user.name || user.profile.name || '' });
    }
  }, [user]);

  const chartData = useMemo(
    () => [
      { name: 'Protein', value: analysis.protein || 120 },
      { name: 'Carbs', value: analysis.carbohydrates || 260 },
      { name: 'Fat', value: analysis.fat || 70 },
    ],
    [analysis],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSave = async () => {
    try {
      const response = await api.put('/users/profile', form);
      const updatedUser = response.data?.data?.user || response.data?.user;
      setUser(updatedUser);
      setStatus('Profile updated successfully.');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Could not update your profile.');
    }
  };

  const handleGeneratePlan = async () => {
    try {
      const response = await api.post('/meal-plans/generate', form);
      setMealPlan(response.data?.data?.meals || response.data?.meals || []);
      setStatus('Meal plan generated successfully.');
    } catch (error) {
      setStatus(error.response?.data?.message || 'The meal plan could not be generated.');
    }
  };

  const handleWeightSubmit = async (event) => {
    event.preventDefault();
    const weightInput = event.target.elements.weight.value;

    try {
      const response = await api.post('/progress', { weight: weightInput, date: new Date().toISOString().slice(0, 10) });
      const nextEntry = response.data?.data?.entry || response.data?.entry;
      setProgress((current) => [...current, nextEntry]);
      setStatus('Weight progress saved.');
      event.target.reset();
    } catch (error) {
      setStatus(error.response?.data?.message || 'Weight log could not be saved.');
    }
  };

  const handleChatSubmit = async (event) => {
    event.preventDefault();
    if (!chatInput.trim()) return;

    try {
      const response = await api.post('/ai/chat', { message: chatInput });
      const answer = response.data?.data?.answer || response.data?.answer || 'Your answer is ready.';
      setChatReply(answer);
      setChatInput('');
    } catch (error) {
      setChatReply(error.response?.data?.message || 'The AI advisor is temporarily unavailable.');
    }
  };

  const latestWeight = progress[progress.length - 1]?.weight || form.weight;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow subtle">Welcome back</span>
          <h1>{user?.name || form.name || 'Your dashboard'}</h1>
        </div>
        <div className="header-badge">
          <Sparkles size={16} /> Daily focus: {analysis.bmiCategory || 'Healthy'}
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          <LogOut size={16} /> Log out
        </button>
      </header>

      <section className="summary-grid">
        <article className="summary-card accent">
          <div className="icon-wrap green"><Activity size={20} /></div>
          <div>
            <small>Daily calories</small>
            <strong>{analysis.dailyCalories || 2150} kcal</strong>
          </div>
        </article>
        <article className="summary-card">
          <div className="icon-wrap teal"><Dumbbell size={20} /></div>
          <div>
            <small>Protein target</small>
            <strong>{analysis.protein || 120} g</strong>
          </div>
        </article>
        <article className="summary-card">
          <div className="icon-wrap orange"><HeartPulse size={20} /></div>
          <div>
            <small>BMI</small>
            <strong>{analysis.bmi || 23.4}</strong>
          </div>
        </article>
        <article className="summary-card">
          <div className="icon-wrap lime"><Salad size={20} /></div>
          <div>
            <small>Current weight</small>
            <strong>{latestWeight} kg</strong>
          </div>
        </article>
      </section>

      <section className="content-grid">
        <div className="panel-card panel-large">
          <div className="panel-headline">
            <h2>Nutrition overview</h2>
            <button type="button" className="btn btn-ghost small" onClick={handleGeneratePlan}>Generate meal plan</button>
          </div>

          <div className="analysis-metrics">
            <div>
              <span>Carbohydrates</span>
              <strong>{analysis.carbohydrates || 260} g</strong>
            </div>
            <div>
              <span>Fat</span>
              <strong>{analysis.fat || 70} g</strong>
            </div>
            <div>
              <span>Fiber</span>
              <strong>{analysis.fiber || 30} g</strong>
            </div>
          </div>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#16A34A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="advice-box">
            <p>{analysis.message}</p>
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-headline">
            <h2>Profile</h2>
            <button type="button" className="btn btn-primary small" onClick={handleProfileSave}>Save</button>
          </div>

          <div className="form-grid">
            <label>
              <span>Name</span>
              <input name="name" value={form.name} onChange={handleChange} />
            </label>
            <label>
              <span>Age</span>
              <input type="number" name="age" value={form.age} onChange={handleChange} />
            </label>
            <label>
              <span>Gender</span>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              <span>Height (cm)</span>
              <input type="number" name="height" value={form.height} onChange={handleChange} />
            </label>
            <label>
              <span>Weight (kg)</span>
              <input type="number" name="weight" value={form.weight} onChange={handleChange} />
            </label>
            <label>
              <span>Activity</span>
              <select name="activityLevel" value={form.activityLevel} onChange={handleChange}>
                <option>Sedentary</option>
                <option>Lightly Active</option>
                <option>Moderately Active</option>
                <option>Very Active</option>
                <option>Extremely Active</option>
              </select>
            </label>
            <label>
              <span>Goal</span>
              <select name="fitnessGoal" value={form.fitnessGoal} onChange={handleChange}>
                <option>Weight Loss</option>
                <option>Weight Maintenance</option>
                <option>Muscle Gain</option>
              </select>
            </label>
            <label>
              <span>Diet</span>
              <select name="dietaryPreference" value={form.dietaryPreference} onChange={handleChange}>
                <option>Vegetarian</option>
                <option>Vegan</option>
                <option>Eggetarian</option>
                <option>Non-Vegetarian</option>
              </select>
            </label>
            <label className="full-width">
              <span>Allergies</span>
              <input name="allergies" value={form.allergies} onChange={handleChange} />
            </label>
            <label className="full-width">
              <span>Food preferences</span>
              <input name="foodPreferences" value={form.foodPreferences} onChange={handleChange} />
            </label>
            <label className="full-width">
              <span>Lifestyle info</span>
              <textarea name="lifestyleInfo" value={form.lifestyleInfo} onChange={handleChange} />
            </label>
          </div>

          {status && <p className="status-text">{status}</p>}
        </div>
      </section>

      <section className="lower-grid">
        <div className="panel-card">
          <div className="panel-headline">
            <h2>Meal plan</h2>
            <span className="tag">{mealPlan.length} meals</span>
          </div>

          <div className="meal-list">
            {(mealPlan.length ? mealPlan : [
              { type: 'Breakfast', summary: { calories: 420, protein: 32, carbohydrates: 42, fat: 15 }, items: [{ name: 'Oats Bowl', quantity: '1 serving' }] },
              { type: 'Lunch', summary: { calories: 560, protein: 28, carbohydrates: 65, fat: 19 }, items: [{ name: 'Chickpea Rice Bowl', quantity: '1 bowl' }] },
            ]).map((meal) => (
              <div key={meal.type} className="meal-item">
                <div className="meal-header">
                  <strong>{meal.type}</strong>
                  <span>{meal.summary?.calories || 0} kcal</span>
                </div>
                <ul>
                  {(meal.items || []).map((item) => (
                    <li key={`${meal.type}-${item.name}`}>
                      {item.name} · {item.quantity || '1 serving'}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <div className="panel-headline">
            <h2>Track progress</h2>
            <span className="tag">{progress.length} logs</span>
          </div>

          <form className="progress-form" onSubmit={handleWeightSubmit}>
            <label>
              <span>Weight today (kg)</span>
              <input type="number" min="20" step="0.1" name="weight" placeholder="72.5" required />
            </label>
            <button type="submit" className="btn btn-primary">Save progress</button>
          </form>

          <div className="history-list">
            {progress.length ? progress.slice(-4).reverse().map((item) => (
              <div key={item.date || item.id} className="history-item">
                <span>{item.date || 'Today'}</span>
                <strong>{item.weight} kg</strong>
              </div>
            )) : (
              <div className="history-item">
                <span>Start tracking</span>
                <strong>72 kg</strong>
              </div>
            )}
          </div>
        </div>

        <div className="panel-card ai-panel">
          <div className="panel-headline">
            <h2>AI Nutrition Advisor</h2>
            <span className="tag">Live</span>
          </div>

          <div className="ai-chat-box">
            <p>{chatReply}</p>
          </div>

          <form className="chat-form" onSubmit={handleChatSubmit}>
            <textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} rows="3" placeholder="Ask about breakfasts, protein, recovery, or meal swaps..." />
            <button type="submit" className="btn btn-primary">Ask AI</button>
          </form>
        </div>
      </section>

      <section className="food-section">
        <div className="panel-headline">
          <h2>Food database</h2>
          <span className="tag">{foods.length} items</span>
        </div>
        <div className="food-grid">
          {foods.length ? foods.map((food) => (
            <div key={food._id || food.id || food.name} className="food-card">
              <div className="food-card-head">
                <strong>{food.name}</strong>
                <span>{food.category || 'General'}</span>
              </div>
              <p>{food.calories || 0} kcal · {food.protein || 0}g protein · {food.carbohydrates || 0}g carbs</p>
            </div>
          )) : (
            <div className="food-card empty-state">
              <p>No foods available yet. Add more food items from the admin dashboard.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
