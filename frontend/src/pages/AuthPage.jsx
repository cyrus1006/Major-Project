import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LockKeyhole, Mail, UserRound } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const defaultForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              confirmPassword: form.confirmPassword,
            };

      const response = await api.post(endpoint, payload);
      const authData = response.data?.data || response.data;
      const token = authData.token;
      const user = authData.user;

      if (!token || !user) {
        throw new Error('Authentication response was incomplete.');
      }

      login(token, user);
      setMessage(mode === 'login' ? 'Welcome back!' : 'Registration successful!');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon">
            <Leaf size={18} />
          </div>
          <div>
            <div className="brand-name">NutriAI</div>
            <div className="brand-subtitle">Nutrition advisor</div>
          </div>
        </div>

        <div className="auth-toggle">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              <span>Full name</span>
              <div className="input-wrap">
                <UserRound size={16} />
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required />
              </div>
            </label>
          )}

          <label>
            <span>Email address</span>
            <div className="input-wrap">
              <Mail size={16} />
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="input-wrap">
              <LockKeyhole size={16} />
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
          </label>

          {mode === 'register' && (
            <label>
              <span>Confirm password</span>
              <div className="input-wrap">
                <LockKeyhole size={16} />
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required />
              </div>
            </label>
          )}

          {message && <p className="form-message">{message}</p>}

          <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login to dashboard' : 'Create account'}
          </button>
        </form>

        <div className="demo-box">
          <strong>Demo admin access</strong>
          <p>Email: admin@nutriai.com</p>
          <p>Password: Admin@123</p>
        </div>

        <Link to="/" className="back-link">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
