import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, PlusCircle, MessageSquare, Users,
  FolderTree, BarChart3, Settings, LogOut, Search, Eye, ThumbsUp,
  Shield, CheckCircle, XCircle, Trash2, Edit, ArrowUpRight, Filter,
  TrendingUp, RefreshCw, AlertCircle, Check, Star, Lock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { AuthContext } from '../context/AuthContext';

const Admin = () => {
  const { user, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Active section in Admin Sidebar
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'blogs' | 'create' | 'comments' | 'users' | 'categories' | 'analytics' | 'settings'

  // Loading & Notice states
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState({ type: '', text: '' });

  // Data states from MongoDB
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalUsers: 0
  });
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentComments, setRecentComments] = useState([]);

  // All blogs management state
  const [allBlogs, setAllBlogs] = useState([]);
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('All');

  // Comments management state
  const [allComments, setAllComments] = useState([]);
  const [commentFilter, setCommentFilter] = useState('all');

  // Users management state
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // Categories management state
  const [allCategories, setAllCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  // Analytics state
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState({
    timelineData: [],
    topBlogs: [],
    categoryStats: []
  });

  // Admin Login state if not authenticated as admin
  const [adminEmail, setAdminEmail] = useState('admin@thejournal.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // New Blog form state
  const [newBlog, setNewBlog] = useState({
    title: '',
    description: '',
    content: '',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    category: 'Design',
    status: 'published',
    featured: false
  });

  // Editing existing blog state
  const [editingBlog, setEditingBlog] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const showNotice = (text, type = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice({ text: '', type: '' }), 3500);
  };

  // Load Admin Data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const res = await axios.get('/api/admin/dashboard', { headers });
      setStats(res.data.stats || {});
      setRecentBlogs(res.data.recentBlogs || []);
      setRecentComments(res.data.recentComments || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const res = await axios.get('/api/admin/blogs', { headers: getAuthHeaders() });
      setAllBlogs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get('/api/admin/comments', { headers: getAuthHeaders() });
      setAllComments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users', { headers: getAuthHeaders() });
      setAllUsers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/admin/categories', { headers: getAuthHeaders() });
      setAllCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async (period = analyticsPeriod) => {
    try {
      const res = await axios.get(`/api/admin/analytics?period=${period}`, { headers: getAuthHeaders() });
      setAnalyticsData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
      fetchBlogs();
      fetchComments();
      fetchUsers();
      fetchCategories();
      fetchAnalytics(analyticsPeriod);
    }
  }, [user]);

  // Handle Admin Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await axios.post('/api/auth/login', {
        email: adminEmail.trim(),
        password: adminPassword.trim()
      });

      if (res.data.user?.role !== 'admin') {
        setLoginError('Account authenticated, but you do not possess administrative clearance.');
        return;
      }

      login(res.data.user, res.data.token);
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Authentication rejected. Verify admin credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Toggle Blog Publish/Draft
  const handleToggleBlogStatus = async (blogId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await axios.put(`/api/admin/blogs/${blogId}/status`, { status: newStatus }, { headers: getAuthHeaders() });
      showNotice(`Blog marked as ${newStatus}.`);
      fetchBlogs();
      fetchDashboardData();
    } catch (err) {
      showNotice('Error updating status.', 'error');
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (blogId, currentFeatured) => {
    try {
      await axios.put(`/api/admin/blogs/${blogId}/status`, { featured: !currentFeatured }, { headers: getAuthHeaders() });
      showNotice(currentFeatured ? 'Removed from featured.' : 'Marked as featured essay.');
      fetchBlogs();
    } catch (err) {
      showNotice('Error updating featured state.', 'error');
    }
  };

  // Delete Blog
  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Delete this blog permanently? All associated views, likes, and comments will be cleared.')) return;
    try {
      await axios.delete(`/api/blogs/${blogId}`, { headers: getAuthHeaders() });
      showNotice('Blog post deleted successfully.');
      fetchBlogs();
      fetchDashboardData();
    } catch (err) {
      showNotice('Error deleting blog.', 'error');
    }
  };

  // Create Blog (Admin)
  const handleCreateBlog = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/blogs', newBlog, { headers: getAuthHeaders() });
      showNotice('Blog created and indexed successfully!');
      setNewBlog({
        title: '',
        description: '',
        content: '',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
        category: 'Design',
        status: 'published',
        featured: false
      });
      fetchBlogs();
      fetchDashboardData();
      setActiveTab('blogs');
    } catch (err) {
      showNotice(err.response?.data?.error || 'Error creating blog.', 'error');
    }
  };

  // Edit Blog Save
  const handleSaveBlogEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/blogs/${editingBlog._id}`, editingBlog, { headers: getAuthHeaders() });
      showNotice('Blog updated successfully.');
      setEditingBlog(null);
      fetchBlogs();
    } catch (err) {
      showNotice('Error updating blog.', 'error');
    }
  };

  // Comment Moderation (approve / hide)
  const handleModerateComment = async (commentId, status) => {
    try {
      await axios.put(`/api/admin/comments/${commentId}/moderate`, { status }, { headers: getAuthHeaders() });
      showNotice(`Comment marked as ${status}.`);
      fetchComments();
      fetchDashboardData();
    } catch (err) {
      showNotice('Error updating comment.', 'error');
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Permanently remove this comment and its replies?')) return;
    try {
      await axios.delete(`/api/admin/comments/${commentId}`, { headers: getAuthHeaders() });
      showNotice('Comment removed.');
      fetchComments();
      fetchDashboardData();
    } catch (err) {
      showNotice('Error removing comment.', 'error');
    }
  };

  // Toggle User Status (active / blocked)
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
      await axios.put(`/api/admin/users/${userId}/status`, { status: nextStatus }, { headers: getAuthHeaders() });
      showNotice(`User status updated to ${nextStatus}.`);
      fetchUsers();
    } catch (err) {
      showNotice('Error updating user status.', 'error');
    }
  };

  // Toggle User Role (admin / user)
  const handleToggleUserRole = async (userId, currentRole) => {
    try {
      const nextRole = currentRole === 'admin' ? 'user' : 'admin';
      await axios.put(`/api/admin/users/${userId}/status`, { role: nextRole }, { headers: getAuthHeaders() });
      showNotice(`User permissions changed to ${nextRole}.`);
      fetchUsers();
    } catch (err) {
      showNotice(err.response?.data?.error || 'Error modifying permissions.', 'error');
    }
  };

  // Category Actions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await axios.post('/api/admin/categories', {
        name: newCatName.trim(),
        description: newCatDesc.trim()
      }, { headers: getAuthHeaders() });
      showNotice('Category added successfully.');
      setNewCatName('');
      setNewCatDesc('');
      fetchCategories();
    } catch (err) {
      showNotice(err.response?.data?.error || 'Error creating category.', 'error');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await axios.put(`/api/admin/categories/${editingCategory._id}`, {
        name: editingCategory.name,
        description: editingCategory.description
      }, { headers: getAuthHeaders() });
      showNotice('Category updated.');
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      showNotice(err.response?.data?.error || 'Error updating category.', 'error');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`/api/admin/categories/${catId}`, { headers: getAuthHeaders() });
      showNotice('Category deleted.');
      fetchCategories();
    } catch (err) {
      showNotice('Error deleting category.', 'error');
    }
  };

  // If user is not logged in or not admin, show clean Admin Login
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F4F4F6] flex items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-lg shadow-sm border border-neutral-200">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#121212] text-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Shield size={24} className="text-amber-400" />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#121212]">
              Administrative Portal
            </h1>
            <p className="text-xs text-[#7A7A7A] mt-1 uppercase tracking-widest font-sans">
              THE JOURNAL &bull; Clearance Required
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center space-x-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#121212] uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                className="w-full p-3 bg-[#FAFAF8] border border-neutral-300 rounded text-xs text-[#121212] focus:outline-none focus:border-black"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#121212] uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full p-3 bg-[#FAFAF8] border border-neutral-300 rounded text-xs text-[#121212] focus:outline-none focus:border-black"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full mt-2 bg-[#121212] text-white py-3 rounded text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition"
            >
              {loginLoading ? 'Verifying Security Clearance...' : 'Authenticate as Administrator'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-200 text-center">
            <span className="text-[11px] text-[#7A7A7A] block mb-2 font-medium">
              Quick Autofill Credentials:
            </span>
            <div className="flex flex-col gap-1.5 mb-3 text-left">
              <button
                type="button"
                onClick={() => { setAdminEmail('admin@thejournal.com'); setAdminPassword('admin123'); }}
                className="text-[11px] p-2 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-800 flex items-center justify-between transition"
              >
                <span><strong>Seed Admin:</strong> admin@thejournal.com</span>
                <span className="text-[10px] text-neutral-500 font-mono">admin123 &rarr;</span>
              </button>
              <button
                type="button"
                onClick={() => { setAdminEmail('bmwm99892@gmail.com'); setAdminPassword('admin123'); }}
                className="text-[11px] p-2 bg-neutral-100 hover:bg-neutral-200 rounded text-neutral-800 flex items-center justify-between transition"
              >
                <span><strong>Personal Admin:</strong> bmwm99892@gmail.com</span>
                <span className="text-[10px] text-neutral-500 font-mono">admin123 &rarr;</span>
              </button>
            </div>
            <Link to="/" className="text-xs text-neutral-900 font-semibold hover:underline">
              &larr; Return to Public Editorial Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtered blogs for table
  const filteredBlogs = allBlogs.filter((b) => {
    const matchesCategory = blogCategoryFilter === 'All' || b.category?.toLowerCase() === blogCategoryFilter.toLowerCase();
    const matchesSearch = !blogSearch ||
      b.title?.toLowerCase().includes(blogSearch.toLowerCase()) ||
      b.author?.name?.toLowerCase().includes(blogSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered comments
  const filteredComments = allComments.filter((c) => {
    if (commentFilter === 'all') return true;
    return c.status === commentFilter;
  });

  // Filtered users
  const filteredUsers = allUsers.filter((u) => {
    if (!userSearch) return true;
    return u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase());
  });

  const CHART_COLORS = ['#121212', '#4F46E5', '#059669', '#D97706', '#DC2626', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex text-[#1C1C1C]">
      
      {/* ==================== 1. DASHBOARD SIDEBAR ==================== */}
      <aside className="w-64 bg-[#121212] text-[#B8B8B6] flex flex-col justify-between shrink-0 border-r border-neutral-800 hidden md:flex min-h-screen">
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <Link to="/" className="block">
              <span className="font-serif text-xl font-bold tracking-[0.2em] uppercase text-white block">
                THE JOURNAL
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#8E8E8E] font-sans">
                Admin Console &bull; SaaS
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'blogs', label: 'All Blogs', icon: FileText, badge: stats.totalBlogs },
              { id: 'create', label: 'Create Blog', icon: PlusCircle },
              { id: 'comments', label: 'Comments', icon: MessageSquare, badge: stats.totalComments },
              { id: 'users', label: 'Users', icon: Users, badge: stats.totalUsers },
              { id: 'categories', label: 'Categories', icon: FolderTree },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-xs uppercase tracking-wider font-medium transition ${
                    isActive
                      ? 'bg-white text-[#121212] font-semibold'
                      : 'text-[#9A9A9A] hover:bg-neutral-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-neutral-200 text-[#121212]' : 'bg-neutral-800 text-neutral-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <div className="px-3 py-2 text-xs">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 block">Logged In Admin</span>
            <span className="text-white font-medium truncate block">{user.name}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/"
              className="flex-1 py-2 px-3 text-center bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[11px] uppercase tracking-wider font-medium transition"
            >
              Public Site
            </Link>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 bg-neutral-800 hover:bg-red-900 text-white rounded transition"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== 2. MAIN ADMIN CONTENT AREA ==================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-neutral-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500">
              Admin &bull; {activeTab.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification alert */}
            {notice.text && (
              <div className={`text-xs px-3 py-1 rounded border animate-fadeIn flex items-center space-x-1.5 ${
                notice.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <Check size={12} />
                <span>{notice.text}</span>
              </div>
            )}

            <button
              onClick={() => {
                fetchDashboardData();
                fetchBlogs();
                fetchComments();
                fetchUsers();
                fetchCategories();
                fetchAnalytics(analyticsPeriod);
                showNotice('Dashboard refreshed.');
              }}
              className="p-2 border border-neutral-200 rounded text-neutral-600 hover:text-black transition"
              title="Refresh MongoDB Data"
            >
              <RefreshCw size={14} />
            </button>

            <Link
              to="/"
              className="inline-flex items-center space-x-1 text-xs text-neutral-700 hover:text-black font-medium border border-neutral-200 px-3 py-1.5 rounded"
            >
              <span>View Live Journal</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 sm:p-8 space-y-8 flex-1">
          
          {/* ==================== TAB: OVERVIEW ==================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* Stat Cards Grid (Dynamic MongoDB metrics) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Blogs', value: stats.totalBlogs, sub: `${stats.publishedBlogs} published &bull; ${stats.draftBlogs} drafts`, icon: FileText, color: 'text-neutral-900' },
                  { label: 'Total Views', value: stats.totalViews?.toLocaleString(), sub: 'Across all articles', icon: Eye, color: 'text-blue-600' },
                  { label: 'Total Likes', value: stats.totalLikes?.toLocaleString(), sub: 'Authenticated interactions', icon: ThumbsUp, color: 'text-emerald-600' },
                  { label: 'Total Comments', value: stats.totalComments?.toLocaleString(), sub: 'Reader discussions', icon: MessageSquare, color: 'text-amber-600' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
                          {stat.label}
                        </span>
                        <Icon size={18} className={stat.color} />
                      </div>
                      <div className="font-serif text-3xl font-bold text-neutral-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-light" dangerouslySetInnerHTML={{ __html: stat.sub }} />
                    </div>
                  );
                })}
              </div>

              {/* Extra Stats Pill Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Registered Users</span>
                    <div className="text-2xl font-serif font-bold text-neutral-900">{stats.totalUsers}</div>
                  </div>
                  <Users size={22} className="text-neutral-400" />
                </div>
                <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Published Articles</span>
                    <div className="text-2xl font-serif font-bold text-emerald-600">{stats.publishedBlogs}</div>
                  </div>
                  <CheckCircle size={22} className="text-emerald-500" />
                </div>
                <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Draft Articles</span>
                    <div className="text-2xl font-serif font-bold text-amber-600">{stats.draftBlogs}</div>
                  </div>
                  <FileText size={22} className="text-amber-500" />
                </div>
              </div>

              {/* Quick Chart Preview in Overview */}
              <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-100">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-neutral-900">30-Day Readership & Interaction Velocity</h3>
                    <p className="text-xs text-neutral-500 font-light">Aggregated views, likes, and comment activity from MongoDB</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="text-xs text-neutral-900 font-semibold hover:underline"
                  >
                    Full Analytics &rarr;
                  </button>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="views" stroke="#121212" fill="#121212" fillOpacity={0.08} />
                      <Area type="monotone" dataKey="likes" stroke="#059669" fill="#059669" fillOpacity={0.12} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Two Column: Recent Blogs & Recent Comments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Blogs */}
                <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
                    <h4 className="font-serif text-base font-bold text-neutral-900">Recent Articles</h4>
                    <button onClick={() => setActiveTab('blogs')} className="text-xs text-neutral-500 hover:text-black">
                      View All
                    </button>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {recentBlogs.map((b) => (
                      <div key={b._id} className="py-3 flex items-center justify-between">
                        <div className="pr-4">
                          <Link to={`/blogs/${b._id}`} className="text-xs font-medium text-neutral-900 hover:underline line-clamp-1">
                            {b.title}
                          </Link>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">
                            {b.category} &bull; {b.views} views &bull; {b.likes} likes
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          b.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Comments */}
                <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
                    <h4 className="font-serif text-base font-bold text-neutral-900">Recent Discussion</h4>
                    <button onClick={() => setActiveTab('comments')} className="text-xs text-neutral-500 hover:text-black">
                      Manage All
                    </button>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {recentComments.length === 0 ? (
                      <p className="text-xs text-neutral-400 py-4 italic">No comments yet.</p>
                    ) : (
                      recentComments.map((c) => (
                        <div key={c._id} className="py-3 flex items-start justify-between">
                          <div className="pr-4">
                            <span className="text-xs font-semibold text-neutral-900">{c.user?.name || 'Reader'}: </span>
                            <span className="text-xs text-neutral-600 line-clamp-1">{c.content}</span>
                            <span className="text-[10px] text-neutral-400 block mt-0.5">On: {c.blog?.title || 'Article'}</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium shrink-0 ${
                            c.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-600'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB: ALL BLOGS MANAGEMENT ==================== */}
          {activeTab === 'blogs' && (
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
              
              {/* Table Controls */}
              <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-3 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search blogs..."
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAFAF8] border border-neutral-300 rounded focus:outline-none focus:border-black"
                    />
                  </div>
                  <select
                    value={blogCategoryFilter}
                    onChange={(e) => setBlogCategoryFilter(e.target.value)}
                    className="p-2 bg-[#FAFAF8] border border-neutral-300 rounded text-xs text-neutral-700"
                  >
                    <option value="All">All Categories</option>
                    {allCategories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center space-x-1.5 bg-[#121212] text-white px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold hover:bg-neutral-800 transition"
                >
                  <PlusCircle size={14} />
                  <span>Draft New Blog</span>
                </button>
              </div>

              {/* Responsive Modern Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
                      <th className="py-3.5 px-4 font-semibold">Article</th>
                      <th className="py-3.5 px-4 font-semibold">Category</th>
                      <th className="py-3.5 px-4 font-semibold">Metrics</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">Date</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredBlogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-400 italic">
                          No blogs matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredBlogs.map((b) => (
                        <tr key={b._id} className="hover:bg-neutral-50/60 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3 max-w-sm">
                              <img
                                src={b.image}
                                alt={b.title}
                                className="w-10 h-10 object-cover rounded shrink-0 bg-neutral-200"
                              />
                              <div>
                                <Link to={`/blogs/${b._id}`} className="font-semibold text-neutral-900 hover:underline line-clamp-1">
                                  {b.title}
                                </Link>
                                <span className="text-[10px] text-neutral-400 block">
                                  By {b.author?.name || 'Staff'} {b.featured && <span className="text-amber-600 font-semibold">&bull; Featured</span>}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-neutral-700">
                            {b.category}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3 text-neutral-600 text-[11px]">
                              <span title="Views" className="flex items-center"><Eye size={12} className="mr-1 text-neutral-400" />{b.views}</span>
                              <span title="Likes" className="flex items-center"><ThumbsUp size={12} className="mr-1 text-neutral-400" />{b.likes}</span>
                              <span title="Comments" className="flex items-center"><MessageSquare size={12} className="mr-1 text-neutral-400" />{b.commentCount || 0}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleBlogStatus(b._id, b.status)}
                              className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded cursor-pointer ${
                                b.status === 'published' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              }`}
                              title="Click to toggle published / draft"
                            >
                              {b.status}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-neutral-400 text-[11px]">
                            {new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleToggleFeatured(b._id, b.featured)}
                                className={`p-1.5 rounded transition ${
                                  b.featured ? 'text-amber-500 bg-amber-50' : 'text-neutral-400 hover:text-amber-500'
                                }`}
                                title={b.featured ? "Remove featured" : "Feature on magazine front"}
                              >
                                <Star size={14} className={b.featured ? "fill-current" : ""} />
                              </button>
                              <button
                                onClick={() => setEditingBlog(b)}
                                className="p-1.5 text-neutral-500 hover:text-black rounded hover:bg-neutral-100 transition"
                                title="Edit Blog"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(b._id)}
                                className="p-1.5 text-neutral-500 hover:text-red-600 rounded hover:bg-neutral-100 transition"
                                title="Delete Blog"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Editing Modal if an article is being edited */}
              {editingBlog && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                      <h3 className="font-serif text-lg font-bold">Edit Article: {editingBlog.title}</h3>
                      <button onClick={() => setEditingBlog(null)} className="text-neutral-500 hover:text-black">
                        <XCircle size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveBlogEdit} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold mb-1 uppercase tracking-wider text-neutral-600">Headline</label>
                        <input
                          type="text"
                          required
                          value={editingBlog.title}
                          onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                          className="w-full p-2.5 border rounded text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold mb-1 uppercase tracking-wider text-neutral-600">Category</label>
                          <select
                            value={editingBlog.category}
                            onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                            className="w-full p-2.5 border rounded text-xs"
                          >
                            {allCategories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold mb-1 uppercase tracking-wider text-neutral-600">Status</label>
                          <select
                            value={editingBlog.status}
                            onChange={(e) => setEditingBlog({ ...editingBlog, status: e.target.value })}
                            className="w-full p-2.5 border rounded text-xs"
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1 uppercase tracking-wider text-neutral-600">Image URL</label>
                        <input
                          type="url"
                          required
                          value={editingBlog.image}
                          onChange={(e) => setEditingBlog({ ...editingBlog, image: e.target.value })}
                          className="w-full p-2.5 border rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1 uppercase tracking-wider text-neutral-600">Short Summary</label>
                        <textarea
                          rows={2}
                          value={editingBlog.description}
                          onChange={(e) => setEditingBlog({ ...editingBlog, description: e.target.value })}
                          className="w-full p-2.5 border rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1 uppercase tracking-wider text-neutral-600">Full Content</label>
                        <textarea
                          rows={8}
                          value={editingBlog.content}
                          onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                          className="w-full p-2.5 border rounded text-xs font-serif leading-relaxed"
                        />
                      </div>
                      <div className="flex justify-end space-x-3 pt-3 border-t">
                        <button
                          type="button"
                          onClick={() => setEditingBlog(null)}
                          className="px-4 py-2 border rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#121212] text-white rounded font-semibold"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ==================== TAB: CREATE BLOG ==================== */}
          {activeTab === 'create' && (
            <div className="bg-white p-8 rounded-lg border border-neutral-200 shadow-sm max-w-4xl mx-auto">
              <div className="mb-6 pb-4 border-b border-neutral-200">
                <h3 className="font-serif text-2xl font-bold text-neutral-900">Create New Article</h3>
                <p className="text-xs text-neutral-500">Publish directly to MongoDB archives with status and category controls</p>
              </div>

              <form onSubmit={handleCreateBlog} className="space-y-6 text-xs">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">Article Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Computational Biology and the Next Century"
                    value={newBlog.title}
                    onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                    className="w-full p-3 border rounded text-sm font-serif"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">Category *</label>
                    <select
                      value={newBlog.category}
                      onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                      className="w-full p-2.5 border rounded"
                    >
                      {allCategories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">Initial Status</label>
                    <select
                      value={newBlog.status}
                      onChange={(e) => setNewBlog({ ...newBlog, status: e.target.value })}
                      className="w-full p-2.5 border rounded"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Save as Draft</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">Featured Story</label>
                    <label className="flex items-center space-x-2 p-2.5 border rounded cursor-pointer bg-[#FAFAF8]">
                      <input
                        type="checkbox"
                        checked={newBlog.featured}
                        onChange={(e) => setNewBlog({ ...newBlog, featured: e.target.checked })}
                      />
                      <span className="font-medium">Feature on Frontpage</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">Lead Image URL *</label>
                  <input
                    type="url"
                    required
                    value={newBlog.image}
                    onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })}
                    className="w-full p-2.5 border rounded"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">Standfirst / Short Summary *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Short 2-sentence summary..."
                    value={newBlog.description}
                    onChange={(e) => setNewBlog({ ...newBlog, description: e.target.value })}
                    className="w-full p-2.5 border rounded font-serif italic"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">Full Content Body *</label>
                  <textarea
                    rows={10}
                    required
                    placeholder="Write the full manuscript. Use blank lines between paragraphs..."
                    value={newBlog.content}
                    onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                    className="w-full p-3 border rounded font-serif text-sm leading-relaxed"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="submit"
                    className="bg-[#121212] text-white px-6 py-2.5 rounded uppercase tracking-wider font-semibold hover:bg-neutral-800 transition"
                  >
                    Save & Index Article
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================== TAB: COMMENTS MODERATION ==================== */}
          {activeTab === 'comments' && (
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-900">Discussion Moderation</h3>
                  <p className="text-xs text-neutral-500">Approve, hide, or delete community comments</p>
                </div>
                <div className="flex items-center space-x-2">
                  {['all', 'approved', 'pending', 'hidden'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setCommentFilter(st)}
                      className={`text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded transition ${
                        commentFilter === st ? 'bg-[#121212] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
                      <th className="py-3 px-4 font-semibold">User</th>
                      <th className="py-3 px-4 font-semibold">Comment</th>
                      <th className="py-3 px-4 font-semibold">Article</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredComments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-neutral-400 italic">No comments found.</td>
                      </tr>
                    ) : (
                      filteredComments.map((c) => (
                        <tr key={c._id} className="hover:bg-neutral-50/60">
                          <td className="py-3 px-4 font-medium text-neutral-900">
                            {c.user?.name || 'Reader'}
                            <span className="block text-[10px] text-neutral-400">{c.user?.email}</span>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <p className="line-clamp-2 text-neutral-700 font-serif">{c.content}</p>
                          </td>
                          <td className="py-3 px-4 text-neutral-500 max-w-[150px] truncate">
                            {c.blog?.title || 'Unknown'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                              c.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                              c.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-400 text-[10px]">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {c.status !== 'approved' && (
                                <button
                                  onClick={() => handleModerateComment(c._id, 'approved')}
                                  className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-semibold px-2"
                                >
                                  Approve
                                </button>
                              )}
                              {c.status !== 'hidden' && (
                                <button
                                  onClick={() => handleModerateComment(c._id, 'hidden')}
                                  className="p-1 bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded text-[10px] font-semibold px-2"
                                >
                                  Hide
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteComment(c._id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB: USER MANAGEMENT ==================== */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-900">User Administration</h3>
                  <p className="text-xs text-neutral-500">Manage contributor roles and account clearance</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAFAF8] border border-neutral-300 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-500 uppercase tracking-wider text-[10px] border-b border-neutral-200">
                      <th className="py-3 px-4 font-semibold">User</th>
                      <th className="py-3 px-4 font-semibold">Role</th>
                      <th className="py-3 px-4 font-semibold">Clearance Status</th>
                      <th className="py-3 px-4 font-semibold">Articles Penned</th>
                      <th className="py-3 px-4 font-semibold">Enrolled Date</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-neutral-50/60">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-neutral-900 block">{u.name}</span>
                          <span className="text-[10px] text-neutral-400">{u.email}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-neutral-700">
                          {u.blogCount || 0}
                        </td>
                        <td className="py-3 px-4 text-neutral-400 text-[10px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleToggleUserRole(u._id, u.role)}
                              className="px-2 py-1 border border-neutral-300 rounded text-[10px] hover:bg-neutral-100"
                              title="Toggle Admin / User"
                            >
                              {u.role === 'admin' ? 'Demote to User' : 'Grant Admin'}
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(u._id, u.status)}
                              className={`px-2 py-1 rounded text-[10px] font-semibold ${
                                u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB: CATEGORIES MANAGEMENT ==================== */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Category List */}
              <div className="lg:col-span-7 bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-neutral-200">
                  <h3 className="font-serif text-lg font-bold text-neutral-900">Taxonomy Index</h3>
                  <p className="text-xs text-neutral-500">Categories currently active in MongoDB</p>
                </div>
                <div className="divide-y divide-neutral-100">
                  {allCategories.map((c) => (
                    <div key={c._id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition">
                      <div>
                        <span className="font-serif font-bold text-sm text-neutral-900 block">{c.name}</span>
                        <span className="text-xs text-neutral-500 line-clamp-1">{c.description || 'No description.'}</span>
                        <span className="text-[10px] text-neutral-400 mt-0.5 block">{c.blogCount || 0} associated articles</span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => setEditingCategory(c)}
                          className="p-1.5 text-neutral-500 hover:text-black rounded hover:bg-neutral-100"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c._id)}
                          className="p-1.5 text-neutral-500 hover:text-red-600 rounded hover:bg-neutral-100"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Add/Edit Category Form */}
              <div className="lg:col-span-5 bg-white p-6 rounded-lg border border-neutral-200 shadow-sm h-fit">
                <h3 className="font-serif text-lg font-bold text-neutral-900 mb-2">
                  {editingCategory ? `Edit: ${editingCategory.name}` : 'Create Taxonomy Field'}
                </h3>
                <p className="text-xs text-neutral-500 mb-5">Assign topics to structure editorial longform essays</p>

                <form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">Field Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Artificial Intelligence"
                      value={editingCategory ? editingCategory.name : newCatName}
                      onChange={(e) => editingCategory ? setEditingCategory({ ...editingCategory, name: e.target.value }) : setNewCatName(e.target.value)}
                      className="w-full p-2.5 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">Field Description</label>
                    <textarea
                      rows={3}
                      placeholder="Brief thematic synopsis..."
                      value={editingCategory ? editingCategory.description : newCatDesc}
                      onChange={(e) => editingCategory ? setEditingCategory({ ...editingCategory, description: e.target.value }) : setNewCatDesc(e.target.value)}
                      className="w-full p-2.5 border rounded"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="flex-1 py-2 border rounded"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 bg-[#121212] text-white py-2 rounded uppercase tracking-wider font-semibold hover:bg-neutral-800 transition"
                    >
                      {editingCategory ? 'Save Category' : 'Add Category'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* ==================== TAB: ANALYTICS (Recharts) ==================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              
              {/* Filter Tabs */}
              <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-900">Editorial Performance & Readership</h3>
                  <p className="text-xs text-neutral-500">Real database metrics powered by MongoDB aggregation</p>
                </div>
                <div className="flex items-center space-x-2">
                  {[
                    { id: '7d', label: 'Last 7 Days' },
                    { id: '30d', label: 'Last 30 Days' },
                    { id: '90d', label: 'Last 90 Days' },
                    { id: 'all', label: 'All Time' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setAnalyticsPeriod(p.id);
                        fetchAnalytics(p.id);
                      }}
                      className={`text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded transition ${
                        analyticsPeriod === p.id ? 'bg-[#121212] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart 1: Daily Views over Time */}
              <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
                <h4 className="font-serif text-base font-bold text-neutral-900 mb-1">Article Readership Volume (Views)</h4>
                <p className="text-xs text-neutral-400 mb-6 font-light">Daily timeline distribution over {analyticsPeriod}</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="views" name="Daily Views" stroke="#121212" fill="#121212" fillOpacity={0.12} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Likes & Comments Over Time */}
              <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
                <h4 className="font-serif text-base font-bold text-neutral-900 mb-1">Reader Engagement (Likes & Comments)</h4>
                <p className="text-xs text-neutral-400 mb-6 font-light">Interactive engagement signals from readers</p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="likes" name="Likes" fill="#059669" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="comments" name="Comments" fill="#D97706" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Two Column: Most Popular Articles & Category Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Popular Blogs */}
                <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
                  <h4 className="font-serif text-base font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
                    Most Popular Articles
                  </h4>
                  <div className="divide-y divide-neutral-100">
                    {analyticsData.topBlogs?.map((b, idx) => (
                      <div key={b._id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="font-serif font-bold text-neutral-400 text-sm">0{idx + 1}</span>
                          <div>
                            <span className="font-medium text-neutral-900 block line-clamp-1">{b.title}</span>
                            <span className="text-[10px] text-neutral-400">{b.category}</span>
                          </div>
                        </div>
                        <div className="text-right text-[11px] font-semibold text-neutral-800">
                          {b.views} views
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Performance */}
                <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
                  <h4 className="font-serif text-base font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
                    Category Breakdown
                  </h4>
                  <div className="divide-y divide-neutral-100">
                    {analyticsData.categoryStats?.map((c) => (
                      <div key={c._id} className="py-3 flex items-center justify-between text-xs">
                        <span className="font-medium text-neutral-900">{c._id || 'Unassigned'}</span>
                        <div className="text-right text-[11px] text-neutral-500">
                          <span className="font-bold text-neutral-800">{c.totalViews} views</span> &bull; {c.count} articles
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB: SETTINGS ==================== */}
          {activeTab === 'settings' && (
            <div className="bg-white p-8 rounded-lg border border-neutral-200 shadow-sm max-w-2xl mx-auto space-y-6 text-xs">
              <div className="pb-4 border-b border-neutral-200">
                <h3 className="font-serif text-2xl font-bold text-neutral-900">Platform Settings</h3>
                <p className="text-xs text-neutral-500">Core administrative configurations & database status</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">Journal Publication Title</label>
                  <input type="text" readOnly value="THE JOURNAL — Editorial & Discourse" className="w-full p-2.5 bg-neutral-100 border rounded text-neutral-700" />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">Database Engine</label>
                  <input type="text" readOnly value="MongoDB (Mongoose ODM v9)" className="w-full p-2.5 bg-neutral-100 border rounded text-neutral-700" />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-neutral-700 mb-1">Administrative Session</label>
                  <input type="text" readOnly value={`${user.name} (${user.email})`} className="w-full p-2.5 bg-neutral-100 border rounded text-neutral-700" />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex justify-between items-center">
                <span className="text-[11px] text-neutral-400">All rights reserved &bull; The Journal Admin Suite</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition"
                >
                  Terminate Session
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};

export default Admin;

