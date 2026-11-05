import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Filter, ArrowRight } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import { EDITORIAL_ARTICLES } from '../data/editorialData';

const ALL_CATEGORIES = ['All', 'Technology', 'Business', 'Lifestyle', 'Design', 'Travel', 'Innovation'];

const Blogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // URL sync state
  const selectedCategory = searchParams.get('category') || 'All';
  const searchTerm = searchParams.get('search') || '';

  const [inputSearch, setInputSearch] = useState(searchTerm);

  useEffect(() => {
    setInputSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
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

  const handleCategoryChange = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    setSearchParams(params);
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

  // Filter client-side
  const filteredBlogs = blogs.filter(blog => {
    const matchesCategory = selectedCategory === 'All' || (blog.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      (blog.title || '').toLowerCase().includes(query) ||
      (blog.description || '').toLowerCase().includes(query) ||
      (blog.category || '').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#FAFAF8] min-h-screen pb-24">
      
      {/* Archive Header */}
      <section className="border-b border-[#E8E8E6] py-16 bg-[#F5F5F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#8E8E8E] block mb-3">
            The Journal Archives
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal text-[#121212] tracking-tight leading-tight mb-4">
            All Articles & Dispatches
          </h1>
          <p className="text-sm sm:text-base text-[#666666] font-light leading-relaxed">
            A comprehensive anthology of essays, architectural critiques, investigative journals, and human observations.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto mt-8 flex items-center bg-white border border-[#D5D5D2] rounded-sm p-1 focus-within:border-[#121212] transition">
            <Search size={16} className="text-[#8E8E8E] ml-3" />
            <input
              type="text"
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              placeholder="Search by keyword, subject, author..."
              className="w-full px-3 py-2 text-xs text-[#121212] placeholder-[#8E8E8E] bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#121212] text-white px-4 py-2 text-[11px] uppercase tracking-wider font-medium rounded-sm hover:bg-[#2A2A2A] transition"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Filter Bar */}
      <div id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center justify-between overflow-x-auto pb-4 border-b border-[#E8E8E6] scrollbar-none gap-2">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {ALL_CATEGORIES.map(cat => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`text-xs uppercase tracking-[0.2em] font-medium px-4 py-2 rounded-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#121212] text-white font-semibold'
                      : 'text-[#666666] hover:text-[#121212] hover:bg-neutral-200/50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-[#8E8E8E] tracking-wider uppercase whitespace-nowrap pl-4 hidden sm:block">
            {filteredBlogs.length} {filteredBlogs.length === 1 ? 'Article' : 'Articles'}
          </span>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {loading ? (
          <div className="text-center py-20 text-[#8E8E8E] text-xs uppercase tracking-widest">
            Compiling Editorial Archives...
          </div>
        ) : filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {filteredBlogs.map(blog => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-[#D5D5D2] rounded-sm p-12">
            <h3 className="font-serif text-2xl text-[#121212] mb-2">No Articles Found</h3>
            <p className="text-sm text-[#777777] mb-6">
              We couldn't find any essays matching "{searchTerm || selectedCategory}".
            </p>
            <button
              onClick={() => {
                setSearchParams({});
                setInputSearch('');
              }}
              className="bg-[#121212] text-white px-5 py-2.5 text-xs uppercase tracking-wider rounded-sm font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Blogs;
