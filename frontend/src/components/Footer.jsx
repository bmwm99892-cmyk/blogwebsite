import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

const TwitterIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const InstagramIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#121212] text-[#FAFAF8] pt-20 pb-12 border-t border-[#242424]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-[#242424]">
          
          {/* Brand & Manifesto Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <Link to="/" className="inline-block focus:outline-none">
              <span className="font-serif text-3xl font-bold tracking-[0.2em] uppercase text-white">
                THE JOURNAL
              </span>
              <span className="block text-[10px] uppercase tracking-[0.35em] text-[#8E8E8E] font-sans mt-0.5">
                Editorial & Discourse
              </span>
            </Link>
            <p className="text-sm text-[#8E8E8E] font-light leading-relaxed max-w-sm">
              An independent editorial publication chronicling contemporary culture, architectural stillness, longform journalism, and timeless ideas.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-[#333333] flex items-center justify-center text-[#A8A8A5] hover:text-white hover:border-white transition-colors"
                aria-label="Twitter"
              >
                <TwitterIcon size={14} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-[#333333] flex items-center justify-center text-[#A8A8A5] hover:text-white hover:border-white transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon size={14} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-[#333333] flex items-center justify-center text-[#A8A8A5] hover:text-white hover:border-white transition-colors"
                aria-label="LinkedIn"
              >
                <LinkedinIcon size={14} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-[#333333] flex items-center justify-center text-[#A8A8A5] hover:text-white hover:border-white transition-colors"
                aria-label="GitHub"
              >
                <GithubIcon size={14} />
              </a>
            </div>
          </div>

          {/* Navigation Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-white">
              Publication
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8E8E8E] tracking-wider uppercase">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home Edition</Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-white transition-colors">All Articles</Link>
              </li>
              <li>
                <Link to="/blogs#categories" className="hover:text-white transition-colors">Index</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Masthead</Link>
              </li>
              <li>
                <Link to="/create-blog" className="hover:text-white transition-colors">Submissions</Link>
              </li>
            </ul>
          </div>

          {/* Categories Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-white">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8E8E8E] tracking-wider uppercase">
              <li>
                <Link to="/blogs?category=Design" className="hover:text-white transition-colors">Design</Link>
              </li>
              <li>
                <Link to="/blogs?category=Technology" className="hover:text-white transition-colors">Technology</Link>
              </li>
              <li>
                <Link to="/blogs?category=Business" className="hover:text-white transition-colors">Business</Link>
              </li>
              <li>
                <Link to="/blogs?category=Lifestyle" className="hover:text-white transition-colors">Lifestyle</Link>
              </li>
              <li>
                <Link to="/blogs?category=Travel" className="hover:text-white transition-colors">Travel</Link>
              </li>
              <li>
                <Link to="/blogs?category=Innovation" className="hover:text-white transition-colors">Innovation</Link>
              </li>
            </ul>
          </div>

          {/* Editorial Info / Issue Column (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-white">
              Print & Archives
            </h4>
            <p className="text-xs text-[#8E8E8E] font-light leading-relaxed">
              Printed quarterly on FSC-certified unbleached cotton paper. Worldwide dispatch from Zurich and New York.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-[#A8A8A5] border border-[#333333] px-3 py-1 rounded-sm">
                ISSN 2490-8832
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#666666] font-light space-y-4 sm:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} THE JOURNAL. All rights reserved. Designed for slow reading.
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/about" className="hover:text-[#999999] transition-colors">Editorial Code</Link>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center space-x-1 hover:text-white transition-colors ml-4"
              aria-label="Back to top"
            >
              <span>Back to Top</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
