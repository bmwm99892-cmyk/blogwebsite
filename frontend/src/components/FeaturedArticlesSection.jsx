import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, Calendar } from 'lucide-react';
import BlogCard from './BlogCard';

const FeaturedArticlesSection = ({ articles = [] }) => {
  if (!articles || articles.length === 0) return null;

  // Split into 1 primary lead + 2 secondary stories
  const primary = articles[0];
  const secondaries = articles.slice(1, 3);

  const formattedDate = primary.createdAt
    ? new Date(primary.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recent';

  const primaryReadTime = primary.readTime || `${Math.max(4, Math.ceil((primary.content?.length || 600) / 400))} min read`;

  return (
    <section className="py-20 bg-[#FAFAF8] border-b border-[#E8E8E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12 pb-4 border-b border-[#E8E8E6]">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-[1.5px] bg-[#121212]"></span>
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#121212]">
              Editor's Selection
            </span>
          </div>
          <Link
            to="/blogs"
            className="text-xs uppercase tracking-[0.2em] font-medium text-[#6B6B6B] hover:text-[#121212] transition-colors flex items-center space-x-1"
          >
            <span>View All Stories</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* Magazine Asymmetrical Split: 1 Big Featured + 2 Smaller Horizontal Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Main Large Featured Article (7 cols) */}
          <article className="lg:col-span-7 group flex flex-col justify-between">
            <div>
              <Link
                to={`/blogs/${primary._id}`}
                className="relative aspect-[16/10] overflow-hidden bg-neutral-100 rounded-sm mb-6 block"
              >
                <img
                  src={primary.image}
                  alt={primary.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-neutral-200/80 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold text-[#121212]">
                  {primary.category || 'Featured Essay'}
                </div>
              </Link>

              <div className="flex items-center space-x-3 text-xs text-[#7A7A7A] uppercase tracking-wider mb-3">
                <span>By {primary.author?.name || 'Staff Editor'}</span>
                <span>&bull;</span>
                <span>{formattedDate}</span>
                <span>&bull;</span>
                <span className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {primaryReadTime}
                </span>
              </div>

              <Link to={`/blogs/${primary._id}`} className="block mb-4">
                <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#121212] group-hover:text-[#4A4A4A] transition-colors leading-[1.2]">
                  {primary.title}
                </h3>
              </Link>

              <p className="text-sm sm:text-base text-[#555555] font-light leading-relaxed mb-6">
                {primary.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[#E8E8E6] flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#8E8E8E] font-medium">
                Longform Reading
              </span>
              <Link
                to={`/blogs/${primary._id}`}
                className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-[0.18em] font-medium text-[#121212] group-hover:text-black transition"
              >
                <span>Full Story</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </article>

          {/* Side Articles Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8 lg:border-l lg:border-[#E8E8E6] lg:pl-10">
            <div className="space-y-8">
              <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-[#8E8E8E]">
                Must-Read Dispatches
              </div>
              {secondaries.map((story) => (
                <BlogCard key={story._id} blog={story} variant="horizontal" />
              ))}
            </div>

            {/* Editorial Quote Box */}
            <div className="p-6 bg-white border border-[#E8E8E6] rounded-sm mt-6">
              <span className="font-serif text-3xl text-[#B8B8B6] block leading-none mb-2">“</span>
              <p className="font-serif text-base italic text-[#2D2D2D] leading-relaxed mb-3">
                The essence of great editorial prose is not to dazzle with complexity, but to reveal what was previously unseen in the familiar.
              </p>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#7A7A7A] block">
                The Journal &bull; Editorial Manifesto
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default FeaturedArticlesSection;

