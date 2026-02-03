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
  Lock
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
      // Show more specific error messages
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid Email or Password. Please check your credentials.');
      } else if (err.code === 'auth/user-not-found') {
        setError('User not found. Please create the user in Firebase Console.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: '#f1f5f9'
    }}>
      <div className="content-card animate-fade-in" style={{ width: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="lu-logo" style={{ margin: '0 auto 1rem', width: '60px', height: '60px', fontSize: '24px' }}>LU</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Admin Login</h2>
          <p style={{ color: '#64748b' }}>Sign in to access the dashboard</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Email</label>
            <input
              type="email"
              required
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Password</label>
            <input
              type="password"
              required
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
            {loading ? 'Signing in...' : 'Sign In'}
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

const UserDetailModal = ({ user, onClose, onEdit }) => {
  if (!user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-detail-card animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="user-avatar-large" style={{ background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))' }}>
            {user.name ? user.name.charAt(0) : '?'}
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <h2 className="detail-name">{user.name || 'No Name'}</h2>
          <p className="detail-designation">{user.designation || 'User'}</p>
          <div className="org-badge">{user.org || 'N/A'}</div>

          <div className="details-grid">
            <div className="detail-item">
              <label>Email</label>
              <span>{user.email}</span>
            </div>
            <div className="detail-item">
              <label>Phone Number</label>
              <span>{user.phone}</span>
            </div>
            <div className="detail-item">
              <label>Location</label>
              <span>{user.city}, {user.state}</span>
            </div>
            <div className="detail-item">
              <label>Designation</label>
              <span>{user.designation}</span>
            </div>
            <div className="detail-item">
              <label>Organization</label>
              <span>{user.org}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-btn" onClick={onClose} style={{ width: '100%' }}>Close</button>
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

  const filteredUsers = users.filter(user =>
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.org || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Enquiries Management</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search enquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.6rem 1rem 0.6rem 2.5rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  width: '240px',
                  backgroundColor: '#f8fafc'
                }}
              />
            </div>
            {/* <button className="primary-btn" onClick={onAddUser}><Plus size={18} style={{ marginRight: '8px' }} /> Add User</button> */}
          </div>
        </div>

        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Designation</th>
              <th>Organization</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr key={user.id} className="user-row">
                <td>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                    onClick={() => setSelectedUser(user)}
                    className="user-name-cell"
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: 'white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {user.name ? user.name.charAt(0) : '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{user.name || 'No Name'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email || 'No Email'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.9rem', color: '#475569' }}>{user.designation || '-'}</td>
                <td style={{ fontSize: '0.9rem', color: '#475569' }}>{user.org || '-'}</td>
                <td>
                  <span className={`badge ${user.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                    {user.status || 'Active'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="delete-icon-btn" onClick={(e) => { e.stopPropagation(); onDeleteUser(user.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', padding: '0.5rem', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No enquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
            state: u.state || 'N/A',
            city: u.city || 'N/A',
            org: u.org || u.organization || 'N/A',
            designation: u.designation || u.role || 'User',
            status: u.status || 'Active'
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
          <header className="page-header">
            <h1 className="page-title">
              {activeTab === 'overview' ? 'Overview' : 'Enquiry Management'}
            </h1>
            {activeTab === 'overview' && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Welcome back, {user.email}
              </div>
            )}
          </header>

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
