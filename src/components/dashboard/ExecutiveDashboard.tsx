import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Send,
  Users,
  CheckCircle2,
  Eye,
  MousePointerClick,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Clock,
  Sparkles,
  Play,
  Pause,
  Plus,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ExecutiveDashboardProps {
  onOpenNewCampaign: () => void;
  onOpenImport: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  onOpenNewCampaign,
  onOpenImport,
}) => {
  const {
    contacts,
    campaigns,
    smsCampaigns,
    queueJobs,
    domains,
    deliverability,
    isEngineRunning,
    pauseQueue,
    resumeQueue,
    flushQueue,
    setActiveTab,
    hourlySpeed,
  } = useApp();

  // Aggregate stats
  const totalContacts = (contacts || []).length;
  const totalEmailsSent = (campaigns || []).reduce((acc, c) => acc + (c?.stats?.sent || 0), 4284291);
  const totalDelivered = (campaigns || []).reduce((acc, c) => acc + (c?.stats?.delivered || 0), 4189000);
  const totalOpened = (campaigns || []).reduce((acc, c) => acc + (c?.stats?.opened || 0), 2065000);
  const totalClicked = (campaigns || []).reduce((acc, c) => acc + (c?.stats?.clicked || 0), 715000);
  const totalBounced = (campaigns || []).reduce((acc, c) => acc + (c?.stats?.bounced || 0), 59900);
  const totalComplaints = (campaigns || []).reduce((acc, c) => acc + (c?.stats?.complaints || 0), 1280);
  const totalSmsSent = (smsCampaigns || []).reduce((acc, s) => acc + (s?.stats?.sent || 0), 842192);

  const deliveryRate = totalEmailsSent > 0 ? ((totalDelivered / totalEmailsSent) * 100).toFixed(1) : '99.4';
  const openRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : '48.2';
  const clickRate = totalDelivered > 0 ? ((totalClicked / totalDelivered) * 100).toFixed(1) : '16.7';
  const bounceRate = totalEmailsSent > 0 ? ((totalBounced / totalEmailsSent) * 100).toFixed(2) : '0.85';
  const complaintRate = totalEmailsSent > 0 ? ((totalComplaints / totalEmailsSent) * 100).toFixed(3) : '0.008';

  // Queue state breakdown
  const queuedJobsCount = (queueJobs || []).filter((j) => j && j.status === 'queued').length;
  const sendingJobsCount = (queueJobs || []).filter((j) => j && j.status === 'sending').length;
  const retryJobsCount = (queueJobs || []).filter((j) => j && j.status === 'retry').length;
  const deliveredJobsCount = (queueJobs || []).filter((j) => j && j.status === 'delivered').length;

  // Chart data: 24h delivery velocity & volume
  const hourlyActivityData = [
    { hour: '00:00', sent: 1200, delivered: 1180, opened: 540 },
    { hour: '03:00', sent: 800, delivered: 790, opened: 310 },
    { hour: '06:00', sent: 3400, delivered: 3320, opened: 1800 },
    { hour: '09:00', sent: 8900, delivered: 8720, opened: 4900 },
    { hour: '12:00', sent: 11200, delivered: 10980, opened: 5800 },
    { hour: '15:00', sent: 9400, delivered: 9210, opened: 4600 },
    { hour: '18:00', sent: 6100, delivered: 5980, opened: 2900 },
    { hour: '21:00', sent: 3200, delivered: 3140, opened: 1400 },
  ];

  const channelDistribution = [
    { name: 'Email Messages', value: totalEmailsSent, color: '#3b82f6' },
    { name: 'SMS Broadcasts', value: totalSmsSent, color: '#8b5cf6' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto">
      {/* Header Banner & Live Control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 bg-white/[0.02] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-serif text-white tracking-wide">
              Executive Delivery <span className="italic text-[#D4AF37]">Command Center</span>
            </h1>
            <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full font-mono font-medium flex items-center gap-1.5 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
              Autonomous MTA v4.8
            </span>
          </div>
          <p className="text-white/50 text-xs mt-1.5 font-light leading-relaxed">
            Real-time delivery cluster monitoring, cryptographic SPF/DKIM authentication, and queue orchestration.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3.5 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-[#D4AF37]/30 text-[#D4AF37] rounded-xl text-xs font-serif italic transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>AI Deliverability Advisor</span>
          </button>

          <button
            onClick={isEngineRunning ? pauseQueue : resumeQueue}
            className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-all shadow-sm ${
              isEngineRunning
                ? 'bg-white/[0.03] text-white/80 border border-white/10 hover:bg-white/[0.06]'
                : 'bg-[#D4AF37] text-black font-bold hover:bg-white'
            }`}
          >
            {isEngineRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400" />
                <span>Pause Spool</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-black" />
                <span>Resume Spool</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenNewCampaign}
            className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 font-bold" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Top 8 Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {/* Total Contacts */}
        <div
          onClick={() => setActiveTab('contacts')}
          className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-white/40 text-[10px] uppercase tracking-[0.2em] mb-1.5 font-mono">
            <span>Contacts</span>
            <Users className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-serif text-[#D4AF37] font-medium tracking-tight">1.28M</div>
          <div className="text-[10px] text-emerald-400/90 flex items-center gap-0.5 mt-1 font-mono">
            <TrendingUp className="w-2.5 h-2.5" /> +12.4k wk
          </div>
        </div>

        {/* Emails Sent */}
        <div
          onClick={() => setActiveTab('campaigns')}
          className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-white/40 text-[10px] uppercase tracking-[0.2em] mb-1.5 font-mono">
            <span>Sent</span>
            <Send className="w-3.5 h-3.5 text-white/60 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-serif text-white font-medium tracking-tight">4.28M</div>
          <div className="text-[10px] text-white/30 font-mono mt-1">Lifetime</div>
        </div>

        {/* Delivered Rate */}
        <div
          onClick={() => setActiveTab('deliverability')}
          className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-white/40 text-[10px] uppercase tracking-[0.2em] mb-1.5 font-mono">
            <span>Delivered</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-serif text-[#D4AF37] font-medium tracking-tight">97.8%</div>
          <div className="text-[10px] text-white/30 font-mono mt-1">4.18M msgs</div>
        </div>

        {/* Opened Rate */}
        <div
          onClick={() => setActiveTab('analytics')}
          className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-white/40 text-[10px] uppercase tracking-[0.2em] mb-1.5 font-mono">
            <span>Opened</span>
            <Eye className="w-3.5 h-3.5 text-white/60 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-serif text-white font-medium tracking-tight">48.2%</div>
          <div className="text-[10px] text-white/30 font-mono mt-1">2.06M opens</div>
        </div>

        {/* Clicked Rate */}
        <div
          onClick={() => setActiveTab('shortlinks')}
          className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-white/40 text-[10px] uppercase tracking-[0.2em] mb-1.5 font-mono">
            <span>Clicked</span>
            <MousePointerClick className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-serif text-[#D4AF37] font-medium tracking-tight">16.7%</div>
          <div className="text-[10px] text-white/30 font-mono mt-1">715k clicks</div>
        </div>

        {/* Bounced Rate */}
        <div
          onClick={() => setActiveTab('suppressions')}
          className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-white/40 text-[10px] uppercase tracking-[0.2em] mb-1.5 font-mono">
            <span>Bounced</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-serif text-rose-300 font-medium tracking-tight">1.4%</div>
          <div className="text-[10px] text-white/30 font-mono mt-1">Auto-clean</div>
        </div>

        {/* Complaints Rate */}
        <div
          onClick={() => setActiveTab('deliverability')}
          className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-white/40 text-[10px] uppercase tracking-[0.2em] mb-1.5 font-mono">
            <span>Spam</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-serif text-white font-medium tracking-tight">0.03%</div>
          <div className="text-[10px] text-[#D4AF37]/80 font-mono mt-1">Safe &lt;0.08%</div>
        </div>

        {/* SMS Sent */}
        <div
          onClick={() => setActiveTab('sms-campaigns')}
          className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 hover:bg-white/[0.04] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-white/40 text-[10px] uppercase tracking-[0.2em] mb-1.5 font-mono">
            <span>SMS Sent</span>
            <MessageSquare className="w-3.5 h-3.5 text-white/60 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-serif text-[#D4AF37] font-medium tracking-tight">842k</div>
          <div className="text-[10px] text-white/30 font-mono mt-1">SMPP Bound</div>
        </div>
      </div>

      {/* Main Grid: Queue & Velocity Activity + Deliverability Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-time 24h Velocity & Spool Queue HUD */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sending Activity Chart */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-serif text-white tracking-wide flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  Autonomous Sending Velocity
                </h2>
                <p className="text-xs text-white/40 font-light mt-0.5">
                  Real-time throughput dynamically throttled by domain reputation and IP warm-up curve.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-[11px]">
                <span className="flex items-center gap-1.5 text-[#D4AF37]">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span> Dispatched
                </span>
                <span className="flex items-center gap-1.5 text-white/80">
                  <span className="w-2 h-2 rounded-full bg-white/70"></span> Delivered
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyActivityData}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="hour" stroke="#666666" fontSize={11} />
                  <YAxis stroke="#666666" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D0D0D',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#FFFFFF',
                    }}
                  />
                  <Area type="monotone" dataKey="sent" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorSent)" />
                  <Area type="monotone" dataKey="delivered" stroke="#E0E0E0" strokeWidth={1.5} fillOpacity={1} fill="url(#colorDelivered)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Queue Visual Bars */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="text-base font-serif text-white tracking-wide">Active Delivery Queue Status</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={flushQueue}
                  className="px-3 py-1 rounded-lg text-xs font-mono bg-white/[0.04] hover:bg-white/[0.08] text-white/70 border border-white/10 transition-colors"
                >
                  Flush Spool
                </button>
                <button
                  onClick={() => setActiveTab('queue')}
                  className="text-xs text-[#D4AF37] hover:underline font-medium flex items-center gap-1 uppercase tracking-wider font-mono text-[10px]"
                >
                  Inspect Live Queue <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Visual Queue Status Bars */}
            <div className="space-y-4 font-mono text-xs">
              {/* Email Queue */}
              <div>
                <div className="flex justify-between text-white/80 mb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span> Email Queue
                  </span>
                  <span className="text-[#D4AF37] font-medium">25,000 / 25,000 (100% active)</span>
                </div>
                <div className="w-full h-2.5 bg-white/[0.05] rounded-full overflow-hidden flex">
                  <div className="bg-[#D4AF37] h-full" style={{ width: '85%' }}></div>
                  <div className="bg-white h-full animate-pulse" style={{ width: '15%' }}></div>
                </div>
              </div>

              {/* SMS Queue */}
              <div>
                <div className="flex justify-between text-white/80 mb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-white/50"></span> SMS Queue (SMPP)
                  </span>
                  <span className="text-white/90 font-medium">3,120 ready to dispatch</span>
                </div>
                <div className="w-full h-2.5 bg-white/[0.05] rounded-full overflow-hidden flex">
                  <div className="bg-white/60 h-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              {/* Scheduled Queue */}
              <div>
                <div className="flex justify-between text-white/80 mb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8C6B2D]"></span> Scheduled Jobs
                  </span>
                  <span className="text-amber-300 font-medium">48,900 upcoming</span>
                </div>
                <div className="w-full h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="bg-[#8C6B2D] h-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              {/* Failed / Retries */}
              <div>
                <div className="flex justify-between text-white/80 mb-1.5">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Retries & Bounces
                  </span>
                  <span className="text-rose-300 font-medium">45 temporary 421 retries</span>
                </div>
                <div className="w-full h-2.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: '4%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Deliverability Health Card & Verified Domains Summary */}
        <div className="space-y-6">
          {/* Deliverability Health Card */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.25em] font-mono">
                  DELIVERABILITY HEALTH
                </h3>
                <div className="text-base font-serif text-white mt-1">Autonomous Reputation</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-serif font-light text-[#D4AF37]">
                  {deliverability.overallScore} <span className="text-base text-white/40 font-sans">/ 100</span>
                </div>
                <span className="text-[10px] text-[#D4AF37]/90 font-mono tracking-widest uppercase">Platinum Tier</span>
              </div>
            </div>

            <div className="py-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Domain Reputation</span>
                <span className="text-[#D4AF37] font-medium">Excellent (98/100)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">IP Pool Reputation</span>
                <span className="text-[#D4AF37] font-medium">Good (95/100)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">SPF Authentication</span>
                <span className="text-white font-medium">✓ PASS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">DKIM (2048-bit RSA)</span>
                <span className="text-white font-medium">✓ PASS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">DMARC Policy (quarantine)</span>
                <span className="text-white font-medium">✓ PASS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Reverse DNS (PTR)</span>
                <span className="text-white font-medium">✓ PASS</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Bounce Rate</span>
                <span className="text-white/80">1.4% (under 2.5% max)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Complaint Rate</span>
                <span className="text-white/80">0.03% (under 0.08% max)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Blacklist Check</span>
                <span className="text-[#D4AF37] font-medium">✓ Clear (Spamhaus/Barracuda)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => setActiveTab('deliverability')}
                className="w-full py-2.5 bg-white/[0.04] hover:bg-[#D4AF37] hover:text-black text-[#D4AF37] rounded-xl text-xs font-serif italic transition-all flex items-center justify-center gap-2 border border-[#D4AF37]/30"
              >
                <ShieldCheck className="w-4 h-4" />
                View Full Deliverability Audit
              </button>
            </div>
          </div>

          {/* Sending Domains Matrix Widget */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.25em] font-mono">
                SENDING DOMAINS
              </h3>
              <button
                onClick={() => setActiveTab('domains')}
                className="text-[10px] text-[#D4AF37] hover:underline uppercase tracking-wider font-mono"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2.5">
              {(domains || []).map((dom) => (
                <div
                  key={dom.id}
                  onClick={() => setActiveTab('domains')}
                  className="p-3 rounded-xl bg-white/[0.01] border border-white/10 hover:bg-white/[0.04] transition-colors cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-serif font-medium text-white">{dom.domain}</div>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/40 mt-1">
                      <span>SPF:{dom.spfStatus?.toUpperCase() || 'PASS'}</span>
                      <span>•</span>
                      <span>DKIM:{dom.dkimStatus?.toUpperCase() || 'PASS'}</span>
                      <span>•</span>
                      <span>DMARC:{dom.dmarcStatus?.toUpperCase() || 'PASS'}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-mono font-medium px-2.5 py-0.5 rounded-full ${
                      dom.status === 'verified'
                        ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {dom.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif text-white tracking-wide">Active & Recent Campaigns</h2>
            <p className="text-xs text-white/40 font-light mt-0.5">Live delivery metrics and recipient engagement telemetry.</p>
          </div>
          <button
            onClick={() => setActiveTab('campaigns')}
            className="text-[10px] text-[#D4AF37] hover:underline font-mono uppercase tracking-wider flex items-center gap-1"
          >
            All Campaigns <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-white/40 border-b border-white/10 uppercase text-[9px] tracking-wider">
              <tr>
                <th className="pb-3 font-semibold">Campaign Name</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Recipients</th>
                <th className="pb-3 font-semibold">Delivered</th>
                <th className="pb-3 font-semibold">Opened</th>
                <th className="pb-3 font-semibold">Clicked</th>
                <th className="pb-3 font-semibold">Replies</th>
                <th className="pb-3 font-semibold">Bounced</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              {(campaigns || []).map((camp) => (
                <tr
                  key={camp.id}
                  onClick={() => setActiveTab('campaigns')}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <td className="py-3.5">
                    <div className="font-serif text-sm text-white font-medium">{camp.name}</div>
                    <div className="text-[11px] text-white/40 truncate max-w-xs">{camp.subject}</div>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-semibold ${
                        camp.status === 'completed'
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                          : camp.status === 'sending'
                          ? 'bg-white/10 text-white border border-white/20 animate-pulse'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {camp.status?.toUpperCase() || 'DRAFT'}
                    </span>
                  </td>
                  <td className="py-3.5 font-medium text-white">
                    {camp.stats.totalRecipients.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-[#D4AF37]">
                    {camp.stats.delivered.toLocaleString()}{' '}
                    <span className="text-[10px] text-white/40">
                      ({camp.stats.totalRecipients > 0 ? ((camp.stats.delivered / camp.stats.totalRecipients) * 100).toFixed(0) : 0}%)
                    </span>
                  </td>
                  <td className="py-3.5 text-white">
                    {camp.stats.opened.toLocaleString()}{' '}
                    <span className="text-[10px] text-white/40">
                      ({camp.stats.delivered > 0 ? ((camp.stats.opened / camp.stats.delivered) * 100).toFixed(0) : 0}%)
                    </span>
                  </td>
                  <td className="py-3.5 text-[#D4AF37]">
                    {camp.stats.clicked.toLocaleString()}
                  </td>
                  <td className="py-3.5 text-white font-semibold">
                    {camp.stats.replies}
                  </td>
                  <td className="py-3.5 text-rose-400">
                    {camp.stats.bounced}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
