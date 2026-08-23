import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/ToastContainer';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { CampaignsView } from './components/campaigns/CampaignsView';
import { SmsCampaignsView } from './components/campaigns/SmsCampaignsView';
import { EmailCampaignWizard } from './components/campaigns/EmailCampaignWizard';
import { SmsCampaignWizard } from './components/campaigns/SmsCampaignWizard';
import { VisualTemplateEditor } from './components/campaigns/VisualTemplateEditor';
import { AutomationsView } from './components/automations/AutomationsView';
import { ContactsView } from './components/contacts/ContactsView';
import { ListsManager } from './components/contacts/ListsManager';
import { SegmentsBuilder } from './components/contacts/SegmentsBuilder';
import { SuppressionsView } from './components/contacts/SuppressionsView';
import { ImportWizardModal } from './components/contacts/ImportWizardModal';
import { DomainsManager } from './components/infrastructure/DomainsManager';
import { DomainDiagnosticsView } from './components/infrastructure/DomainDiagnosticsView';
import { IpWarmupView } from './components/infrastructure/IpWarmupView';
import { MtaSpoolQueueView } from './components/infrastructure/MtaSpoolQueueView';
import { EmailDeliveryStatusView } from './components/delivery/EmailDeliveryStatusView';
import { SmsGatewaysView } from './components/infrastructure/SmsGatewaysView';
import { GeminiIntelligenceView } from './components/intelligence/GeminiIntelligenceView';
import { AiDeliverabilityAdvisoryView } from './components/intelligence/AiDeliverabilityAdvisoryView';
import { WorkspaceIntegrationView } from './components/workspace/WorkspaceIntegrationView';
import { DeliverabilityChatbotModal } from './components/intelligence/DeliverabilityChatbotModal';
import { MailboxesView } from './components/mailboxes/MailboxesView';
import { ShortLinksView } from './components/assets/ShortLinksView';
import { MediaLibraryView } from './components/assets/MediaLibraryView';
import { SystemSettingsView } from './components/system/SystemSettingsView';
import { AuditLogsView } from './components/system/AuditLogsView';
import { CampaignAnalyticsView } from './components/analytics/CampaignAnalyticsView';
import {
  Sparkles,
  Bot,
  MessageSquare,
  Server,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [isCampaignWizardOpen, setIsCampaignWizardOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('aethermail_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('aethermail_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ExecutiveDashboard
            onOpenNewCampaign={() => setIsCampaignWizardOpen(true)}
            onOpenImport={() => setIsImportModalOpen(true)}
          />
        );
      case 'analytics':
        return <CampaignAnalyticsView />;
      case 'campaigns':
        return <CampaignsView onOpenNewCampaign={() => setIsCampaignWizardOpen(true)} />;
      case 'sms-campaigns':
        return <SmsCampaignsView />;
      case 'templates':
        return <VisualTemplateEditor onSaveTemplate={() => {}} />;
      case 'automation':
        return <AutomationsView />;
      case 'contacts':
        return <ContactsView onOpenImport={() => setIsImportModalOpen(true)} />;
      case 'lists':
        return <ListsManager />;
      case 'segments':
        return <SegmentsBuilder />;
      case 'suppressions':
        return <SuppressionsView />;
      case 'domains':
        return <DomainsManager />;
      case 'diagnostics':
        return <DomainDiagnosticsView />;
      case 'mailboxes':
      case 'webmail':
        return <MailboxesView />;
      case 'queue':
        return <MtaSpoolQueueView />;
      case 'delivery-status':
        return <EmailDeliveryStatusView />;
      case 'deliverability':
        return <IpWarmupView />;
      case 'sms-gateways':
        return <SmsGatewaysView />;
      case 'shortlinks':
        return <ShortLinksView />;
      case 'media':
        return <MediaLibraryView />;
      case 'intelligence':
        return <GeminiIntelligenceView />;
      case 'ai-assistant':
      case 'deliverability-advisory':
        return <AiDeliverabilityAdvisoryView />;
      case 'workspace':
        return <WorkspaceIntegrationView />;
      case 'settings':
        return <SystemSettingsView />;
      case 'audit-logs':
        return <AuditLogsView />;
      default:
        return (
          <ExecutiveDashboard
            onOpenNewCampaign={() => setIsCampaignWizardOpen(true)}
            onOpenImport={() => setIsImportModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] flex flex-col font-sans antialiased selection:bg-[#D4AF37] selection:text-black">
      {/* Global Toast Notification Container */}
      <ToastContainer />

      {/* Top Navbar */}
      <Navbar
        onOpenNewCampaign={() => setIsCampaignWizardOpen(true)}
        onOpenQuickImport={() => setIsImportModalOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={toggleMobileSidebar}
      />

      {/* Body: Sidebar + Dynamic Main View */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          onOpenNewCampaign={() => {
            setIsCampaignWizardOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={closeMobileSidebar}
        />

        <main className="flex-1 overflow-y-auto bg-[#050505] custom-scrollbar relative">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating AI Advisor Action Pill */}
      <button
        onClick={() => setIsChatbotModalOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#8C6B2D] text-black px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-2xl shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40 hover:scale-105 transition-all flex items-center gap-2 sm:gap-2.5 font-bold text-xs border border-white/20 group max-w-[calc(100vw-2rem)]"
        title="Chat with AI Deliverability Advisor"
      >
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-black animate-pulse" />
        </div>
        <span className="font-serif tracking-wider font-bold truncate">AI Advisor</span>
        <span className="hidden xs:inline bg-black/20 text-black text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-widest shrink-0">
          Live
        </span>
      </button>

      {/* Modals */}
      <EmailCampaignWizard
        isOpen={isCampaignWizardOpen}
        onClose={() => setIsCampaignWizardOpen(false)}
      />

      <ImportWizardModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <DeliverabilityChatbotModal
        isOpen={isChatbotModalOpen}
        onClose={() => setIsChatbotModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <MainContent />
      </ToastProvider>
    </AppProvider>
  );
}
