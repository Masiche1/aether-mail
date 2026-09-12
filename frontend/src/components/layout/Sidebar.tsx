import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  Mail,
  MessageSquare,
  GitFork,
  FileCode,
  Users,
  ListFilter,
  Layers,
  UserX,
  Globe,
  Inbox,
  Cpu,
  ShieldCheck,
  Radio,
  Link2,
  FolderOpen,
  BarChart3,
  Settings,
  ShieldAlert,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

interface SidebarProps {
  onOpenNewCampaign: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewCampaign,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { activeTab, setActiveTab, queueJobs, messages, domains } = useApp();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const handleItemSelect = (tabId: NavigationTab) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const queuedCount = (queueJobs || []).filter((j) => j && (j.status === 'queued' || j.status === 'sending')).length;
  const unreadMails = (messages || []).filter((m) => m && !m.isRead).length;
  const pendingDomains = (domains || []).filter((d) => d && d.status === 'pending').length;

  const sections: {
    title: string;
    items: {
      id: NavigationTab;
      label: string;
      icon: React.ElementType;
      badge?: number | string;
      badgeColor?: string;
    }[];
  }[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'analytics', label: 'Campaign Analytics', icon: BarChart3 },
        {
          id: 'intelligence',
          label: 'Gemini Intelligence & Media',
          icon: Sparkles,
          badge: 'AI Hub',
          badgeColor: 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30',
        },
        {
          id: 'ai-assistant',
          label: 'AI Deliverability Advisor',
          icon: ShieldCheck,
          badge: 'Advisory',
          badgeColor: 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30',
        },
      ],
    },
    {
      title: 'MESSAGING & CREATIVE',
      items: [
        { id: 'campaigns', label: 'Email Campaigns', icon: Mail },
        { id: 'sms-campaigns', label: 'SMS Campaigns', icon: MessageSquare },
        { id: 'automation', label: 'Visual Automations', icon: GitFork },
        { id: 'templates', label: 'Templates & Composer', icon: FileCode },
      ],
    },
    {
      title: 'AUDIENCE & HYGIENE',
      items: [
        { id: 'contacts', label: 'All Contacts', icon: Users },
        {
          id: 'workspace',
          label: 'Google Workspace Sync',
          icon: Layers,
          badge: 'OAuth',
          badgeColor: 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30',
        },
        { id: 'lists', label: 'Contact Lists', icon: ListFilter },
        { id: 'segments', label: 'Smart Segments', icon: Layers },
        { id: 'suppressions', label: 'Suppressions & Opt-outs', icon: UserX },
      ],
    },
    {
      title: 'INFRASTRUCTURE & MTA',
      items: [
        {
          id: 'domains',
          label: 'Sending Domains & DNS',
          icon: Globe,
          badge: pendingDomains > 0 ? `${pendingDomains} pending` : undefined,
          badgeColor: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
        },
        {
          id: 'diagnostics',
          label: 'Domain Diagnostics Console',
          icon: Sparkles,
          badge: 'DNS/SMTP',
          badgeColor: 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30',
        },
        {
          id: 'mailboxes',
          label: 'Private Mailboxes',
          icon: Inbox,
          badge: unreadMails > 0 ? unreadMails : undefined,
          badgeColor: 'bg-white/10 text-white border border-white/20',
        },
        {
          id: 'queue',
          label: 'MTA Delivery Queue',
          icon: Cpu,
          badge: queuedCount > 0 ? `${queuedCount} live` : undefined,
          badgeColor: 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40',
        },
        {
          id: 'delivery-status',
          label: 'Email Delivery Status & Logs',
          icon: BarChart3,
          badge: 'RFC 5321',
          badgeColor: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
        },
        { id: 'deliverability', label: 'Deliverability & IP Pool', icon: ShieldCheck },
        { id: 'sms-gateways', label: 'SMS Gateways (SMPP)', icon: Radio },
      ],
    },
    {
      title: 'ASSETS & BRANDING',
      items: [
        { id: 'shortlinks', label: 'Branded Short Links', icon: Link2 },
        { id: 'media', label: 'Media Library', icon: FolderOpen },
      ],
    },
    {
      title: 'SYSTEM & GOVERNANCE',
      items: [
        { id: 'settings', label: 'System Configuration', icon: Settings },
        { id: 'audit-logs', label: 'Security & Audit Logs', icon: ShieldAlert },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden transition-opacity animate-in fade-in"
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed md:relative top-0 bottom-0 left-0 z-50 md:z-20
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-[72px]' : 'md:w-64'}
          w-72 md:w-auto
          bg-[#050505] border-r border-white/10 flex flex-col h-full md:h-[calc(100vh-4rem)]
          select-none shrink-0 transition-all duration-300 ease-in-out
          shadow-2xl md:shadow-none
        `}
      >
        {/* Collapse/Expand Toggle Header & Mobile Header */}
        <div
          className={`p-3 border-b border-white/10 flex items-center justify-between`}
        >
          {/* Mobile Brand Title & Close Button */}
          <div className="flex md:hidden items-center justify-between w-full px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8C6B2D] flex items-center justify-center font-serif font-bold text-black text-sm">
                A
              </div>
              <span className="font-serif text-sm font-semibold text-white tracking-wide">
                Aether<span className="text-[#D4AF37] italic">Mail</span>
              </span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Collapse/Expand Control */}
          <div className="hidden md:flex items-center justify-between w-full">
            {!isCollapsed && (
              <div className="flex items-center gap-2 pl-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-white/40">
                  Navigation
                </span>
              </div>
            )}
            <button
              onClick={toggleCollapse}
              className={`p-1.5 rounded-lg text-white/40 hover:text-[#D4AF37] hover:bg-white/[0.05] transition-colors flex items-center justify-center ${
                isCollapsed ? 'mx-auto' : ''
              }`}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-[#D4AF37]" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Main Navigation Sections */}
        <div className="flex-1 p-3 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed ? (
                <h3 className="text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] px-3 mb-2 font-mono">
                  {section.title}
                </h3>
              ) : (
                <>
                  <h3 className="md:hidden text-[9px] font-bold text-white/30 uppercase tracking-[0.25em] px-3 mb-2 font-mono">
                    {section.title}
                  </h3>
                  {sIdx > 0 && <div className="hidden md:block w-6 h-px bg-white/10 mx-auto my-3" />}
                </>
              )}

              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => handleItemSelect(item.id)}
                        className={`w-full flex items-center ${
                          isCollapsed ? 'md:justify-center md:px-2 md:py-2.5 px-3 py-2 justify-between' : 'justify-between px-3 py-2'
                        } rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold shadow-sm'
                            : 'text-white/60 hover:text-white hover:bg-white/[0.03] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive ? 'text-[#D4AF37]' : 'text-white/40 group-hover:text-white/80'
                              }`}
                            />
                            {/* Dot indicator on icon when collapsed on desktop with badge */}
                            {isCollapsed && item.badge && (
                              <span className="hidden md:block absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D4AF37] ring-2 ring-[#050505]" />
                            )}
                          </div>
                          {(!isCollapsed || true) && (
                            <span className={`truncate ${isCollapsed ? 'md:hidden' : ''}`}>{item.label}</span>
                          )}
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded-full shrink-0 ${
                              isCollapsed ? 'md:hidden' : ''
                            } ${
                              item.badgeColor || 'bg-white/10 text-white/80 border border-white/10'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>

                      {/* Floating Tooltip when Collapsed on Desktop */}
                      {isCollapsed && (
                        <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-3 py-1.5 bg-[#0D0D0D] border border-white/15 rounded-xl shadow-2xl text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 items-center gap-2">
                          <span className="text-white font-medium">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded-full ${
                                item.badgeColor || 'bg-white/10 text-white/80 border border-white/10'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          <div className="text-[8px] font-mono uppercase text-white/30 pl-1 border-l border-white/10">
                            {section.title}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

      {/* Autonomous System Status Footer */}
      <div className="mt-auto p-3 border-t border-white/10 bg-white/[0.01]">
        {!isCollapsed ? (
          <div className="bg-white/[0.02] rounded-xl p-3 border border-white/10 text-xs space-y-2">
            <div className="flex items-center justify-between text-white/40 font-mono text-[10px] uppercase tracking-wider">
              <span>Postfix SMTP/MTA</span>
              <span className="text-[#D4AF37] flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                PORT 25/587
              </span>
            </div>
            <div className="flex items-center justify-between text-white/40 font-mono text-[10px] uppercase tracking-wider">
              <span>Dovecot IMAP</span>
              <span className="text-white/80 font-semibold">ONLINE</span>
            </div>
            <div className="flex items-center justify-between text-white/40 font-mono text-[10px] uppercase tracking-wider">
              <span>SMPP Transceiver</span>
              <span className="text-[#D4AF37] font-semibold">BOUND</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-1.5 group relative">
            <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#D4AF37] cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            </div>
            {/* Tooltip for status when collapsed */}
            <div className="absolute left-full bottom-2 ml-2.5 px-3 py-2 bg-[#0D0D0D] border border-white/15 rounded-xl shadow-2xl text-[11px] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 font-mono space-y-1">
              <div className="text-[#D4AF37] font-bold">Autonomous Systems Online</div>
              <div className="text-white/60 text-[10px]">Postfix: 25/587 • IMAP: Active • SMPP: Bound</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  </>
  );
};
