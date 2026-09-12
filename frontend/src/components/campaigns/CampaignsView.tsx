import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmailCampaign } from '../../types';
import {
  Mail,
  Plus,
  Play,
  Pause,
  Eye,
  MousePointerClick,
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface CampaignsViewProps {
  onOpenNewCampaign: () => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ onOpenNewCampaign }) => {
  const { campaigns, setCampaigns, setActiveTab } = useApp();
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);

  const toggleCampaignStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'sending' ? 'paused' : c.status === 'paused' ? 'sending' : c.status;
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Mail className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Email <span className="italic text-[#D4AF37]">Campaigns</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Manage authenticated bulk transmissions, scheduled digests, transactional broadcasts, and live telemetry.
          </p>
        </div>

        <button
          onClick={onOpenNewCampaign}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition-all font-serif"
        >
          <Plus className="w-4 h-4" />
          <span>New Email Campaign</span>
        </button>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {(campaigns || []).map((camp) => (
          <div
            key={camp.id}
            className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 hover:border-[#D4AF37]/30 transition-all"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-serif font-bold text-white tracking-wide">{camp.name}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      camp.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : camp.status === 'sending'
                        ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 animate-pulse'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {camp.status ? camp.status.toUpperCase() : 'DRAFT'}
                  </span>
                </div>
                <div className="text-xs text-white/50 font-sans mt-1">
                  Subject: <span className="text-white/80 font-medium">{camp.subject}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {camp.status === 'sending' || camp.status === 'paused' ? (
                  <button
                    onClick={() => toggleCampaignStatus(camp.id)}
                    className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/80 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    {camp.status === 'sending' ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-400" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-400" /> Resume
                      </>
                    )}
                  </button>
                ) : null}

                <button
                  onClick={() => setSelectedCampaign(camp)}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/80 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[#D4AF37]" /> Details
                </button>
              </div>
            </div>

            {/* Campaign Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-xs text-center">
              <div className="bg-[#141414] p-3 rounded-xl border border-white/5">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">RECIPIENTS</div>
                <div className="text-sm font-bold text-white mt-1">
                  {(camp.stats?.totalRecipients || 0).toLocaleString()}
                </div>
              </div>

              <div className="bg-[#141414] p-3 rounded-xl border border-white/5">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">DELIVERED</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">
                  {(camp.stats?.delivered || 0).toLocaleString()}
                </div>
              </div>

              <div className="bg-[#141414] p-3 rounded-xl border border-white/5">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">OPENED</div>
                <div className="text-sm font-bold text-[#D4AF37] mt-1">
                  {(camp.stats?.opened || 0).toLocaleString()}
                </div>
              </div>

              <div className="bg-[#141414] p-3 rounded-xl border border-white/5">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">CLICKED</div>
                <div className="text-sm font-bold text-amber-400 mt-1">
                  {(camp.stats?.clicked || 0).toLocaleString()}
                </div>
              </div>

              <div className="bg-[#141414] p-3 rounded-xl border border-white/5">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">REPLIES</div>
                <div className="text-sm font-bold text-purple-400 mt-1">
                  {camp.stats?.replies || 0}
                </div>
              </div>

              <div className="bg-[#141414] p-3 rounded-xl border border-white/5">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">BOUNCES</div>
                <div className="text-sm font-bold text-rose-400 mt-1">
                  {camp.stats?.bounced || 0}
                </div>
              </div>

              <div className="bg-[#141414] p-3 rounded-xl border border-white/5">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">COMPLAINTS</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">
                  {camp.stats?.complaints || 0}
                </div>
              </div>

              <div className="bg-[#141414] p-3 rounded-xl border border-white/5">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">THROUGHPUT</div>
                <div className="text-sm font-bold text-[#D4AF37] mt-1">
                  {(camp.sendingSpeedPerHour || 0).toLocaleString()}/hr
                </div>
              </div>
            </div>

            {/* Campaign Target & Metadata */}
            <div className="flex flex-wrap items-center justify-between text-xs text-white/50 pt-1">
              <div className="flex items-center gap-4">
                <span>
                  Sender:{' '}
                  <strong className="text-white/90">
                    {camp.senderName} ({camp.senderEmail})
                  </strong>
                </span>
                <span>
                  Target: <strong className="text-[#D4AF37]">{camp.targetName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                {camp.scheduledAt && (
                  <span className="flex items-center gap-1 text-white/50">
                    <Calendar className="w-3.5 h-3.5 text-white/40" />
                    Scheduled: {new Date(camp.scheduledAt).toLocaleString()}
                  </span>
                )}
                {camp.completedAt && (
                  <span className="text-emerald-400">
                    Completed: {new Date(camp.completedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#050505] border border-white/15 rounded-2xl w-full max-w-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-white tracking-wide">{selectedCampaign.name}</h2>
                <p className="text-xs text-white/50">{selectedCampaign.subject}</p>
              </div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-xs bg-white/[0.05] hover:bg-white/[0.1] text-white/80 border border-white/10 px-3.5 py-1.5 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-[#0D0D0D] p-5 rounded-xl space-y-2.5 border border-white/10">
                <div className="flex justify-between">
                  <span className="text-white/40">Campaign ID:</span>
                  <span className="text-[#D4AF37] font-bold">{selectedCampaign.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Sender Identity:</span>
                  <span className="text-white font-medium">
                    {selectedCampaign.senderName} &lt;{selectedCampaign.senderEmail}&gt;
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Target Audience:</span>
                  <span className="text-emerald-400 font-medium">{selectedCampaign.targetName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Throughput Configuration:</span>
                  <span className="text-white font-medium">
                    {(selectedCampaign.sendingSpeedPerHour || 0).toLocaleString()} messages / hour
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
