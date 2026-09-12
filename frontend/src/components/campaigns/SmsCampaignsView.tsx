import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Send,
  Plus,
  Radio,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Users,
  CreditCard,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SmsCampaign } from '../../types';
import { SmsCampaignWizard } from './SmsCampaignWizard';

export const SmsCampaignsView: React.FC = () => {
  const { smsCampaigns, setSmsCampaigns, gateways } = useApp();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCampaigns = (smsCampaigns || []).filter((c) => {
    if (!c) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.senderId || '').toLowerCase().includes(q) ||
        (c.messageText || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalSmsSent = (smsCampaigns || []).reduce((acc, c) => acc + (c?.stats?.sent || 0), 0);
  const totalDelivered = (smsCampaigns || []).reduce((acc, c) => acc + (c?.stats?.delivered || 0), 0);
  const totalCredits = (gateways || []).reduce((acc, g) => acc + (g?.creditsRemaining || 0), 0);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              SMS Broadcast <span className="italic text-[#D4AF37]">Campaigns</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            High-throughput transactional and marketing SMS broadcast pipeline via direct SMPP carrier nodes.
          </p>
        </div>

        <button
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-white text-black font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New SMS Broadcast</span>
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-white/40 text-xs font-mono uppercase mb-2">
            <span>Total Broadcasts</span>
            <MessageSquare className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-bold text-white">{(smsCampaigns || []).length}</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-white/40 text-xs font-mono uppercase mb-2">
            <span>Total Sent Volume</span>
            <Send className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{totalSmsSent.toLocaleString()}</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-white/40 text-xs font-mono uppercase mb-2">
            <span>Delivery Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {totalSmsSent > 0 ? ((totalDelivered / totalSmsSent) * 100).toFixed(1) : '99.2'}%
          </div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-white/40 text-xs font-mono uppercase mb-2">
            <span>SMPP Credits</span>
            <Radio className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-bold text-[#D4AF37]">{totalCredits.toLocaleString()}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search campaigns, sender IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto overflow-x-auto w-full sm:w-auto">
          {['all', 'completed', 'scheduled', 'sending', 'draft'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium uppercase font-mono transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 font-bold'
                  : 'bg-white/[0.03] text-white/50 border border-white/5 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* SMS Campaigns List */}
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-xl overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141414] text-white/40 border-b border-white/10 uppercase text-[10px]">
              <tr>
                <th className="p-4">Campaign &amp; Message Preview</th>
                <th className="p-4">Sender ID</th>
                <th className="p-4">Target Audience</th>
                <th className="p-4">Status</th>
                <th className="p-4">Sent / Delivered</th>
                <th className="p-4 text-right">Scheduled / Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-white/40">
                    No SMS campaigns match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-serif font-bold text-white text-sm mb-1">{camp.name}</div>
                      <div className="text-[11px] text-white/50 max-w-md line-clamp-1 font-sans font-light">
                        {camp.messageText}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-white font-bold text-[11px]">
                        {camp.senderId}
                      </span>
                    </td>
                    <td className="p-4 text-white/80">{camp.targetName}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          camp.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : camp.status === 'sending'
                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse'
                            : camp.status === 'scheduled'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-white/10 text-white/60 border border-white/15'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-bold">
                        {camp.stats.delivered.toLocaleString()} / {camp.stats.sent.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-white/40">
                        {camp.stats.sent > 0
                          ? `${((camp.stats.delivered / camp.stats.sent) * 100).toFixed(1)}% success`
                          : 'Pending'}
                      </div>
                    </td>
                    <td className="p-4 text-right text-white/40">
                      {camp.scheduledAt ? new Date(camp.scheduledAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embedded Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <SmsCampaignWizard />
              <button
                onClick={() => setIsWizardOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors bg-black/60 p-2 rounded-xl border border-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
