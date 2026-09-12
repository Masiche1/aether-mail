import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AutomatedWarmupPlan, WarmupPaceStrategy } from '../../types';
import {
  Flame,
  Server,
  TrendingUp,
  Play,
  Pause,
  FastForward,
  Send,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  Activity,
  ArrowUpRight,
  Info,
  Calendar,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export const IpWarmupView: React.FC = () => {
  const {
    warmupPlans,
    createWarmupPlan,
    advanceWarmupDay,
    toggleWarmupStatus,
    simulateWarmupDispatch,
    domains,
    addAuditLog,
  } = useApp();

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    warmupPlans?.[0]?.id || 'plan_aethermail_corp'
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [testSendVolume, setTestSendVolume] = useState<number>(500);
  const [isSimulating, setIsSimulating] = useState(false);

  // New Plan Form State
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDomain, setNewPlanDomain] = useState(domains?.[0]?.domain || 'mail.aethermail.net');
  const [newPlanTargetVol, setNewPlanTargetVol] = useState<number>(250000);
  const [newPlanStartVol, setNewPlanStartVol] = useState<number>(500);
  const [newPlanDays, setNewPlanDays] = useState<number>(30);
  const [newPlanStrategy, setNewPlanStrategy] = useState<WarmupPaceStrategy>('balanced_30d');
  const [newPlanThrottle, setNewPlanThrottle] = useState<boolean>(true);
  const [newPlanThreshold, setNewPlanThreshold] = useState<number>(2.0);

  const activePlan =
    (warmupPlans || []).find((p) => p.id === selectedPlanId) ||
    warmupPlans?.[0] || {
      id: 'plan_fallback',
      name: 'Default Warmup Schedule',
      targetDomain: 'mail.aethermail.net',
      ipPoolId: 'pool_corp',
      ipAddresses: ['198.51.100.41', '198.51.100.42'],
      strategy: 'balanced_30d' as WarmupPaceStrategy,
      totalDays: 30,
      currentDay: 14,
      startDate: new Date().toISOString(),
      targetDailyVolume: 250000,
      startingDailyVolume: 500,
      autoThrottleOnBounce: true,
      maxBounceThresholdPercent: 2.0,
      autoPauseOnSpam: true,
      status: 'running' as const,
      overallReputationScore: 98,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schedule: [],
    };

  const activeScheduleDay =
    (activePlan.schedule || []).find((d) => d.dayNumber === activePlan.currentDay) ||
    activePlan.schedule?.[0];

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createWarmupPlan({
      name: newPlanName.trim() || `Ramp ${newPlanDomain}`,
      targetDomain: newPlanDomain,
      ipAddresses: ['198.51.100.41', '198.51.100.42'],
      targetDailyVolume: Number(newPlanTargetVol),
      startingDailyVolume: Number(newPlanStartVol),
      totalDays: Number(newPlanDays),
      strategy: newPlanStrategy,
      autoThrottleOnBounce: newPlanThrottle,
      maxBounceThresholdPercent: Number(newPlanThreshold),
    });

    setSelectedPlanId(created.id);
    setShowCreateModal(false);
    setNewPlanName('');
  };

  const handleSimulateBatch = () => {
    if (!activePlan) return;
    setIsSimulating(true);
    simulateWarmupDispatch(activePlan.id, testSendVolume);
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  // Prepare chart data from active plan schedule
  const chartData = (activePlan.schedule || []).map((s) => ({
    day: `D${s.dayNumber}`,
    limit: s.dailyLimit,
    sent: s.actualSent || 0,
    gmail: s.ispAllocations?.gmail || 0,
    microsoft: s.ispAllocations?.microsoft || 0,
    yahoo: s.ispAllocations?.yahoo || 0,
    icloud: s.ispAllocations?.icloud || 0,
    status: s.status,
  }));

  const progressPercent = activePlan.totalDays > 0
    ? Math.min(100, Math.round((activePlan.currentDay / activePlan.totalDays) * 100))
    : 0;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Flame className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Automated IP & Domain <span className="italic text-[#D4AF37]">Warming</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Autonomous daily volume ramp-up engine protecting sender reputation across Gmail, Microsoft Outlook, Yahoo, and iCloud.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c59e2b] text-black text-xs font-bold rounded-xl transition-all shadow-md shadow-[#D4AF37]/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Warmup Plan
          </button>
        </div>
      </div>

      {/* Plan Selector & Quick Status Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 flex flex-wrap gap-2.5 items-center bg-[#0D0D0D] border border-white/10 p-3 rounded-2xl">
          <span className="text-xs font-mono text-white/50 ml-2">Active Plan:</span>
          {(warmupPlans || []).map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlanId(plan.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                selectedPlanId === plan.id
                  ? 'bg-[#D4AF37] text-black font-bold shadow-md shadow-[#D4AF37]/20'
                  : 'bg-white/[0.04] text-white/80 hover:bg-white/[0.08] border border-white/10'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>{plan.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  plan.status === 'running'
                    ? selectedPlanId === plan.id
                      ? 'bg-black/30 text-black'
                      : 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                Day {plan.currentDay}/{plan.totalDays}
              </span>
            </button>
          ))}
        </div>

        {/* Global Reputation Gauge */}
        <div className="bg-[#0D0D0D] border border-white/10 p-4 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Sender Reputation</div>
            <div className="text-xl font-serif font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span>{activePlan.overallReputationScore || 99}%</span>
              <span className="text-[11px] font-sans font-normal text-white/60">High Authority</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Plan Overview Card */}
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-serif font-bold text-white tracking-wide">
                {activePlan.name}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  activePlan.status === 'running'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}
              >
                {activePlan.status === 'running' ? 'Active Warmup Running' : 'Pacing Paused'}
              </span>
              <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-lg border border-[#D4AF37]/20">
                {activePlan.targetDomain}
              </span>
            </div>
            <p className="text-xs text-white/50 font-light">
              Strategy:{' '}
              <span className="font-mono text-white capitalize">
                {activePlan.strategy.replace('_', ' ')}
              </span>{' '}
              • Target Daily Capacity:{' '}
              <span className="font-mono text-[#D4AF37]">
                {(activePlan.targetDailyVolume || 250000).toLocaleString()} emails/day
              </span>
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => toggleWarmupStatus(activePlan.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                activePlan.status === 'running'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              {activePlan.status === 'running' ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Pacing
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Resume Automation
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => advanceWarmupDay(activePlan.id)}
              className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Manually advance schedule to the next calendar day"
            >
              <FastForward className="w-3.5 h-3.5 text-[#D4AF37]" />
              Advance Next Day
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5 font-mono text-xs">
          <div className="bg-[#141414] p-3.5 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">CURRENT STAGE</div>
            <div className="text-base font-bold text-white">
              Day {activePlan.currentDay} <span className="text-white/40 text-xs font-normal">of {activePlan.totalDays}</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#D4AF37] h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-[#141414] p-3.5 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">TODAY'S SEND CAP</div>
            <div className="text-base font-bold text-[#D4AF37]">
              {(activeScheduleDay?.dailyLimit || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-white/40 font-sans">Max allowed volume</div>
          </div>

          <div className="bg-[#141414] p-3.5 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">TODAY DISPATCHED</div>
            <div className="text-base font-bold text-emerald-400">
              {(activeScheduleDay?.actualSent || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400/80 font-sans">
              {activeScheduleDay && activeScheduleDay.dailyLimit > 0
                ? `${Math.round((activeScheduleDay.actualSent / activeScheduleDay.dailyLimit) * 100)}% utilized`
                : '0% utilized'}
            </div>
          </div>

          <div className="bg-[#141414] p-3.5 rounded-xl border border-white/5 space-y-1">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">HOURLY SPEED CAP</div>
            <div className="text-base font-bold text-cyan-400">
              {(activeScheduleDay?.hourlySpeedLimit || 250).toLocaleString()} /hr
            </div>
            <div className="text-[10px] text-white/40 font-sans">Autonomous throttle</div>
          </div>

          <div className="bg-[#141414] p-3.5 rounded-xl border border-white/5 space-y-1 col-span-2 sm:col-span-4 lg:col-span-1">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">PROTECTION POLICY</div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
              <Zap className="w-3.5 h-3.5" /> Auto-Throttle ON
            </div>
            <div className="text-[10px] text-white/40 font-sans">&lt; {activePlan.maxBounceThresholdPercent}% bounce limit</div>
          </div>
        </div>

        {/* Interactive Warmup Batch Simulator */}
        <div className="bg-black/60 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-white font-bold block">Warmup Dispatch Simulator</span>
              <span className="text-[11px] text-white/40 font-sans">
                Simulate sending campaign warmup traffic to test ramp-up progression and throttling.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={testSendVolume}
              onChange={(e) => setTestSendVolume(Number(e.target.value))}
              className="bg-[#111111] border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value={250}>+250 emails</option>
              <option value={500}>+500 emails</option>
              <option value={1000}>+1,000 emails</option>
              <option value={2500}>+2,500 emails</option>
              <option value={5000}>+5,000 emails</option>
            </select>

            <button
              type="button"
              disabled={isSimulating}
              onClick={handleSimulateBatch}
              className="px-4 py-1.5 bg-[#D4AF37] hover:bg-[#c59e2b] text-black font-bold rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isSimulating ? 'Dispatching...' : 'Dispatch Batch'}
            </button>
          </div>
        </div>
      </div>

      {/* Projection Chart & ISP Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Exponential Ramp Curve */}
        <div className="lg:col-span-8 bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2 tracking-wide">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                Warmup Exponential Volume Ramp Curve
              </h3>
              <p className="text-[11px] text-white/50 font-light mt-0.5">
                Daily limits scale automatically while maintaining compliance with provider delivery algorithms.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-[#D4AF37]">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#D4AF37]" /> Daily Limit
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Dispatched
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="warmupLimitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="warmupSentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="day" stroke="#666" tick={{ fontSize: 10, fill: '#888' }} />
                <YAxis stroke="#666" tick={{ fontSize: 10, fill: '#888' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050505',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="limit"
                  stroke="#D4AF37"
                  strokeWidth={2}
                  fill="url(#warmupLimitGrad)"
                  name="Daily Limit Cap"
                />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#warmupSentGrad)"
                  name="Actual Sent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ISP Allocation Stack */}
        <div className="lg:col-span-4 bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2 tracking-wide">
              <Layers className="w-4 h-4 text-cyan-400" />
              ISP Traffic Allocation (Today)
            </h3>
            <p className="text-[11px] text-white/50 font-light mt-0.5">
              Traffic is proportionally balanced to prevent sudden spikes on any single mailbox provider.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs my-2">
            <div>
              <div className="flex justify-between text-white/80 mb-1">
                <span>Google Workspace / Gmail (45%)</span>
                <span className="text-[#D4AF37]">
                  {(activeScheduleDay?.ispAllocations?.gmail || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[45%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-white/80 mb-1">
                <span>Microsoft 365 / Outlook (28%)</span>
                <span className="text-[#D4AF37]">
                  {(activeScheduleDay?.ispAllocations?.microsoft || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[28%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-white/80 mb-1">
                <span>Yahoo / AOL Mail (15%)</span>
                <span className="text-[#D4AF37]">
                  {(activeScheduleDay?.ispAllocations?.yahoo || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full w-[15%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-white/80 mb-1">
                <span>Apple iCloud (7%)</span>
                <span className="text-[#D4AF37]">
                  {(activeScheduleDay?.ispAllocations?.icloud || 0).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full w-[7%]" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-black/50 border border-white/10 rounded-xl text-[11px] text-white/60 flex items-start gap-2">
            <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <span>
              If bounce rates exceed {activePlan.maxBounceThresholdPercent}% on any ISP, automated speed throttling halts that provider's queue segment immediately.
            </span>
          </div>
        </div>
      </div>

      {/* Daily Ramp Schedule Table */}
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2 tracking-wide">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              Warmup Schedule Progression Breakdown
            </h3>
            <p className="text-[11px] text-white/50 font-light mt-0.5">
              Day-by-day scheduled limits, delivery success telemetry, and throttle speeds.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-[11px]">
                <th className="pb-3 pl-2">DAY</th>
                <th className="pb-3">DATE</th>
                <th className="pb-3">DAILY CAP</th>
                <th className="pb-3">HOURLY SPEED</th>
                <th className="pb-3">ACTUAL SENT</th>
                <th className="pb-3">DELIVERY RATE</th>
                <th className="pb-3">BOUNCE RATE</th>
                <th className="pb-3 text-right pr-2">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(activePlan.schedule || []).map((item) => (
                <tr
                  key={item.dayNumber}
                  className={`hover:bg-white/[0.02] transition-colors ${
                    item.dayNumber === activePlan.currentDay ? 'bg-[#D4AF37]/5 font-bold' : ''
                  }`}
                >
                  <td className="py-3 pl-2">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] ${
                        item.dayNumber === activePlan.currentDay
                          ? 'bg-[#D4AF37] text-black font-bold'
                          : 'bg-white/5 text-white/70'
                      }`}
                    >
                      {item.dayNumber}
                    </span>
                  </td>
                  <td className="py-3 text-white/70">{item.date}</td>
                  <td className="py-3 text-[#D4AF37]">{(item.dailyLimit || 0).toLocaleString()}</td>
                  <td className="py-3 text-cyan-400">{(item.hourlySpeedLimit || 0).toLocaleString()} /hr</td>
                  <td className="py-3 text-white">{(item.actualSent || 0).toLocaleString()}</td>
                  <td className="py-3 text-emerald-400">{item.deliverySuccessRate || 99.8}%</td>
                  <td className="py-3 text-amber-400">{item.bounceRate || 0.15}%</td>
                  <td className="py-3 text-right pr-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${
                        item.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : item.status === 'active'
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                          : 'bg-white/5 text-white/40'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/20 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-base font-serif font-bold text-white">Configure Warmup Plan</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-white/40 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div>
                <label className="text-white/80 block mb-1 font-medium">Plan Identifier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Transactional Domain Warmup"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full bg-[#050505] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/80 block mb-1 font-medium">Sending Domain</label>
                  <select
                    value={newPlanDomain}
                    onChange={(e) => setNewPlanDomain(e.target.value)}
                    className="w-full bg-[#050505] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {(domains || []).map((d) => (
                      <option key={d.id} value={d.domain}>
                        {d.domain}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Pacing Strategy</label>
                  <select
                    value={newPlanStrategy}
                    onChange={(e) => setNewPlanStrategy(e.target.value as WarmupPaceStrategy)}
                    className="w-full bg-[#050505] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="balanced_30d">Standard Balanced (30 Days)</option>
                    <option value="conservative_45d">Conservative Safe (45 Days)</option>
                    <option value="aggressive_14d">Aggressive Accelerated (14 Days)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-white/80 block mb-1 font-medium">Start Volume (Day 1)</label>
                  <input
                    type="number"
                    min={100}
                    value={newPlanStartVol}
                    onChange={(e) => setNewPlanStartVol(Number(e.target.value))}
                    className="w-full bg-[#050505] border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Target Daily Volume</label>
                  <input
                    type="number"
                    min={1000}
                    step={5000}
                    value={newPlanTargetVol}
                    onChange={(e) => setNewPlanTargetVol(Number(e.target.value))}
                    className="w-full bg-[#050505] border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="text-white/80 block mb-1 font-medium">Schedule Days</label>
                  <input
                    type="number"
                    min={7}
                    max={60}
                    value={newPlanDays}
                    onChange={(e) => setNewPlanDays(Number(e.target.value))}
                    className="w-full bg-[#050505] border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="p-3 bg-black/40 border border-white/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/90 font-medium">Auto-Throttle on Bounce Spikes</span>
                  <input
                    type="checkbox"
                    checked={newPlanThrottle}
                    onChange={(e) => setNewPlanThrottle(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                </div>
                <div className="flex items-center justify-between text-white/60">
                  <span>Max Bounce Tolerance Threshold</span>
                  <div className="flex items-center gap-1 font-mono text-white">
                    <input
                      type="number"
                      step={0.1}
                      min={0.5}
                      max={5.0}
                      value={newPlanThreshold}
                      onChange={(e) => setNewPlanThreshold(Number(e.target.value))}
                      className="w-14 bg-[#111111] border border-white/20 rounded px-1.5 py-0.5 text-center text-xs"
                    />
                    <span>%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-[#c59e2b] text-black font-bold rounded-xl shadow-md"
                >
                  Create & Launch Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
