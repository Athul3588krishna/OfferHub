import React, { useState } from 'react';
import { X, Sparkles, Wand2, Check, Loader2, RefreshCw } from 'lucide-react';
import { runShopContentAgent, GeneratedOfferContent } from '../../services/ai/shopContentAgent';
import { useToast } from '../common/Toast';

interface AiOfferGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  shopName: string;
  onApply: (content: GeneratedOfferContent) => void;
}

export const AiOfferGeneratorModal: React.FC<AiOfferGeneratorModalProps> = ({
  isOpen,
  onClose,
  productName,
  category,
  originalPrice,
  offerPrice,
  shopName,
  onApply,
}) => {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!productName.trim() || originalPrice <= 0 || offerPrice <= 0) {
      showToast('Missing Details', 'Please enter product name and prices before generating with AI.', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await runShopContentAgent({
        productName,
        category,
        originalPrice,
        offerPrice,
        shopName,
      });

      setGeneratedTitle(result.title);
      setGeneratedDescription(result.description);
      setGeneratedTags(result.tags);
      showToast('AI Content Generated', 'Catchy title, description & tags generated for your deal.', 'success');
    } catch (err) {
      showToast('Generation Error', 'Failed to generate content. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedTitle || !generatedDescription) {
      showToast('Nothing to Apply', 'Please generate content first.', 'info');
      return;
    }

    onApply({
      title: generatedTitle,
      description: generatedDescription,
      tags: generatedTags,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>AI Offer Generator</span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Agent 5
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Generate promotional titles, persuasive copy & tags for Perinthalmanna buyers.
            </p>
          </div>
        </div>

        {/* Product Context Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-5 text-xs grid grid-cols-2 gap-2">
          <div>
            <span className="text-slate-400 block font-medium">Product:</span>
            <span className="font-bold text-slate-800 truncate block">{productName || 'Untitled Item'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Pricing:</span>
            <span className="font-bold text-emerald-700">
              ₹{offerPrice.toLocaleString('en-IN')} <span className="line-through text-slate-400 font-normal">₹{originalPrice.toLocaleString('en-IN')}</span>
            </span>
          </div>
        </div>

        {/* Action Button if not yet generated */}
        {!generatedTitle && (
          <div className="text-center py-6">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all inline-flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating High-Converting Copy...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>✨ Generate with AI</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Generated Output Fields (Editable by Shop Owner per requirements) */}
        {generatedTitle && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Offer Title (Editable)
                </label>
                <button
                  onClick={handleGenerate}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate</span>
                </button>
              </div>
              <input
                type="text"
                value={generatedTitle}
                onChange={(e) => setGeneratedTitle(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Promotional Description (Editable)
              </label>
              <textarea
                value={generatedDescription}
                onChange={(e) => setGeneratedDescription(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Suggested Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {generatedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply to Offer Form</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
