import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
            Join the Contributor Fellowship
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
              Full Legal / Pen Name
            </label>
            <input
              type="text"
              required
              placeholder="Julian Thorne"
              className="w-full p-3 bg-[#FAFAF8] border border-[#D5D5D2] rounded-sm text-xs text-[#121212] placeholder-[#9E9E9E] focus:outline-none focus:border-[#121212] focus:bg-white transition"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

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
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
            <ArrowRight size={13} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E8E8E6] text-center text-xs text-[#666666]">
          <span>Already registered with us? </span>
          <Link to="/login" className="text-[#121212] font-semibold hover:underline">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
