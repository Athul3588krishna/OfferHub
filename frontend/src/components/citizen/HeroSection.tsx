import React, { useState } from 'react';
import { Search, Sparkles, MapPin, ArrowRight, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (searchTerm: string) => void;
  onOpenAi: () => void;
  onSelectTrendingTag: (tag: string) => void;
  onExploreDeals: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onOpenAi,
  onSelectTrendingTag,
  onExploreDeals,
}) => {
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const trendingSearches = [
    "Men's shoes under ₹2000",
    "5G Mobiles under ₹20000",
    "Silk sarees",
    "Broast combo deals",
    "Sony headphones"
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/60">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-200/30 via-teal-100/40 to-indigo-100/30 blur-3xl pointer-events-none -z-10 rounded-full"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Hackathon Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-semibold mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
          <span>Hojathon Series 1 • Perinthalmanna Edition</span>
          <span className="text-emerald-500">•</span>
          <span className="text-emerald-700">Agentic AI Powered</span>
        </div>

        {/* Hero Title & Subtitle per specifications */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Find the Best Deals in <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
            Perinthalmanna
          </span>
        </h1>

        <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Discover local offers, compare prices and let AI find the best deal for you.
        </p>

        {/* Search & Action Bar */}
        <div className="mt-8 sm:mt-10 max-w-3xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex flex-col sm:flex-row items-stretch gap-2.5 p-2 bg-white rounded-3xl shadow-xl border border-slate-200/80 backdrop-blur-md">
            <div className="relative flex-1 flex items-center pl-4">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands (Nike, OnePlus, Silk Sarees)..."
                className="w-full pl-3 pr-4 py-3 bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              />
              <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 border-l border-slate-200 pl-3 pr-2 whitespace-nowrap">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Perinthalmanna</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={onOpenAi}
                className="px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                title="Launch Agentic AI Deal Assistant"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Ask PMNA AI</span>
              </button>
            </div>
          </form>

          {/* Quick Trending Searches */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Trending:
            </span>
            {trendingSearches.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setQuery(tag);
                  onSelectTrendingTag(tag);
                }}
                className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition-colors shadow-2xs"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Quick Metrics */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200/60">
          <div className="text-center p-3 rounded-2xl bg-white/70 border border-slate-200/50">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">50%+</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Top Local Discounts</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-white/70 border border-slate-200/50">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">100%</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Admin Verified Stores</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-white/70 border border-slate-200/50">
            <p className="text-2xl sm:text-3xl font-black text-indigo-600">5 Agents</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Autonomous AI Core</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-white/70 border border-slate-200/50">
            <p className="text-2xl sm:text-3xl font-black text-slate-900">Real-Time</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Perinthalmanna DB</p>
          </div>
        </div>
      </div>
    </section>
  );
};
