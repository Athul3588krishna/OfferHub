import React from 'react';
import { 
  Shirt, Tv, Smartphone, Footprints, UtensilsCrossed, 
  ShoppingBag, Sparkles, Coffee, Home, Trophy, Tag, Layers
} from 'lucide-react';
import { Category } from '../../types';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'shirt': return <Shirt className="w-5 h-5" />;
      case 'tv': return <Tv className="w-5 h-5" />;
      case 'smartphone': return <Smartphone className="w-5 h-5" />;
      case 'footprints': return <Footprints className="w-5 h-5" />;
      case 'utilscrossed':
      case 'utensilscrossed': return <UtensilsCrossed className="w-5 h-5" />;
      case 'shoppingbag': return <ShoppingBag className="w-5 h-5" />;
      case 'sparkles': return <Sparkles className="w-5 h-5" />;
      case 'coffee': return <Coffee className="w-5 h-5" />;
      case 'home': return <Home className="w-5 h-5" />;
      case 'trophy': return <Trophy className="w-5 h-5" />;
      default: return <Tag className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth">
        {/* All Categories Option */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 scale-[1.02]'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Deals</span>
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 scale-[1.02]'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-emerald-600'}>
                {getCategoryIcon(cat.icon)}
              </span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
