import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  User,
  Building,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Award,
  Globe,
  MapPin,
  Heart,
  Hammer,
  ShoppingBag,
  Briefcase,
  Headphones,
  ShieldAlert,
  Star,
  Layers,
  Database,
  Server,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_PROFILES } from '../data/seedData';
import { supabase, isSupabaseConfigured, dataStore } from '../lib/supabase';
import { useLanguage } from '../lib/i18n';
import { LanguageSelector } from './LanguageSelector';

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
  onContinueAsGuest: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthSuccess,
  onContinueAsGuest,
}) => {
  const { t, isHindiOrRegional } = useLanguage();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [isB2B, setIsB2B] = useState<boolean>(false);

  // Form Fields
  const [identifier, setIdentifier] = useState<string>('ananya.sharma@example.com');
  const [password, setPassword] = useState<string>('kalasetu2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('Ananya Sharma');
  const [phone, setPhone] = useState<string>('+91 98201 45678');
  const [stateRegion, setStateRegion] = useState<string>('Maharashtra');
  const [businessName, setBusinessName] = useState<string>('');
  const [craftSpecialty, setCraftSpecialty] = useState<string>('Blue Pottery');

  // Interactive UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Real Database Persistence Stats
  const dbStats = dataStore.getDatabaseStats();

  // Quick 1-click Demo Profiles from Seed Data
  const demoProfiles = [
    {
      profile: INITIAL_PROFILES[0], // Ananya Sharma (Retail Collector)
      label: 'Retail Collector',
      sub: 'Ananya Sharma (Mumbai)',
      icon: ShoppingBag,
      role: 'customer' as UserRole,
      badgeColor: 'from-[#B89B5E] to-[#B89B5E]',
    },
    {
      profile: INITIAL_PROFILES[1], // Vikram Singhal (B2B Buyer)
      label: 'B2B Wholesale Buyer',
      sub: 'Heritage Living Retail Ltd.',
      icon: Briefcase,
      role: 'customer' as UserRole,
      badgeColor: 'from-[#6B6258] to-[#6B6258]',
    },
    {
      profile: INITIAL_PROFILES[2], // Ustad Rameshwar Prajapati (Artisan)
      label: 'Master Artisan',
      sub: 'Ustad Rameshwar (Jaipur)',
      icon: Hammer,
      role: 'artisan' as UserRole,
      badgeColor: 'from-[#9F8249] to-[#B89B5E]',
    },
    {
      profile: INITIAL_PROFILES[5], // Admin
      label: 'Platform Admin',
      sub: 'KalaSetu Governance',
      icon: ShieldCheck,
      role: 'admin' as UserRole,
      badgeColor: 'from-[#4A3B1E] to-[#6B6258]',
    },
  ];

  const handleRoleSelect = (role: UserRole, b2b = false) => {
    setSelectedRole(role);
    setIsB2B(b2b);

    if (role === 'artisan') {
      setIdentifier('rameshwar.prajapati@kalasetu.in');
      setFullName('Ustad Rameshwar Prajapati');
      setStateRegion('Rajasthan');
    } else if (role === 'customer' && b2b) {
      setIdentifier('vikram.singhal@heritageboutique.in');
      setFullName('Vikram Singhal');
      setBusinessName('Heritage Living Retail Ltd.');
      setStateRegion('Delhi');
    } else if (role === 'customer') {
      setIdentifier('ananya.sharma@example.com');
      setFullName('Ananya Sharma');
      setStateRegion('Maharashtra');
    } else if (role === 'support_operator') {
      setIdentifier('support.pooja@kalasetu.in');
      setFullName('Pooja Verma');
      setStateRegion('Karnataka');
    } else if (role === 'admin') {
      setIdentifier('admin@kalasetu.in');
      setFullName('KalaSetu Lead Administrator');
      setStateRegion('Delhi');
    }
  };

  const handleDemoLogin = (profile: UserProfile) => {
    setIsSubmitting(true);
    dataStore.setCurrentUser(profile);
    setIsSubmitting(false);
    onAuthSuccess(profile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMsg(t('auth.identifier_req', 'Please enter your email or mobile phone number.'));
      return;
    }
    if (password.length < 6) {
      setErrorMsg(t('auth.password_min', 'Password must contain at least 6 characters.'));
      return;
    }

    setIsSubmitting(true);

    try {
      if (supabase && isSupabaseConfigured) {
        const cleanEmail = cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier.replace(/\D/g, '')}@kalasetu.in`;
        if (authMode === 'signin') {
          const { error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (error && !error.message.includes('Invalid login credentials')) {
            console.warn('Supabase auth notice:', error.message);
          }
        } else {
          await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: fullName,
                role: selectedRole,
                phone,
                state: stateRegion,
              },
            },
          });
        }
      }
    } catch (err: any) {
      console.warn('Network sync notice (local database fallback active):', err?.message);
    }

    if (authMode === 'signup') {
      // 1. REGISTER NEW USER IN LOCAL & CLOUD DATABASE
      const emailToUse = cleanIdentifier.includes('@')
        ? cleanIdentifier
        : `${cleanIdentifier.replace(/\D/g, '')}@kalasetu.in`;

      const regResult = dataStore.registerUser({
        full_name: fullName.trim() || (cleanIdentifier.includes('@') ? cleanIdentifier.split('@')[0] : 'Artisan Patron'),
        email: emailToUse,
        phone: phone.trim() || (cleanIdentifier.includes('@') ? '+91 98000 00000' : cleanIdentifier),
        password: password,
        role: selectedRole,
        business_name: isB2B ? (businessName || 'Wholesale Enterprise') : undefined,
        state: stateRegion,
      });

      if (!regResult.success) {
        setErrorMsg(regResult.error || 'Registration could not be completed.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMsg(t('auth.reg_success', 'Account registered and securely stored in database! Logging you in...'));
      setTimeout(() => {
        setIsSubmitting(false);
        onAuthSuccess(regResult.user!);
      }, 400);
      return;
    }

    // 2. SIGN IN: VERIFY REGISTERED USER FROM DATABASE
    const loginResult = dataStore.loginUser(cleanIdentifier, password);
    if (!loginResult.success) {
      setErrorMsg(
        loginResult.error ||
        t('auth.invalid_cred', 'Invalid credentials. If this is a new account, please click "Create Account" first to register in the database.')
      );
      setIsSubmitting(false);
      return;
    }

    setSuccessMsg(t('auth.login_success', 'Credentials verified! Launching your portal...'));
    setTimeout(() => {
      setIsSubmitting(false);
      onAuthSuccess(loginResult.user!);
    }, 300);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-[#FAF7F0] via-[#F5F0E8] to-[#E7E0D3] text-[#1C1917] flex flex-col justify-between relative overflow-hidden"
      id="auth-screen"
    >
      {/* Background Indian jaali lattice overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#B89B5E 1.5px, transparent 1.5px), radial-gradient(#4A3B1E 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />

      {/* Decorative ambient radial orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#B89B5E]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#B89B5E]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#B89B5E] to-[#4A3B1E] flex items-center justify-center text-white shadow-lg shadow-[#B89B5E]/25">
            <span className="font-serif text-2xl font-bold tracking-wider">क</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1C1917]">
                KalaSetu
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-[#B89B5E]/10 text-[#B89B5E] border border-[#B89B5E]/20">
                कलासेतु
              </span>
            </div>
            <p className="text-[11px] text-[#6B6258] font-medium tracking-wide">
              Crafted by Hands • Rooted in Heritage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <button
            onClick={onContinueAsGuest}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6258] hover:text-[#B89B5E] bg-white/80 border border-[#E7E0D3] transition-all cursor-pointer px-3.5 py-1.5 rounded-full hover:bg-white shadow-sm"
          >
            <span>{t('nav.explore', 'Explore Marketplace')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#B89B5E]" />
          </button>
        </div>
      </header>

      {/* Main Authentication Card Grid */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-[#E7E0D3] overflow-hidden">
          {/* ========================================================================= */}
          {/* LEFT HERO STORYTELLING COLUMN (Indian Crafts & Provenance) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1C1917] via-[#1C1917] to-[#1C1917] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Background craft mosaic */}
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80')`,
              }}
            />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold text-[#E8D5A3] mb-6">
                <Sparkles className="w-3 h-3 text-[#B89B5E]" />
                <span>DIRECT ARTISAN COMMERCE PLATFORM</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight text-[#FAF7F0]">
                Where Heritage Meets Fair Direct Trade
              </h2>

              <p className="text-sm text-[#E7E0D3] mt-4 leading-relaxed font-light">
                Sign in to discover GI-certified handcrafted masterworks, request wholesale
                crating quotes, or list your creations with 1-click AI voice assistance.
              </p>

              {/* 3 Key Value Props */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#B89B5E]/30 border border-[#B89B5E]/50 flex items-center justify-center shrink-0 text-[#E8D5A3] mt-0.5">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">100% Certified Master Artisans</h4>
                    <p className="text-[11px] text-[#9A9089]">
                      Dispatched directly from certified looms, pottery wheels, and brass kilns across India.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#6B6258]/40 border border-[#6B6258] flex items-center justify-center shrink-0 text-[#D4B87A] mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">0% Middleman Markups</h4>
                    <p className="text-[11px] text-[#9A9089]">
                      Full fair earnings go directly into the hands of the creating artisans and families.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#B89B5E]/30 border border-[#B89B5E]/50 flex items-center justify-center shrink-0 text-[#E8D5A3] mt-0.5">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Live B2B Wholesale Quotes</h4>
                    <p className="text-[11px] text-[#9A9089]">
                      Direct quotations, custom monograms, and export-grade wooden crating logistics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center gap-1 text-[#D4B87A] mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <p className="text-xs italic text-[#E7E0D3]">
                "Through KalaSetu’s AI voice cataloging, my Jaipur Blue Pottery now ships directly to patrons in 14 countries without any exploitative agent cuts."
              </p>
              <p className="text-[11px] font-semibold text-[#E8D5A3] mt-2">
                — Ustad Rameshwar Prajapati, Master Ceramicist (Jaipur)
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT AUTH FORM & ROLE PICKER */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Tab Switcher: Sign In vs Create Account */}
              <div className="flex items-center justify-between border-b border-[#E7E0D3] pb-4 mb-6">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMsg(null);
                    }}
                    className={`pb-1 text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
                      authMode === 'signin'
                        ? 'text-[#B89B5E]'
                        : 'text-[#9A9089] hover:text-[#1C1917]'
                    }`}
                  >
                    <span>Sign In (लॉग इन)</span>
                    {authMode === 'signin' && (
                      <motion.div
                        layoutId="auth-tab-indicator"
                        className="absolute -bottom-4.5 left-0 right-0 h-0.5 bg-[#B89B5E]"
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMsg(null);
                    }}
                    className={`pb-1 text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
                      authMode === 'signup'
                        ? 'text-[#B89B5E]'
                        : 'text-[#9A9089] hover:text-[#1C1917]'
                    }`}
                  >
                    <span>Create Account (नया खाता)</span>
                    {authMode === 'signup' && (
                      <motion.div
                        layoutId="auth-tab-indicator"
                        className="absolute -bottom-4.5 left-0 right-0 h-0.5 bg-[#B89B5E]"
                      />
                    )}
                  </button>
                </div>

                <span className="text-xs text-[#9A9089] hidden sm:inline">
                  Step 1 of 2
                </span>
              </div>

              {/* Persona / Role Selector */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-[#6B6258] uppercase tracking-wider mb-2">
                  Select Your Profile Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('customer', false)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      selectedRole === 'customer' && !isB2B
                        ? 'bg-[#B89B5E]/10 border-[#B89B5E] text-[#B89B5E] shadow-xs'
                        : 'bg-[#FAF7F0] border-[#E7E0D3] hover:bg-white text-[#1C1917]'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Art Collector</p>
                      <p className="text-[10px] text-[#9A9089]">Retail Patron</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('customer', true)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      selectedRole === 'customer' && isB2B
                        ? 'bg-[#6B6258]/10 border-[#6B6258] text-[#6B6258] shadow-xs'
                        : 'bg-[#FAF7F0] border-[#E7E0D3] hover:bg-white text-[#1C1917]'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-tight">B2B Wholesale</p>
                      <p className="text-[10px] text-[#9A9089]">Hotels & Export</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('artisan')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      selectedRole === 'artisan'
                        ? 'bg-[#B89B5E]/15 border-[#B89B5E] text-[#9F8249] shadow-xs'
                        : 'bg-[#FAF7F0] border-[#E7E0D3] hover:bg-white text-[#1C1917]'
                    }`}
                  >
                    <Hammer className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Master Artisan</p>
                      <p className="text-[10px] text-[#9A9089]">शिल्पकार (Maker)</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Database Storage Persistence Status Badge */}
              <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-50/90 to-stone-50 border border-amber-200/90 text-xs flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2 text-stone-800">
                  <Database className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-900">Database Storage Engine:</span>{' '}
                    <span className="text-stone-600">
                      {dbStats.registeredUsersCount} registered user accounts safely stored
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              </div>

              {/* Success Banner */}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Error Banner */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                  {authMode === 'signin' && errorMsg.includes('register') && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMsg(null);
                      }}
                      className="text-[11px] font-bold text-[#B89B5E] underline hover:text-[#9F8249] pl-6 block"
                    >
                      Click here to Register this as a New User →
                    </button>
                  )}
                </div>
              )}

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name (Sign Up only) */}
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Full Name / Studio Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9089]" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rameshwar Prajapati"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAF7F0] border border-[#E7E0D3] rounded-xl focus:bg-white focus:border-[#B89B5E] focus:ring-2 focus:ring-[#B89B5E]/20 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Email / Mobile Identifier */}
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Email Address or Indian Mobile Number
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9089]" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="name@kalasetu.in or +91 98XXX XXXXX"
                      required
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FAF7F0] border border-[#E7E0D3] rounded-xl focus:bg-white focus:border-[#B89B5E] focus:ring-2 focus:ring-[#B89B5E]/20 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#1C1917]">
                      Password
                    </label>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => alert('For this demo, any password with 6+ characters will sign in!')}
                        className="text-[11px] text-[#B89B5E] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9089]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter at least 6 characters"
                      required
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-[#FAF7F0] border border-[#E7E0D3] rounded-xl focus:bg-white focus:border-[#B89B5E] focus:ring-2 focus:ring-[#B89B5E]/20 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A9089] hover:text-[#1C1917] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Additional details for Sign Up */}
                {authMode === 'signup' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        State / Region
                      </label>
                      <select
                        value={stateRegion}
                        onChange={(e) => setStateRegion(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#FAF7F0] border border-[#E7E0D3] rounded-xl focus:bg-white focus:border-[#B89B5E] focus:outline-none"
                      >
                        <option value="Rajasthan">Rajasthan (Jaipur/Jodhpur)</option>
                        <option value="Gujarat">Gujarat (Kutch/Patan)</option>
                        <option value="Kashmir">Jammu & Kashmir (Srinagar)</option>
                        <option value="Odisha">Odisha (Raghurajpur/Puri)</option>
                        <option value="West Bengal">West Bengal (Shantiniketan)</option>
                        <option value="Maharashtra">Maharashtra (Mumbai/Paithan)</option>
                        <option value="Delhi">Delhi NCR</option>
                        <option value="Karnataka">Karnataka (Bengaluru/Mysore)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                        {isB2B ? 'Business / GST' : selectedRole === 'artisan' ? 'Craft Discipline' : 'Preferred Craft'}
                      </label>
                      <input
                        type="text"
                        value={isB2B ? businessName : craftSpecialty}
                        onChange={(e) =>
                          isB2B ? setBusinessName(e.target.value) : setCraftSpecialty(e.target.value)
                        }
                        placeholder={isB2B ? 'Company Name' : 'e.g. Blue Pottery, Ajrakh'}
                        className="w-full px-3 py-2 text-xs bg-[#FAF7F0] border border-[#E7E0D3] rounded-xl focus:bg-white focus:border-[#B89B5E] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#B89B5E] via-[#C4A96B] to-[#B89B5E] hover:from-[#9F8249] hover:to-[#B89B5E] text-white font-bold text-sm shadow-md shadow-[#B89B5E]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  id="auth-submit-btn"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating & Launching 3D Portal...</span>
                    </div>
                  ) : (
                    <>
                      <span>{authMode === 'signin' ? 'Sign In & Enter KalaSetu' : 'Create Account & Enter'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* ========================================================================= */}
              {/* 1-CLICK DEMO PROFILES (Instant Test Access) */}
              {/* ========================================================================= */}
              <div className="mt-6 pt-5 border-t border-[#E7E0D3]">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-bold text-[#6B6258] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B89B5E]" />
                    <span>Instant 1-Click Demo Profiles</span>
                  </p>
                  <span className="text-[10px] text-[#9A9089]">Click to test 3D flow</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {demoProfiles.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleDemoLogin(item.profile)}
                        className="p-2 rounded-xl bg-[#FAF7F0] hover:bg-[#E7E0D3] border border-[#E7E0D3] hover:border-[#B89B5E] transition-all text-left group cursor-pointer"
                        title={`Login immediately as ${item.profile.full_name}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${item.badgeColor} flex items-center justify-center text-white shrink-0 shadow-xs`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <span className="text-[10px] font-bold text-[#1C1917] group-hover:text-[#B89B5E] truncate">
                            {item.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#9A9089] truncate">
                          {item.sub}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Guest Link */}
            <div className="mt-6 pt-4 border-t border-[#E7E0D3] flex items-center justify-between text-xs text-[#9A9089]">
              <span>Need help? Call our support desk: 1800-KALA-SETU</span>
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="text-[#B89B5E] font-semibold hover:underline cursor-pointer"
              >
                Skip & View Marketplace →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer minimal info */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-[#9A9089]">
        <p>© 2026 KalaSetu (कलासेतु) • Ministry of Textiles & Handicrafts Partner • Zero Middleman Certified</p>
      </footer>
    </div>
  );
};
