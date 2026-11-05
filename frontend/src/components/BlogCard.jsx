import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Calendar } from 'lucide-react';

const BlogCard = ({ blog, variant = 'standard' }) => {
  if (!blog) return null;

  const formattedDate = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent';

  // Calculate estimated read time if not provided
  const readTime = blog.readTime || `${Math.max(3, Math.ceil((blog.content?.length || 500) / 400))} min read`;

  // Horizontal variant (for side featured stories)
  if (variant === 'horizontal') {
    return (
      <article className="group flex flex-col sm:flex-row gap-5 pb-6 border-b border-[#E8E8E6] last:border-b-0">
        <Link
          to={`/blogs/${blog._id}`}
          className="sm:w-1/3 aspect-[4/3] overflow-hidden bg-neutral-100 rounded-sm shrink-0 relative block"
        >
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>
        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8E8E8E] mb-2">
              <span className="text-[#121212]">{blog.category || 'Article'}</span>
              <span>&bull;</span>
              <span>{readTime}</span>
            </div>
            <Link to={`/blogs/${blog._id}`} className="block">
              <h4 className="font-serif text-lg font-medium text-[#121212] group-hover:text-[#555555] transition-colors leading-snug line-clamp-2">
                {blog.title}
              </h4>
            </Link>
          </div>
          <div className="flex items-center justify-between text-xs text-[#7A7A7A] mt-3">
            <span>By {blog.author?.name || 'Staff Writer'}</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </article>
    );
  }

  // Standard vertical card (for 3-column Latest Stories grid)
  return (
    <article className="group flex flex-col bg-transparent">
      {/* Image Preview Container */}
      <Link
        to={`/blogs/${blog._id}`}
        className="relative aspect-[16/10] overflow-hidden bg-neutral-100 rounded-sm mb-4 block"
      >
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] font-semibold text-[#121212] border border-neutral-200/60">
          {blog.category || 'General'}
        </div>
      </Link>

      {/* Meta Information Bar */}
      <div className="flex items-center space-x-3 text-[11px] text-[#7A7A7A] tracking-wider uppercase mb-2">
        <span>{formattedDate}</span>
        <span>&bull;</span>
        <span className="flex items-center">
          <Clock size={11} className="mr-1" />
          {readTime}
        </span>
      </div>

      {/* Title */}
      <Link to={`/blogs/${blog._id}`} className="block mb-2.5">
        <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#121212] group-hover:text-[#555555] transition-colors leading-snug line-clamp-2">
          {blog.title}
        </h3>
      </Link>

      {/* Description / Excerpt */}
      <p className="text-sm text-[#5A5A5A] line-clamp-3 leading-relaxed font-light mb-4 flex-grow">
        {blog.description}
      </p>

      {/* Author and Read Link */}
      <div className="pt-3 border-t border-[#E8E8E6] flex items-center justify-between text-xs">
        <span className="text-[#121212] font-medium tracking-wide">
          {blog.author?.name || 'Staff Writer'}
        </span>
        <Link
          to={`/blogs/${blog._id}`}
          className="inline-flex items-center space-x-1 text-[11px] uppercase tracking-[0.18em] font-medium text-[#121212] group-hover:text-black transition"
        >
          <span>Read Story</span>
          <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;
