import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import {
  Clock, Calendar, ArrowLeft, Share2, Check, Bookmark, Heart,
  Eye, MessageSquare, Send, CornerDownRight, Trash2, Edit2, X, AlertCircle
} from 'lucide-react';
import Loader from '../components/Loader';
import BlogCard from '../components/BlogCard';
import { AuthContext } from '../context/AuthContext';
import { EDITORIAL_ARTICLES } from '../data/editorialData';
import { SOCIAL_LINKS } from '../data/socialLinks';

const LinkedInIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const BlogDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Interaction States (Views, Likes, Comments)
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // commentId
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');

  const viewRecordedRef = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    viewRecordedRef.current = false;

    // Scroll reading progress listener
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);

    // Fetch blog details
    const token = localStorage.getItem('token');
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    axios.get(`/api/blogs/${id}`)
      .then(res => {
        if (res.data && res.data.title) {
          setBlog(res.data);
          setViews(res.data.views || 0);
          setLikes(res.data.likes || 0);
        } else {
          fallbackToLocal();
        }
      })
      .catch(() => {
        fallbackToLocal();
      })
      .finally(() => {
        setLoading(false);
      });

    // Check likes status
    axios.get(`/api/blogs/${id}/likes`, { headers: authHeader })
      .then(res => {
        setLikes(res.data.likes || 0);
        setHasLiked(res.data.hasLiked || false);
      })
      .catch(() => {});

    // Fetch comments
    loadComments();

    // Trigger View increment once per page load
    if (!viewRecordedRef.current) {
      viewRecordedRef.current = true;
      axios.post(`/api/blogs/${id}/view`)
        .then(res => {
          if (res.data?.views) setViews(res.data.views);
        })
        .catch(() => {});
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);

  const fallbackToLocal = () => {
    const match = EDITORIAL_ARTICLES.find(a => a._id === id || a.id?.toString() === id);
    const selected = match || EDITORIAL_ARTICLES[0];
    setBlog(selected);
    setViews(selected.views || 120);
    setLikes(selected.likes || 24);
  };

  const loadComments = () => {
    axios.get(`/api/blogs/${id}/comments`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setComments(res.data);
        }
      })
      .catch(() => setComments([]));
  };

  // Like & Unlike Handler
  const handleLikeToggle = async () => {
    if (!user) {
      alert('Please sign in to like this essay.');
      return;
    }
    if (likeLoading) return;

    setLikeLoading(true);
    // Optimistic UI update
    const previousLiked = hasLiked;
    const previousCount = likes;
    setHasLiked(!previousLiked);
    setLikes(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/blogs/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasLiked(res.data.hasLiked);
      setLikes(res.data.likes);
    } catch (err) {
      // Revert on error
      setHasLiked(previousLiked);
      setLikes(previousCount);
    } finally {
      setLikeLoading(false);
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to post a comment.');
      return;
    }

    setCommentSubmitting(true);
    try {
      await axios.post(`/api/blogs/${id}/comments`, { content: newComment.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment('');
      loadComments();
    } catch (err) {
      alert(err.response?.data?.error || 'Error posting comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Add Reply
  const handleAddReply = async (parentCommentId) => {
    if (!replyText.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to reply.');
      return;
    }

    try {
      await axios.post(`/api/comments/${parentCommentId}/replies`, { content: replyText.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReplyingTo(null);
      setReplyText('');
      loadComments();
    } catch (err) {
      alert(err.response?.data?.error || 'Error posting reply.');
    }
  };

  // Edit Comment
  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;
    const token = localStorage.getItem('token');

    try {
      await axios.put(`/api/comments/${commentId}`, { content: editText.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingCommentId(null);
      setEditText('');
      loadComments();
    } catch (err) {
      alert(err.response?.data?.error || 'Error editing comment.');
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    const token = localStorage.getItem('token');

    try {
      await axios.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadComments();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting comment.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      
      {/* 1. Reading Progress Bar */}
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
          Taxonomy: {blog.category || 'General'}
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

        {/* Metadata Strip: Author, Date, Reading Time, Live Views */}
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
            <span>&bull;</span>
            <span className="flex items-center text-[#121212] font-semibold" title="Total Real Views">
              <Eye size={13} className="mr-1 text-[#8E8E8E]" />
              {views} views
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
          <span>Views: {views} &bull; Likes: {likes}</span>
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

          {/* Actions: Real Like Button, Bookmark, Share */}
          <div className="flex items-center space-x-2.5">
            {/* Functional Like / Unlike Button */}
            <button
              onClick={handleLikeToggle}
              disabled={likeLoading}
              className={`flex items-center space-x-1.5 px-3 py-1.5 border rounded-sm transition text-xs font-medium ${
                hasLiked
                  ? 'border-red-500 text-red-600 bg-red-50'
                  : 'border-[#E8E8E6] hover:border-[#121212] text-[#121212] bg-white'
              }`}
              title={user ? (hasLiked ? "Unlike essay" : "Like essay") : "Sign in to like"}
            >
              <Heart size={14} className={hasLiked ? 'fill-current text-red-500' : ''} />
              <span>{likes}</span>
            </button>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-1.5 border rounded-sm transition ${
                isBookmarked ? 'border-[#121212] bg-[#121212] text-white' : 'border-[#E8E8E6] hover:border-[#121212] text-[#121212] bg-white'
              }`}
              title="Bookmark story"
            >
              <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 border border-[#E8E8E6] rounded-sm hover:border-[#121212] text-[#121212] bg-white transition"
              title="Copy Story Link"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            </button>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 border border-[#E8E8E6] rounded-sm hover:border-[#121212] text-[#121212] bg-white transition"
              title="Share on Twitter"
            >
              <TwitterIcon size={14} />
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 border border-[#E8E8E6] rounded-sm hover:border-[#121212] text-[#121212] bg-white transition"
              title="Share on LinkedIn"
            >
              <LinkedInIcon size={14} />
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
              Senior contributor writing for THE JOURNAL on spatial stillness, computational biology, and enduring culture.
            </p>
          </div>
        </div>

        {/* ==================== 6. COMPLETE COMMENT SYSTEM ==================== */}
        <section id="comments-section" className="mt-20 pt-12 border-t border-[#E8E8E6]">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <MessageSquare size={18} className="text-[#121212]" />
              <h3 className="font-serif text-2xl font-normal text-[#121212]">
                Dialogue & Discourse
              </h3>
            </div>
            <span className="text-xs uppercase tracking-wider text-[#7A7A7A] font-medium">
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </span>
          </div>

          {/* New Comment Box */}
          {user ? (
            <form onSubmit={handleAddComment} className="mb-12 bg-white border border-[#E8E8E6] p-5 rounded-sm shadow-sm">
              <div className="text-xs text-[#7A7A7A] mb-2 font-medium">
                Signed in as <span className="text-[#121212] font-semibold">{user.name}</span>
              </div>
              <textarea
                rows={3}
                required
                placeholder="Share your perspective or critique..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 bg-[#FAFAF8] border border-[#D5D5D2] rounded-sm text-sm text-[#121212] placeholder-[#A0A0A0] focus:outline-none focus:border-[#121212] focus:bg-white transition font-serif leading-relaxed mb-3"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="inline-flex items-center space-x-1.5 bg-[#121212] text-white px-5 py-2 text-xs uppercase tracking-[0.18em] font-medium rounded-sm hover:bg-[#2A2A2A] transition"
                >
                  <span>{commentSubmitting ? 'Posting...' : 'Post Comment'}</span>
                  <Send size={12} />
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-12 p-6 bg-white border border-[#E8E8E6] rounded-sm text-center">
              <p className="font-serif italic text-sm text-[#555555] mb-3">
                "Dialogue flourishes when voices identify themselves."
              </p>
              <Link
                to="/login"
                className="inline-block border border-[#121212] text-[#121212] px-5 py-2 text-xs uppercase tracking-[0.18em] font-medium rounded-sm hover:bg-[#121212] hover:text-white transition"
              >
                Sign In to Join Conversation
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#8E8E8E] font-serif italic border border-dashed border-[#D5D5D2] p-6 rounded-sm">
                No comments posted yet. Be the first to share an insight.
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="bg-white border border-[#E8E8E6] p-5 rounded-sm">
                  
                  {/* Top: User info & Actions */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#121212] text-white flex items-center justify-center text-[10px] uppercase font-bold">
                        {(comment.user?.name || 'A')[0]}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#121212] block">
                          {comment.user?.name || 'Reader'}
                        </span>
                        <span className="text-[10px] text-[#8E8E8E]">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Edit / Delete Buttons if own comment or admin */}
                    {user && (user._id === comment.user?._id || user.id === comment.user?._id || user.role === 'admin') && (
                      <div className="flex items-center space-x-2 text-[11px] text-[#8E8E8E]">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment._id);
                            setEditText(comment.content);
                          }}
                          className="hover:text-[#121212] transition p-1"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="hover:text-red-600 transition p-1"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Body */}
                  {editingCommentId === comment._id ? (
                    <div className="my-3 space-y-2">
                      <textarea
                        rows={2}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2.5 text-xs bg-[#FAFAF8] border border-[#D5D5D2] rounded-sm focus:outline-none"
                      />
                      <div className="flex items-center space-x-2 justify-end">
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="px-3 py-1 text-[11px] border rounded-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(comment._id)}
                          className="px-3 py-1 text-[11px] bg-[#121212] text-white rounded-sm"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#2B2B2B] font-serif leading-relaxed my-2 pl-9">
                      {comment.content}
                    </p>
                  )}

                  {/* Reply Button Trigger */}
                  <div className="pl-9 pt-1 flex items-center space-x-4 text-[11px]">
                    <button
                      onClick={() => {
                        setReplyingTo(replyingTo === comment._id ? null : comment._id);
                        setReplyText('');
                      }}
                      className="text-[#666666] hover:text-[#121212] font-medium flex items-center space-x-1"
                    >
                      <CornerDownRight size={12} />
                      <span>{replyingTo === comment._id ? 'Cancel Reply' : 'Reply'}</span>
                    </button>
                  </div>

                  {/* Reply Input Box */}
                  {replyingTo === comment._id && (
                    <div className="mt-3 ml-9 p-3 bg-[#FAFAF8] border border-[#E8E8E6] rounded-sm animate-fadeIn">
                      <textarea
                        rows={2}
                        placeholder={`Reply to ${comment.user?.name}...`}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full p-2 text-xs bg-white border border-[#D5D5D2] rounded-sm focus:outline-none mb-2"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleAddReply(comment._id)}
                          className="bg-[#121212] text-white px-3 py-1 text-[10px] uppercase tracking-wider rounded-sm"
                        >
                          Submit Reply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-9 space-y-3 pt-3 border-t border-[#F0F0ED]">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="bg-[#FAFAF8] p-3 rounded-sm border border-[#E8E8E6]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-[#121212]">
                              {reply.user?.name || 'Reader'}
                            </span>
                            <span className="text-[9px] text-[#8E8E8E]">
                              {new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-xs text-[#333333] font-serif leading-relaxed">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </section>

      </div>

      {/* 7. Related Articles Section */}
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
