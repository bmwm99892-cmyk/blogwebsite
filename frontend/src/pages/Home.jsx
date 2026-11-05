import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Hero from '../components/Hero';
import FeaturedArticlesSection from '../components/FeaturedArticlesSection';
import CategoriesSection from '../components/CategoriesSection';
import BlogCard from '../components/BlogCard';
import Newsletter from '../components/Newsletter';
import { EDITORIAL_ARTICLES } from '../data/editorialData';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/blogs')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          // Merge or prioritize backend articles, fill with editorial articles if needed
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
      .catch(err => {
        console.error('Fetching blogs fallback to editorial collection:', err);
        setBlogs(EDITORIAL_ARTICLES);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Split content:
  // Hero takes primary lead
  const heroStory = blogs[0] || EDITORIAL_ARTICLES[0];
  // Featured Section takes the next 3 stories
  const featuredStories = blogs.slice(1, 4).length >= 3 ? blogs.slice(1, 4) : EDITORIAL_ARTICLES.slice(0, 3);
  // Latest Stories takes remaining stories (or a curated grid of 6)
  const latestStories = blogs.length > 3 ? blogs.slice(3, 9) : EDITORIAL_ARTICLES.slice(1);

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      
      {/* 1. Asymmetrical Editorial Hero */}
      <Hero featuredStory={heroStory} />

      {/* 2. Featured Magazine Articles (1 large + 2 side cards) */}
      <FeaturedArticlesSection articles={featuredStories} />

      {/* 3. Thematic Categories Section */}
      <CategoriesSection />

      {/* 4. Latest Stories Section (3 Columns Editorial Grid) */}
      <section className="py-24 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 pb-4 border-b border-[#E8E8E6]">
            <div>
              <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#8E8E8E] block mb-2">
                Chronicled Perspectives
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#121212] tracking-tight">
                Latest Dispatches & Essays
              </h2>
            </div>
            <Link
              to="/blogs"
              className="mt-3 sm:mt-0 inline-flex items-center space-x-1.5 text-xs uppercase tracking-[0.2em] font-medium text-[#121212] hover:text-[#555555] transition"
            >
              <span>Explore All Archives</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* 3 Columns Desktop / 2 Tablets / 1 Mobile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {latestStories.map((story) => (
              <BlogCard key={story._id} blog={story} />
            ))}
          </div>

          {/* Centered Browse More Button */}
          <div className="text-center mt-16 pt-8 border-t border-[#E8E8E6]">
            <Link
              to="/blogs"
              className="inline-flex items-center space-x-2 bg-transparent border border-[#121212] text-[#121212] px-8 py-3.5 text-xs uppercase tracking-[0.22em] font-medium hover:bg-[#121212] hover:text-white transition-all rounded-sm"
            >
              <span>View Full Edition Archive</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </section>

      {/* 5. Newsletter Subscription */}
      <Newsletter />

    </div>
  );
};

export default Home;
