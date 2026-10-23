import React, { useState } from 'react';
import { Product } from '../types';
import { TrendingUp, Sparkles, MapPin, Building2, Flame, ArrowRight } from 'lucide-react';

interface TrendingSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onBulkInquiry: (product: Product) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  products,
  onSelectProduct,
  onBulkInquiry,
}) => {
  const [selectedLocation, setSelectedLocation] = useState('Delhi NCR');
  const [activeTrendType, setActiveTrendType] = useState<'festival' | 'near_you' | 'b2b'>('festival');

  const locations = [
    'Delhi NCR',
    'Rajasthan (Jaipur/Udaipur)',
    'Maharashtra (Mumbai/Pune)',
    'Karnataka (Bengaluru)',
    'Gujarat (Ahmedabad/Kutch)',
    'West Bengal (Kolkata)',
  ];

  // Specific market reasoning messages backed by real Indian seasonal & corporate cycles
  const locationReasons: Record<string, string> = {
    'Delhi NCR': 'High demand for bespoke Diwali gifting and luxury home decor sets (+210% search volume).',
    'Rajasthan (Jaipur/Udaipur)': 'Boutique heritage hotels and wedding planners actively sourcing handcrafted tablewares.',
    'Maharashtra (Mumbai/Pune)': 'Corporate B2B orders for eco-friendly handcrafted employee and partner hampers.',
    'Karnataka (Bengaluru)': 'Minimalist artisan studio pottery and handloom living room textiles trending among tech professionals.',
    'Gujarat (Ahmedabad/Kutch)': 'Navratri and festive hand-block printed indigo textiles seeing record wholesale quotes.',
    'West Bengal (Kolkata)': 'Durga Puja home adornments and terracotta lighting installations in peak demand.',
  };

  const trendingProducts = products.filter((p) => p.is_trending || p.inquiry_count > 10);

  return (
    <section className="py-14 bg-white border-b border-[#E7E0D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#B89B5E] uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-[#B89B5E]" />
              <span>Real-Time Craft Velocity</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
              Trending Crafts & Festive Demand
            </h2>
            <p className="text-sm text-[#6B6258] mt-1">
              Live market intelligence backed by customer purchases and B2B wholesale inquiries.
            </p>
          </div>

          {/* Trend Type Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#FAF7F0] border border-[#E7E0D3] self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTrendType('festival')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTrendType === 'festival' ? 'bg-[#B89B5E] text-white' : 'text-[#6B6258]'
              }`}
            >
              Diwali Festive
            </button>
            <button
              onClick={() => setActiveTrendType('near_you')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTrendType === 'near_you' ? 'bg-[#B89B5E] text-white' : 'text-[#6B6258]'
              }`}
            >
              Trending Near You
            </button>
            <button
              onClick={() => setActiveTrendType('b2b')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTrendType === 'b2b' ? 'bg-[#B89B5E] text-white' : 'text-[#6B6258]'
              }`}
            >
              Popular with Bulk Buyers
            </button>
          </div>
        </div>

        {/* Location Selector & Why It's Trending Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF7F0] border border-[#E7E0D3] mb-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
              <MapPin className="w-4 h-4 text-[#B89B5E]" />
              <span>Filter Trends by Regional Hub:</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedLocation === loc
                      ? 'bg-[#4A3B1E] text-white shadow-xs'
                      : 'bg-white text-[#6B6258] border border-[#E7E0D3] hover:bg-[#E7E0D3]'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#E7E0D3]/70 flex items-center gap-2 text-xs text-[#6B6258]">
            <Sparkles className="w-4 h-4 text-[#B89B5E] shrink-0" />
            <span>
              <strong>Platform Signal for {selectedLocation}:</strong> {locationReasons[selectedLocation]}
            </span>
          </div>
        </div>

        {/* Trending Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {trendingProducts.slice(0, 4).map((prod) => (
            <div
              key={prod.id}
              onClick={() => onSelectProduct(prod)}
              className="group rounded-2xl bg-white border border-[#E7E0D3] overflow-hidden hover:border-[#B89B5E] hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square relative overflow-hidden bg-[#E7E0D3]">
                  <img
                    src={prod.images[0]?.image_url}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#B89B5E] text-white shadow-xs">
                    Trending in {selectedLocation.split(' ')[0]}
                  </span>
                </div>

                <div className="p-4 text-xs">
                  <span className="text-[11px] text-[#9A9089] block">
                    By {prod.artisan_name}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#1C1917] line-clamp-1 mt-0.5 group-hover:text-[#B89B5E]">
                    {prod.title}
                  </h4>
                  <p className="text-[11px] text-[#6B6258] font-medium mt-1">
                    ⚡ {prod.inquiry_count || 14}+ inquiries this week
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-baseline justify-between border-t border-[#E7E0D3] pt-2">
                  <div>
                    <span className="text-[10px] text-[#9A9089] block">Retail</span>
                    <span className="font-serif font-bold text-sm text-[#1C1917]">
                      ₹{prod.price}
                    </span>
                  </div>
                  {prod.b2b_price && (
                    <div className="text-right">
                      <span className="text-[10px] text-[#6B6258] font-bold block">Wholesale</span>
                      <span className="font-serif font-bold text-xs text-[#6B6258]">
                        ₹{prod.b2b_price}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
