import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/editorialData';
import { ArrowRight, Layers } from 'lucide-react';

const CategoriesSection = () => {
  return (
    <section id="categories-section" className="py-24 bg-white border-y border-[#E8E8E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 pb-4 border-b border-[#E8E8E6]">
          <div>
            <div className="inline-flex items-center space-x-2 text-[11px] uppercase tracking-[0.25em] font-semibold text-[#8E8E8E] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#121212]"></span>
              <span>Curated Thematic Taxonomy</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#121212] tracking-tight">
              Explore by Category
            </h2>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link
              to="/categories"
              className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-[0.2em] font-medium text-[#121212] hover:text-[#555555] transition"
            >
              <span>Full Category Index</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Minimalist Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/categories?category=${encodeURIComponent(cat.name)}`}
              className="group relative overflow-hidden bg-[#FAFAF8] border border-[#E8E8E6] p-8 rounded-sm hover:border-[#121212] transition-all duration-300 flex flex-col justify-between h-64 hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]"
            >
              {/* Subtle background photo overlay with fade */}
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Top: Category Meta & Arrow */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#7A7A7A] group-hover:text-[#121212] transition-colors">
                  {cat.count}
                </span>
                <span className="w-8 h-8 rounded-full border border-[#D5D5D2] flex items-center justify-center text-[#121212] group-hover:bg-[#121212] group-hover:text-white group-hover:border-[#121212] transition-all">
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              {/* Bottom: Title & Description */}
              <div className="relative z-10">
                <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#121212] mb-2 group-hover:translate-x-1 transition-transform">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#555555] font-light line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategoriesSection;
