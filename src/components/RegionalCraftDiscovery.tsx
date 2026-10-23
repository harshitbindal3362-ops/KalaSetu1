import React, { useState } from 'react';
import { Product, Artisan } from '../types';
import { MapPin, Compass, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface RegionalCraftDiscoveryProps {
  products: Product[];
  artisans: Artisan[];
  onSelectProduct: (product: Product) => void;
  onViewArtisan: (artisanId: string) => void;
}

export const RegionalCraftDiscovery: React.FC<RegionalCraftDiscoveryProps> = ({
  products,
  artisans,
  onSelectProduct,
  onViewArtisan,
}) => {
  const regions = [
    {
      state: 'Rajasthan',
      capital: 'Jaipur',
      crafts: ['Jaipur Blue Pottery', 'Pichwai Painting', 'Sanganeri Print', 'Thewa Jewellery'],
      tagline: 'Land of Quartz Glazes & Royal Guilds',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    },
    {
      state: 'Gujarat',
      capital: 'Kutch',
      crafts: ['Ajrakh Block Print', 'Rogan Art', 'Kala Cotton Handloom', 'Bandhani'],
      tagline: 'Centuries of Desert Indigo Alchemy',
      image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=600&q=80',
    },
    {
      state: 'Odisha',
      capital: 'Raghurajpur',
      crafts: ['Pattachitra Scroll Painting', 'Dhokra Metal Casting', 'Pipili Applique'],
      tagline: 'Living Heritage Craft Villages',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    },
    {
      state: 'Jammu & Kashmir',
      capital: 'Srinagar',
      crafts: ['Pashmina Cashmere Shawls', 'Walnut Wood Carving', 'Papier-mâché'],
      tagline: 'Intricate Himalayan Flora Motifs',
      image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=600&q=80',
    },
    {
      state: 'West Bengal',
      capital: 'Shantiniketan',
      crafts: ['Bankura Terracotta', 'Kantha Embroidery', 'Sholapith Craft'],
      tagline: 'Soil and Thread of Bengal',
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const [selectedState, setSelectedState] = useState<string>('Rajasthan');

  const activeRegion = regions.find((r) => r.state === selectedState) || regions[0];
  const stateProducts = products.filter((p) => p.state === selectedState);
  const stateArtisans = artisans.filter((a) => a.state === selectedState);

  return (
    <section className="py-14 bg-[#FAF7F0] border-b border-[#E7E0D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#B89B5E] uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-[#B89B5E]" />
              <span>Geographical Craft Provenance</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
              Explore India’s Craft Geography
            </h2>
            <p className="text-sm text-[#6B6258] mt-1">
              Every region carries unique raw materials, climatic conditions, and generations-old guild knowledge.
            </p>
          </div>
        </div>

        {/* State Selection Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
          {regions.map((reg) => (
            <button
              key={reg.state}
              onClick={() => setSelectedState(reg.state)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedState === reg.state
                  ? 'bg-[#B89B5E] text-white shadow-md'
                  : 'bg-white hover:bg-[#E7E0D3] text-[#6B6258] border border-[#E7E0D3]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{reg.state}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Region Spotlight Banner */}
        <div className="rounded-3xl bg-white border border-[#E7E0D3] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 mb-8">
          <div className="lg:col-span-4 relative aspect-video lg:aspect-auto">
            <img
              src={activeRegion.image}
              alt={activeRegion.state}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:hidden" />
            <div className="absolute bottom-4 left-4 text-white lg:hidden">
              <span className="text-xs font-bold">{activeRegion.state}</span>
            </div>
          </div>

          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#B89B5E]">
                Regional Provenance
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
                {activeRegion.state} — {activeRegion.tagline}
              </h3>
              <p className="text-xs sm:text-sm text-[#6B6258] mt-2 leading-relaxed">
                Featuring master lineages in {activeRegion.crafts.join(', ')}. Certified raw materials sourced sustainably from indigenous local geography.
              </p>
            </div>

            <div className="pt-4 border-t border-[#E7E0D3] flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#9A9089]">Notable Disciplines:</span>
              {activeRegion.crafts.map((craft, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7F0] border border-[#E7E0D3] text-xs font-semibold text-[#1C1917]"
                >
                  {craft}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Products in this Region */}
        {stateProducts.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-lg text-[#1C1917]">
              Authentic Creations from {selectedState}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {stateProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  className="group rounded-2xl bg-white border border-[#E7E0D3] overflow-hidden hover:border-[#B89B5E] cursor-pointer shadow-2xs hover:shadow-md transition-all"
                >
                  <div className="aspect-square overflow-hidden bg-[#E7E0D3]">
                    <img
                      src={prod.images[0]?.image_url}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3 text-xs">
                    <span className="text-[10px] text-[#9A9089] block truncate">
                      {prod.craft_type}
                    </span>
                    <h5 className="font-serif font-bold text-[#1C1917] line-clamp-1 mt-0.5 group-hover:text-[#B89B5E]">
                      {prod.title}
                    </h5>
                    <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-[#E7E0D3]">
                      <span className="font-serif font-bold text-sm text-[#1C1917]">
                        ₹{prod.price}
                      </span>
                      {prod.b2b_price && (
                        <span className="text-[10px] text-[#6B6258] font-medium">
                          B2B: ₹{prod.b2b_price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
