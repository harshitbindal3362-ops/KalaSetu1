import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, HeartHandshake, Mic } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface HeroProps {
  onShopClick: () => void;
  onArtisansClick: () => void;
  onAiVoiceClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onShopClick,
  onArtisansClick,
  onAiVoiceClick,
}) => {
  const { t, isHindiOrRegional } = useLanguage();

  return (
    <section
      data-tour="hero"
      className="relative overflow-hidden bg-gradient-to-b from-[#FAF7F0] via-[#E7E0D3] to-[#FAF7F0] py-12 md:py-20 border-b border-[#E7E0D3]"
    >
      {/* Subtle decorative Indian craft arches */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#B89B5E]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#B89B5E]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B89B5E]/10 border border-[#B89B5E]/20 text-[#B89B5E] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#B89B5E]" />
              <span>{t('hero.badge', '100% Authentic Handcrafted Heritage')}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1C1917] leading-[1.15]">
              {isHindiOrRegional ? (
                <>
                  हस्तशिल्प की समृद्ध धरोहर।{' '}
                  <span className="block text-[#B89B5E] font-serif">
                    सीधे भट्टी व करघा से आपके घर।
                  </span>
                </>
              ) : (
                <>
                  Crafted by Hands.{' '}
                  <span className="block text-[#B89B5E] font-serif">
                    Rooted in India.
                  </span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-[#6B6258] max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {t(
                'hero.subtitle',
                'Discover authentic handmade creations made by skilled Indian artisans, preserving traditions one craft at a time. Connect directly with master craftspeople for retail purchases, wholesale B2B quotes, and personalized custom orders.'
              )}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onShopClick}
                className="px-6 py-3.5 rounded-full bg-[#B89B5E] hover:bg-[#9F8249] text-white font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{t('catalog.buy_now', 'Shop Handmade')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onArtisansClick}
                className="px-6 py-3.5 rounded-full bg-white hover:bg-[#FAF7F0] text-[#4A3B1E] border border-[#E7E0D3] hover:border-[#B89B5E] font-semibold text-sm transition-all cursor-pointer"
              >
                <span>{t('nav.artisans', 'Meet Our Artisans')}</span>
              </button>

              {/* Artisan voice prompt pill */}
              <button
                onClick={onAiVoiceClick}
                className="px-4 py-3 rounded-full bg-[#FAF7F0] hover:bg-white text-[#B89B5E] border border-[#B89B5E]/30 font-medium text-xs flex items-center gap-2 cursor-pointer shadow-2xs"
                title="Artisans: Speak in Hindi or your local language to list a product"
              >
                <div className="w-5 h-5 rounded-full bg-[#B89B5E] text-white flex items-center justify-center">
                  <Mic className="w-3 h-3 animate-pulse" />
                </div>
                <span>{t('hero.voice_cta', 'Sell with 1 Voice Note')}</span>
              </button>
            </div>

            {/* Value Pillars */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E7E0D3]/70">
              <div className="text-center lg:text-left">
                <p className="font-serif text-2xl font-bold text-[#4A3B1E]">400+</p>
                <p className="text-xs text-[#9A9089]">{t('hero.stat_artisans', 'Verified Master Artisans')}</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="font-serif text-2xl font-bold text-[#B89B5E]">0%</p>
                <p className="text-xs text-[#9A9089]">Middlemen markups</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="font-serif text-2xl font-bold text-[#6B6258]">100%</p>
                <p className="text-xs text-[#9A9089]">{t('hero.stat_gi', 'GI Authenticity Certified')}</p>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              {/* Primary craft photo with authentic artisan frame */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
                <div className="relative h-80 sm:h-96">
                  <img
                    src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80"
                    alt="Master artisan painting Jaipur Blue Pottery"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#B89B5E]">
                      Jaipur Blue Pottery
                    </span>
                    <h3 className="font-serif text-lg font-bold mt-1">Ustad Rameshwar Prajapati</h3>
                    <p className="text-xs text-white/90">Master craftsperson • 34 years carving natural quartz & copper glaze</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge 1: B2B Quote Ready */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white rounded-2xl p-3 border border-[#E7E0D3] shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6B6258]/10 text-[#6B6258] flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9A9089] uppercase tracking-wider">B2B Wholesale</p>
                  <p className="text-xs font-bold text-[#1C1917]">Direct Bulk Quotations</p>
                  <p className="text-[10px] text-[#6B6258] font-medium">Wholesale quotes in &lt; 24h</p>
                </div>
              </div>

              {/* Floating Badge 2: AI Voice Assisted */}
              <div className="absolute -top-4 -right-4 sm:-right-6 bg-white rounded-2xl p-3 border border-[#E7E0D3] shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#B89B5E]/10 text-[#B89B5E] flex items-center justify-center">
                  <Mic className="w-5 h-5 text-[#B89B5E]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9A9089] uppercase tracking-wider">Voice-to-Product AI</p>
                  <p className="text-xs font-bold text-[#1C1917]">Regional Hindi, Odia, Gujarati</p>
                  <p className="text-[10px] text-[#B89B5E] font-medium">Zero typing required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
