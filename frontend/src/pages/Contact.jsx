import { useState } from 'react';
import axios from 'axios';
import { Mail, Send, Check, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/socialLinks';

const LinkedInIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GitHubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Submits to backend API, saving message directly into database
      await axios.post('/api/contact', formData);
      setStatus({
        type: 'success',
        message: 'Your message has been received and archived in our database. We will reply shortly.'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        message: err.response?.data?.error || 'Unable to record message at this moment. You may email directly.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FAFAF8] min-h-screen pb-24">
      
      {/* Editorial Header */}
      <section className="py-20 border-b border-[#E8E8E6] bg-[#F5F5F2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#8E8E8E] block mb-3">
            Inquiries & Correspondence
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#121212] tracking-tight leading-tight mb-5">
            Get in Touch
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-[#5A5A5A] max-w-2xl mx-auto leading-relaxed">
            "Whether discussing an editorial submission, engineering collaboration, or general inquiry, we welcome direct dialogue."
          </p>
        </div>
      </section>

      {/* Main Grid: Info + Contact Form */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Direct Contact Info & Social Action Buttons */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E8E8E] block mb-2">
                Primary Contributor
              </span>
              <h2 className="font-serif text-3xl font-normal text-[#121212] mb-3">
                Abdul Hanan
              </h2>
              <p className="text-sm text-[#666666] leading-relaxed font-light">
                Full-Stack Engineer & Editor in Chief. Based in Pakistan, collaborating globally across digital design, cloud architectures, and publishing platforms.
              </p>
            </div>

            {/* Direct Email Display & Functional Buttons (Requirement 5) */}
            <div className="p-6 bg-white border border-[#E8E8E6] rounded-sm space-y-5 shadow-sm">
              <div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#8E8E8E] font-semibold block mb-1">
                  Direct Email Address
                </span>
                <span className="text-sm sm:text-base font-medium text-[#121212] break-all select-all">
                  {SOCIAL_LINKS.email}
                </span>
              </div>

              {/* Functional mailto button */}
              <a
                href={SOCIAL_LINKS.mailto}
                className="w-full inline-flex items-center justify-center space-x-2 bg-[#121212] text-white py-3 text-xs uppercase tracking-[0.2em] font-medium rounded-sm hover:bg-[#2A2A2A] transition shadow-sm"
              >
                <Mail size={14} />
                <span>Launch Email Client</span>
              </a>

              {/* LinkedIn Connection Button */}
              <a
                href={SOCIAL_LINKS.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 border border-[#D5D5D2] text-[#121212] py-3 text-xs uppercase tracking-[0.2em] font-medium rounded-sm hover:border-[#121212] hover:bg-[#FAFAF8] transition"
              >
                <LinkedInIcon size={14} />
                <span>Connect on LinkedIn</span>
                <ExternalLink size={12} className="opacity-70" />
              </a>

              {/* GitHub Profile Button */}
              <a
                href={SOCIAL_LINKS.gitHub}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 border border-[#D5D5D2] text-[#121212] py-3 text-xs uppercase tracking-[0.2em] font-medium rounded-sm hover:border-[#121212] hover:bg-[#FAFAF8] transition"
              >
                <GitHubIcon size={14} />
                <span>Explore GitHub Profile</span>
                <ExternalLink size={12} className="opacity-70" />
              </a>
            </div>

            <div className="text-xs text-[#7A7A7A] space-y-2 border-t border-[#E8E8E6] pt-6">
              <p className="flex items-center justify-between">
                <span>Response Time:</span>
                <span className="text-[#121212] font-medium">Within 24 Hours</span>
              </p>
              <p className="flex items-center justify-between">
                <span>Timezone:</span>
                <span className="text-[#121212] font-medium">GMT+5 (PKT)</span>
              </p>
            </div>
          </div>

          {/* Right Column: Database-Connected Contact Form (Requirement 7) */}
          <div className="lg:col-span-7 bg-white border border-[#E8E8E6] p-8 sm:p-10 rounded-sm shadow-sm">
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E8E8E] block mb-1">
                Direct Dispatch Form
              </span>
              <h3 className="font-serif text-2xl font-normal text-[#121212]">
                Send a Dispatch Message
              </h3>
              <p className="text-xs text-[#7A7A7A] mt-1">
                Recorded securely into database archives.
              </p>
            </div>

            {status.message && (
              <div className={`mb-6 p-4 rounded-sm text-xs flex items-center space-x-2.5 ${
                status.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {status.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-[#121212] mb-1.5">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Julian Thorne"
                    className="w-full p-3.5 bg-[#FAFAF8] border border-[#D5D5D2] rounded-sm text-xs text-[#121212] placeholder-[#A0A0A0] focus:outline-none focus:border-[#121212] focus:bg-white transition"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-[#121212] mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    className="w-full p-3.5 bg-[#FAFAF8] border border-[#D5D5D2] rounded-sm text-xs text-[#121212] placeholder-[#A0A0A0] focus:outline-none focus:border-[#121212] focus:bg-white transition"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-[#121212] mb-1.5">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Editorial Collaboration / Technical Inquiry"
                  className="w-full p-3.5 bg-[#FAFAF8] border border-[#D5D5D2] rounded-sm text-xs text-[#121212] placeholder-[#A0A0A0] focus:outline-none focus:border-[#121212] focus:bg-white transition"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-[#121212] mb-1.5">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write your note or question here..."
                  className="w-full p-4 bg-[#FAFAF8] border border-[#D5D5D2] rounded-sm text-sm text-[#121212] placeholder-[#A0A0A0] focus:outline-none focus:border-[#121212] focus:bg-white font-serif leading-relaxed transition"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 bg-[#121212] text-white px-8 py-3.5 text-xs uppercase tracking-[0.22em] font-medium hover:bg-[#2A2A2A] transition rounded-sm shadow-sm"
              >
                <span>{loading ? 'Dispatching...' : 'Send Message'}</span>
                <Send size={13} />
              </button>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Contact;

