import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar, ArrowLeft, Share2, Check, Bookmark, Heart, Type } from 'lucide-react';
import Loader from '../components/Loader';
import BlogCard from '../components/BlogCard';
import { EDITORIAL_ARTICLES } from '../data/editorialData';

const TwitterIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const LinkedinIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(24);
  const [hasLiked, setHasLiked] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large'
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    // Scroll reading progress listener
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Check if it's one of the curated editorial articles
    const localMatch = EDITORIAL_ARTICLES.find(a => a._id === id || a.id?.toString() === id);
    if (localMatch) {
      setBlog(localMatch);
      setLoading(false);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    // Otherwise fetch from backend API
    axios.get(`/api/blogs/${id}`)
      .then(res => {
        if (res.data && res.data.title) {
          setBlog(res.data);
        } else {
          setBlog(EDITORIAL_ARTICLES[0]);
        }
      })
      .catch(() => {
        setBlog(EDITORIAL_ARTICLES[0]);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
    } else {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    }
  };

  if (loading) return <Loader />;
  if (!blog) return null;

  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent';

  const readTime = blog.readTime || `${Math.max(4, Math.ceil((blog.content?.length || 800) / 400))} min read`;
  const relatedArticles = EDITORIAL_ARTICLES.filter(a => a._id !== blog._id && a.id !== blog.id).slice(0, 3);
  const paragraphs = (blog.content || '').split('\n\n').filter(p => p.trim());

  return (
    <article className="bg-[#FAFAF8] min-h-screen pb-28 relative">
      
      {/* 1. Reading Progress Bar at the top */}
      <div
        className="fixed top-0 left-0 h-[2.5px] bg-[#121212] z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* 2. Top Breadcrumb & Return Link */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-6 flex items-center justify-between">
        <Link
          to="/blogs"
          className="inline-flex items-center space-x-2 text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] hover:text-[#121212] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Dispatches</span>
        </Link>
        <Link
          to={`/categories?category=${encodeURIComponent(blog.category || 'Design')}`}
          className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8E8E8E] hover:text-[#121212] transition"
        >
          Category: {blog.category || 'General'}
        </Link>
      </div>

      {/* 3. Editorial Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-4 pb-12">
        <div className="inline-block mb-4">
          <span className="text-[11px] uppercase tracking-[0.28em] font-semibold text-[#8E8E8E] border-b border-[#121212] pb-0.5">
            {blog.category || 'Discourse'}
          </span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-[#121212] tracking-tight leading-[1.12] mb-6 max-w-3xl mx-auto">
          {blog.title}
        </h1>

        {blog.description && (
          <p className="font-serif italic text-lg sm:text-xl text-[#5A5A5A] max-w-2xl mx-auto leading-relaxed mb-8">
            "{blog.description}"
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-[#E8E8E6] text-xs text-[#6B6B6B]">
          <div className="flex items-center space-x-3 text-left">
            <img
              src={blog.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
              alt={blog.author?.name || 'Author'}
              className="w-10 h-10 rounded-full object-cover grayscale"
            />
            <div>
              <span className="block font-medium text-[#121212] tracking-wider uppercase text-[11px]">
                {blog.author?.name || 'Julian Thorne'}
              </span>
              <span className="text-[10px] text-[#8E8E8E]">
                {blog.authorBio || 'Staff Essayist & Cultural Correspondent'}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-[#E8E8E6] hidden sm:block"></div>

          <div className="flex items-center space-x-4 tracking-wider uppercase text-[11px] text-[#7A7A7A]">
            <span className="flex items-center">
              <Calendar size={13} className="mr-1.5" />
              {formattedDate}
            </span>
            <span>&bull;</span>
            <span className="flex items-center">
              <Clock size={13} className="mr-1.5" />
              {readTime}
            </span>
          </div>
        </div>
      </header>

      {/* 4. Wide High-Res Featured Image */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
        <div className="aspect-[16/9] sm:aspect-[21/9] overflow-hidden bg-neutral-200 rounded-sm shadow-sm">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover object-center"
          />
        </div>
        <div className="pt-2 flex items-center justify-between text-[11px] text-[#8E8E8E] font-serif italic">
          <span>Archival Photography &bull; The Journal Collection</span>
          <span>Field: {blog.category || 'Editorial'}</span>
        </div>
      </div>

      {/* 5. Narrow Readable Content Column */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        {/* Floating Utility Toolbar: Typography Adjuster, Like, Bookmark & Share */}
        <div className="flex items-center justify-between pb-6 mb-10 border-b border-[#E8E8E6] text-xs text-[#7A7A7A]">
          
          {/* Font Resizer */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-wider text-[#8E8E8E]">Type:</span>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-0.5 text-xs rounded-sm transition ${
                fontSize === 'normal' ? 'bg-[#121212] text-white font-medium' : 'text-[#666666] hover:text-black'
              }`}
            >
              18px
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-0.5 text-xs rounded-sm transition ${
                fontSize === 'large' ? 'bg-[#121212] text-white font-medium' : 'text-[#666666] hover:text-black'
              }`}
            >
              22px
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 px-3 py-1.5 border rounded-sm transition text-xs ${
                hasLiked ? 'border-red-500 text-red-600 bg-red-50' : 'border-[#E8E8E6] hover:border-[#121212] text-[#121212]'
              }`}
              title="Applaud essay"
            >
              <Heart size={13} className={hasLiked ? 'fill-current text-red-500' : ''} />
              <span>{likes}</span>
            </button>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-1.5 border rounded-sm transition ${
                isBookmarked ? 'border-[#121212] bg-[#121212] text-white' : 'border-[#E8E8E6] hover:border-[#121212] text-[#121212]'
              }`}
              title="Bookmark story"
            >
              <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 border border-[#E8E8E6] rounded-sm hover:border-[#121212] text-[#121212] transition"
              title="Copy Story Link"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 border border-[#E8E8E6] rounded-sm hover:border-[#121212] text-[#121212] transition"
              title="Share on Twitter"
            >
              <TwitterIcon size={14} />
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 border border-[#E8E8E6] rounded-sm hover:border-[#121212] text-[#121212] transition"
              title="Share on LinkedIn"
            >
              <LinkedinIcon size={14} />
            </a>
          </div>
        </div>

        {/* Formatted Article Body */}
        <div className={`space-y-6 text-[#2B2B2B] font-serif leading-[1.8] font-normal transition-all ${
          fontSize === 'large' ? 'text-xl sm:text-2xl leading-[1.85]' : 'text-lg sm:text-xl leading-[1.8]'
        }`}>
          {paragraphs.map((p, index) => {
            if (index === 0) {
              return (
                <p key={index} className="first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:text-[#121212] text-[#1C1C1C]">
                  {p}
                </p>
              );
            }

            if (index === 2) {
              return (
                <div key={index}>
                  <blockquote className="my-10 py-6 border-y border-[#121212] text-center px-4">
                    <p className="font-serif italic text-2xl sm:text-3xl text-[#121212] leading-snug">
                      “True modern luxury is not acreage or ornament. It is silence, preserved in the shadows between walls.”
                    </p>
                  </blockquote>
                  <p>{p}</p>
                </div>
              );
            }

            return <p key={index}>{p}</p>;
          })}
        </div>

        {/* Author Bio Box */}
        <div className="mt-16 p-8 bg-white border border-[#E8E8E6] rounded-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={blog.authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
            alt={blog.author?.name || 'Author'}
            className="w-16 h-16 rounded-full object-cover grayscale shrink-0"
          />
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8E8E8E] font-semibold block">
              About the Contributor
            </span>
            <h4 className="font-serif text-xl font-normal text-[#121212]">
              {blog.author?.name || 'Julian Thorne'}
            </h4>
            <p className="text-xs text-[#666666] leading-relaxed font-light">
              Senior writer and architectural commentator. Based between New York and Copenhagen, writing on the intersection of minimal form, neurological well-being, and material culture.
            </p>
          </div>
        </div>

      </div>

      {/* 6. Related Articles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-16 border-t border-[#E8E8E6]">
        <div className="flex items-center justify-between mb-10 pb-4 border-b border-[#E8E8E6]">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#121212]">
            Further Reading &bull; Related Dispatches
          </span>
          <Link
            to="/blogs"
            className="text-xs uppercase tracking-[0.2em] font-medium text-[#7A7A7A] hover:text-[#121212] transition"
          >
            All Stories
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedArticles.map(item => (
            <BlogCard key={item._id} blog={item} />
          ))}
        </div>
      </section>

    </article>
  );
};

export default BlogDetails;
