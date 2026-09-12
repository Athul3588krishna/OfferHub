import React, { useState } from 'react';
import { X, Store, User as UserIcon, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Category, User } from '../../types';
import { dbService } from '../../services/supabase';
import { useToast } from '../common/Toast';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  categories,
  onLoginSuccess,
}) => {
  const { showToast } = useToast();
  const [role, setRole] = useState<'citizen' | 'shop'>('shop');
  const [isRegistering, setIsRegistering] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'mobiles');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (role === 'shop') {
      if (!name || !email || !shopName || !phone || !address) {
        showToast('Required Fields', 'Please complete all mandatory shop registration fields.', 'error');
        return;
      }

      // 1. Create User
      const newUser = dbService.createUser({
        name,
        email,
        phone,
        role: 'shop',
        avatar_url: imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      });

      // 2. Create Shop with Status = Pending
      dbService.createShop({
        owner_id: newUser.id,
        shop_name: shopName,
        owner_name: name,
        phone,
        email,
        category,
        address,
        landmark: 'Perinthalmanna',
        latitude: 10.9760,
        longitude: 76.2254,
        description: description || `${shopName} located at ${address}, Perinthalmanna.`,
        image_url: imageUrl || 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
        verification_status: 'pending', // Pending Verification per prompt!
      });

      confetti({ particleCount: 35, spread: 55 });
      showToast(
        'Registration Submitted: Pending Verification',
        'Your shop has been registered. The shop cannot publish offers until Admin reviews and approves it.',
        'info'
      );

      dbService.setCurrentUser(newUser);
      onLoginSuccess(newUser);
      onClose();
    } else {
      // Citizen registration/login
      const newUser = dbService.createUser({
        name: name || 'Perinthalmanna Citizen',
        email,
        phone,
        role: 'citizen',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      });

      showToast('Welcome!', `Logged in as ${newUser.name}.`, 'success');
      dbService.setCurrentUser(newUser);
      onLoginSuccess(newUser);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <h3 className="text-xl font-black text-slate-900">
            {role === 'shop' ? 'Shop Owner Registration' : 'Citizen Sign In'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            PMNA Deals • Local Commerce Platform for Perinthalmanna
          </p>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setRole('shop')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'shop'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-indigo-600" />
              <span>Shop Owner</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('citizen')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'citizen'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>Citizen / Shopper</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {role === 'shop' && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                <b>Status: Pending Verification.</b> After registration, your shop cannot publish offers until the municipal Admin verifies and approves your business.
              </p>
            </div>
          )}

          {/* Owner / Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {role === 'shop' ? 'Owner Full Name *' : 'Your Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shamsudheen K."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Shop Specific Fields */}
          {role === 'shop' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Oxygen Digital, Perinthalmanna Footwear..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Shop Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Address in Perinthalmanna *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Ooty Road, Near Municipal Bus Stand..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description & Specialties
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of your business..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Shop Image / Storefront URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... image of your shop"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            </>
          )}

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="store@pmna.in"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98471 22334"
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              defaultValue="password123"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors"
            >
              {role === 'shop' ? 'Register Shop (Pending Verification)' : 'Continue to Deals'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
