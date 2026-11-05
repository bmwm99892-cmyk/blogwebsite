import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Eye, Edit3, Image as ImageIcon, Clock, Check, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const CATEGORIES = ['Design', 'Technology', 'Business', 'Lifestyle', 'Travel', 'Innovation'];

const CURATED_PRESETS = [
  {
    name: 'Minimal Architecture',
    category: 'Design',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Synthetic Tech',
    category: 'Technology',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Nordic Wilderness',
    category: 'Travel',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Bespoke Craft',
    category: 'Innovation',
    url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Tuscan Slow Living',
    category: 'Lifestyle',
    url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Modern Enterprise',
    category: 'Business',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80',
    thumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80'
  }
];

const CreateBlog = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'Design';
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: initialCategory,
    image: CURATED_PRESETS[0].url,
    description: '',
    content: '',
    authorName: user?.name || ''
  });

  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.name && !formData.authorName) {
      setFormData(prev => ({ ...prev, authorName: user.name }));
    }
  }, [user]);

  // Live word & read time calculation
  const wordCount = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;
  const estimatedMins = Math.max(1, Math.ceil(wordCount / 200));

  const handleSelectPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      image: preset.url,
      category: preset.category
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const res = await axios.post('/api/blogs', formData, { headers });
      setSuccess(true);
      setTimeout(() => {
        // Navigate to the newly created blog post or archive
        const targetId = res.data?.id || res.data?._id;
        if (targetId) {
          navigate(`/blogs/${targetId}`);
        } else {
          navigate('/blogs');
        }
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to submit article. Please check all fields.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAF8] min-h-screen pb-28">
      
      {/* 1. Top Editorial Banner */}
      <section className="py-14 border-b border-[#E8E8E6] bg-[#F5F5F2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            to="/blogs"
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] hover:text-[#121212] transition-colors mb-4"
          >
            <ArrowLeft size={13} />
            <span>Return to Archives</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#8E8E8E] block mb-2">
                Editorial Contributor Desk
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#121212] tracking-tight">
                Compose New Dispatch
              </h1>
            </div>

            {/* Toggle Editor / Preview */}
            <div className="inline-flex border border-[#D5D5D2] rounded-sm p-1 bg-white">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs uppercase tracking-wider font-medium rounded-sm transition ${
                  activeTab === 'editor'
                    ? 'bg-[#121212] text-white'
                    : 'text-[#666666] hover:text-[#121212]'
                }`}
              >
                <Edit3 size={13} />
                <span>Write</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs uppercase tracking-wider font-medium rounded-sm transition ${
                  activeTab === 'preview'
                    ? 'bg-[#121212] text-white'
                    : 'text-[#666666] hover:text-[#121212]'
                }`}
              >
                <Eye size={13} />
                <span>Editorial Preview</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-800 text-xs tracking-wide rounded-sm flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs tracking-wide rounded-sm flex items-center space-x-2 animate-fadeIn">
            <Check size={16} className="text-emerald-700 shrink-0" />
            <span>Article published successfully to THE JOURNAL! Redirecting to your live dispatch...</span>
          </div>
        )}

        {/* TAB 1: DRAFT EDITOR */}
        {activeTab === 'editor' && (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Title */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[#121212] mb-2">
                Headline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The Architecture of Stillness: Crafting Sanctuaries in a Hyper-Connected World"
                className="w-full p-4 bg-white border border-[#D5D5D2] rounded-sm text-lg sm:text-xl text-[#121212] placeholder-[#A0A0A0] focus:outline-none focus:border-[#121212] font-serif transition shadow-sm"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Category & Author Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[#121212] mb-2">
                  Taxonomy / Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full p-3.5 bg-white border border-[#D5D5D2] rounded-sm text-xs uppercase tracking-wider text-[#121212] focus:outline-none focus:border-[#121212] transition"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-[0.2em] font-semibold text-[#121212] mb-2">
                  Author / Pen Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Julian Thorne or Your Name"
                  className="w-full p-3.5 bg-white border border-[#D5D5D2] rounded-sm text-xs text-[#121212] placeholder-[#A0A0A0] focus:outline-none focus:border-[#121212] transition"
                  value={formData.authorName}
                  onChange={e => setFormData({ ...formData, authorName: e.target.value })}
                />
              </div>
            </div>

            {/* Image Presets Selector */}
            <div className="bg-white border border-[#E8E8E6] p-5 rounded-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#121212] flex items-center space-x-1.5">
                  <Sparkles size={13} />
                  <span>Choose Curated Editorial Photography</span>
                </span>
                <span className="text-[10px] text-[#7A7A7A] uppercase tracking-wider">
                  One-click selection
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {CURATED_PRESETS.map((preset) => {
                  const isSelected = formData.image === preset.url;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`group relative aspect-[4/3] rounded-sm overflow-hidden border-2 text-left transition ${
                        isSelected ? 'border-[#121212] ring-2 ring-black/20' : 'border-transparent hover:border-[#121212]'
                      }`}
                    >
                      <img
                        src={preset.thumb}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                        <span className="text-[9px] text-white font-medium truncate leading-none">
                          {preset.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-[#F0F0ED]">
                <label className="block text-[11px] uppercase tracking-wider text-[#777777] mb-1.5">
                  Or Paste Custom Image URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-[#FAFAF8] border border-[#D5D5D2] rounded-sm text-xs text-[#121212] placeholder-[#A0A0A0] focus:outline-none focus:border-[#121212] focus:bg-white transition"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
            </div>

            {/* Standfirst / Summary */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-[0.2em] font-semibold text-[#121212]">
                  Standfirst / Lead Excerpt <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-[#8E8E8E] uppercase tracking-wider">
                  Displayed on magazine covers & cards
                </span>
              </div>
              <textarea
                required
                rows={2}
                placeholder="A compelling, refined two-sentence synthesis of your essay's core thesis..."
                className="w-full p-3.5 bg-white border border-[#D5D5D2] rounded-sm text-sm text-[#121212] placeholder-[#A0A0A0] focus:outline-none focus:border-[#121212] leading-relaxed transition shadow-sm font-serif italic"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Content Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase tracking-[0.2em] font-semibold text-[#121212]">
                  Manuscript Body <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-3 text-[11px] text-[#7A7A7A] uppercase tracking-wider">
                  <span>{wordCount} words</span>
                  <span>&bull;</span>
                  <span className="flex items-center">
                    <Clock size={11} className="mr-1" />
                    ~{estimatedMins} min read
                  </span>
                </div>
              </div>
              <textarea
                required
                rows={14}
                placeholder="Compose your article here. Separate paragraphs with an empty line. THE JOURNAL's reading engine will automatically format drop-caps and elegant serif typography..."
                className="w-full p-5 bg-white border border-[#D5D5D2] rounded-sm text-base text-[#121212] placeholder-[#A0A0A0] focus:outline-none focus:border-[#121212] font-serif leading-[1.8] transition shadow-sm"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            {/* Publish Action Bar */}
            <div className="pt-6 border-t border-[#E8E8E6] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-[#7A7A7A] font-light">
                Articles are instantly indexed into the global magazine archive.
              </span>
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className="w-full sm:w-auto border border-[#D5D5D2] text-[#121212] px-5 py-3 text-xs uppercase tracking-[0.2em] font-medium hover:border-[#121212] transition rounded-sm"
                >
                  Preview Layout
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#121212] text-white px-8 py-3 text-xs uppercase tracking-[0.22em] font-medium hover:bg-[#2A2A2A] transition rounded-sm shadow-sm"
                >
                  <span>{loading ? 'Publishing...' : 'Publish to Journal'}</span>
                  <Send size={13} />
                </button>
              </div>
            </div>

          </form>
        )}

        {/* TAB 2: LIVE EDITORIAL PREVIEW */}
        {activeTab === 'preview' && (
          <div className="bg-white border border-[#E8E8E6] p-8 sm:p-12 rounded-sm shadow-sm animate-fadeIn">
            
            {/* Category tag */}
            <div className="text-center mb-4">
              <span className="text-[11px] uppercase tracking-[0.28em] font-semibold text-[#8E8E8E] border-b border-[#121212] pb-0.5">
                {formData.category || 'Discourse'}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-center text-[#121212] tracking-tight leading-tight mb-6 max-w-3xl mx-auto">
              {formData.title || 'Untitled Dispatch Headline'}
            </h1>

            {/* Description */}
            {formData.description && (
              <p className="font-serif italic text-center text-lg sm:text-xl text-[#5A5A5A] max-w-2xl mx-auto leading-relaxed mb-8">
                "{formData.description}"
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center justify-center space-x-4 text-xs text-[#7A7A7A] uppercase tracking-wider pb-8 mb-8 border-b border-[#E8E8E6]">
              <span className="text-[#121212] font-medium">By {formData.authorName || 'Staff Contributor'}</span>
              <span>&bull;</span>
              <span>Today</span>
              <span>&bull;</span>
              <span>{estimatedMins} min read</span>
            </div>

            {/* Featured Image */}
            {formData.image && (
              <div className="aspect-[16/9] overflow-hidden rounded-sm bg-neutral-100 mb-10">
                <img
                  src={formData.image}
                  alt={formData.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content with Drop Cap */}
            <div className="max-w-2xl mx-auto space-y-6 text-[#2D2D2D] font-serif text-lg leading-[1.8]">
              {formData.content ? (
                formData.content.split('\n\n').filter(p => p.trim()).map((p, i) => (
                  <p
                    key={i}
                    className={i === 0 ? "first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:text-[#121212]" : ""}
                  >
                    {p}
                  </p>
                ))
              ) : (
                <p className="italic text-[#8E8E8E] text-center">
                  Manuscript body is currently empty. Switch back to the 'Write' tab to compose your thoughts.
                </p>
              )}
            </div>

            {/* Return to Editor Button */}
            <div className="mt-12 pt-6 border-t border-[#E8E8E6] text-center">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className="bg-[#121212] text-white px-8 py-3 text-xs uppercase tracking-[0.2em] font-medium rounded-sm hover:bg-[#2A2A2A] transition"
              >
                Return to Editor & Publish
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default CreateBlog;
