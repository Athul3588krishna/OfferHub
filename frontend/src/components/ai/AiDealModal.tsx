import React, { useState } from 'react';
import { 
  X, Sparkles, Trophy, ArrowRight, ShieldCheck, 
  MapPin, CheckCircle2, Loader2, Search, ArrowUpRight 
} from 'lucide-react';
import { AIDealRecommendation, AgentProgressStep, Offer } from '../../types';
import { runAgenticDealPipeline, INITIAL_PIPELINE_STEPS } from '../../services/ai/agentPipeline';
import confetti from 'canvas-confetti';

interface AiDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOffer: (offer: Offer) => void;
}

export const AiDealModal: React.FC<AiDealModalProps> = ({
  isOpen,
  onClose,
  onSelectOffer,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState<AgentProgressStep[]>(INITIAL_PIPELINE_STEPS);
  const [recommendation, setRecommendation] = useState<AIDealRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    "I need men's shoes under ₹2000.",
    "Find me the best mobile offer under ₹20000.",
    "I have ₹1000. What are the best deals available?",
    "Find a festive silk saree near Perinthalmanna under ₹5000.",
    "Best family dinner combo under ₹600."
  ];

  const handleRunAi = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const result = await runAgenticDealPipeline(searchQuery, (updatedSteps) => {
        setSteps(updatedSteps);
      });

      setRecommendation(result);
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      setError(err?.message || 'Unable to find matching deals in Perinthalmanna.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Ask PMNA AI
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                  4-Agent Pipeline
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Type your budget or product needs in natural language — our autonomous agents scan live Perinthalmanna deals.
              </p>
            </div>
          </div>

          {/* Search Input Bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleRunAi(query); }}
            className="mt-6 flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 'I need men's shoes under ₹2000' or 'mobile under 20k with good camera'"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm sm:text-base focus:bg-white/15 focus:border-indigo-400 focus:outline-hidden transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Agent Working...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Find Best Deal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Prompt Pills */}
          <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] py-1">Try:</span>
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => { setQuery(p); handleRunAi(p); }}
                className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors text-[11px]"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Agent Visual Progress Pipeline */}
          {isLoading && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4 animate-in fade-in">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                <span>Autonomous Agent Pipeline Running</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-xl border text-xs transition-all ${
                      step.status === 'completed'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs'
                        : step.status === 'in-progress'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-md ring-1 ring-indigo-400'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[10px] uppercase tracking-wider">
                        Agent {step.id}
                      </span>
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : step.status === 'in-progress' ? (
                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      )}
                    </div>
                    <p className="font-bold text-slate-800 text-sm mb-0.5">{step.title}</p>
                    <p className="text-[11px] leading-relaxed text-slate-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm text-center">
              {error}
            </div>
          )}

          {/* Results Showcase */}
          {recommendation && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              {/* #1 BEST DEAL SPOTLIGHT CARD */}
              <div className="relative rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50/60 via-white to-white p-6 shadow-xl overflow-hidden">
                {/* Winner Ribbon */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs px-4 py-1.5 rounded-bl-2xl shadow-md flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-slate-950" />
                  <span>🏆 #1 BEST DEAL</span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full md:w-56 h-56 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative group">
                    <img
                      src={recommendation.best_deal.image_url}
                      alt={recommendation.best_deal.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-2 left-2 bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-md">
                      {recommendation.best_deal.discount_percentage}% OFF
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100">
                          {recommendation.best_deal.shop?.shop_name || 'Perinthalmanna Store'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {recommendation.best_deal.shop?.address.split(',')[0].trim()}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                        {recommendation.best_deal.product_name}
                      </h3>

                      <div className="flex items-baseline gap-3 mt-2">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900">
                          ₹{recommendation.best_deal.offer_price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                          ₹{recommendation.best_deal.original_price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">
                          (Save ₹{(recommendation.best_deal.original_price - recommendation.best_deal.offer_price).toLocaleString('en-IN')})
                        </span>
                      </div>
                    </div>

                    {/* Why this deal? per requirements */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Why this deal?</span>
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {recommendation.why_this_deal.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectOffer(recommendation.best_deal);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
                      >
                        <span>View Deal Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-3 ALTERNATIVE OFFERS */}
              {recommendation.alternatives.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                    <span>Alternative Matching Deals in Perinthalmanna</span>
                    <span className="text-xs font-normal text-slate-400">({recommendation.alternatives.length} options)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {recommendation.alternatives.map((alt, idx) => (
                      <div
                        key={alt.offer.id}
                        onClick={() => {
                          onClose();
                          onSelectOffer(alt.offer);
                        }}
                        className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100 mb-3 relative">
                            <img
                              src={alt.offer.image_url}
                              alt={alt.offer.product_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 text-white font-bold text-[10px] px-2 py-0.5 rounded-md">
                              {alt.offer.discount_percentage}% OFF
                            </span>
                          </div>

                          <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block truncate">
                            {alt.offer.shop?.shop_name || 'Store'}
                          </span>
                          <h5 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {alt.offer.product_name}
                          </h5>

                          <p className="text-[11px] text-indigo-700 font-medium mt-1 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                            💡 {alt.reason}
                          </p>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-base font-extrabold text-slate-900">
                            ₹{alt.offer.offer_price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-indigo-600 font-semibold group-hover:underline flex items-center gap-1">
                            <span>Check</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
