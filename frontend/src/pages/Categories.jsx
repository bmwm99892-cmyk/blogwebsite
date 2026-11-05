import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, ArrowRight, BookOpen, Layers, PenLine, Sparkles } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import { EDITORIAL_ARTICLES, CATEGORIES } from '../data/editorialData';

const ALL_CATEGORY_NAMES = ['All', 'Technology', 'Business', 'Lifestyle', 'Design', 'Travel', 'Innovation'];

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('category') || 'All';
  const searchTerm = searchParams.get('search') || '';
  const [inputSearch, setInputSearch] = useState(searchTerm);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    axios.get('/api/blogs')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const combined = [...res.data];
          EDITORIAL_ARTICLES.forEach(art => {
            if (!combined.some(b => b.title === art.title)) {
              combined.push(art);
            }
          });
          setBlogs(combined);
        } else {
          setBlogs(EDITORIAL_ARTICLES);
        }
      })
      .catch(() => {
        setBlogs(EDITORIAL_ARTICLES);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSelectCategory = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    setSearchParams(params);
    // Smooth scroll down to filtered section
    const listElement = document.getElementById('category-dispatches');
    if (listElement) {
      listElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (inputSearch.trim()) {
      params.set('search', inputSearch.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  // Filtered stories
  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = selectedCategory === 'All' || (blog.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (blog.title || '').toLowerCase().includes(query) ||
      (blog.description || '').toLowerCase().includes(query) ||
      (blog.category || '').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Calculate live counts per category
  const getCategoryCount = (categoryName) => {
    if (categoryName === 'All') return blogs.length;
    return blogs.filter(b => (b.category || '').toLowerCase() === categoryName.toLowerCase()).length;
  };

  return (
    <div className="bg-[#FAFAF8] min-h-screen pb-28">
      
      {/* 1. Header Section */}
      <section className="py-20 border-b border-[#E8E8E6] bg-[#F5F5F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <div className="inline-flex items-center space-x-2 text-[11px] uppercase tracking-[0.28em] font-semibold text-[#8E8E8E] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#121212]"></span>
            <span>Thematic Archives & Index</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#121212] tracking-tight leading-tight mb-5">
            Curated Categories
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-[#5A5A5A] max-w-2xl mx-auto leading-relaxed">
            "Every discipline holds its own dialect. Explore our ongoing inquiry into spatial aesthetics, technological paradigms, and mindful living."
          </p>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-[#7A7A7A] uppercase tracking-widest font-medium">
            <span>6 Curated Fields</span>
            <span>&bull;</span>
            <span>{blogs.length} Longform Essays</span>
            <span>&bull;</span>
            <span>Zero Algorithmic Curation</span>
          </div>
        </div>
      </section>

      {/* 2. Visual Category Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#E8E8E6]">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#121212]">
            Select a Taxonomy
          </span>
          <span className="text-xs text-[#8E8E8E] font-serif italic">
            Click any field to view corresponding dispatches
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const isCurrent = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const liveCount = getCategoryCount(cat.name);

            return (
              <div
                key={cat.name}
                onClick={() => handleSelectCategory(cat.name)}
                className={`group relative overflow-hidden p-8 rounded-sm cursor-pointer transition-all duration-300 flex flex-col justify-between h-72 border ${
                  isCurrent
                    ? 'border-[#121212] bg-[#121212] text-white shadow-md'
                    : 'border-[#E8E8E6] bg-white hover:border-[#121212]'
                }`}
              >
                {/* Background image subtle overlay */}
                <div className={`absolute inset-0 transition-opacity duration-700 ${
                  isCurrent ? 'opacity-20' : 'opacity-10 group-hover:opacity-20'
                }`}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover grayscale"
                  />
                </div>

                {/* Top: Metadata */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className={`text-[10px] uppercase tracking-[0.25em] font-semibold ${
                    isCurrent ? 'text-neutral-300' : 'text-[#7A7A7A] group-hover:text-[#121212]'
                  }`}>
                    {liveCount} {liveCount === 1 ? 'Dispatch' : 'Dispatches'}
                  </span>
                  <span className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'border-white text-white bg-white/10'
                      : 'border-[#D5D5D2] text-[#121212] group-hover:bg-[#121212] group-hover:text-white group-hover:border-[#121212]'
                  }`}>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>

                {/* Bottom: Title & Description */}
                <div className="relative z-10 space-y-2">
                  <h3 className={`font-serif text-3xl font-normal transition-transform group-hover:translate-x-0.5 ${
                    isCurrent ? 'text-white' : 'text-[#121212]'
                  }`}>
                    {cat.name}
                  </h3>
                  <p className={`text-xs font-light line-clamp-2 leading-relaxed ${
                    isCurrent ? 'text-neutral-300' : 'text-[#555555]'
                  }`}>
                    {cat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Filtered Articles Dispatches Section */}
      <section id="category-dispatches" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Filter Navigation Bar & Search */}
        <div className="bg-white border border-[#E8E8E6] p-6 rounded-sm mb-12 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Category Pills */}
            <div className="flex items-center overflow-x-auto pb-2 lg:pb-0 gap-2 scrollbar-none">
              {ALL_CATEGORY_NAMES.map((cat) => {
                const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className={`text-xs uppercase tracking-[0.2em] font-medium px-4 py-2.5 rounded-sm transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#121212] text-white font-semibold shadow-sm'
                        : 'text-[#666666] hover:text-[#121212] hover:bg-[#FAFAF8]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex items-center border border-[#D5D5D2] rounded-sm p-1 focus-within:border-[#121212] transition bg-[#FAFAF8] w-full lg:w-72">
              <Search size={15} className="text-[#8E8E8E] ml-2.5" />
              <input
                type="text"
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                placeholder="Search in this archive..."
                className="w-full px-2.5 py-1.5 text-xs text-[#121212] placeholder-[#8E8E8E] bg-transparent focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#121212] text-white px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium rounded-sm hover:bg-[#2A2A2A] transition"
              >
                Go
              </button>
            </form>

          </div>
        </div>

        {/* Section Title & Article Count */}
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#E8E8E6]">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#121212]">
              {selectedCategory === 'All' ? 'All Curated Dispatches' : `${selectedCategory} Articles`}
            </h2>
            <span className="text-xs text-[#7A7A7A] uppercase tracking-wider mt-1 block">
              Showing {filteredBlogs.length} {filteredBlogs.length === 1 ? 'Dispatch' : 'Dispatches'}
            </span>
          </div>

          <Link
            to={`/create-blog?category=${encodeURIComponent(selectedCategory === 'All' ? 'Design' : selectedCategory)}`}
            className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest font-medium text-[#121212] border border-[#121212] px-4 py-2 rounded-sm hover:bg-[#121212] hover:text-white transition"
          >
            <PenLine size={13} />
            <span>Contribute to {selectedCategory === 'All' ? 'Archive' : selectedCategory}</span>
          </Link>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="text-center py-20 text-xs uppercase tracking-widest text-[#8E8E8E]">
            Loading category archives...
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-[#E8E8E6] rounded-sm p-10">
            <h3 className="font-serif text-2xl text-[#121212] mb-2">No Articles Found</h3>
            <p className="text-xs text-[#777777] mb-6 max-w-sm mx-auto">
              There are currently no published essays matching "{searchTerm || selectedCategory}".
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setSearchParams({});
                  setInputSearch('');
                }}
                className="border border-[#D5D5D2] text-[#121212] px-5 py-2.5 text-xs uppercase tracking-wider rounded-sm font-medium hover:border-[#121212] transition"
              >
                Clear Filter
              </button>
              <Link
                to={`/create-blog?category=${encodeURIComponent(selectedCategory === 'All' ? 'Design' : selectedCategory)}`}
                className="bg-[#121212] text-white px-5 py-2.5 text-xs uppercase tracking-wider rounded-sm font-medium hover:bg-[#2A2A2A] transition"
              >
                Publish First Story
              </Link>
            </div>
          </div>
        )}

      </section>

    </div>
  );
};

export default Categories;

