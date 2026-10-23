import React from 'react';
import { Sparkles, Phone, ShieldCheck, Database } from 'lucide-react';

interface AnnouncementBarProps {
  onRequestCallback: () => void;
  onOpenSupabase?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  onRequestCallback,
  onOpenSupabase,
}) => {
  return (
    <div id="announcement-bar" className="bg-[#4A3B1E] text-[#FAF7F0] text-xs py-2 px-4 border-b border-[#6B6258]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#B89B5E] text-white">
            DIRECT CRAFT
          </span>
          <span className="font-medium text-[#E7E0D3]">
            100% Authentic Indian Handlooms & Crafts • Fair wages directly to certified artisan families
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-[#E7E0D3]">
          {onOpenSupabase && (
            <button
              onClick={onOpenSupabase}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[#B89B5E] font-medium transition-colors cursor-pointer"
              title="Click to open Supabase Database Hub"
            >
              <Database className="w-3 h-3 text-[#B89B5E]" />
              <span className="font-mono">DB: Artisan</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#B89B5E] animate-pulse" />
            </button>
          )}

          <div className="hidden md:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B89B5E]" />
            <span>Verified Master Crafts</span>
          </div>

          <button
            onClick={onRequestCallback}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer text-[#B89B5E] font-medium"
            title="Are you an artisan? Request free listing support via phone call"
          >
            <Phone className="w-3.5 h-3.5 animate-pulse" />
            <span>Artisan Call Support: +91 80000 12345</span>
          </button>
        </div>
      </div>
    </div>
  );
};
