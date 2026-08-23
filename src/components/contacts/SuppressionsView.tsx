import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { BounceNotification } from '../../types';
import { BOUNCE_PRESET_PAYLOADS } from '../../services/bounceHandler';
import {
  UserX,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Trash2,
  Plus,
  X,
  Activity,
  Zap,
  ArrowRight,
  RefreshCw,
  Server,
  FileText,
  Filter,
  Download,
  Terminal,
} from 'lucide-react';

export const SuppressionsView: React.FC = () => {
  const { contacts, setContacts, bounces, setBounces, ingestBounce, unsuppressContact, addAuditLog } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'blacklist' | 'bounce_feed' | 'simulator'>('blacklist');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [bounceTypeFilter, setBounceTypeFilter] = useState<'all' | 'hard' | 'soft'>('all');
  const [manualEmail, setManualEmail] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBounce, setSelectedBounce] = useState<BounceNotification | null>(null);

  // Simulation form states
  const [simEmail, setSimEmail] = useState('test-bounce@unregistered-target.ke');
  const [simPresetIdx, setSimPresetIdx] = useState(0);
  const [simRawDsn, setSimRawDsn] = useState(BOUNCE_PRESET_PAYLOADS[0].rawDsn);
  const [simRecipientMx, setSimRecipientMx] = useState(BOUNCE_PRESET_PAYLOADS[0].recipientMx);

  // Suppressed contacts
  const suppressedList = (contacts || []).filter(
    (c) => c && (c.status === 'bounced' || c.status === 'unsubscribed' || c.status === 'suppressed' || c.status === 'complained')
  );

  const filteredSuppressed = suppressedList.filter((c) => {
    if (!c) return false;
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = (c.email || '').toLowerCase().includes(q) || (c.company || '').toLowerCase().includes(q);
    const matchesType = filterType === 'all' || c.status === filterType;
    return matchesSearch && matchesType;
  });

  const filteredBounces = (bounces || []).filter((b) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      b.email.toLowerCase().includes(q) ||
      b.smtpCode.includes(q) ||
      b.enhancedCode.includes(q) ||
      b.rawDsn.toLowerCase().includes(q);
    const matchesType = bounceTypeFilter === 'all' || b.bounceType === bounceTypeFilter;
    return matchesSearch && matchesType;
  });

  const handlePresetSelect = (idx: number) => {
    setSimPresetIdx(idx);
    const preset = BOUNCE_PRESET_PAYLOADS[idx];
    setSimRawDsn(preset.rawDsn);
    setSimRecipientMx(preset.recipientMx);
  };

  const handleIngestSimulatedBounce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simEmail.trim()) return;

    const res = ingestBounce(simEmail.trim(), simRawDsn, {
      campaignName: 'East Africa Tech Summit 2026 VIP Pass',
      recipientMx: simRecipientMx,
    });

    if (res.bounceNotification.bounceType === 'hard') {
      showToast({
        type: 'warning',
        title: 'Hard Bounce Categorized & Suppressed',
        message: `${res.bounceNotification.email} rejected permanently (${res.bounceNotification.smtpCode} ${res.bounceNotification.enhancedCode} - ${res.bounceNotification.bounceCategory}). Auto-suppressed.`,
        autoCloseMs: 6000,
      });
    } else {
      showToast({
        type: 'info',
        title: 'Soft Bounce Categorized',
        message: `${res.bounceNotification.email} logged as temporary soft bounce (${res.bounceNotification.smtpCode} ${res.bounceNotification.enhancedCode} - ${res.bounceNotification.bounceCategory}). Consecutive count: ${res.bounceNotification.consecutiveCount}/3.`,
        autoCloseMs: 6000,
      });
    }

    setActiveTab('bounce_feed');
  };

  const handleUnsuppress = (id: string, email: string) => {
    unsuppressContact(email);
    showToast({
      type: 'success',
      title: 'Contact Restored',
      message: `${email} was removed from suppression list and restored to Active status.`,
      autoCloseMs: 4000,
    });
  };

  const handleAddManualSuppression = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;

    const email = manualEmail.trim().toLowerCase();
    const existing = contacts.find((c) => (c.email || '').toLowerCase() === email);

    if (existing) {
      setContacts((prev) => prev.map((c) => (c.id === existing.id ? { ...c, status: 'suppressed' } : c)));
    } else {
      setContacts((prev) => [
        {
          id: `cnt_sup_${Date.now()}`,
          organizationId: 'org_001',
          email,
          firstName: 'Manual',
          lastName: 'Suppression',
          status: 'suppressed',
          lists: [],
          tags: ['Manual-Blacklist'],
          engagementScore: 0,
          totalSent: 0,
          totalOpens: 0,
          totalClicks: 0,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    addAuditLog('SUPPRESSION_ADDED', 'SuppressionTable', email, `Added ${email} to global unsubscribe/suppression table.`);
    setManualEmail('');
    setShowAddModal(false);
    showToast({
      type: 'info',
      title: 'Address Blacklisted',
      message: `${email} added to global suppression list.`,
      autoCloseMs: 4000,
    });
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Email,Reason,Created At,Status']
        .concat(
          suppressedList.map((c) => `"${c.email}","${c.status}","${c.createdAt}","Suppressed"`)
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `suppressions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <UserX className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Suppression <span className="italic text-rose-400">&amp; Bounce Handler</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Automated RFC 3464 DSN ingestion service classifying incoming hard &amp; soft bounces, spam complaints (FBL), and protecting domain sender reputation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold uppercase tracking-wider transition-all font-serif shadow-lg shadow-black/40"
          >
            <Zap className="w-4 h-4 text-[#D4AF37]" />
            <span>Ingest / Test Bounce DSN</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-600/20 transition-all font-serif"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Blacklist</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#0D0D0D] border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-white/40 font-medium">Total Suppressed Pool</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{suppressedList.length}</div>
          <div className="text-[11px] text-white/40 mt-0.5">Active blocked addresses</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-rose-400 font-medium">Hard Bounces (5xx)</div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
            {bounces.filter((b) => b.bounceType === 'hard').length}
          </div>
          <div className="text-[11px] text-white/40 mt-0.5">Auto-suppressed immediately</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-amber-400 font-medium">Soft Bounces (4xx)</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {bounces.filter((b) => b.bounceType === 'soft').length}
          </div>
          <div className="text-[11px] text-white/40 mt-0.5">Rate limits &amp; full mailboxes</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-[#D4AF37] font-medium">Unsubscribes</div>
          <div className="text-2xl font-bold text-[#D4AF37] font-mono mt-1">
            {suppressedList.filter((c) => c.status === 'unsubscribed').length}
          </div>
          <div className="text-[11px] text-white/40 mt-0.5">List-Unsubscribe headers</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-emerald-400 font-medium">Spam Complaints (FBL)</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {suppressedList.filter((c) => c.status === 'complained').length}
          </div>
          <div className="text-[11px] text-white/40 mt-0.5">Feedback loop reports</div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-8 text-xs font-serif">
        <button
          onClick={() => setActiveTab('blacklist')}
          className={`pb-3 font-bold uppercase tracking-wider transition-all relative ${
            activeTab === 'blacklist'
              ? 'text-rose-400 border-b-2 border-rose-400'
              : 'text-white/40 hover:text-white'
          }`}
        >
          Global Suppression Blacklist ({suppressedList.length})
        </button>

        <button
          onClick={() => setActiveTab('bounce_feed')}
          className={`pb-3 font-bold uppercase tracking-wider transition-all relative ${
            activeTab === 'bounce_feed'
              ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
              : 'text-white/40 hover:text-white'
          }`}
        >
          Bounce Handler Ingestion Feed ({bounces.length})
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`pb-3 font-bold uppercase tracking-wider transition-all relative ${
            activeTab === 'simulator'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-white/40 hover:text-white'
          }`}
        >
          DSN Bounce Ingestion &amp; Classifier Lab
        </button>
      </div>

      {/* TAB 1: Global Blacklist */}
      {activeTab === 'blacklist' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search suppressed email address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>Reason:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-black border border-white/15 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-rose-500"
                >
                  <option value="all">All Suppressed</option>
                  <option value="bounced">Hard Bounces</option>
                  <option value="unsubscribed">Unsubscribes</option>
                  <option value="suppressed">Manual Blacklists</option>
                  <option value="complained">Spam Complaints</option>
                </select>
              </div>

              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs border border-white/10 transition-colors"
                title="Export suppression table as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/80 text-white/40 border-b border-white/10 uppercase text-[10px]">
                <tr>
                  <th className="p-4 font-bold">Email Address</th>
                  <th className="p-4 font-bold">Suppression Reason</th>
                  <th className="p-4 font-bold">Source / Timestamp</th>
                  <th className="p-4 font-bold">Company / Org</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/70">
                {filteredSuppressed.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white">{item.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'bounced'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : item.status === 'unsubscribed'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {item.status ? item.status.toUpperCase() : 'SUPPRESSED'}
                      </span>
                    </td>
                    <td className="p-4 text-white/40">
                      Bounce Handler ({new Date(item.createdAt).toLocaleDateString()})
                    </td>
                    <td className="p-4 text-white/70 font-sans">{item.company || 'Enterprise Global'}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleUnsuppress(item.id, item.email)}
                        className="px-3 py-1 text-[11px] rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                      >
                        Un-suppress (Restore)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Live Bounce Handler Ingestion Feed */}
      {activeTab === 'bounce_feed' && (
        <div className="space-y-4">
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by email, SMTP code (550, 421)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] font-mono"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-white/50">
              <span>Category Filter:</span>
              <select
                value={bounceTypeFilter}
                onChange={(e) => setBounceTypeFilter(e.target.value as any)}
                className="bg-black border border-white/15 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">All Bounces (Hard &amp; Soft)</option>
                <option value="hard">Hard Bounces (Permanent 5xx)</option>
                <option value="soft">Soft Bounces (Transient 4xx)</option>
              </select>
            </div>
          </div>

          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/80 text-white/40 border-b border-white/10 uppercase text-[10px]">
                <tr>
                  <th className="p-4 font-bold">Recipient Email</th>
                  <th className="p-4 font-bold">SMTP Code</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Remote MX</th>
                  <th className="p-4 font-bold">Policy Action</th>
                  <th className="p-4 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/70">
                {filteredBounces.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white">{b.email}</td>
                    <td className="p-4">
                      <span className="text-[#D4AF37] font-bold">{b.smtpCode} {b.enhancedCode}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] bg-white/5 border border-white/10 text-white/80 uppercase">
                        {b.bounceCategory.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.bounceType === 'hard'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {b.bounceType.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-white/50 truncate max-w-[160px]" title={b.recipientMx}>
                      {b.recipientMx}
                    </td>
                    <td className="p-4">
                      {b.autoSuppressed ? (
                        <span className="text-rose-400 font-bold text-[11px] flex items-center gap-1">
                          ✔ Auto-Suppressed
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[11px]">
                          Retry Queue ({b.consecutiveCount}/3)
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedBounce(b)}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-[11px] border border-white/10 transition-colors"
                      >
                        Inspect DSN
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Ingestion & Simulator Lab */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-serif font-bold text-white tracking-wide">
                Ingest Incoming DSN Bounce Notification
              </h3>
              <p className="text-xs text-white/50 mt-1 font-light">
                Submit an RFC 3464 Delivery Status Notification (DSN) to test the automated classification logic, SMTP error code parsing, and suppression blacklist updates.
              </p>
            </div>

            <form onSubmit={handleIngestSimulatedBounce} className="space-y-4">
              <div>
                <label className="text-xs text-white/80 font-medium block mb-1">Preset Diagnostic Payloads</label>
                <select
                  value={simPresetIdx}
                  onChange={(e) => handlePresetSelect(Number(e.target.value))}
                  className="w-full bg-black border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  {BOUNCE_PRESET_PAYLOADS.map((p, idx) => (
                    <option key={idx} value={idx}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-white/80 font-medium block mb-1">Recipient Email Address *</label>
                <input
                  type="email"
                  required
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl p-3 text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-white/80 font-medium block mb-1">Remote MX Host / Server</label>
                <input
                  type="text"
                  value={simRecipientMx}
                  onChange={(e) => setSimRecipientMx(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-white/80 font-medium block mb-1">Raw DSN Message / SMTP Response String *</label>
                <textarea
                  rows={4}
                  required
                  value={simRawDsn}
                  onChange={(e) => setSimRawDsn(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl p-3 text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#D4AF37] hover:bg-white text-black font-bold uppercase tracking-wider rounded-xl text-xs font-serif transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Process &amp; Ingest Bounce Notification</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-white font-serif uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Auto-Suppression Policy Engine</span>
              </h4>
              <ul className="text-xs text-white/60 space-y-2 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">5xx:</span>
                  <span><strong>Hard Bounces</strong> (User Unknown, Domain Unknown, Strict DMARC Reject) are added to global suppression immediately.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">4xx:</span>
                  <span><strong>Soft Bounces</strong> (Mailbox Full, Rate Limit / Greylist) increment consecutive failure counters and trigger backoff. 3 consecutive soft bounces auto-suppresses the address.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">FBL:</span>
                  <span>Spam complaints received via ARF Feedback Loops immediately suppress the sender pair.</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl space-y-2">
              <h4 className="text-xs font-bold text-white font-serif uppercase tracking-wider">
                Active Ingestion Pipeline
              </h4>
              <p className="text-xs text-white/50 font-light">
                Listening on LMTP socket <span className="font-mono text-[#D4AF37]">unix:/var/run/dovecot/lmtp</span> and Postfix bounce daemon <span className="font-mono text-white">cleanup/qmgr</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DSN Detail Modal */}
      {selectedBounce && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#0A0A0A] border border-white/15 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-sm font-bold font-serif text-white">DSN Bounce Inspection</h3>
              </div>
              <button
                onClick={() => setSelectedBounce(null)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Recipient:</span>
                <span className="text-white font-bold">{selectedBounce.email}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">SMTP Code:</span>
                <span className="text-[#D4AF37] font-bold">{selectedBounce.smtpCode} {selectedBounce.enhancedCode}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Classification:</span>
                <span className="text-white uppercase">{selectedBounce.bounceType} ({selectedBounce.bounceCategory})</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Remote MX:</span>
                <span className="text-white">{selectedBounce.recipientMx}</span>
              </div>

              <div>
                <span className="text-white/40 block mb-1">Raw DSN Message:</span>
                <div className="bg-black border border-white/10 rounded-xl p-3 text-white/80 text-[11px] whitespace-pre-wrap select-all">
                  {selectedBounce.rawDsn}
                </div>
              </div>

              <div>
                <span className="text-white/40 block mb-1">Diagnostic Remedy:</span>
                <div className="bg-[#141414] border border-white/10 rounded-xl p-3 text-[#D4AF37] text-[11px]">
                  {selectedBounce.diagnosticDetails}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedBounce(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Suppression Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#050505] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-serif font-bold text-white tracking-wide">Add Suppression Blacklist</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddManualSuppression} className="space-y-4">
              <div>
                <label className="text-xs text-white/80 font-medium block mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="spam-trap@competitor.org"
                  className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-rose-500 font-mono transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white/80 rounded-xl text-xs font-medium transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-rose-600/20"
                >
                  Add to Blacklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
