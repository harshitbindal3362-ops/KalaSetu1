import React from 'react';
import { Category } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onViewAll: () => void;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onViewAll,
}) => {
  return (
    <section className="py-12 bg-[#FAF7F0] border-b border-[#E7E0D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#B89B5E] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#B89B5E]" />
              <span>Indigenous Craft Disciplines</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
              Explore Traditional Indian Crafts
            </h2>
            <p className="text-sm text-[#6B6258] mt-1">
              From Rajasthani quartz ceramics to Kutch indigo and Kashmiri walnut carving.
            </p>
          </div>

          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B89B5E] hover:text-[#9F8249] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid of categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? null : cat.id)}
                className={`group text-left p-3.5 rounded-2xl transition-all duration-300 cursor-pointer border ${
                  isSelected
                    ? 'bg-white border-[#B89B5E] shadow-md ring-2 ring-[#B89B5E]/20'
                    : 'bg-white hover:bg-white/90 border-[#E7E0D3] hover:border-[#B89B5E]/60 hover:shadow-md'
                }`}
              >
                <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-3 bg-[#E7E0D3]">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 text-[#4A3B1E] backdrop-blur-xs">
                    {cat.craft_count || 30}+ Pieces
                  </span>
                </div>

                <h3 className="font-serif font-bold text-sm text-[#1C1917] group-hover:text-[#B89B5E] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#9A9089] line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
