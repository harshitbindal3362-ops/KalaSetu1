import React, { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';
import { Filter, SlidersHorizontal, Search, X, Check, Building2, MapPin } from 'lucide-react';

interface ShopCatalogProps {
  products: Product[];
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (catId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onBulkInquiry: (product: Product) => void;
}

export const ShopCatalog: React.FC<ShopCatalogProps> = ({
  products,
  categories,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  onBulkInquiry,
}) => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCraftType, setSelectedCraftType] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [onlyB2bEligible, setOnlyB2bEligible] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating' | 'trending'>('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // States available
  const availableStates = Array.from(new Set(products.map((p) => p.state))).filter(Boolean);
  const availableCraftTypes = Array.from(new Set(products.map((p) => p.craft_type))).filter(Boolean);

  // Filtered products logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesCraft = p.craft_type.toLowerCase().includes(query);
        const matchesArtisan = p.artisan_name.toLowerCase().includes(query);
        const matchesState = p.state.toLowerCase().includes(query);
        const matchesMaterial = p.material.toLowerCase().includes(query);
        const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCraft && !matchesArtisan && !matchesState && !matchesMaterial && !matchesTags) {
          return false;
        }
      }

      // Category
      if (selectedCategoryId && p.category_id !== selectedCategoryId) {
        return false;
      }

      // State
      if (selectedState && p.state !== selectedState) {
        return false;
      }

      // Craft type
      if (selectedCraftType && p.craft_type !== selectedCraftType) {
        return false;
      }

      // Max price
      if (p.price > maxPrice) {
        return false;
      }

      // B2B Wholesale eligible
      if (onlyB2bEligible && !p.b2b_price) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'trending') return (b.inquiry_count || 0) - (a.inquiry_count || 0);
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategoryId, selectedState, selectedCraftType, maxPrice, onlyB2bEligible, sortBy]);

  const resetFilters = () => {
    onSelectCategory(null);
    setSelectedState(null);
    setSelectedCraftType(null);
    setMaxPrice(15000);
    setOnlyB2bEligible(false);
    onSearchChange('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Catalog Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D3]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Handmade Craft Marketplace
          </h1>
          <p className="text-xs text-[#6B6258] mt-1">
            Showing {filteredProducts.length} authentic handcrafted creations from across India
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden px-3 py-2 rounded-xl bg-white border border-[#E7E0D3] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#9A9089] hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2 rounded-xl border border-[#E7E0D3] bg-white font-medium text-xs focus:outline-none focus:border-[#B89B5E]"
            >
              <option value="featured">Featured Curations</option>
              <option value="trending">Trending & Inquiries</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Top Rated Crafts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Filter Column (Desktop) */}
        <div
          className={`lg:col-span-3 space-y-6 text-xs ${
            isMobileFilterOpen ? 'block fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden lg:block'
          }`}
        >
          {isMobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D3] lg:hidden">
              <h3 className="font-serif font-bold text-base text-[#1C1917]">Filter Crafts</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full text-[#9A9089]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Reset button */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#1C1917]">Filters</span>
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-[#B89B5E] hover:underline cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="font-bold text-xs text-[#1C1917] uppercase tracking-wider block">
              Discipline / Category
            </label>
            <div className="space-y-1">
              <button
                onClick={() => onSelectCategory(null)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                  selectedCategoryId === null
                    ? 'bg-[#B89B5E]/10 font-bold text-[#B89B5E]'
                    : 'text-[#6B6258] hover:bg-[#FAF7F0]'
                }`}
              >
                <span>All Disciplines</span>
                <span>{products.length}</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    selectedCategoryId === cat.id
                      ? 'bg-[#B89B5E]/10 font-bold text-[#B89B5E]'
                      : 'text-[#6B6258] hover:bg-[#FAF7F0]'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] text-[#9A9089]">
                    {products.filter((p) => p.category_id === cat.id).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-4 border-t border-[#E7E0D3]">
            <div className="flex justify-between items-center">
              <label className="font-bold text-xs text-[#1C1917] uppercase tracking-wider">
                Max Price
              </label>
              <span className="font-serif font-bold text-sm text-[#1C1917]">
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={15000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#B89B5E] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9A9089]">
              <span>₹500</span>
              <span>₹15,000+</span>
            </div>
          </div>

          {/* Regional Provenance Filter */}
          <div className="space-y-2 pt-4 border-t border-[#E7E0D3]">
            <label className="font-bold text-xs text-[#1C1917] uppercase tracking-wider block">
              Origin State
            </label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedState(null)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg cursor-pointer ${
                  selectedState === null ? 'font-bold text-[#B89B5E]' : 'text-[#6B6258]'
                }`}
              >
                All States
              </button>
              {availableStates.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedState(st)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center justify-between ${
                    selectedState === st ? 'font-bold text-[#B89B5E]' : 'text-[#6B6258]'
                  }`}
                >
                  <span>{st}</span>
                  <span className="text-[10px] text-[#9A9089]">
                    {products.filter((p) => p.state === st).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Wholesale B2B Toggle */}
          <div className="pt-4 border-t border-[#E7E0D3]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyB2bEligible}
                onChange={(e) => setOnlyB2bEligible(e.target.checked)}
                className="w-4 h-4 rounded text-[#6B6258] accent-[#6B6258]"
              />
              <span className="font-semibold text-xs text-[#1C1917] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#6B6258]" />
                <span>B2B Wholesale Eligible Only</span>
              </span>
            </label>
          </div>

          {isMobileFilterOpen && (
            <div className="pt-4">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#B89B5E] text-white font-bold"
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>

        {/* Products Grid Column */}
        <div className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-[#E7E0D3] space-y-3">
              <Search className="w-10 h-10 text-[#9A9089] mx-auto" />
              <h3 className="font-serif font-bold text-lg text-[#1C1917]">
                No matching crafts found
              </h3>
              <p className="text-xs text-[#9A9089] max-w-sm mx-auto">
                Try clearing your search terms or expanding your price and state filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-[#B89B5E] text-white text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  isWishlisted={wishlistIds.includes(prod.id)}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={onAddToCart}
                  onSelectProduct={onSelectProduct}
                  onBulkInquiry={onBulkInquiry}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
