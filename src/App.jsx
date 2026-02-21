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

const WEBHOOK_URL = 'https://automations.letsupgrade.net/webhook/ai-for-workingprofessional';

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
  const [submitting, setSubmitting] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState(null); // 'success' | 'error' | null

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setWebhookStatus(null);

    // Only fire webhook for new user creation (not edits)
    if (!user) {
      console.log('[Webhook] Sending form data to webhook:', formData);
      try {
        const response = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name || '',
            email: formData.email || '',
            phoneNumber: formData.phone || '',
            currentStatus: formData.status || '',
            state: formData.state || '',
            city: formData.city || '',
            companyName: formData.org || 'NA',
            designation: formData.designation || 'NA',
            url: window.location.href,
          }),
        });

        if (response.ok) {
          console.log('[Webhook] ✅ Success — data sent to webhook.');
          setWebhookStatus('success');
        } else {
          console.warn('[Webhook] ⚠️ Non-OK response:', response.status, response.statusText);
          setWebhookStatus('error');
        }
      } catch (err) {
        console.error('[Webhook] ❌ Error sending to webhook:', err);
        setWebhookStatus('error');
      }
    }

    setSubmitting(false);
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

          {/* Webhook status feedback */}
          {webhookStatus === 'success' && (
            <div style={{
              background: '#f0fdf4',
              color: '#16a34a',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ✅ Enquiry submitted successfully!
            </div>
          )}
          {webhookStatus === 'error' && (
            <div style={{
              background: '#fef2f2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⚠️ Webhook failed, but user was saved locally.
            </div>
          )}

          <div className="modal-footer" style={{ marginTop: '1.5rem', background: 'transparent', padding: '0' }}>
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : (user ? 'Update User' : 'Create User')}
            </button>
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

const OverviewContent = ({ users, freeUsers, paidUsers, onCardClick }) => {
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

      {/* -- Website Source Section -- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem', marginBottom: '1rem' }}>

        {/* Free Website Card — lp.letsupgrade.in */}
        <div
          className="stats-card"
          onClick={() => onCardClick && onCardClick('free')}
          style={{
            background: 'linear-gradient(135deg, #ecfccb 0%, #f7fee7 100%)',
            border: '1px solid #d9f99d',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
        >
          <div className="card-label" style={{ color: '#3f6212', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Generative AI Masterclass</span>
            <span style={{ fontSize: '0.72rem', background: '#d9f99d', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>Free</span>
          </div>
          <div className="card-value" style={{ color: '#365314' }}>
            {freeUsers.length}
          </div>
          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem', color: '#4d7c0f', fontWeight: '600' }}>
              <span>lp.letsupgrade.in</span>
              <span style={{ fontWeight: '700' }}>{freeUsers.length}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#65a30d', marginTop: '0.5rem', fontWeight: '600' }}>Click to view enquiries →</div>
          </div>
        </div>

        {/* Paid Website Card — ai.letsupgrade.in */}
        <div
          className="stats-card"
          onClick={() => onCardClick && onCardClick('paid')}
          style={{
            background: 'linear-gradient(135deg, #e0e7ff 0%, #eef2ff 100%)',
            border: '1px solid #c7d2fe',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
        >
          <div className="card-label" style={{ color: '#3730a3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Best AI Program</span>
            <span style={{ fontSize: '0.72rem', background: '#c7d2fe', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>Paid</span>
          </div>
          <div className="card-value" style={{ color: '#312e81' }}>
            {paidUsers.length}
          </div>
          <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem', color: '#4338ca', fontWeight: '600' }}>
              <span>ai.letsupgrade.in</span>
              <span style={{ fontWeight: '700' }}>{paidUsers.length}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#4f46e5', marginTop: '0.5rem', fontWeight: '600' }}>Click to view enquiries →</div>
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

const UserContent = ({ users, onAddUser, onEditUser, onDeleteUser, trafficFilter, onClearFilter }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [utmFilter, setUtmFilter] = useState(null);       // null | 'organic' | 'inorganic'
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [datePreset, setDatePreset] = useState(null); // 'today' | 'yesterday' | 'last7' | 'last30' | 'custom'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <span style={{ opacity: 0.3, marginLeft: '4px', fontSize: '0.7rem' }}>↕</span>;
    return <span style={{ marginLeft: '4px', fontSize: '0.7rem', color: '#2563eb' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const resetAllFilters = () => {
    onClearFilter && onClearFilter();
    setUtmFilter(null);
    setSortKey('date');
    setSortDir('desc');
    setDatePreset(null);
    setDateFrom('');
    setDateTo('');
  };

  // Count active filters (excluding default sort)
  const activeFilterCount = [
    trafficFilter,
    utmFilter,
    datePreset === 'custom' ? (dateFrom || dateTo) : datePreset,
    (sortKey !== 'date' || sortDir !== 'desc') ? 'sort' : null,
  ].filter(Boolean).length;

  // Step 1: Filter by website source
  const sourceFiltered = trafficFilter === 'paid'
    ? users.filter(u => u._source === 'paid')
    : trafficFilter === 'free'
      ? users.filter(u => u._source === 'free')
      : users;

  // Step 2: Filter by traffic type
  const trafficFiltered = utmFilter === 'organic'
    ? sourceFiltered.filter(u => !u.utm_source || u.utm_source === 'N/A')
    : utmFilter === 'inorganic'
      ? sourceFiltered.filter(u => u.utm_source && u.utm_source !== 'N/A')
      : sourceFiltered;

  // Step 3: Filter by date preset
  const dateFiltered = trafficFiltered.filter(u => {
    if (!datePreset) return true;

    // Normalize user date to midnight
    const userDate = new Date(u.date);
    userDate.setHours(0, 0, 0, 0);

    // Normalize current date to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (datePreset === 'today') {
      return userDate.getTime() === today.getTime();
    }
    if (datePreset === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return userDate.getTime() === yesterday.getTime();
    }
    if (datePreset === 'last7') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return userDate >= sevenDaysAgo && userDate <= today;
    }
    if (datePreset === 'last30') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return userDate >= thirtyDaysAgo && userDate <= today;
    }
    if (datePreset === 'custom') {
      const d = new Date(u.date);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    }
    return true;
  });

  // Step 4: Search
  const searchFiltered = dateFiltered.filter(user =>
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.org || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Step 5: Sort
  const filteredUsers = [...searchFiltered].sort((a, b) => {
    let aVal = a[sortKey] || '';
    let bVal = b[sortKey] || '';
    if (sortKey === 'date') {
      return sortDir === 'asc' ? new Date(aVal) - new Date(bVal) : new Date(bVal) - new Date(aVal);
    }
    aVal = String(aVal).toLowerCase();
    bVal = String(bVal).toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  // Pill helper
  const Pill = ({ label, color = '#2563eb', bg = '#eff6ff', onRemove }) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.78rem',
      fontWeight: '700', background: bg, color, border: `1.5px solid ${color}22`
    }}>
      {label}
      <span onClick={onRemove} style={{ cursor: 'pointer', opacity: 0.6, fontWeight: '900', marginLeft: '2px' }}>×</span>
    </span>
  );

  return (
    <div className="animate-fade-in" style={{ padding: '0 0.5rem' }}>

      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: '1.5rem', padding: '1rem 1.25rem',
        background: 'rgba(255,255,255,0.6)', borderRadius: '16px', backdropFilter: 'blur(8px)',
        flexWrap: 'wrap', gap: '0.75rem'
      }}>
        {/* Left: title */}
        <div style={{ borderLeft: '4px solid #2563eb', paddingLeft: '1rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b', lineHeight: '1.2' }}>Enquiry Management</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>
            {filteredUsers.length} of {users.length} enquiries
          </p>
        </div>

        {/* Right: search + filter btn + view toggle */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search name, email, org..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '240px', padding: '0.7rem 1rem 0.7rem 2.5rem',
                borderRadius: '12px', border: '1.5px solid #e2e8f0',
                outline: 'none', backgroundColor: 'white',
                fontSize: '0.88rem', color: '#1e293b', transition: 'all 0.2s ease',
              }}
              className="search-input-premium"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(f => !f)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.7rem 1.1rem', borderRadius: '12px',
              border: `2px solid ${showFilters ? '#2563eb' : '#e2e8f0'}`,
              background: showFilters ? '#eff6ff' : 'white',
              color: showFilters ? '#2563eb' : '#475569',
              fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
              transition: 'all 0.2s ease', position: 'relative'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: '#ef4444', color: 'white', borderRadius: '50%',
                width: '20px', height: '20px', fontSize: '0.7rem', fontWeight: '800',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid white'
              }}>{activeFilterCount}</span>
            )}
          </button>

          {/* View toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'sheet' : 'list')}
            className="primary-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.7rem 1.1rem', whiteSpace: 'nowrap',
              background: viewMode === 'sheet' ? '#1e293b' : '#10b981',
              boxShadow: viewMode === 'sheet' ? '0 4px 12px rgba(30,41,59,0.2)' : '0 4px 12px rgba(16,185,129,0.2)'
            }}
          >
            {viewMode === 'list' ? <><FileSpreadsheet size={16} /> Sheets</> : <><LayoutDashboard size={16} /> List</>}
          </button>
        </div>
      </div>

      {/* ── ACTIVE FILTER CHIPS ── */}
      {activeFilterCount > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' }}>Active:</span>
          {trafficFilter === 'free' && <Pill label="Generative AI Masterclass" color="#16a34a" bg="#f0fdf4" onRemove={() => onClearFilter && onClearFilter()} />}
          {trafficFilter === 'paid' && <Pill label="Best AI Program" color="#7c3aed" bg="#f5f3ff" onRemove={() => onClearFilter && onClearFilter()} />}
          {utmFilter === 'organic' && <Pill label="Organic" color="#059669" bg="#ecfdf5" onRemove={() => setUtmFilter(null)} />}
          {utmFilter === 'inorganic' && <Pill label="Inorganic" color="#7c3aed" bg="#f5f3ff" onRemove={() => setUtmFilter(null)} />}
          {datePreset === 'today' && <Pill label="Today" color="#0369a1" bg="#f0f9ff" onRemove={() => setDatePreset(null)} />}
          {datePreset === 'yesterday' && <Pill label="Yesterday" color="#0369a1" bg="#f0f9ff" onRemove={() => setDatePreset(null)} />}
          {datePreset === 'last7' && <Pill label="Last 7 Days" color="#0369a1" bg="#f0f9ff" onRemove={() => setDatePreset(null)} />}
          {datePreset === 'last30' && <Pill label="One Month" color="#0369a1" bg="#f0f9ff" onRemove={() => setDatePreset(null)} />}
          {datePreset === 'custom' && (dateFrom || dateTo) && <Pill label={`Date: ${dateFrom || '...'} → ${dateTo || '...'}`} color="#0369a1" bg="#f0f9ff" onRemove={() => { setDatePreset(null); setDateFrom(''); setDateTo(''); }} />}
          {(sortKey !== 'date' || sortDir !== 'desc') && (
            <Pill label={`Sort: ${sortKey} ${sortDir === 'asc' ? '↑' : '↓'}`} color="#475569" bg="#f8fafc" onRemove={() => { setSortKey('date'); setSortDir('desc'); }} />
          )}
          <button onClick={resetAllFilters} style={{
            fontSize: '0.78rem', color: '#ef4444', fontWeight: '700', background: 'none',
            border: 'none', cursor: 'pointer', padding: '0.2rem 0.5rem', textDecoration: 'underline'
          }}>Clear all</button>
        </div>
      )}

      {/* ── LAYOUT: filter panel + table ── */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>

        {/* ── FILTER PANEL (Flipkart style) ── */}
        {showFilters && (
          <div style={{
            width: '260px', flexShrink: 0,
            background: 'white', borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            position: 'sticky', top: '1rem'
          }}>
            {/* Panel header */}
            <div style={{
              padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'linear-gradient(135deg, #1e293b, #334155)'
            }}>
              <span style={{ fontWeight: '800', fontSize: '0.95rem', color: 'white' }}>Filters</span>
              <button onClick={resetAllFilters} style={{
                fontSize: '0.75rem', color: '#94a3b8', background: 'none',
                border: 'none', cursor: 'pointer', fontWeight: '700'
              }}>Reset all</button>
            </div>

            {/* ── Section: Website ── */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Website</div>
              {[{ val: null, label: 'All Websites' }, { val: 'free', label: 'Generative AI Masterclass' }, { val: 'paid', label: 'Best AI Program' }].map(({ val, label }) => (
                <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0', cursor: 'pointer' }}>
                  <input
                    type="radio" name="website" checked={trafficFilter === val}
                    onChange={() => onClearFilter && onClearFilter(val)}
                    style={{ accentColor: '#2563eb', width: '15px', height: '15px' }}
                  />
                  <span style={{ fontSize: '0.88rem', color: '#334155', fontWeight: '600' }}>{label}</span>
                </label>
              ))}
            </div>

            {/* ── Section: Traffic Type ── */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Traffic Type</div>
              {[{ val: null, label: 'All Traffic' }, { val: 'organic', label: 'Organic' }, { val: 'inorganic', label: 'Inorganic' }].map(({ val, label }) => (
                <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0', cursor: 'pointer' }}>
                  <input
                    type="radio" name="traffic" checked={utmFilter === val}
                    onChange={() => setUtmFilter(val)}
                    style={{ accentColor: '#059669', width: '15px', height: '15px' }}
                  />
                  <span style={{ fontSize: '0.88rem', color: '#334155', fontWeight: '600' }}>{label}</span>
                </label>
              ))}
            </div>


            {/* ── Section: Date Range ── */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Date Range</div>
              {[
                { val: 'today', label: 'Today' },
                { val: 'yesterday', label: 'Yesterday' },
                { val: 'last7', label: 'Last 7 Days' },
                { val: 'last30', label: 'One Month' },
                { val: 'custom', label: 'Custom Date' },
              ].map(({ val, label }) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0', cursor: 'pointer' }}>
                  <input
                    type="radio" name="datePreset" checked={datePreset === val}
                    onChange={() => setDatePreset(val)}
                    style={{ accentColor: '#0369a1', width: '15px', height: '15px' }}
                  />
                  <span style={{ fontSize: '0.88rem', color: '#334155', fontWeight: '600' }}>{label}</span>
                </label>
              ))}
              {datePreset === 'custom' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', paddingLeft: '1.6rem' }}>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }} />
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.8rem', color: '#334155' }} />
                </div>
              )}
              {datePreset && (
                <button onClick={() => setDatePreset(null)} style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: '700', padding: '0.5rem 0 0 0' }}>✕ Clear date</button>
              )}
            </div>


          </div>
        )}

        {/* ── TABLE AREA ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          <div className="content-card" style={{ padding: '0', overflowX: 'auto', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05)' }}>
            {viewMode === 'list' ? (
              <table className="user-table" style={{ width: '100%' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    {[
                      { label: 'NAME & CONTACT', key: 'name', style: { padding: '1.25rem 2rem' } },
                      { label: 'DESIGNATION', key: 'designation' },
                      { label: 'ORGANIZATION', key: 'org' },
                      { label: 'TRAFFIC SOURCE', key: 'utm_source', style: { textAlign: 'center' } },
                      { label: 'DATE', key: 'date', style: { textAlign: 'center' } },
                      { label: 'ACTION', key: null, style: { textAlign: 'center', position: 'sticky', right: 0, background: '#f8fafc', boxShadow: '-4px 0 8px rgba(0,0,0,0.02)' } },
                    ].map(({ label, key, style }) => (
                      <th
                        key={label}
                        onClick={() => key && handleSort(key)}
                        style={{
                          ...style,
                          cursor: key ? 'pointer' : 'default',
                          userSelect: 'none',
                          whiteSpace: 'nowrap',
                          color: sortKey === key ? '#2563eb' : undefined,
                          transition: 'color 0.15s ease',
                        }}
                      >
                        {label}{key && <SortIcon colKey={key} />}
                      </th>
                    ))}
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
                        {(() => {
                          const isPaid = user.utm_source && user.utm_source !== 'N/A';
                          return (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.35rem 0.85rem',
                              borderRadius: '20px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              letterSpacing: '0.02em',
                              background: isPaid ? 'linear-gradient(135deg, #ede9fe, #ddd6fe)' : 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                              color: isPaid ? '#6d28d9' : '#15803d',
                              border: isPaid ? '1px solid #c4b5fd' : '1px solid #86efac',
                            }}>
                              <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: isPaid ? '#7c3aed' : '#16a34a',
                                display: 'inline-block'
                              }} />
                              {isPaid ? 'Inorganic' : 'Organic'}
                            </span>
                          );
                        })()}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b', fontWeight: '500' }}>{user.date}</td>
                      <td style={{ textAlign: 'center', position: 'sticky', right: 0, background: 'inherit', boxShadow: '-4px 0 8px rgba(0,0,0,0.02)' }}>
                        <div style={{ background: 'white', padding: '0.5rem', margin: '-0.5rem' }}> {/* Wrapper to ensure solid background on sticky cell */}
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
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
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
                      {[
                        { label: 'Date', key: 'date' },
                        { label: 'Name', key: 'name' },
                        { label: 'Course Name', key: '_source' },
                        { label: 'Email', key: 'email' },
                        { label: 'Phone', key: 'phone' },
                        { label: 'Designation', key: 'designation' },
                        { label: 'Organization', key: 'org' },
                        { label: 'State', key: 'state' },
                        { label: 'City', key: 'city' },
                        { label: 'CTC', key: 'currentCTC' },
                        { label: 'UTM Source', key: 'utm_source' },
                        { label: 'UTM Medium', key: 'utm_medium' },
                        { label: 'UTM Campaign', key: 'utm_campaign' },
                        { label: 'UTM Term', key: 'utm_term' },
                        { label: 'UTM Content', key: 'utm_content' },
                      ].map(({ label, key }) => (
                        <th
                          key={label}
                          onClick={() => handleSort(key)}
                          style={{
                            padding: '0.75rem',
                            textAlign: 'left',
                            fontWeight: '700',
                            color: sortKey === key ? '#2563eb' : '#475569',
                            borderRight: '1px solid #e2e8f0',
                            whiteSpace: 'nowrap',
                            borderBottom: '1px solid #cbd5e1',
                            cursor: 'pointer',
                            userSelect: 'none',
                            transition: 'color 0.15s ease',
                            background: sortKey === key ? '#eff6ff' : undefined,
                          }}
                        >
                          {label}<SortIcon colKey={key} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
                      <tr key={user.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                        <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '600', whiteSpace: 'nowrap' }}>{user.date}</td>
                        <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '600', whiteSpace: 'nowrap' }}>{user.name}</td>
                        <td style={{ padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', color: '#1e293b', fontWeight: '500', whiteSpace: 'nowrap' }}>
                          {user._source === 'free' ? 'Generative AI Masterclass' : user._source === 'paid' ? 'Best AI Program' : '-'}
                        </td>
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
                        <td colSpan="15" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          No data found to display in sheet view.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div> {/* end table area */}
      </div> {/* end flex layout */}

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
  const [freeUsers, setFreeUsers] = useState([]);
  const [paidUsers, setPaidUsers] = useState([]);
  const [trafficFilter, setTrafficFilter] = useState(null); // null | 'free' | 'paid'

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
          const { freeEnquiries, paidEnquiries, allEnquiries } = await fetchEnquiries();

          const mapUser = (u) => ({
            id: u.id,
            _source: u._source, // 'free' or 'paid'
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
          });

          const mappedAll = allEnquiries.map(mapUser);
          const mappedFree = freeEnquiries.map(mapUser);
          const mappedPaid = paidEnquiries.map(mapUser);

          setUsers(mappedAll);
          setFreeUsers(mappedFree);
          setPaidUsers(mappedPaid);
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
              onClick={() => { setActiveTab('overview'); setTrafficFilter(null); }}
            >
              Overview
            </button>
            <button
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => { setActiveTab('users'); setTrafficFilter(null); }}
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
            <OverviewContent
              users={users}
              freeUsers={freeUsers}
              paidUsers={paidUsers}
              onCardClick={(filter) => {
                setTrafficFilter(filter);
                setActiveTab('users');
              }}
            />
          ) : (
            <UserContent
              users={users}
              onAddUser={handleAddUser}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              trafficFilter={trafficFilter}
              onClearFilter={(filter) => setTrafficFilter(filter || null)}
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
