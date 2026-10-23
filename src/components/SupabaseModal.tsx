import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Layers,
  ArrowRight,
  Server,
  Key,
  Globe,
  UploadCloud,
  Code,
  X,
  Sparkles,
  FileText,
  Table as TableIcon,
} from 'lucide-react';
import { dataStore, supabase, SUPABASE_CONFIG } from '../lib/supabase';
import { MVP_15_TABLES_SQL, FULL_26_TABLES_SQL, SCHEMA_TABLES_LIST } from '../data/schemas';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latency?: number;
    message: string;
  } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'sync'>('schema');
  const [schemaMode, setSchemaMode] = useState<'mvp' | 'full' | 'dictionary'>('mvp');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !testResult) {
      handleTestConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await dataStore.testSupabaseConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection test timed out',
      });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const currentSql = schemaMode === 'mvp' ? MVP_15_TABLES_SQL : FULL_26_TABLES_SQL;

  const handleSyncDataToSupabase = async () => {
    if (!supabase) {
      alert('Supabase client is not initialized.');
      return;
    }
    setSyncing(true);
    setSyncStatus('Connecting to Supabase tables...');

    try {
      const localProducts = dataStore.getProducts();
      const localArtisans = dataStore.getArtisans();

      // Check if tables exist by attempting a select
      const { error: testErr } = await supabase.from('products').select('id').limit(1);

      if (testErr && testErr.code === '42P01') {
        // Table does not exist in Supabase yet
        setSyncStatus(
          'Notice: The "products" table does not exist yet in your Supabase SQL editor. Please run the SQL Schema provided in the "SQL Schema" tab first!'
        );
        setSyncing(false);
        return;
      }

      setSyncStatus(`Syncing ${localArtisans.length} artisans & ${localProducts.length} masterworks...`);

      // Attempt to upsert
      const { error: artErr } = await supabase.from('artisans').upsert(
        localArtisans.map((a) => ({
          id: a.id,
          name: a.name,
          craft_name: a.craft_name,
          city: a.city,
          state: a.state,
          region: a.region,
          story: a.story || a.bio,
          profile_image_url: a.profile_image_url,
          verification_status: a.verification_status,
          years_of_experience: a.years_of_experience,
        }))
      );

      if (artErr) {
        throw artErr;
      }

      setSyncStatus('Synced master artisans successfully to your Supabase database!');
    } catch (err: any) {
      setSyncStatus(`Sync info: ${err.message || 'If tables are not created yet, run the SQL script in your Supabase dashboard.'}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      id="supabase-hub-modal"
    >
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#E7E0D3] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="bg-[#1C1917] text-white px-6 py-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#B89B5E]/20 border border-[#B89B5E]/40 flex items-center justify-center text-[#B89B5E]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-white">
                  Supabase Database Hub
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B89B5E]/20 text-[#B89B5E] border border-[#B89B5E]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89B5E] animate-pulse" />
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-[#E7E0D3]">
                Project: <strong className="text-white">{SUPABASE_CONFIG.projectName}</strong> • ID: <code className="text-[#E8D5A3]">{SUPABASE_CONFIG.projectId}</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#E7E0D3] px-6 bg-[#FAF7F0]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-[#B89B5E] text-[#B89B5E]'
                : 'border-transparent text-[#9A9089] hover:text-[#1C1917]'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Connection Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'border-[#B89B5E] text-[#B89B5E]'
                : 'border-transparent text-[#9A9089] hover:text-[#1C1917]'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>SQL Schema (PostgreSQL)</span>
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'sync'
                ? 'border-[#B89B5E] text-[#B89B5E]'
                : 'border-transparent text-[#9A9089] hover:text-[#1C1917]'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Data Sync & Seeding</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-[#1C1917] space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Live Connection Status Banner */}
              <div className="p-4 rounded-2xl bg-[#B89B5E]/10 border border-[#B89B5E]/30 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#B89B5E]/20 text-[#6B6258] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#6B6258]">
                      Active Supabase Connection Established
                    </h4>
                    <p className="text-xs text-[#6B6258] mt-0.5">
                      KalaSetu is configured with your database project. Authentication requests and data queries are routing directly to your Supabase cloud backend.
                    </p>
                    {testResult && (
                      <div className="mt-2 text-xs font-mono text-[#6B6258] flex items-center gap-2">
                        <span>Latency: {testResult.latency}ms</span>
                        <span>•</span>
                        <span>{testResult.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-[#E7E0D3] text-[#6B6258] border border-[#B89B5E]/40 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? 'Testing...' : 'Ping Test'}</span>
                </button>
              </div>

              {/* Credentials Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project URL */}
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E7E0D3]">
                  <div className="flex items-center justify-between text-xs text-[#9A9089] mb-1">
                    <span className="font-semibold flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#B89B5E]" />
                      Project URL
                    </span>
                    <button
                      onClick={() => copyToClipboard(SUPABASE_CONFIG.url, setCopiedUrl)}
                      className="text-[#B89B5E] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs text-[#1C1917] break-all font-medium">
                    {SUPABASE_CONFIG.url}
                  </p>
                </div>

                {/* Project ID */}
                <div className="p-4 rounded-2xl bg-[#FAF7F0] border border-[#E7E0D3]">
                  <div className="flex items-center justify-between text-xs text-[#9A9089] mb-1">
                    <span className="font-semibold flex items-center gap-1">
                      <Server className="w-3.5 h-3.5 text-[#B89B5E]" />
                      Project ID
                    </span>
                    <span className="text-[11px] font-bold text-[#6B6258] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {SUPABASE_CONFIG.projectName}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-[#1C1917] font-bold">
                    {SUPABASE_CONFIG.projectId}
                  </p>
                </div>

                {/* Publishable Anon Key */}
                <div className="sm:col-span-2 p-4 rounded-2xl bg-[#FAF7F0] border border-[#E7E0D3]">
                  <div className="flex items-center justify-between text-xs text-[#9A9089] mb-1">
                    <span className="font-semibold flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-[#6B6258]" />
                      API Key (Publishable / Anon)
                    </span>
                    <button
                      onClick={() => copyToClipboard(SUPABASE_CONFIG.anonKey, setCopiedKey)}
                      className="text-[#B89B5E] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs text-[#1C1917] break-all bg-white p-2 rounded-lg border border-[#E7E0D3]">
                    {SUPABASE_CONFIG.anonKey}
                  </p>
                </div>
              </div>

              {/* Quick Links to Supabase Console */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-amber-900">
                    Open Your Supabase Dashboard Console
                  </h5>
                  <p className="text-[11px] text-amber-800">
                    Access your Table Editor, SQL Editor, and Authentication users directly in Supabase.
                  </p>
                </div>
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_CONFIG.projectId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#1C1917] hover:bg-[#4A3B1E] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Open Supabase</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SQL SCHEMA */}
          {/* ========================================================================= */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              {/* Mode Toggle Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F0] p-2 rounded-2xl border border-[#E7E0D3]">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSchemaMode('mvp')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      schemaMode === 'mvp'
                        ? 'bg-[#1C1917] text-white shadow-xs'
                        : 'text-[#9A9089] hover:text-[#1C1917] hover:bg-white/60'
                    }`}
                  >
                    MVP (15 Core Tables)
                  </button>

                  <button
                    onClick={() => setSchemaMode('full')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      schemaMode === 'full'
                        ? 'bg-[#1C1917] text-white shadow-xs'
                        : 'text-[#9A9089] hover:text-[#1C1917] hover:bg-white/60'
                    }`}
                  >
                    Full System (26 Tables + RLS)
                  </button>

                  <button
                    onClick={() => setSchemaMode('dictionary')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      schemaMode === 'dictionary'
                        ? 'bg-[#1C1917] text-white shadow-xs'
                        : 'text-[#9A9089] hover:text-[#1C1917] hover:bg-white/60'
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Table Dictionary</span>
                  </button>
                </div>

                {schemaMode !== 'dictionary' && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://supabase.com/dashboard/project/${SUPABASE_CONFIG.projectId}/sql/new`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#E7E0D3] hover:bg-[#E7E0D3] text-xs font-semibold text-[#1C1917] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Open SQL Editor</span>
                      <ExternalLink className="w-3 h-3 text-[#B89B5E]" />
                    </a>

                    <button
                      onClick={() => copyToClipboard(currentSql, setCopiedSql)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#B89B5E] hover:bg-[#9F8249] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                    </button>
                  </div>
                )}
              </div>

              {schemaMode === 'dictionary' ? (
                /* Data Dictionary Table */
                <div className="border border-[#E7E0D3] rounded-2xl overflow-hidden bg-white shadow-xs">
                  <div className="overflow-x-auto max-h-80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F0] text-[#9A9089] uppercase font-bold text-[10px] tracking-wider border-b border-[#E7E0D3] sticky top-0 z-10">
                        <tr>
                          <th className="py-2.5 px-3">Table Name</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Main Columns</th>
                          <th className="py-2.5 px-3">Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E0D3]">
                        {SCHEMA_TABLES_LIST.map((t) => (
                          <tr key={t.name} className="hover:bg-[#FAF7F0]/50 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#B89B5E] whitespace-nowrap">
                              {t.name}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-700">
                                {t.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-stone-600 max-w-xs truncate" title={t.columns}>
                              {t.columns}
                            </td>
                            <td className="py-2.5 px-3 text-[#1C1917]">
                              {t.purpose}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* SQL Code Preview */
                <div className="relative">
                  <div className="flex items-center justify-between text-[11px] text-[#9A9089] mb-1 px-1">
                    <span>
                      {schemaMode === 'mvp'
                        ? '15 Core Tables (profiles, artisans, categories, products, orders, inquiries, drafts)'
                        : 'All 26 Tables + Foreign Keys + Performance Indexes + RLS Policies + auth.users Trigger'}
                    </span>
                    <span className="font-mono text-emerald-700 font-semibold">PostgreSQL DDL Ready</span>
                  </div>
                  <pre className="p-4 rounded-2xl bg-[#1C1917] text-[#E7E0D3] text-xs font-mono overflow-x-auto max-h-80 leading-relaxed border border-stone-800">
                    {currentSql}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: DATA SYNC & SEEDING */}
          {/* ========================================================================= */}
          {activeTab === 'sync' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-bold text-[#1C1917]">
                  Sync Certified Masterworks & Artisans to Supabase
                </h4>
                <p className="text-xs text-[#9A9089] mt-0.5">
                  Push KalaSetu's master artisan seed data (Jaipur Blue Pottery, Kutch Ajrakh, Kashmiri Walnut, Bastar Dhokra) into your Supabase database tables.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#E7E0D3] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#B89B5E]/10 text-[#B89B5E] flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1C1917]">Artisans & Products Payload</p>
                      <p className="text-[11px] text-[#9A9089]">Includes verified GI certificates, UPI IDs, and wholesale pricing tiers</p>
                    </div>
                  </div>

                  <button
                    onClick={handleSyncDataToSupabase}
                    disabled={syncing}
                    className="px-4 py-2.5 rounded-xl bg-[#6B6258] hover:bg-[#4A4038] text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                  >
                    <UploadCloud className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
                    <span>{syncing ? 'Syncing to Database...' : 'Sync Sample Data Now'}</span>
                  </button>
                </div>

                {syncStatus && (
                  <div className="p-3 rounded-xl bg-white border border-[#E7E0D3] text-xs font-medium text-[#1C1917]">
                    {syncStatus}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF7F0] px-6 py-4 border-t border-[#E7E0D3] flex items-center justify-between">
          <span className="text-xs text-[#9A9089]">
            Environment credentials saved in <code className="text-[#B89B5E]">.env</code> & configured
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1C1917] hover:bg-[#4A3B1E] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
