import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  Play,
  Pause,
  Zap,
  Sparkles,
  Plus,
  ShieldCheck,
  Server,
  Bell,
  Search,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewCampaign: () => void;
  onOpenQuickImport: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewCampaign,
  onOpenQuickImport,
  isSidebarCollapsed,
  onToggleSidebar,
  isMobileSidebarOpen,
  onToggleMobileSidebar,
}) => {
  const {
    organization,
    isEngineRunning,
    pauseQueue,
    resumeQueue,
    hourlySpeed,
    setHourlySpeed,
    deliverability,
    setActiveTab,
    theme,
    toggleTheme,
  } = useApp();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-[#050505] border-b border-white/10 px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 backdrop-blur-md">
      {/* Left: Organization & Global Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Menu Button (Hidden on Desktop) */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-white/70 hover:text-[#D4AF37] hover:bg-white/[0.06] transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-[#D4AF37]" />
          </button>
        )}

        {/* Desktop Collapse/Expand Button (Hidden on Mobile) */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 rounded-xl text-white/40 hover:text-[#D4AF37] hover:bg-white/[0.04] transition-colors items-center justify-center mr-1"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-[#D4AF37]" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6B2D] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-black shadow-lg shadow-[#D4AF37]/10 shrink-0">
            <span className="font-serif font-bold text-sm sm:text-base text-black">A</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-serif font-semibold text-sm sm:text-base text-white tracking-wide">
                Aether<span className="text-[#D4AF37] italic">Mail</span>
              </span>
              <span className="hidden xs:inline-block bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-[9px] sm:text-[10px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-widest font-medium">
                Autonomous MTA
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-white/40 font-mono tracking-tight">
              mail.aethermail.net • {organization.timezone}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Live Autonomous Engine HUD */}
      <div className="hidden lg:flex items-center gap-3 bg-white/[0.02] border border-white/10 px-4 py-1.5 rounded-full text-xs">
        {/* Engine status indicator */}
        <div className="flex items-center gap-2 pr-3 border-r border-white/10">
          <span className="relative flex h-2 w-2">
            {isEngineRunning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isEngineRunning ? 'bg-[#D4AF37]' : 'bg-amber-500'
              }`}
            ></span>
          </span>
          <span className="text-[#E0E0E0] font-medium text-xs">
            {isEngineRunning ? 'MTA Engine Active' : 'MTA Engine Paused'}
          </span>
          <button
            onClick={isEngineRunning ? pauseQueue : resumeQueue}
            title={isEngineRunning ? 'Pause active delivery workers' : 'Resume delivery workers'}
            className="p-1 rounded text-white/50 hover:text-[#D4AF37] hover:bg-white/5 transition-colors ml-1"
          >
            {isEngineRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#D4AF37]" />}
          </button>
        </div>

        {/* Speed throttle selector */}
        <div className="relative flex items-center gap-1.5 pr-3 border-r border-white/10">
          <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-white/40 uppercase tracking-wider text-[10px]">Speed:</span>
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="font-mono text-[#D4AF37] font-semibold hover:text-white transition-colors flex items-center gap-1"
          >
            {hourlySpeed.toLocaleString()}/hr
          </button>

          {showSpeedMenu && (
            <div className="absolute top-8 left-0 w-44 bg-[#0D0D0D] border border-white/15 rounded-xl shadow-2xl p-2 z-50">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium px-2 py-1">Warmup Rate Limits</p>
              {[1000, 2500, 5000, 10000, 25000].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setHourlySpeed(rate);
                    setShowSpeedMenu(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-white/5 font-mono ${
                    hourlySpeed === rate ? 'text-[#D4AF37] font-bold bg-[#D4AF37]/10' : 'text-white/70'
                  }`}
                >
                  {rate.toLocaleString()} msgs / hr
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Deliverability Health Score */}
        <button
          onClick={() => setActiveTab('deliverability')}
          className="flex items-center gap-1.5 text-white/70 hover:text-[#D4AF37] transition-colors group"
        >
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          <span className="font-semibold font-serif text-sm text-[#D4AF37]">{deliverability.overallScore}%</span>
          <span className="text-white/40 uppercase tracking-wider text-[10px]">Score</span>
        </button>
      </div>

      {/* Right: Quick Actions & Intelligence */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <button
          onClick={() => setActiveTab('ai-assistant')}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-medium transition-all shadow-sm"
          title="Open AI Deliverability Architect"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="font-serif italic font-medium hidden sm:inline">AI Architect</span>
          <span className="font-serif italic font-medium sm:hidden text-[11px]">AI</span>
        </button>

        <button
          onClick={onOpenQuickImport}
          className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-white/80 text-xs font-medium border border-white/10 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-white/50" />
          <span>Import</span>
        </button>

        <button
          onClick={onOpenNewCampaign}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-3.5 h-3.5 font-bold" />
          <span className="hidden xs:inline">Campaign</span>
        </button>

        {/* Theme Toggle Button (Dark / High-Contrast Light Mode) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-white/80 hover:text-[#D4AF37] border border-white/10 transition-colors flex items-center justify-center"
          title={theme === 'dark' ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#D4AF37]" />
          ) : (
            <Moon className="w-4 h-4 text-[#D4AF37]" />
          )}
        </button>

        {/* User profile avatar */}
        <div className="ml-1 sm:ml-2 pl-1.5 sm:pl-2 border-l border-white/10 flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#8C6B2D]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[10px] sm:text-xs font-serif font-bold text-[#D4AF37]">
            LL
          </div>
        </div>
      </div>
    </header>
  );
};
