import React, { useState } from 'react';
import { X, Sparkles, Plus, Image, Calendar, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { Category, Offer, Shop, User } from '../../types';
import { dbService } from '../../services/supabase';
import { useToast } from '../common/Toast';
import { AiOfferGeneratorModal } from '../ai/AiOfferGeneratorModal';
import confetti from 'canvas-confetti';

interface AddOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  categories: Category[];
  onOfferAdded: (offer: Offer) => void;
}

export const AddOfferModal: React.FC<AddOfferModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  categories,
  onOfferAdded,
}) => {
  const { showToast } = useToast();

  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'fashion');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [offerPrice, setOfferPrice] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [stockStatus, setStockStatus] = useState('In Stock - Limited Quantity');
  const [terms, setTerms] = useState('Offer valid for in-store purchases in Perinthalmanna while stocks last.');
  const [tags, setTags] = useState<string[]>(['Offer', 'Perinthalmanna']);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  if (!isOpen) return null;

  // Resolve shop for current user
  const userShop: Shop | undefined = dbService.getShopByOwnerId(currentUser.id) || dbService.getShops()[0];

  // Auto calculate discount
  const numOriginal = typeof originalPrice === 'number' ? originalPrice : 0;
  const numOffer = typeof offerPrice === 'number' ? offerPrice : 0;
  const discountPercent = numOriginal > 0 && numOffer > 0 && numOriginal > numOffer
    ? Math.round(((numOriginal - numOffer) / numOriginal) * 100)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!productName.trim() || !numOriginal || !numOffer) {
      showToast('Validation Error', 'Please complete product name and prices.', 'error');
      return;
    }

    if (numOffer >= numOriginal) {
      showToast('Invalid Price', 'Offer price must be lower than original price.', 'error');
      return;
    }

    const defaultImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';

    const newOffer = dbService.createOffer({
      shop_id: userShop?.id || 'shop-oxygen',
      product_name: productName.trim(),
      category,
      description: description.trim() || `Special discounted deal on ${productName} available at ${userShop?.shop_name || 'store'}.`,
      original_price: numOriginal,
      offer_price: numOffer,
      image_url: defaultImage,
      start_date: startDate,
      expiry_date: expiryDate,
      stock_status: stockStatus,
      terms,
      tags,
      status: 'pending', // Per requirements: Status = Pending until Admin approves!
    });

    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    showToast(
      'Offer Submitted (Status: Pending)',
      'Your offer has been submitted for Admin verification. It will appear on the platform once approved.',
      'info'
    );

    onOfferAdded(newOffer);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div 
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Publish New Local Offer</h3>
                <p className="text-xs text-slate-500">
                  Shop: <span className="font-semibold text-emerald-700">{userShop?.shop_name || 'My Store'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
            {/* Status Notice per prompt: Status = Pending */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 shrink-0">
                Notice
              </span>
              <p>
                When submitted, <b>Offer status = Pending</b>. Admin must approve the offer before it becomes publicly visible to citizens of Perinthalmanna.
              </p>
            </div>

            {/* Product Name & AI Generator Trigger */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Product / Deal Name *
                </label>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>✨ Generate with AI</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Nike Air Max Running Shoes, OnePlus Nord CE4..."
                className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Category & Stock Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Stock / Availability
                </label>
                <input
                  type="text"
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value)}
                  placeholder="e.g. 10 units left, Limited Sizes..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Prices & Auto Discount Calculation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Original Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2499"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-emerald-500 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Offer Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1499"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-emerald-500 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Auto Discount %
                </label>
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold text-sm text-center border border-emerald-300">
                  {discountPercent > 0 ? `${discountPercent}% OFF` : '0%'}
                </div>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Product Image URL
              </label>
              <div className="relative">
                <Image className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or paste image URL"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Offer Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key features, highlights, and why Perinthalmanna shoppers should visit..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Dates: Start & Expiry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Offer Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Offer Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Terms & Conditions
              </label>
              <input
                type="text"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="e.g. Valid only for in-store walk-ins, one unit per customer..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Offer (Pending Review)</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* AI Generator Modal Sub-component */}
      <AiOfferGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        productName={productName}
        category={category}
        originalPrice={numOriginal}
        offerPrice={numOffer}
        shopName={userShop?.shop_name || 'our shop'}
        onApply={(content) => {
          setProductName(content.title);
          setDescription(content.description);
          setTags(content.tags);
        }}
      />
    </>
  );
};
