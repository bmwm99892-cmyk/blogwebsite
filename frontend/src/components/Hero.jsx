import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Calendar, Sparkles } from 'lucide-react';

const Hero = ({ featuredStory }) => {
  // Use passed featured story or default editorial lead
  const story = featuredStory || {
    _id: "featured-1",
    title: "The Architecture of Silence: Designing Spaces in an Overstimulated World",
    description: "An exploration into contemporary minimalist architecture, examining how light, void, and tactile materiality shape modern human consciousness.",
    category: "Design",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    author: { name: "Julian Thorne" },
    createdAt: "2026-03-12T10:00:00.000Z",
    readTime: "7 min read"
  };

  const formattedDate = new Date(story.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <section className="relative overflow-hidden border-b border-[#E8E8E6] bg-[#FAFAF8] py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Asymmetrical Editorial Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Prominent Editorial Headline & Lead */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            
            {/* Volume / Issue Tag */}
            <div className="inline-flex items-center space-x-2 text-[11px] uppercase tracking-[0.25em] font-medium text-[#6B6B6B]">
              <span className="w-2 h-2 rounded-full bg-[#121212]"></span>
              <span>The Editorial Dispatch &bull; Vol. 14</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#121212] leading-[1.12]">
              Stories That Inspire. <br />
              <span className="italic font-light text-[#3A3A3A]">Ideas That Matter.</span>
            </h1>

            {/* Short Subtitle */}
            <p className="text-base sm:text-lg text-[#555555] font-light leading-relaxed max-w-lg">
              A curated digital publication exploring long-form journalism, spatial aesthetics, cultural philosophy, and emerging frontiers.
            </p>

            {/* Featured Article Mini Card in Hero */}
            <div className="pt-4 border-t border-[#E8E8E6] mt-4">
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#8E8E8E] block mb-2">
                Featured Cover Story
              </span>
              <Link 
                to={`/blogs/${story._id}`}
                className="group block"
              >
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#121212] group-hover:text-[#4A4A4A] transition-colors leading-snug line-clamp-2">
                  {story.title}
                </h3>
                <div className="flex items-center space-x-4 text-xs text-[#7A7A7A] mt-2.5">
                  <span className="font-medium text-[#121212]">{story.author?.name || 'Editorial Staff'}</span>
                  <span>&bull;</span>
                  <span className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {formattedDate}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center">
                    <Clock size={12} className="mr-1" />
                    {story.readTime || '6 min read'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to={`/blogs/${story._id}`}
                className="inline-flex items-center space-x-2 bg-[#121212] text-[#FAFAF8] px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#2A2A2A] transition-all rounded-sm shadow-sm group"
              >
                <span>Explore Stories</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/blogs"
                className="inline-flex items-center space-x-2 border border-[#D5D5D2] text-[#121212] px-5 py-3 text-xs uppercase tracking-[0.2em] font-medium hover:border-[#121212] transition-colors rounded-sm"
              >
                <span>Browse Archive</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero High-Res Editorial Photography with Asymmetric Layering */}
          <div className="lg:col-span-7">
            <Link 
              to={`/blogs/${story._id}`}
              className="group block relative overflow-hidden bg-neutral-100 rounded-sm"
            >
              <div className="aspect-[4/3] sm:aspect-[16/10] overflow-hidden">
                <img
                  src={story.image}
                  alt={story.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Minimalist Floating Overlay Pill */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-neutral-200/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] font-semibold text-[#121212]">
                {story.category || 'Featured'}
              </div>

              {/* Image Caption Bar */}
              <div className="p-4 bg-white border-t border-[#E8E8E6] flex items-center justify-between text-xs text-[#6B6B6B]">
                <span className="italic font-serif">Photograph: Editorial Collection 2026</span>
                <span className="group-hover:text-[#121212] transition-colors flex items-center font-medium">
                  Read Essay <ArrowRight size={12} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Hero;
