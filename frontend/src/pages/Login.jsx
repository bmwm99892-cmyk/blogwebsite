import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', {
        email: formData.email.trim(),
        password: formData.password.trim()
      });
      login(res.data.user, res.data.token);
      if (res.data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAF8] min-h-[80vh] flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white border border-[#E8E8E6] p-8 sm:p-10 rounded-sm shadow-sm">
        
        {/* Brand Heading */}
        <div className="text-center mb-8">
          <span className="font-serif text-2xl font-bold tracking-[0.2em] uppercase text-[#121212] block">
            THE JOURNAL
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E8E8E] block mt-1">
            Subscriber & Contributor Access
          </span>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 text-xs tracking-wide rounded-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-[#121212] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="reader@thejournal.com"
              className="w-full p-3 bg-[#FAFAF8] border border-[#D5D5D2] rounded-sm text-xs text-[#121212] placeholder-[#9E9E9E] focus:outline-none focus:border-[#121212] focus:bg-white transition"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-[#121212] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-3 bg-[#FAFAF8] border border-[#D5D5D2] rounded-sm text-xs text-[#121212] placeholder-[#9E9E9E] focus:outline-none focus:border-[#121212] focus:bg-white transition"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#121212] text-white py-3 text-xs uppercase tracking-[0.22em] font-medium rounded-sm hover:bg-[#2A2A2A] transition duration-200 flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={13} />
          </button>
        </form>

        {/* Quick Admin Fill Options */}
        <div className="mt-6 pt-5 border-t border-[#E8E8E6]">
          <span className="text-[10px] uppercase tracking-wider text-[#8E8E8E] block mb-2 font-medium">
            Quick Admin Autofill:
          </span>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setFormData({ email: 'admin@thejournal.com', password: 'admin123' })}
              className="text-[11px] p-2 bg-[#F5F5F3] hover:bg-[#EBEBE8] rounded text-[#121212] flex items-center justify-between transition text-left"
            >
              <span><strong>Seed Admin:</strong> admin@thejournal.com</span>
              <span className="text-[10px] text-neutral-500 font-mono">admin123 &rarr;</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'bmwm99892@gmail.com', password: 'admin123' })}
              className="text-[11px] p-2 bg-[#F5F5F3] hover:bg-[#EBEBE8] rounded text-[#121212] flex items-center justify-between transition text-left"
            >
              <span><strong>Personal Admin:</strong> bmwm99892@gmail.com</span>
              <span className="text-[10px] text-neutral-500 font-mono">admin123 &rarr;</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E8E8E6] text-center text-xs text-[#666666]">
          <span>Don't have a contributor account? </span>
          <Link to="/register" className="text-[#121212] font-semibold hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
