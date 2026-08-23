import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { QueueJob, SmtpErrorCodeDefinition } from '../../types';
import {
  Server,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Zap,
  Terminal,
  Activity,
  UserX,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Sliders,
  Send,
} from 'lucide-react';

// Comprehensive RFC 5321 / RFC 3463 SMTP Response Code Knowledge Base
export const SMTP_CODE_DIRECTORY: Record<string, SmtpErrorCodeDefinition> = {
  '250': {
    code: '250',
    enhancedCode: '2.0.0',
    statusClass: '2xx_success',
    name: '250 OK (Delivery Completed)',
    category: 'Deliverability',
    description: 'Requested mail action completed OK and queued for final inbox delivery.',
    typicalRootCause: 'The destination mail exchange (MX) server accepted the RFC 5321 transaction and acknowledged receipt of the message payload.',
    recommendedAction: 'Message successfully handed off to destination inbox MTA. No action required.',
  },
  '421': {
    code: '421',
    enhancedCode: '4.7.0',
    statusClass: '4xx_transient',
    name: '421 Connection Rate Limited',
    category: 'Rate Limiting',
    description: 'Service not available / Inbound connection rate limit exceeded.',
    typicalRootCause: 'The recipient mail provider is throttling inbound SMTP connections from your IP/domain due to sudden traffic volume spikes or greylisting defenses.',
    recommendedAction: 'Lower the hourly dispatch rate in the MTA Spool Queue throttle slider. Enable exponential backoff retry policy.',
  },
  '451': {
    code: '451',
    enhancedCode: '4.4.0',
    statusClass: '4xx_transient',
    name: '451 Local Processing Error / Timeout',
    category: 'DNS & Network',
    description: 'Requested action aborted / Local processing error or connection timeout.',
    typicalRootCause: 'The target MX server experienced a temporary internal error, network timeout during DATA streaming, or anti-spam timeout.',
    recommendedAction: 'Automatic retry scheduled. If persistent across multiple recipients on the same domain, test DNS MX resolution.',
  },
  '452': {
    code: '452',
    enhancedCode: '4.2.2',
    statusClass: '4xx_transient',
    name: '452 Mailbox Storage Full',
    category: 'Mailbox State',
    description: 'Insufficient system storage / Recipient mailbox over quota.',
    typicalRootCause: 'The recipient account exists, but their mailbox has exceeded its allocated disk quota storage limit.',
    recommendedAction: 'Transient soft bounce. Do not immediately suppress. The message will retry over 48 hours until space is cleared.',
  },
  '535': {
    code: '535',
    enhancedCode: '5.7.8',
    statusClass: 'auth_error',
    name: '535 Authentication Failed',
    category: 'Authentication',
    description: 'Authentication credentials invalid / SASL handshake rejected.',
    typicalRootCause: 'Outbound relay authentication failed against your configured private SMTP relay credentials.',
    recommendedAction: 'Verify SMTP username, API token, and TLS/STARTTLS security port (587/465) in Domain Diagnostics Console.',
  },
  '550': {
    code: '550',
    enhancedCode: '5.1.1',
    statusClass: '5xx_permanent',
    name: '550 User Unknown (Hard Bounce)',
    category: 'Mailbox State',
    description: 'User unknown / Mailbox does not exist on remote server.',
    typicalRootCause: 'The destination mail server checked its virtual alias table and confirmed that no such email user exists at this domain.',
    recommendedAction: 'Permanent Hard Bounce. Address automatically added to Suppressions table to preserve IP sender reputation.',
  },
  '550_dmarc': {
    code: '550',
    enhancedCode: '5.7.26',
    statusClass: '5xx_permanent',
    name: '550 DMARC Policy Reject',
    category: 'Spam & Policy',
    description: 'Unauthenticated email rejected due to DMARC/SPF policy mismatch (p=reject).',
    typicalRootCause: 'The sending domain failed SPF or DKIM cryptographic alignment checks, and the domain\'s DMARC record enforces p=reject.',
    recommendedAction: 'Open Domain Diagnostics to verify that your TXT records for SPF (v=spf1 include:...) and DKIM 2048-bit keys are fully propagated.',
  },
  '554': {
    code: '554',
    enhancedCode: '5.7.1',
    statusClass: '5xx_permanent',
    name: '554 Content Blocked / Anti-Spam Reject',
    category: 'Spam & Policy',
    description: 'Transaction failed / Relay access denied or rejected by spam heuristics.',
    typicalRootCause: 'The destination spam filter (e.g., Spamhaus, Cisco IronPort, Barracuda) scored the email body or sending IP as untrusted.',
    recommendedAction: 'Review email HTML content for spam trigger keywords, verify PTR reverse DNS record, and authenticate sending domain with BIMI/DKIM.',
  },
};

export const EmailDeliveryStatusView: React.FC = () => {
  const { queueJobs = [], retryJob, suppressContact, ingestBounce, setActiveTab } = useApp();
  const { showToast, notifyQueueStall, notifySmtpAuthFailure } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'delivered' | 'retry' | 'failed'>('all');
  const [selectedJob, setSelectedJob] = useState<QueueJob | null>(null);

  // Cross-reference jobs with SMTP explanations
  const analyzedJobs = useMemo(() => {
    return (queueJobs || []).map((job) => {
      const resp = job.smtpResponse || job.lastError || '';
      let matchedCode = '250';

      if (resp.includes('5.7.26') || (resp.includes('550') && resp.toLowerCase().includes('dmarc'))) {
        matchedCode = '550_dmarc';
      } else if (resp.includes('550') || resp.includes('5.1.1')) {
        matchedCode = '550';
      } else if (resp.includes('535') || resp.includes('5.7.8')) {
        matchedCode = '535';
      } else if (resp.includes('554') || resp.includes('5.7.1')) {
        matchedCode = '554';
      } else if (resp.includes('421') || resp.includes('4.7.0')) {
        matchedCode = '421';
      } else if (resp.includes('452') || resp.includes('4.2.2')) {
        matchedCode = '452';
      } else if (resp.includes('451') || resp.includes('4.4.0')) {
        matchedCode = '451';
      } else if (job.status === 'delivered') {
        matchedCode = '250';
      } else if (job.status === 'retry') {
        matchedCode = '451';
      }

      const codeInfo = SMTP_CODE_DIRECTORY[matchedCode] || {
        code: '500',
        enhancedCode: '5.0.0',
        statusClass: '5xx_permanent' as const,
        name: '500 Delivery Failure',
        category: 'Deliverability' as const,
        description: 'General SMTP Delivery Failure',
        typicalRootCause: resp || 'Remote server connection terminated unexpectedly.',
        recommendedAction: 'Inspect MTA daemon socket logs and test domain connectivity.',
      };

      return {
        ...job,
        parsedSmtpCode: codeInfo.code,
        parsedEnhancedCode: codeInfo.enhancedCode,
        smtpInfo: codeInfo,
      };
    });
  }, [queueJobs]);

  const filteredJobs = analyzedJobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      job.recipientEmail.toLowerCase().includes(q) ||
      (job.campaignName && job.campaignName.toLowerCase().includes(q)) ||
      (job.smtpResponse && job.smtpResponse.toLowerCase().includes(q)) ||
      (job.lastError && job.lastError.toLowerCase().includes(q)) ||
      job.parsedSmtpCode.includes(q);

    let matchesCategory = true;
    if (categoryFilter === 'delivered') matchesCategory = job.status === 'delivered';
    if (categoryFilter === 'retry') matchesCategory = job.status === 'retry' || job.status === 'sending' || job.status === 'queued';
    if (categoryFilter === 'failed') matchesCategory = job.status === 'failed' || (job.status === 'retry' && job.retryCount >= 3);

    return matchesSearch && matchesCategory;
  });

  const stats = useMemo(() => {
    const total = queueJobs.length;
    const delivered = queueJobs.filter((j) => j.status === 'delivered').length;
    const retrying = queueJobs.filter((j) => j.status === 'retry').length;
    const failed = queueJobs.filter((j) => j.status === 'failed' || j.retryCount >= 3).length;
    const rate = total > 0 ? Math.round((delivered / total) * 100) : 100;

    return { total, delivered, retrying, failed, rate };
  }, [queueJobs]);

  const handleManualRetry = (job: QueueJob) => {
    retryJob(job.id);
    showToast({
      type: 'info',
      title: 'Message Re-queued',
      message: `Enqueued ${job.recipientEmail} for immediate outbound MTA dispatch.`,
      autoCloseMs: 4000,
    });
  };

  const handleAutoSuppress = (job: QueueJob) => {
    ingestBounce(job.recipientEmail, job.lastError || job.smtpResponse || '550 5.1.1 User Unknown', {
      campaignId: job.campaignId,
      campaignName: job.campaignName,
    });
    showToast({
      type: 'warning',
      title: 'Contact Suppressed',
      message: `${job.recipientEmail} added to Global Suppression blacklist.`,
      autoCloseMs: 4000,
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Server className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Email Delivery Status <span className="italic text-[#D4AF37]">&amp; SMTP Diagnostics</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Cross-referenced MTA spool logs and RFC 5321 SMTP response codes explaining why individual messages succeeded, deferred, or bounced.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => notifyQueueStall({ count: 4, reason: 'ISP greylisting (421 4.7.0) on busy mail servers' })}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Simulate Queue Stall</span>
          </button>

          <button
            onClick={() => notifySmtpAuthFailure({ domain: 'aethermail.net', code: '535 5.7.8 Authentication credentials rejected' })}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Simulate Auth Failure</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#0D0D0D] border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-white/40 font-medium">Total Messages Processed</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{stats.total}</div>
          <div className="text-[11px] text-white/40 mt-0.5">Spool queue history</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-emerald-400 font-medium">Delivered (250 OK)</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{stats.delivered}</div>
          <div className="text-[11px] text-emerald-400/70 mt-0.5">{stats.rate}% delivery rate</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-amber-400 font-medium">Transient Retries (4xx)</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{stats.retrying}</div>
          <div className="text-[11px] text-white/40 mt-0.5">Greylisted / Rate-limited</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-rose-400 font-medium">Permanent Bounces (5xx)</div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">{stats.failed}</div>
          <div className="text-[11px] text-white/40 mt-0.5">550 User Unknown / Blocked</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="text-xs text-[#D4AF37] font-medium">Average MX Latency</div>
          <div className="text-2xl font-bold text-[#D4AF37] font-mono mt-1">142ms</div>
          <div className="text-[11px] text-white/40 mt-0.5">TLS 1.3 Cipher Handshake</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by email, SMTP code (250, 421, 550), campaign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span>Status Filter:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-black border border-white/15 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">All Delivery Events</option>
              <option value="delivered">Delivered (250 OK)</option>
              <option value="retry">Active Retries (4xx Deferred)</option>
              <option value="failed">Failed / Bounces (5xx Rejections)</option>
            </select>
          </div>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold transition-colors font-serif"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Open Domain Diagnostic Tool</span>
          </button>
        </div>
      </div>

      {/* Main Delivery Status Table */}
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/80 text-white/40 border-b border-white/10 uppercase text-[10px]">
              <tr>
                <th className="p-4 font-bold">Recipient &amp; Campaign</th>
                <th className="p-4 font-bold">Delivery Status</th>
                <th className="p-4 font-bold">SMTP Response Code</th>
                <th className="p-4 font-bold">Root Cause / Diagnostic Diagnosis</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              {filteredJobs.map((job) => {
                const isSuccess = job.status === 'delivered';
                const isRetry = job.status === 'retry';
                const isQueued = job.status === 'queued' || job.status === 'sending';

                return (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-xs">{job.recipientEmail}</div>
                      <div className="text-[11px] text-white/40 font-sans mt-0.5">{job.campaignName}</div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isSuccess
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isRetry
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : isQueued
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                        {isRetry && <Clock className="w-3 h-3" />}
                        {job.status.toUpperCase()}
                        {job.retryCount > 0 && ` (${job.retryCount}/5)`}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="text-[#D4AF37] font-bold text-xs">
                        {job.smtpInfo.code} {job.smtpInfo.enhancedCode}
                      </div>
                      <div className="text-[10px] text-white/40 truncate max-w-[200px]" title={job.smtpResponse || job.lastError || ''}>
                        {job.smtpResponse || job.lastError || '250 2.0.0 OK'}
                      </div>
                    </td>

                    <td className="p-4 max-w-md">
                      <div className="text-white/80 font-sans text-xs line-clamp-1">
                        {job.smtpInfo.description}
                      </div>
                      <div className="text-white/40 font-sans text-[11px] mt-0.5 line-clamp-1">
                        <span className="text-[#D4AF37]/80 font-semibold">Remedy:</span> {job.smtpInfo.recommendedAction}
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-[11px] border border-white/10 transition-colors"
                        >
                          Inspect Trace
                        </button>

                        {isRetry && (
                          <button
                            onClick={() => handleManualRetry(job)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] border border-amber-500/30 transition-colors"
                            title="Force immediate retry"
                          >
                            Retry Now
                          </button>
                        )}

                        {!isSuccess && (
                          <button
                            onClick={() => handleAutoSuppress(job)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] border border-rose-500/30 transition-colors"
                            title="Add to suppression blacklist"
                          >
                            Suppress
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trace Inspection Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#0A0A0A] border border-white/15 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#D4AF37]" />
                <div>
                  <h3 className="text-sm font-bold font-serif text-white">MTA Execution Trace &amp; SMTP Audit</h3>
                  <div className="text-[11px] text-white/40 font-mono">{selectedJob.id}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-black/60 p-4 rounded-2xl border border-white/5">
              <div>
                <span className="text-white/40 block">Recipient:</span>
                <span className="text-white font-bold">{selectedJob.recipientEmail}</span>
              </div>
              <div>
                <span className="text-white/40 block">Status:</span>
                <span className="text-[#D4AF37] font-bold uppercase">{selectedJob.status}</span>
              </div>
              <div>
                <span className="text-white/40 block">SMTP Code:</span>
                <span className="text-emerald-400 font-bold">
                  {selectedJob.smtpInfo.code} {selectedJob.smtpInfo.enhancedCode}
                </span>
              </div>
              <div>
                <span className="text-white/40 block">Retries:</span>
                <span className="text-white">{selectedJob.retryCount} / {selectedJob.maxRetries}</span>
              </div>
            </div>

            {/* Diagnostic Remedy Box */}
            <div className="bg-[#121212] border border-[#D4AF37]/30 rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold font-serif text-[#D4AF37] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Diagnostic Breakdown &amp; Resolution Plan</span>
              </div>
              <p className="text-xs text-white/80 font-sans leading-relaxed">
                {selectedJob.smtpInfo.typicalRootCause}
              </p>
              <div className="text-xs text-[#D4AF37] font-sans bg-black/50 p-2.5 rounded-xl border border-[#D4AF37]/20">
                <strong>Recommended Action:</strong> {selectedJob.smtpInfo.recommendedAction}
              </div>
            </div>

            {/* Event Timeline */}
            <div>
              <div className="text-xs font-bold text-white/60 uppercase font-mono tracking-wider mb-2">
                Outbound MTA Worker Event Timeline
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar font-mono text-[11px]">
                {selectedJob.events.map((ev, idx) => (
                  <div key={idx} className="bg-black/50 border border-white/5 p-2.5 rounded-xl flex items-start gap-2">
                    <span className="text-[#D4AF37] font-bold shrink-0">{ev.event}</span>
                    <span className="text-white/60 flex-1">{ev.details}</span>
                    <span className="text-white/30 text-[10px] shrink-0">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleManualRetry(selectedJob);
                    setSelectedJob(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold"
                >
                  Force Spool Re-queue
                </button>
                <button
                  onClick={() => {
                    handleAutoSuppress(selectedJob);
                    setSelectedJob(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold"
                >
                  Suppress Recipient
                </button>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium"
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
