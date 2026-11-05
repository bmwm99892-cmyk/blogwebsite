import { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ArrowUpRight, LogOut, PenLine, Sparkles, BookOpen } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Articles', path: '/blogs' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/about' },
  ];

  const scrollToNewsletter = () => {
    const element = document.getElementById('newsletter-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#newsletter-section');
    }
  };

  return (
    <>
      {/* Top Editorial Announcement Header */}
      <div className="bg-[#121212] text-[#B8B8B6] text-[10px] uppercase tracking-[0.28em] py-1.5 px-4 text-center border-b border-black hidden sm:flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Issue No. 42 &bull; Winter Anthology</span>
          </span>
          <span className="hidden md:inline font-serif italic normal-case tracking-normal text-xs text-neutral-400">
            Stories that inspire. Ideas that matter.
          </span>
          <div className="flex items-center space-x-4">
            <Link to="/categories" className="hover:text-white transition">Index</Link>
            <span>&bull;</span>
            <Link to="/about" className="hover:text-white transition">Masthead</Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E8E8E6] py-3.5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]'
            : 'bg-[#FAFAF8] border-b border-[#E8E8E6] py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Left: Brand Masthead */}
            <div className="flex items-center space-x-6">
              <Link
                to="/"
                className="group flex flex-col text-left focus:outline-none"
              >
                <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-[0.2em] uppercase text-[#121212] group-hover:opacity-85 transition-opacity">
                  THE JOURNAL
                </span>
                <span className="text-[9px] uppercase tracking-[0.35em] text-[#8E8E8E] font-sans -mt-0.5">
                  Editorial & Discourse
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-200 relative py-1 ${
                      isActive
                        ? 'text-[#121212] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#121212]'
                        : 'text-[#555555] hover:text-[#121212]'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              
              {/* Write Article Button (Always accessible so users can easily add blogs!) */}
              <Link
                to="/create-blog"
                className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-[0.18em] font-medium bg-white text-[#121212] border border-[#121212] hover:bg-[#121212] hover:text-white px-3 sm:px-3.5 py-1.5 rounded-sm transition duration-200 shadow-sm"
                title="Write a new story or essay"
              >
                <PenLine size={13} />
                <span className="hidden xs:inline">Write Article</span>
              </Link>

              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-[#4A4A4A] hover:text-[#121212] transition-colors focus:outline-none"
                aria-label="Search"
              >
                <Search size={17} strokeWidth={1.75} />
              </button>

              {/* User State */}
              {user ? (
                <div className="hidden sm:flex items-center space-x-2">
                  <span className="text-[11px] text-[#6B6B6B] max-w-[100px] truncate" title={user.name}>
                    {user.name}
                  </span>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 text-[#8E8E8E] hover:text-[#121212] transition"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-xs uppercase tracking-[0.18em] text-[#555555] hover:text-[#121212] transition font-medium"
                  >
                    Sign In
                  </Link>
                  <button
                    onClick={scrollToNewsletter}
                    className="bg-[#121212] text-[#FAFAF8] px-3.5 py-1.5 text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#2A2A2A] transition duration-200 rounded-sm flex items-center space-x-1 shadow-sm"
                  >
                    <span>Subscribe</span>
                    <ArrowUpRight size={13} className="opacity-80" />
                  </button>
                </div>
              )}

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#121212] hover:text-black focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar Drawer Overlay */}
        {searchOpen && (
          <div className="border-t border-[#E8E8E6] bg-[#FAFAF8] px-4 py-4 sm:px-6 transition-all duration-300">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search size={18} className="absolute left-3 text-[#8E8E8E]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles by keyword, category, or author..."
                  className="w-full pl-10 pr-24 py-2.5 bg-white border border-[#D5D5D2] rounded-sm text-sm text-[#121212] placeholder-[#8E8E8E] focus:outline-none focus:border-[#121212] transition"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#121212] text-white text-xs uppercase tracking-wider font-medium rounded-sm hover:bg-[#2E2E2E] transition"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="fixed inset-y-0 right-0 w-full max-w-xs bg-[#FAFAF8] shadow-2xl p-6 flex flex-col justify-between border-l border-[#E8E8E6]"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#E8E8E6]">
                <div>
                  <span className="font-serif text-xl font-bold tracking-[0.2em] uppercase text-[#121212]">
                    THE JOURNAL
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#121212] hover:bg-neutral-200/50 rounded-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="block text-sm uppercase tracking-[0.2em] font-medium text-[#121212] hover:text-[#6B6B6B] transition py-2"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/create-blog"
                  className="flex items-center space-x-2 text-sm uppercase tracking-[0.2em] font-medium text-emerald-800 py-2"
                >
                  <PenLine size={15} />
                  <span>Write New Story</span>
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-[#E8E8E6] space-y-3">
              {user ? (
                <>
                  <div className="text-xs text-[#6B6B6B] mb-2">Signed in as <span className="font-medium text-[#121212]">{user.name}</span></div>
                  <button
                    onClick={logout}
                    className="w-full text-center border border-[#D5D5D2] text-[#121212] py-2 text-xs uppercase tracking-widest font-medium rounded-sm"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full block text-center border border-[#121212] text-[#121212] py-2.5 text-xs uppercase tracking-widest font-medium rounded-sm hover:bg-[#121212] hover:text-white transition"
                  >
                    Sign In
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      scrollToNewsletter();
                    }}
                    className="w-full bg-[#121212] text-white py-2.5 text-xs uppercase tracking-widest font-medium rounded-sm hover:bg-[#2A2A2A] transition"
                  >
                    Subscribe to Journal
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
