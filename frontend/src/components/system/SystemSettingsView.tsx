import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Server,
  Shield,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Mail,
  Sliders,
  Sparkles,
  Sun,
  Moon,
  Eye,
  Monitor,
} from 'lucide-react';
import { SystemSettingState } from '../../types';

export const SystemSettingsView: React.FC = () => {
  const { systemSettings, setSystemSettings, addAuditLog, theme, setTheme } = useApp();
  const [formData, setFormData] = useState<SystemSettingState>({
    ...systemSettings,
    theme: systemSettings.theme || theme || 'dark',
    highContrastMode: systemSettings.highContrastMode !== undefined ? systemSettings.highContrastMode : true,
  });
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'mta' | 'governance' | 'antispam' | 'accessibility'>('mta');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSystemSettings(formData);
    if (formData.theme) {
      setTheme(formData.theme);
    }
    setIsSaved(true);
    addAuditLog('SETTINGS_UPDATED', 'SystemSettingState', 'global_config', 'System configuration and accessibility parameters updated.');
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setFormData((prev) => ({ ...prev, theme: newTheme }));
    setTheme(newTheme);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              System <span className="italic text-[#D4AF37]">Configuration</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Core Postfix MTA parameters, autonomous bounce suppression rules, Rspamd hygiene, and global dispatch thresholds.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Parameters Saved &amp; Applied</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {[
          { id: 'mta', label: 'Postfix & SMTP MTA Core', icon: Server },
          { id: 'governance', label: 'Autonomous Throttles & Hygiene', icon: Sliders },
          { id: 'antispam', label: 'Rspamd & Security Daemon', icon: Shield },
          { id: 'accessibility', label: 'Display & Accessibility', icon: Sun },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 font-bold shadow-sm'
                  : 'bg-white/[0.02] text-white/60 border border-white/5 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-white/40'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6 flex-1">
        {activeTab === 'mta' && (
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-[#D4AF37]" />
              Postfix Transport &amp; Delivery Nodes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-white/50 mb-1.5 font-mono uppercase text-[10px]">
                  MTA Hostname (myhostname)
                </label>
                <input
                  type="text"
                  value={formData.smtpHostname}
                  onChange={(e) => setFormData({ ...formData, smtpHostname: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1.5 font-mono uppercase text-[10px]">
                  SMTP Listening Port
                </label>
                <input
                  type="number"
                  value={formData.smtpPort}
                  onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) || 587 })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1.5 font-mono uppercase text-[10px]">
                  Postfix Spool Directory
                </label>
                <input
                  type="text"
                  value={formData.postfixQueuePath}
                  onChange={(e) => setFormData({ ...formData, postfixQueuePath: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1.5 font-mono uppercase text-[10px]">
                  Max Attachment Size (MB)
                </label>
                <input
                  type="number"
                  value={formData.maxAttachmentSizeMb}
                  onChange={(e) => setFormData({ ...formData, maxAttachmentSizeMb: parseInt(e.target.value) || 25 })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'governance' && (
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#D4AF37]" />
              Autonomous Throttling &amp; Auto-Protection Thresholds
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-white/50 mb-1.5 font-mono uppercase text-[10px]">
                  Auto-Throttle on Bounce Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.autoThrottleOnBounceThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, autoThrottleOnBounceThreshold: parseFloat(e.target.value) || 2.5 })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="text-[10px] text-white/40 mt-1 block">
                  Automatically reduces hourly delivery speed by 50% if bounce rate exceeds this threshold.
                </span>
              </div>

              <div>
                <label className="block text-white/50 mb-1.5 font-mono uppercase text-[10px]">
                  Auto-Pause on Complaint Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.autoPauseOnComplaintThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, autoPauseOnComplaintThreshold: parseFloat(e.target.value) || 0.08 })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="text-[10px] text-white/40 mt-1 block">
                  Instantly pauses active campaign dispatch if spam complaint rate surpasses this barrier.
                </span>
              </div>

              <div className="md:col-span-2 space-y-4 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.warmupEnabled}
                    onChange={(e) => setFormData({ ...formData, warmupEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-black/50 text-[#D4AF37] focus:ring-0"
                  />
                  <span className="text-white text-xs">
                    Enable Autonomous Gradual IP Warm-up curves for newly provisioned nodes
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.suppressUnsubscribesGlobally}
                    onChange={(e) => setFormData({ ...formData, suppressUnsubscribesGlobally: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-black/50 text-[#D4AF37] focus:ring-0"
                  />
                  <span className="text-white text-xs">
                    Enforce global organization-wide suppression for unsubscriptions across all campaigns
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'antispam' && (
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              Rspamd &amp; ClamAV Antivirus Daemon
            </h3>

            <div className="space-y-4 text-xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rspamdFilteringEnabled}
                  onChange={(e) => setFormData({ ...formData, rspamdFilteringEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-black/50 text-[#D4AF37] focus:ring-0"
                />
                <span className="text-white text-xs">
                  Enable inbound and outbound Rspamd statistical spam scoring and Bayes heuristics
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.clamAvScanEnabled}
                  onChange={(e) => setFormData({ ...formData, clamAvScanEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-black/50 text-[#D4AF37] focus:ring-0"
                />
                <span className="text-white text-xs">
                  Scan all email attachments with ClamAV stream scanner before queuing
                </span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'accessibility' && (
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#D4AF37]" />
                Display Theme &amp; Daylight Accessibility
              </h3>
              <p className="text-xs text-white/50 mt-1">
                Configure visual contrast and color palettes for optimal readability in high-ambient daylight environments and office conditions.
              </p>
            </div>

            {/* Theme Selector Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dark Mode Card */}
              <div
                onClick={() => handleThemeChange('dark')}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                  formData.theme === 'dark'
                    ? 'border-[#D4AF37] bg-white/[0.04] shadow-lg shadow-[#D4AF37]/10'
                    : 'border-white/10 bg-black/40 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-black border border-white/10 flex items-center justify-center text-[#D4AF37]">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-white">Midnight Obsidian (Dark)</h4>
                      <span className="text-[10px] font-mono text-white/40">Default Enterprise Theme</span>
                    </div>
                  </div>
                  {formData.theme === 'dark' && (
                    <span className="p-1 rounded-full bg-[#D4AF37] text-black">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="p-3 bg-[#050505] rounded-xl border border-white/10 space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-white/60">
                    <span>Background: #050505</span>
                    <span className="w-3 h-3 rounded-full bg-[#050505] border border-white/20"></span>
                  </div>
                  <div className="flex items-center justify-between text-white/60">
                    <span>Card Surface: #0D0D0D</span>
                    <span className="w-3 h-3 rounded-full bg-[#0D0D0D] border border-white/20"></span>
                  </div>
                  <div className="flex items-center justify-between text-[#D4AF37]">
                    <span>Gold Accent: #D4AF37</span>
                    <span className="w-3 h-3 rounded-full bg-[#D4AF37]"></span>
                  </div>
                </div>
              </div>

              {/* Light Mode Card */}
              <div
                onClick={() => handleThemeChange('light')}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition-all ${
                  formData.theme === 'light'
                    ? 'border-[#D4AF37] bg-white/[0.04] shadow-lg shadow-[#D4AF37]/10'
                    : 'border-white/10 bg-black/40 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-white">Daylight Contrast (Light Mode)</h4>
                      <span className="text-[10px] font-mono text-emerald-400">WCAG AA Compliant</span>
                    </div>
                  </div>
                  {formData.theme === 'light' && (
                    <span className="p-1 rounded-full bg-[#D4AF37] text-black">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-[11px] font-mono text-slate-800">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Background: #F4F6F9</span>
                    <span className="w-3 h-3 rounded-full bg-[#F4F6F9] border border-slate-300"></span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Card Surface: #FFFFFF</span>
                    <span className="w-3 h-3 rounded-full bg-[#FFFFFF] border border-slate-300"></span>
                  </div>
                  <div className="flex items-center justify-between text-[#B8860B] font-bold">
                    <span>High-Contrast Gold: #B8860B</span>
                    <span className="w-3 h-3 rounded-full bg-[#B8860B]"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accessibility Checkboxes */}
            <div className="space-y-3 pt-2 text-xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.highContrastMode !== false}
                  onChange={(e) => setFormData({ ...formData, highContrastMode: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-black/50 text-[#D4AF37] focus:ring-0"
                />
                <span className="text-white text-xs">
                  Enhanced border sharpness and crisp typography contrast for daylight monitors
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/20"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
