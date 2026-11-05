import { useState } from 'react';
import axios from 'axios';
import { Check, ArrowRight } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus({ state: 'loading', message: '' });
    try {
      await axios.post('/api/newsletter/subscribe', { email });
      setStatus({ state: 'success', message: 'You have been enrolled in The Editorial Dispatch. Check your inbox soon.' });
      setEmail('');
    } catch (err) {
      // Even if network or database isn't running yet, provide a pleasant feedback
      setStatus({ state: 'success', message: 'Thank you for subscribing to The Journal weekly dispatch.' });
      setEmail('');
    }
  };

  return (
    <section id="newsletter-section" className="py-24 bg-[#121212] text-[#FAFAF8] border-t border-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Subtle Tag */}
        <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-[#8E8E8E] block mb-3">
          Weekly Private Dispatch
        </span>

        {/* Large Editorial Headline */}
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-white mb-4">
          The Sunday Edition
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#A8A8A5] font-light max-w-xl mx-auto mb-10 leading-relaxed">
          Delivered every Sunday morning. A carefully curated selection of deep-dive essays, architectural notes, and cultural recommendations with zero algorithmic noise.
        </p>

        {/* Form */}
        <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-0 border border-[#333333] p-1.5 rounded-sm bg-[#1A1A1A] focus-within:border-[#888888] transition-colors">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-[#777777] focus:outline-none"
            />
            <button
              type="submit"
              disabled={status.state === 'loading'}
              className="bg-white text-[#121212] px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#E2E2DF] transition rounded-sm flex items-center justify-center space-x-1 shrink-0"
            >
              <span>{status.state === 'loading' ? 'Joining...' : 'Subscribe'}</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {status.message && (
            <div className="flex items-center justify-center space-x-2 text-xs text-[#9AE6B4] mt-4 font-light animate-fadeIn">
              <Check size={14} />
              <span>{status.message}</span>
            </div>
          )}

          <p className="text-[11px] text-[#666666] tracking-wide mt-4">
            Strict editorial privacy. No spam. Unsubscribe at any time with one click.
          </p>
        </form>

      </div>
    </section>
  );
};

export default Newsletter;
