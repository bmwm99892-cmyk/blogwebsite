import { Link } from 'react-router-dom';
import { ArrowUp, Mail } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/socialLinks';

const LinkedInIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GitHubIcon = ({ size = 15 }) => (
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
                Editorial & Discourse &bull; Engineered by Abdul Hanan
              </span>
            </Link>
            <p className="text-sm text-[#8E8E8E] font-light leading-relaxed max-w-sm">
              An independent editorial publication chronicling contemporary culture, architectural stillness, longform journalism, and software craftsmanship.
            </p>
            
            {/* Requirement 6: Social icons for GitHub, LinkedIn, Email */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href={SOCIAL_LINKS.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-[#333333] flex items-center justify-center text-[#A8A8A5] hover:text-white hover:border-white transition-colors"
                aria-label="LinkedIn Profile"
                title="LinkedIn Profile"
              >
                <LinkedInIcon size={15} />
              </a>
              <a
                href={SOCIAL_LINKS.gitHub}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-[#333333] flex items-center justify-center text-[#A8A8A5] hover:text-white hover:border-white transition-colors"
                aria-label="GitHub Profile"
                title="GitHub Profile"
              >
                <GitHubIcon size={15} />
              </a>
              <a
                href={SOCIAL_LINKS.mailto}
                className="w-9 h-9 rounded-full border border-[#333333] flex items-center justify-center text-[#A8A8A5] hover:text-white hover:border-white transition-colors"
                aria-label="Email Address"
                title="Direct Email Contact"
              >
                <Mail size={15} />
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
                <Link to="/categories" className="hover:text-white transition-colors">Categories</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">Masthead</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Categories Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-white">
              Taxonomy
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8E8E8E] tracking-wider uppercase">
              <li>
                <Link to="/categories?category=Design" className="hover:text-white transition-colors">Design</Link>
              </li>
              <li>
                <Link to="/categories?category=Technology" className="hover:text-white transition-colors">Technology</Link>
              </li>
              <li>
                <Link to="/categories?category=Business" className="hover:text-white transition-colors">Business</Link>
              </li>
              <li>
                <Link to="/categories?category=Lifestyle" className="hover:text-white transition-colors">Lifestyle</Link>
              </li>
              <li>
                <Link to="/categories?category=Travel" className="hover:text-white transition-colors">Travel</Link>
              </li>
            </ul>
          </div>

          {/* Direct Contact & Admin (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.25em] font-semibold text-white">
              Connect Directly
            </h4>
            <div className="space-y-1.5 text-xs text-[#8E8E8E]">
              <p className="text-white font-medium">Abdul Hanan</p>
              <a href={SOCIAL_LINKS.mailto} className="hover:text-white block transition text-[#A8A8A5]">
                {SOCIAL_LINKS.email}
              </a>
              <p className="text-[11px] pt-1 text-[#666666]">
                Available for engineering opportunities, writing commissions, and advisory.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/admin"
                className="inline-block text-[10px] uppercase tracking-[0.25em] text-[#A8A8A5] border border-[#333333] px-3 py-1.5 rounded-sm hover:border-white hover:text-white transition"
              >
                Admin Clearance Portal &rarr;
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#666666] font-light space-y-4 sm:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} THE JOURNAL. All rights reserved. Built with React & MongoDB.
          </div>
          <div className="flex items-center space-x-6">
            <a href={SOCIAL_LINKS.gitHub} target="_blank" rel="noopener noreferrer" className="hover:text-[#999999] transition">GitHub</a>
            <a href={SOCIAL_LINKS.linkedIn} target="_blank" rel="noopener noreferrer" className="hover:text-[#999999] transition">LinkedIn</a>
            <Link to="/contact" className="hover:text-[#999999] transition">Contact</Link>
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
