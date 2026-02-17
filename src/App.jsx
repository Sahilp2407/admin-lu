import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "./firebase";
import { fetchEnquiries } from "./fetchData";
import {
  Users,
  LayoutDashboard,
  TrendingUp,
  CircleUserRound,
  Search,
  Bell,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Plus,
  X,
  Edit2,
  Trash2,
  Star,
  LogOut,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  MapPin,
  Briefcase,
  Target,
  CheckCircle2,
  Circle,
  XCircle,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import './App.css';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// --- Login Component ---
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const cleanEmail = email.trim();
    console.log("Attempting login with:", cleanEmail);

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      // Auth state listener in App will handle the rest
    } catch (err) {
      console.error("Login Error Full Object:", err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid Email or Password. Please check your credentials.');
      } else if (err.code === 'auth/user-not-found') {
        setError('User not found.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Try again later.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-header animate-fade-in">
        <div className="lu-logo-large">LU</div>
        <h1>Welcome Back</h1>
        <p>Sign in to access the admin dashboard</p>
      </div>

      <div className="login-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {error && (
          <div style={{
            background: '#fef2f2',
            color: '#ef4444',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            border: '1px solid #fee2e2'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-container">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                required
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div className="input-container">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign in <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Components ---

const UserFormModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
    org: '',
    designation: '',
    status: 'Active'
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-detail-card animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header" style={{ justifyContent: 'space-between', padding: '1.5rem 2rem', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button className="close-button-simple" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ textAlign: 'left', paddingBottom: '1rem' }}>
          <div className="details-grid" style={{ gridTemplateColumns: '1fr 1fr', borderTop: 'none', paddingTop: '0' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Full Name</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Jane Doe"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Email</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="jane@example.com"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="+1 (555) 000-0000"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Organization</label>
              <input
                name="org"
                value={formData.org}
                onChange={handleChange}
                className="form-input"
                placeholder="Company Name"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Designation</label>
              <input
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="form-input"
                placeholder="Job Title"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>City</label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-input"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569' }}>State</label>
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="form-input"
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '1.5rem', background: 'transparent', padding: '0' }}>
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn">{user ? 'Update User' : 'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  const InfoBox = ({ label, value, bgColor, labelColor, textColor = '#1e293b' }) => (
    <div style={{
      background: bgColor,
      padding: '1rem',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem',
      border: '1px solid rgba(0,0,0,0.02)'
    }}>
      <label style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: labelColor, letterSpacing: '0.05em' }}>{label}</label>
      <span style={{ fontSize: '0.95rem', fontWeight: '600', color: textColor }}>{value || 'Not provided'}</span>
    </div>
  );

  const SectionTitle = ({ icon: Icon, title, color = '#2563eb' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', marginBottom: '1rem' }}>
      <Icon size={18} color={color} />
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{title}</h3>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-detail-card animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #2563eb', paddingLeft: '1rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>Enquiry Submission Details</h2>
        </div>

        {/* Personal Details */}
        <SectionTitle icon={User} title="Personal Details" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <InfoBox label="Full Name" value={user.name} bgColor="#eff6ff" labelColor="#2563eb" />
          <InfoBox label="Email Address" value={user.email} bgColor="#f0fdf4" labelColor="#22c55e" />
          <InfoBox label="Mobile Number" value={user.phone} bgColor="#f5f3ff" labelColor="#8b5cf6" />
          <InfoBox label="Registration Date" value={user.date} bgColor="#fff1f2" labelColor="#e11d48" />
        </div>

        {/* Professional Details */}
        <SectionTitle icon={Briefcase} title="Professional Details" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <InfoBox label="Organization" value={user.org} bgColor="#fdf2f8" labelColor="#db2777" />
          <InfoBox label="Current Designation" value={user.designation} bgColor="#fefce8" labelColor="#ca8a04" />
          <InfoBox label="Current CTC" value={user.currentCTC || 'Not answered'} bgColor="#eff6ff" labelColor="#2563eb" />
        </div>

        {/* Location Information */}
        <SectionTitle icon={MapPin} title="Location Information" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <InfoBox label="State" value={user.state} bgColor="#fff7ed" labelColor="#f97316" />
          <InfoBox label="City" value={user.city} bgColor="#f0fdfa" labelColor="#14b8a6" />
        </div>

        {/* Marketing Information */}
        <SectionTitle icon={Target} title="Marketing Information" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <InfoBox label="UTM Source" value={user.utm_source} bgColor="#f3e8ff" labelColor="#9333ea" />
          <InfoBox label="UTM Medium" value={user.utm_medium} bgColor="#f3e8ff" labelColor="#9333ea" />
          <InfoBox label="UTM Campaign" value={user.utm_campaign} bgColor="#f3e8ff" labelColor="#9333ea" />
          <InfoBox label="UTM Term" value={user.utm_term} bgColor="#f3e8ff" labelColor="#9333ea" />
          <InfoBox label="UTM Content" value={user.utm_content} bgColor="#f3e8ff" labelColor="#9333ea" />
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <button className="primary-btn" onClick={onClose} style={{ width: '140px', padding: '0.85rem' }}>Close Details</button>
        </div>
      </div>
    </div>
  );
};

const OverviewContent = ({ users }) => {
  // --- Dynamic Stats Calculation ---
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  // Dynamic "Role Switch" interest (mocked logic: ~11% of total users)
  const roleSwitchCount = Math.round(totalUsers * 0.11);
  // Dynamic Rating (mocked average based on active users)
  const avgRating = (4.0 + (activeUsers % 10) * 0.1).toFixed(2);

  const stats = [
    {
      label: 'Total Enquiries',
      value: totalUsers,
      subtext: 'Active records in system',
      type: 'text'
    },
    {
      label: 'Avg Rating',
      value: avgRating,
      type: 'rating',
      subtext: null
    },
    {
      label: 'Role Switch',
      value: roleSwitchCount,
      subtext: '11% interested in switching',
      type: 'text'
    },
  ];

  // --- Dynamic Chart Data Derivation ---

  // 1. Users by Profession
  const freshersCount = users.filter(u =>
    /junior|intern|associate|trainee/i.test(u.designation)
  ).length;
  const professionalCount = totalUsers - freshersCount;

  // 2. Outcome Survey (Pie Chart)
  const otherOutcomesCount = totalUsers - roleSwitchCount;

  // 3. Daily Login Analytics
  const generateLoginData = () => {
    const days = [];
    const baseLogins = Math.max(0, activeUsers);
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const randomFactor = 0.3 + (Math.random() * 0.6);

      days.push({
        day: dateStr,
        val: Math.floor(baseLogins * randomFactor)
      });
    }
    return days;
  };
  const loginData = generateLoginData();
  const totalLoginsLast30Days = loginData.reduce((acc, curr) => acc + curr.val, 0);
  const avgLoginsPerDay = (totalLoginsLast30Days / 30).toFixed(1);
  const peakValues = loginData.map(d => d.val);
  const peakDayVal = Math.max(...peakValues);

  return (
    <div className="animate-fade-in">
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {stats.map((stat, index) => (
          <div key={index} className="stats-card">
            <div className="card-label">{stat.label}</div>
            <div className="card-value">{stat.value}</div>

            {stat.type === 'rating' ? (
              <div style={{ display: 'flex', gap: '4px', marginTop: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={20} fill="#f59e0b" strokeWidth={0} />
                ))}
              </div>
            ) : (
              <div style={{
                marginTop: '0.5rem',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {stat.subtext}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* -- New Paid vs Unpaid Section -- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>
        {/* Unpaid Card */}
        <div className="stats-card" style={{ background: 'linear-gradient(135deg, #ecfccb 0%, #f7fee7 100%)', border: '1px solid #d9f99d' }}>
          <div className="card-label" style={{ color: '#3f6212', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Unpaid Traffic</span>
            <span style={{ fontSize: '0.75rem', background: '#d9f99d', padding: '2px 8px', borderRadius: '12px' }}>Organic</span>
          </div>
          <div className="card-value" style={{ color: '#365314' }}>
            {users.filter(u => (!u.utm_source || u.utm_source === 'N/A')).length}
          </div>
          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#4d7c0f' }}>
              <span>LetsUpgrade</span>
              <span style={{ fontWeight: '700' }}>{users.filter(u => (!u.utm_source || u.utm_source === 'N/A')).length}</span>
            </div>
          </div>
        </div>

        {/* Paid Card */}
        <div className="stats-card" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #eef2ff 100%)', border: '1px solid #c7d2fe' }}>
          <div className="card-label" style={{ color: '#3730a3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Paid Traffic</span>
            <span style={{ fontSize: '0.75rem', background: '#c7d2fe', padding: '2px 8px', borderRadius: '12px' }}>Ad Campaigns</span>
          </div>
          <div className="card-value" style={{ color: '#312e81' }}>
            {users.filter(u => u.utm_source && u.utm_source !== 'N/A').length}
          </div>
          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#4338ca' }}>
              <span>LetsUpgrade</span>
              <span style={{ fontWeight: '700' }}>{users.filter(u => (u.utm_source && u.utm_source !== 'N/A')).length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2 className="section-title">Analytics & Insights</h2>
        <p className="section-desc">Visual representation of user data</p>
      </div>

      <div className="insights-grid">
        {/* Users by Profession Chart */}
        <div className="content-card">
          <div className="chart-header">
            <div className="vertical-bar" style={{ background: '#22c55e' }}></div>
            <div>
              <div className="chart-title">Users by Profession</div>
              <span className="chart-subtitle">Distribution of user types</span>
            </div>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Freshers', value: freshersCount || 1 },
                    { name: 'Professionals', value: professionalCount || 1 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="legend-container">
            <div className="legend-item"><div className="legend-dot" style={{ background: '#22c55e' }}></div>Freshers</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#3b82f6' }}></div>Working Professionals</div>
          </div>

          <div className="stats-row">
            <div className="stat-box" style={{ background: '#f0fdf4' }}>
              <div className="stat-box-label" style={{ color: '#15803d' }}>FRESHERS</div>
              <div className="stat-box-value" style={{ color: '#15803d' }}>{freshersCount}</div>
            </div>
            <div className="stat-box" style={{ background: '#eff6ff' }}>
              <div className="stat-box-label" style={{ color: '#1d4ed8' }}>PROFESSIONALS</div>
              <div className="stat-box-value" style={{ color: '#1d4ed8' }}>{professionalCount}</div>
            </div>
          </div>
        </div>

        {/* Outcome Survey Chart */}
        <div className="content-card">
          <div className="chart-header">
            <div className="vertical-bar" style={{ background: '#f97316' }}></div>
            <div>
              <div className="chart-title">Outcome Survey</div>
              <span className="chart-subtitle">Role switch interest analysis</span>
            </div>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Role Switch', value: roleSwitchCount },
                    { name: 'Other Outcomes', value: otherOutcomesCount }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill="#f59e0b" />
                  <Cell fill="#cbd5e1" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="legend-container">
            <div className="legend-item"><div className="legend-dot" style={{ background: '#f59e0b' }}></div>Role Switch</div>
            <div className="legend-item"><div className="legend-dot" style={{ background: '#cbd5e1' }}></div>Other Outcomes</div>
          </div>

          <div className="stats-row">
            <div className="stat-box" style={{ background: '#fff7ed' }}>
              <div className="stat-box-label" style={{ color: '#b45309' }}>ROLE SWITCH</div>
              <div className="stat-box-value" style={{ color: '#b45309' }}>{roleSwitchCount}</div>
            </div>
            <div className="stat-box" style={{ background: '#f8fafc' }}>
              <div className="stat-box-label">OTHERS</div>
              <div className="stat-box-value">{otherOutcomesCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserContent = ({ users, onAddUser, onEditUser, onDeleteUser }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'sheet'

  const filteredUsers = users.filter(user =>
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.org || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '0 0.5rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.5)',
        borderRadius: '16px',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #2563eb', paddingLeft: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', lineHeight: '1.2' }}>Enquiry Management</h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>Manage and view user admission queries</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by name, email or org..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 3rem',
                borderRadius: '14px',
                border: '1.5px solid #e2e8f0',
                outline: 'none',
                backgroundColor: 'white',
                fontSize: '0.95rem',
                color: '#1e293b',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
              }}
              className="search-input-premium"
            />
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'sheet' : 'list')}
            className="primary-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem 1.25rem',
              whiteSpace: 'nowrap',
              background: viewMode === 'sheet' ? '#1e293b' : '#10b981',
              boxShadow: viewMode === 'sheet' ? '0 4px 12px rgba(30, 41, 59, 0.2)' : '0 4px 12px rgba(16, 185, 129, 0.2)'
            }}
          >
            {viewMode === 'list' ? (
              <>
                <FileSpreadsheet size={18} /> View in Sheets
              </>
            ) : (
              <>
                <LayoutDashboard size={18} /> View List
              </>
            )}
          </button>
        </div>
      </div>

      <div className="content-card" style={{ padding: '0', overflow: 'hidden', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)' }}>
        {viewMode === 'list' ? (
          <table className="user-table" style={{ width: '100%' }}>
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '1.25rem 2rem' }}>NAME & CONTACT</th>
                <th>DESIGNATION</th>
                <th>ORGANIZATION</th>
                <th style={{ textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="user-row" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s ease' }}>
                  <td style={{ padding: '1.25rem 2rem' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                      onClick={() => setSelectedUser(user)}
                      className="user-name-cell"
                    >
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        fontWeight: '800',
                        color: '#2563eb',
                        boxShadow: 'inset 0 2px 4px rgba(37, 99, 235, 0.05)',
                        border: '1px solid rgba(37, 99, 235, 0.1)'
                      }}>
                        {user.name ? user.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>{user.name || 'No Name'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500', marginTop: '2px' }}>{user.email || 'No Email'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>{user.designation || '-'}</td>
                  <td style={{ fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>{user.org || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="view-details-btn"
                      onClick={() => setSelectedUser(user)}
                      style={{
                        background: '#2563eb',
                        border: 'none',
                        color: 'white',
                        padding: '0.65rem 1.25rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                        margin: '0 auto',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <Search size={48} strokeWidth={1} style={{ opacity: 0.2 }} />
                      <span style={{ fontWeight: '500', fontSize: '1.1rem' }}>No enquiries found Matching your search.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', backgroundColor: 'white' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  {['Date', 'Name', 'Email', 'Phone', 'Designation', 'Organization', 'State', 'City', 'CTC', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Term', 'UTM Content'].map((header) => (
                    <th key={header} style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      fontWeight: '700',
                      color: '#475569',
                      borderRight: '1px solid #e2e8f0',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid #cbd5e1'
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
                  <tr key={user.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '600', whiteSpace: 'nowrap' }}>{user.date}</td>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '600', whiteSpace: 'nowrap' }}>{user.name}</td>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#475569' }}>{user.email}</td>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#475569', whiteSpace: 'nowrap' }}>{user.phone}</td>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#475569' }}>{user.designation}</td>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#475569' }}>{user.org}</td>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#475569' }}>{user.state}</td>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#475569' }}>{user.city}</td>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#475569' }}>{user.currentCTC || '-'}</td>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#64748b' }}>{user.utm_source}</td>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#64748b' }}>{user.utm_medium}</td>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#64748b' }}>{user.utm_campaign}</td>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#64748b' }}>{user.utm_term}</td>
                    <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#64748b' }}>{user.utm_content}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="14" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No data found to display in sheet view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={(user) => { setSelectedUser(null); onEditUser(user); }}
        />
      )}
    </div>
  );
};


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("LOGGED IN AS UID:", currentUser.uid); // Debugging Log

        // --- DEBUGGING START ---
        try {
          const adminDocRef = doc(db, "admins", currentUser.uid);
          const adminDocSnap = await getDoc(adminDocRef);

          if (adminDocSnap.exists()) {
            console.log("✅ Admin Document Found:", adminDocSnap.data());
            if (adminDocSnap.data().role !== 'admin') {
              alert(`Debug Error: Role is '${adminDocSnap.data().role}', expected 'admin'.`);
            }
          } else {
            console.error("❌ Admin Document NOT FOUND at path: admins/" + currentUser.uid);
            alert(`Debug Error: No Admin Document found for UID: ${currentUser.uid}\nPlease create this document in 'admins' collection.`);
          }
        } catch (debugErr) {
          console.error("Error verifying admin status:", debugErr);
        }
        // --- DEBUGGING END ---

        // Fetch data when authenticated
        try {
          const rawEnquiries = await fetchEnquiries();

          // Map fields to match table structure
          const mappedUsers = rawEnquiries.map(u => ({
            id: u.id,
            name: u.name || u.fullName || 'No Name',
            email: u.email || 'No Email',
            phone: u.phone || u.phoneNumber || 'N/A',
            state: u.state || u.selectState || 'N/A',
            city: u.city || u.selectCity || 'N/A',
            org: u.org || u.organization || 'N/A',
            designation: u.designation || u.currentDesignation || u.role || 'User',
            currentCTC: u.currentCTC || u.ctc || null,
            status: u.status || 'Active',
            utm_source: u.utm_source || 'N/A',
            utm_medium: u.utm_medium || 'N/A',
            utm_campaign: u.utm_campaign || 'N/A',
            utm_term: u.utm_term || 'N/A',
            utm_content: u.utm_content || 'N/A',
            date: u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : (u.timestamp ? new Date(u.timestamp.seconds * 1000).toLocaleDateString() : 'N/A')
          }));

          setUsers(mappedUsers);
          setLoading(false);
        } catch (error) {
          console.error("Error loading data:", error);
          if (error.code === 'permission-denied' || (error.message && error.message.includes('Missing or insufficient permissions'))) {
            alert("Access Denied: You do not have administrator permissions for this dashboard.");
            await signOut(auth);
            setUser(null);
          }
          setLoading(false);
        }
      } else {
        setUsers([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Handlers
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      // In a real app, delete from Firestore here
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      // Edit Mode
      setUsers(users.map(u => u.id === editingUser.id ? { ...userData, id: editingUser.id } : u));
    } else {
      // Add Mode
      const newUser = { ...userData, id: Date.now() }; // Simple ID generation
      setUsers([...users, newUser]);
    }
    setIsFormOpen(false);
    setEditingUser(null);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="navbar-container">
          <div className="logo-section">
            <div className="lu-logo">LU</div>
            <span className="brand-name">LU Admin Dashboard</span>
          </div>

          <div className="nav-menu">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Enquiries
            </button>
          </div>

          <div className="action-section">
            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={16} style={{ marginRight: '8px' }} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-container">
          {activeTab === 'overview' && (
            <header className="page-header">
              <h1 className="page-title">Overview</h1>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Welcome back, {user.email}
              </div>
            </header>
          )}

          {activeTab === 'overview' ? (
            <OverviewContent users={users} />
          ) : (
            <UserContent
              users={users}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
        </div>
      </main>

      {isFormOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => {
            setIsFormOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}

export default App;
