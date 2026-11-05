import { Link } from 'react-router-dom';
import { ArrowRight, Feather, Compass, Globe, Mail, ExternalLink } from 'lucide-react';
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

const About = () => {
  return (
    <div className="bg-[#FAFAF8] min-h-screen pb-24">
      
      {/* Editorial Header */}
      <section className="py-20 border-b border-[#E8E8E6] bg-[#F5F5F2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-[11px] uppercase tracking-[0.3em] font-semibold text-[#8E8E8E] block mb-3">
            The Masthead & Philosophy
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#121212] tracking-tight leading-tight mb-6">
            About THE JOURNAL
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-[#555555] max-w-2xl mx-auto leading-relaxed">
            "A publication born from the conviction that thoughtful prose, engineering craftsmanship, and visual discipline are essential antidotes to modern distraction."
          </p>
        </div>
      </section>

      {/* Main Philosophy Body */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 space-y-12">
        <div className="space-y-6 text-[#2D2D2D] font-serif text-lg sm:text-xl leading-[1.8]">
          <p className="first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:text-[#121212]">
            Founded as an independent digital quarterly, THE JOURNAL documents the quiet revolutions shaping modern technology, software architecture, and cultural philosophy. We believe that true depth requires patience — in writing, in engineering, and in reading.
          </p>
          <p>
            Curated and engineered by Abdul Hanan, this platform blends editorial design with robust full-stack systems, connecting global creators, software craftsmen, and readers through slow, contemplative digital journalism.
          </p>
        </div>

        {/* Requirement 4: Social Profile Area in About Section */}
        <div className="p-8 bg-white border border-[#E8E8E6] rounded-sm shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E8E6] gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#8E8E8E] block">
                Connect Directly
              </span>
              <h3 className="font-serif text-2xl font-normal text-[#121212]">
                Editorial & Engineering Profiles
              </h3>
            </div>
            <span className="text-xs text-[#7A7A7A] italic font-serif">Open for collaborations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* LinkedIn */}
            <a
              href={SOCIAL_LINKS.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 border border-[#E8E8E6] rounded-sm hover:border-[#121212] transition-all duration-300 flex flex-col justify-between h-28 bg-[#FAFAF8] hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#121212] group-hover:text-blue-700 transition">
                  <LinkedInIcon size={18} />
                </span>
                <ExternalLink size={12} className="text-[#8E8E8E] group-hover:text-[#121212] transition" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider font-semibold text-[#121212]">LinkedIn</span>
                <span className="text-[11px] text-[#7A7A7A] truncate block">/in/abdul-hanan</span>
              </div>
            </a>

            {/* GitHub */}
            <a
              href={SOCIAL_LINKS.gitHub}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-4 border border-[#E8E8E6] rounded-sm hover:border-[#121212] transition-all duration-300 flex flex-col justify-between h-28 bg-[#FAFAF8] hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#121212]">
                  <GitHubIcon size={18} />
                </span>
                <ExternalLink size={12} className="text-[#8E8E8E] group-hover:text-[#121212] transition" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider font-semibold text-[#121212]">GitHub</span>
                <span className="text-[11px] text-[#7A7A7A] truncate block">@bmwm99892-cmyk</span>
              </div>
            </a>

            {/* Email */}
            <a
              href={SOCIAL_LINKS.mailto}
              className="group p-4 border border-[#E8E8E6] rounded-sm hover:border-[#121212] transition-all duration-300 flex flex-col justify-between h-28 bg-[#FAFAF8] hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <span className="text-[#121212] group-hover:text-emerald-700 transition">
                  <Mail size={18} />
                </span>
                <ExternalLink size={12} className="text-[#8E8E8E] group-hover:text-[#121212] transition" />
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider font-semibold text-[#121212]">Direct Email</span>
                <span className="text-[11px] text-[#7A7A7A] truncate block">{SOCIAL_LINKS.email}</span>
              </div>
            </a>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 border-y border-[#E8E8E6]">
          <div className="space-y-2">
            <Feather size={20} className="text-[#121212] mb-3" />
            <h3 className="font-serif text-xl text-[#121212]">Editorial Rigor</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Every sentence is weighed for clarity, resonance, and enduring insight rather than ephemeral virality.
            </p>
          </div>
          <div className="space-y-2">
            <Compass size={20} className="text-[#121212] mb-3" />
            <h3 className="font-serif text-xl text-[#121212]">Spatial Harmony</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Generous margins and uncluttered layouts designed to calm the nervous system and encourage contemplation.
            </p>
          </div>
          <div className="space-y-2">
            <Globe size={20} className="text-[#121212] mb-3" />
            <h3 className="font-serif text-xl text-[#121212]">Global Perspective</h3>
            <p className="text-xs text-[#666666] leading-relaxed">
              Dispatches from architects in Tokyo, developers in California, and cultural theorists worldwide.
            </p>
          </div>
        </div>

        {/* Editorial Team / Masthead Table */}
        <div className="pt-6">
          <h2 className="font-serif text-2xl text-[#121212] mb-6">The Masthead</h2>
          <div className="divide-y divide-[#E8E8E6] text-sm">
            <div className="py-3 flex justify-between items-center">
              <span className="font-medium text-[#121212]">Abdul Hanan</span>
              <span className="text-xs text-[#7A7A7A] uppercase tracking-wider">Editor in Chief & Engineering Lead</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="font-medium text-[#121212]">Julian Thorne</span>
              <span className="text-xs text-[#7A7A7A] uppercase tracking-wider">Spatial Philosophy Correspondent</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="font-medium text-[#121212]">Clara Beauchamp</span>
              <span className="text-xs text-[#7A7A7A] uppercase tracking-wider">Senior Design & Craft Critic</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="font-medium text-[#121212]">Henrik Lindqvist</span>
              <span className="text-xs text-[#7A7A7A] uppercase tracking-wider">Visual Director & Photography</span>
            </div>
          </div>
        </div>

        {/* Call to Submissions */}
        <div className="p-8 bg-white border border-[#E8E8E6] rounded-sm text-center space-y-4">
          <h3 className="font-serif text-2xl text-[#121212]">Submit an Essay</h3>
          <p className="text-xs text-[#666666] max-w-md mx-auto leading-relaxed">
            We welcome manuscripts, essays, and critiques that align with our publication's slow reading principles.
          </p>
          <Link
            to="/create-blog"
            className="inline-flex items-center space-x-1.5 bg-[#121212] text-white px-6 py-2.5 text-xs uppercase tracking-widest font-medium rounded-sm hover:bg-[#2A2A2A] transition"
          >
            <span>Write for The Journal</span>
            <ArrowRight size={13} />
          </Link>
        </div>

      </section>

    </div>
  );
};

export default About;
