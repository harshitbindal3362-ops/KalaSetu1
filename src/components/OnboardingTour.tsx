import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';
import { TOUR_TRANSLATIONS } from '../lib/tourTranslations';

export interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateHome?: () => void;
}

interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface StepConfig {
  id: number;
  target: string;
  preferredPlacement?: 'bottom' | 'top' | 'left' | 'right' | 'center';
  padding?: number;
}

const TOUR_STEPS: StepConfig[] = [
  { id: 1, target: 'hero', preferredPlacement: 'center', padding: 12 },
  { id: 2, target: 'search', preferredPlacement: 'bottom', padding: 8 },
  { id: 3, target: 'nav-artisans', preferredPlacement: 'bottom', padding: 6 },
  { id: 4, target: 'ai-discovery', preferredPlacement: 'bottom', padding: 6 },
  { id: 5, target: 'wishlist-cart', preferredPlacement: 'bottom', padding: 6 },
  { id: 6, target: 'customer-type', preferredPlacement: 'bottom', padding: 6 },
  { id: 7, target: 'featured-products', preferredPlacement: 'top', padding: 12 },
  { id: 8, target: 'order-tracking', preferredPlacement: 'bottom', padding: 6 },
  { id: 9, target: 'language-selector', preferredPlacement: 'bottom', padding: 6 },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onNavigateHome,
}) => {
  const { language } = useLanguage();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const stepConfig = TOUR_STEPS[currentStepIndex];
  const totalSteps = TOUR_STEPS.length;
  const currentStepNumber = currentStepIndex + 1;

  // Language bundle with graceful fallback
  const langBundle = TOUR_TRANSLATIONS[language] || TOUR_TRANSLATIONS.en;
  const stepText = langBundle.steps[currentStepNumber] || TOUR_TRANSLATIONS.en.steps[currentStepNumber];

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Locate and measure target element
  const updateTargetRect = useCallback(() => {
    if (!isOpen) return;

    if (stepConfig.preferredPlacement === 'center' && currentStepNumber === 1) {
      // Step 1 Welcome: measure hero if available, but if viewport is centered, target is hero banner
      const heroEl = document.querySelector('[data-tour="hero"]');
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        setTargetRect({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
        });
      } else {
        setTargetRect(null);
      }
      return;
    }

    const selector = `[data-tour="${stepConfig.target}"]`;
    const el = document.querySelector(selector);

    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
      });
    } else {
      // Fallback if target element is momentarily not in DOM
      setTargetRect(null);
    }
  }, [isOpen, stepConfig, currentStepNumber]);

  // Scroll target element smoothly into view on step change
  useEffect(() => {
    if (!isOpen) return;

    // If on a page other than home, ensure home is active so all targets exist
    if (onNavigateHome) {
      onNavigateHome();
    }

    const timer = setTimeout(() => {
      const selector = `[data-tour="${stepConfig.target}"]`;
      const el = document.querySelector(selector);
      if (el) {
        if (stepConfig.preferredPlacement !== 'center') {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      // Re-measure after scroll animation starts
      setTimeout(updateTargetRect, 200);
      setTimeout(updateTargetRect, 450);
    }, 50);

    return () => clearTimeout(timer);
  }, [currentStepIndex, isOpen, stepConfig, onNavigateHome, updateTargetRect]);

  // Listen to window scroll & resize events
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollResize = () => {
      window.requestAnimationFrame(updateTargetRect);
    };

    window.addEventListener('scroll', handleScrollResize, { passive: true });
    window.addEventListener('resize', handleScrollResize);

    return () => {
      window.removeEventListener('scroll', handleScrollResize);
      window.removeEventListener('resize', handleScrollResize);
    };
  }, [isOpen, updateTargetRect]);

  // Keyboard navigation: Escape closes/skips, ArrowRight next, ArrowLeft previous
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' && currentStepIndex < totalSteps - 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, totalSteps]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem('kalasetu_tour_completed', 'true');
    } catch (e) {}
    onClose();
  };

  const handleFinish = () => {
    try {
      localStorage.setItem('kalasetu_tour_completed', 'true');
    } catch (e) {}
    onClose();
  };

  // Calculate tooltip placement styles
  const getTooltipStyle = (): React.CSSProperties => {
    const cardWidth = isMobile ? Math.min(window.innerWidth - 32, 360) : 380;
    const padding = stepConfig.padding || 8;
    const tooltipEstHeight = 250;

    // Step 1: Centered Welcome Card
    if (currentStepNumber === 1 || !targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${cardWidth}px`,
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 60,
      };
    }

    // On mobile, stick tooltip near bottom for clean ergonomics
    if (isMobile) {
      return {
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${cardWidth}px`,
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 60,
      };
    }

    // Desktop smart positioning: top, bottom, or clamped
    let top = 0;
    let left = targetRect.x + targetRect.width / 2 - cardWidth / 2;

    // Clamp horizontal position within viewport
    left = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, left));

    const spaceBelow = window.innerHeight - (targetRect.bottom + padding);
    const spaceAbove = targetRect.top - padding;

    if (stepConfig.preferredPlacement === 'top') {
      if (spaceAbove >= tooltipEstHeight + 16) {
        top = targetRect.top - padding - tooltipEstHeight - 12;
      } else {
        top = targetRect.bottom + padding + 12;
      }
    } else {
      if (spaceBelow >= tooltipEstHeight + 16) {
        top = targetRect.bottom + padding + 12;
      } else if (spaceAbove >= tooltipEstHeight + 16) {
        top = targetRect.top - padding - tooltipEstHeight - 12;
      } else {
        top = (window.innerHeight - tooltipEstHeight) / 2;
      }
    }

    // Ensure tooltip is strictly within viewport vertically
    top = Math.max(16, Math.min(window.innerHeight - tooltipEstHeight - 16, top));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
      zIndex: 60,
    };
  };

  const pad = stepConfig.padding || 8;
  const stepLabel = langBundle.step_of
    .replace('{current}', String(currentStepNumber))
    .replace('{total}', String(totalSteps));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="KalaSetu Onboarding Tour"
      className="fixed inset-0 z-50 overflow-hidden font-sans select-none"
    >
      {/* SVG Spotlight Cutout Mask */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none transition-all duration-300"
        style={{ zIndex: 51 }}
      >
        <defs>
          <mask id="kalasetu-spotlight-mask">
            {/* White reveals full dark overlay */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cutout punches a clear window over the target */}
            {targetRect && currentStepNumber !== 1 && (
              <rect
                x={targetRect.x - pad}
                y={targetRect.y - pad}
                width={targetRect.width + pad * 2}
                height={targetRect.height + pad * 2}
                rx="14"
                ry="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Semi-transparent dark overlay using deep charcoal */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(28, 25, 23, 0.72)"
          mask="url(#kalasetu-spotlight-mask)"
          className="pointer-events-auto cursor-default"
        />
      </svg>

      {/* Target Highlight Glow Border */}
      {targetRect && currentStepNumber !== 1 && (
        <div
          style={{
            position: 'fixed',
            top: targetRect.y - pad,
            left: targetRect.x - pad,
            width: targetRect.width + pad * 2,
            height: targetRect.height + pad * 2,
            zIndex: 52,
          }}
          className="pointer-events-none rounded-2xl border-2 border-[#B89B5E] shadow-[0_0_24px_rgba(184,155,94,0.45)] transition-all duration-300"
        />
      )}

      {/* Tooltip Card */}
      <div
        ref={tooltipRef}
        style={getTooltipStyle()}
        className="bg-white rounded-3xl border border-[#E7E0D3] shadow-2xl p-5 sm:p-6 text-[#1C1917] transition-all duration-300 animate-in fade-in zoom-in-95"
      >
        {/* Top Header: Step Badge + Progress Bar + Close Button */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#E7E0D3] text-[11px] font-semibold text-[#B89B5E] tracking-wide">
              {stepLabel}
            </span>
            <div className="flex items-center gap-1">
              {TOUR_STEPS.map((s, idx) => (
                <div
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex
                      ? 'w-4 bg-[#B89B5E]'
                      : idx < currentStepIndex
                      ? 'w-1.5 bg-[#B89B5E]/60'
                      : 'w-1.5 bg-[#E7E0D3]'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleSkip}
            className="p-1 rounded-full text-[#9A9089] hover:text-[#1C1917] hover:bg-[#FAF7F0] transition-colors cursor-pointer"
            title={langBundle.btn_close}
            aria-label={langBundle.btn_close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Title & Icon */}
        <div className="space-y-1.5 mb-2">
          {currentStepNumber === 1 && (
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F0] border border-[#E7E0D3] text-[#B89B5E] flex items-center justify-center mb-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#B89B5E]" />
            </div>
          )}
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917] leading-snug">
            {stepText.title}
          </h3>
        </div>

        {/* Step Description */}
        <p className="text-xs sm:text-sm text-[#6B6258] font-normal leading-relaxed mb-5">
          {stepText.desc}
        </p>

        {/* Controls Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E7E0D3]/80 gap-2">
          {/* Left Action: Skip or Previous */}
          {currentStepNumber === 1 ? (
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 text-xs font-semibold text-[#9A9089] hover:text-[#1C1917] transition-colors cursor-pointer"
            >
              {langBundle.btn_skip}
            </button>
          ) : (
            <button
              onClick={handlePrev}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#4A3B1E] bg-[#FAF7F0] hover:bg-[#E7E0D3] border border-[#E7E0D3] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{langBundle.btn_prev}</span>
            </button>
          )}

          {/* Right Action: Next, Start, or Finish */}
          {currentStepNumber === 1 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#B89B5E] hover:bg-[#9F8249] text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>{langBundle.btn_start}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : currentStepNumber === totalSteps ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF7F0] hover:bg-[#E7E0D3] text-[#4A3B1E] text-xs font-semibold border border-[#E7E0D3] transition-colors cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#B89B5E]" />
                <span>{langBundle.btn_explore}</span>
              </button>
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#B89B5E] hover:bg-[#9F8249] text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{langBundle.btn_finish}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="hidden sm:inline-block px-2.5 py-1 text-xs font-medium text-[#9A9089] hover:text-[#6B6258] cursor-pointer"
              >
                {langBundle.btn_skip}
              </button>
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#B89B5E] hover:bg-[#9F8249] text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>{langBundle.btn_next}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
