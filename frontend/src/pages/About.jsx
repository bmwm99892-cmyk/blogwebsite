import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Feather, Compass, Globe } from 'lucide-react';

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
            "A publication born from the conviction that thoughtful prose and visual discipline are essential antidotes to modern distraction."
          </p>
        </div>
      </section>

      {/* Main Philosophy Body */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 space-y-12">
        <div className="space-y-6 text-[#2D2D2D] font-serif text-lg sm:text-xl leading-[1.8]">
          <p className="first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:text-[#121212]">
            Founded as an independent digital and print quarterly, THE JOURNAL documents the quiet revolutions shaping modern civilization. We believe that true depth requires patience — in writing, in observation, and in reading.
          </p>
          <p>
            In an attention economy dominated by outrage, clickbait, and algorithmic churn, we champion the slow article: rigorously researched essays, spatial critiques, philosophical reflections, and interviews with craftsmen and thinkers who operate on generational timelines.
          </p>
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
              Dispatches from architects in Tokyo, ecologists in Scandinavia, and cultural theorists in Latin America.
            </p>
          </div>
        </div>

        {/* Editorial Team / Masthead Table */}
        <div className="pt-6">
          <h2 className="font-serif text-2xl text-[#121212] mb-6">The Masthead</h2>
          <div className="divide-y divide-[#E8E8E6] text-sm">
            <div className="py-3 flex justify-between items-center">
              <span className="font-medium text-[#121212]">Julian Thorne</span>
              <span className="text-xs text-[#7A7A7A] uppercase tracking-wider">Editor in Chief</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="font-medium text-[#121212]">Clara Beauchamp</span>
              <span className="text-xs text-[#7A7A7A] uppercase tracking-wider">Senior Design Critic</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="font-medium text-[#121212]">Henrik Lindqvist</span>
              <span className="text-xs text-[#7A7A7A] uppercase tracking-wider">Visual Director & Photography</span>
            </div>
            <div className="py-3 flex justify-between items-center">
              <span className="font-medium text-[#121212]">Camilla Sterling</span>
              <span className="text-xs text-[#7A7A7A] uppercase tracking-wider">Contributing Editor, Technology</span>
            </div>
          </div>
        </div>

        {/* Call to Submissions */}
        <div className="p-8 bg-white border border-[#E8E8E6] rounded-sm text-center space-y-4">
          <h3 className="font-serif text-2xl text-[#121212]">Submit an Essay</h3>
          <p className="text-xs text-[#666666] max-w-md mx-auto leading-relaxed">
            We welcome unsolicited manuscripts, essays, and photographic series that align with our editorial ethos.
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

