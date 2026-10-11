import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, BarChart3, LogOut, MessageSquare, Users, UtensilsCrossed } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, foodItems: 0, mealPlans: 0, aiRequests: 0, progressEntries: 0 });
  const [users, setUsers] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([api.get('/admin/stats'), api.get('/admin/users')]);
        setStats(statsRes.data?.data || statsRes.data || {});
        setUsers(usersRes.data?.data?.users || usersRes.data?.users || []);
      } catch (error) {
        console.error('Unable to fetch admin dashboard data:', error);
      }
    };

    loadAdminData();
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="page-message">
        <h1>Admin access required</h1>
        <p>Please sign in with an admin account to view this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="dashboard-header admin-header">
        <div>
          <span className="eyebrow subtle">Admin console</span>
          <h1>Nutrition platform overview</h1>
        </div>
        <button type="button" className="btn btn-ghost" onClick={handleLogout}>
          <LogOut size={16} /> Log out
        </button>
      </header>

      <section className="summary-grid admin-grid">
        <article className="summary-card accent">
          <div className="icon-wrap green"><Users size={20} /></div>
          <div>
            <small>Total users</small>
            <strong>{stats.totalUsers}</strong>
          </div>
        </article>
        <article className="summary-card">
          <div className="icon-wrap teal"><UtensilsCrossed size={20} /></div>
          <div>
            <small>Food items</small>
            <strong>{stats.foodItems}</strong>
          </div>
        </article>
        <article className="summary-card">
          <div className="icon-wrap orange"><BarChart3 size={20} /></div>
          <div>
            <small>Generated meal plans</small>
            <strong>{stats.mealPlans}</strong>
          </div>
        </article>
        <article className="summary-card">
          <div className="icon-wrap teal"><MessageSquare size={20} /></div>
          <div>
            <small>AI conversations</small>
            <strong>{stats.aiConversations}</strong>
          </div>
        </article>
        <article className="summary-card">
          <div className="icon-wrap lime"><Activity size={20} /></div>
          <div>
            <small>Progress entries</small>
            <strong>{stats.progressEntries}</strong>
          </div>
        </article>
      </section>

      <section className="panel-card admin-table-panel">
        <div className="panel-headline">
          <h2>Registered users</h2>
          <span className="tag">{users.length} entries</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Goal</th>
              </tr>
            </thead>
            <tbody>
              {users.length ? users.map((member) => (
                <tr key={member.id || member.email}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.role}</td>
                  <td>{member.profile?.fitnessGoal || 'Weight Maintenance'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4">No users registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
