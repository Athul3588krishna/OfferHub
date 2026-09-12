import React from 'react';
import { Store, MapPin, Sparkles, Heart, ShieldCheck } from 'lucide-react';

export const Footer: React.FC<{ onOpenAi: () => void; onExploreDeals: () => void }> = ({ onOpenAi, onExploreDeals }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-24 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Store className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                PMNA <span className="text-emerald-400">Deals</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The Agentic AI-powered local offers platform for Perinthalmanna. Empowering local merchants, saving citizens money, and driving smart town commerce.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hojathon Series 1 – Agentic AI Hackathon 2026</span>
            </div>
          </div>

          {/* Col 2: Key Hubs in Perinthalmanna */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Local Commercial Hubs
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ooty Road & Bus Stand Hub</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Pattambi Road Textile Hub</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Jubilee Junction & Calicut Road</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Polytechnic Junction & Bypass</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Court Road & Stadium Complex</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform Features */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Platform Features
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button onClick={onOpenAi} className="hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Agentic AI Deal Assistant</span>
                </button>
              </li>
              <li>
                <button onClick={onExploreDeals} className="hover:text-emerald-400 transition-colors">
                  Verified Local Discounts (Up to 60%)
                </button>
              </li>
              <li>
                <span className="hover:text-emerald-400 transition-colors">
                  Perinthalmanna Interactive Map
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-400 transition-colors">
                  Merchant Verification & Fraud Defense
                </span>
              </li>
              <li>
                <span className="hover:text-emerald-400 transition-colors">
                  AI Copywriting for Shop Owners
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: About & AI Architecture */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Agentic Multi-Agent Core
            </h4>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <p className="font-semibold text-slate-200">5 Specialized AI Agents:</p>
              <p>• <span className="text-emerald-300 font-medium">Intent Agent:</span> Query & budget parser</p>
              <p>• <span className="text-teal-300 font-medium">Discovery Agent:</span> Real DB offer scanner</p>
              <p>• <span className="text-indigo-300 font-medium">Comparison Agent:</span> Multivector ranking</p>
              <p>• <span className="text-purple-300 font-medium">Recommendation Agent:</span> Best deal rationale</p>
              <p>• <span className="text-amber-300 font-medium">Shop Content Agent:</span> Promo generator</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PMNA Deals. Built with React, TypeScript, Supabase, Tailwind CSS & Agentic AI.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Perinthalmanna
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
