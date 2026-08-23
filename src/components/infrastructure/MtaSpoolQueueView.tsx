import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { QueueJob } from '../../types';
import {
  Cpu,
  Play,
  Pause,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Sliders,
  Terminal,
  ArrowRight,
  ShieldCheck,
  Server,
} from 'lucide-react';

export const MtaSpoolQueueView: React.FC = () => {
  const {
    queueJobs = [],
    isEngineRunning = true,
    pauseQueue,
    resumeQueue,
    hourlySpeed = 10000,
    setHourlySpeed,
    flushQueue,
    retryJob,
    setActiveTab,
    addAuditLog,
  } = useApp();
  const { showToast, notifyQueueStall } = useToast();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<QueueJob | null>(null);

  const mtaQueue = queueJobs || [];
  const filteredJobs = mtaQueue.filter((j) => (filterStatus === 'all' ? true : j.status === filterStatus));

  const stats = {
    queued: mtaQueue.filter((j) => j.status === 'queued').length,
    sending: mtaQueue.filter((j) => j.status === 'sending').length,
    delivered: mtaQueue.filter((j) => j.status === 'delivered').length,
    retry: mtaQueue.filter((j) => j.status === 'retry').length,
  };

  const handleToggleEngine = () => {
    if (isEngineRunning) {
      pauseQueue();
      showToast({
        type: 'warning',
        title: 'MTA Spool Engine Paused',
        message: 'Active message dispatch suspended by operator.',
        autoCloseMs: 4000,
      });
    } else {
      resumeQueue();
      showToast({
        type: 'success',
        title: 'MTA Spool Engine Resumed',
        message: 'Outbound worker threads resumed dispatch.',
        autoCloseMs: 4000,
      });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Cpu className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              MTA Engine <span className="italic text-[#D4AF37]">&amp; Spool Queue</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Real-time multi-threaded SMTP connection manager, MX DNS resolving, TLS handshake, and retry state machine.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('delivery-status')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold transition-colors font-serif"
          >
            <Server className="w-4 h-4" />
            <span>Delivery Status &amp; SMTP Diagnostics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={flushQueue}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Flush Spool</span>
          </button>

          <button
            onClick={handleToggleEngine}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg font-serif ${
              isEngineRunning
                ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 shadow-amber-500/10'
                : 'bg-[#D4AF37] hover:bg-white text-black shadow-[#D4AF37]/20'
            }`}
          >
            {isEngineRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isEngineRunning ? 'Pause Engine' : 'Resume Dispatch'}</span>
          </button>
        </div>
      </div>

      {/* Throttle & Engine Speed Control */}
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-serif font-bold text-white tracking-wide">Dynamic Dispatch Rate Limiter</div>
            <div className="text-xs text-white/50 font-light">
              Autonomous throttle prevents ISP rate-limiting greylists.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="range"
            min="500"
            max="50000"
            step="500"
            value={hourlySpeed}
            onChange={(e) => setHourlySpeed(Number(e.target.value))}
            className="w-full md:w-64 accent-[#D4AF37] cursor-pointer"
          />
          <span className="font-mono text-[#D4AF37] font-bold text-sm min-w-[110px] text-right">
            {(hourlySpeed || 0).toLocaleString()} msg/hr
          </span>
        </div>
      </div>

      {/* Stats Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
        <div
          onClick={() => setFilterStatus('queued')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'queued'
              ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-xl ring-1 ring-[#D4AF37]/30'
              : 'bg-[#0D0D0D] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-xs text-white/50 uppercase tracking-wider">QUEUED</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.queued}</div>
        </div>

        <div
          onClick={() => setFilterStatus('sending')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'sending'
              ? 'bg-cyan-500/15 border-cyan-500 shadow-xl'
              : 'bg-[#0D0D0D] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-xs text-cyan-400 uppercase tracking-wider">CONNECTING / TLS</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{stats.sending}</div>
        </div>

        <div
          onClick={() => setFilterStatus('delivered')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'delivered'
              ? 'bg-emerald-500/15 border-emerald-500 shadow-xl'
              : 'bg-[#0D0D0D] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-xs text-emerald-400 uppercase tracking-wider">250 OK DELIVERED</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{stats.delivered}</div>
        </div>

        <div
          onClick={() => setFilterStatus('retry')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === 'retry'
              ? 'bg-amber-500/15 border-amber-500 shadow-xl'
              : 'bg-[#0D0D0D] border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-xs text-amber-400 uppercase tracking-wider">RETRY BACKOFF (4XX)</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{stats.retry}</div>
        </div>
      </div>

      {/* Queue Jobs Table */}
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-mono font-bold text-white/80">Live MTA Thread Execution Log</span>
          </div>

          <button
            onClick={() => setFilterStatus('all')}
            className="text-[11px] text-[#D4AF37] hover:text-white font-mono font-bold transition-colors"
          >
            Reset Filter ({mtaQueue.length} total)
          </button>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141414] text-white/40 border-b border-white/10 uppercase text-[10px] sticky top-0">
              <tr>
                <th className="p-3.5">Job ID</th>
                <th className="p-3.5">Channel</th>
                <th className="p-3.5">Recipient</th>
                <th className="p-3.5">Campaign Name</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Attempts</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              {(filteredJobs || []).slice(0, 50).map((job) => (
                <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5 text-[#D4AF37] font-bold">{job.id}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] bg-white/[0.05] border border-white/10 text-white/80 font-bold uppercase">
                      {job.channel}
                    </span>
                  </td>
                  <td className="p-3.5 text-white font-bold">{job.recipientEmail || job.recipientPhone}</td>
                  <td className="p-3.5 text-white/50 truncate max-w-[200px]">{job.campaignName}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        job.status === 'delivered'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : job.status === 'sending'
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse'
                          : job.status === 'retry'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {(job.status || 'queued').toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3.5">{job.retryCount || 0} / {job.maxRetries || 5}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-[11px] border border-white/10 transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Trace Inspection */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#0A0A0A] border border-white/15 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-sm font-bold font-serif text-white">MTA Spool Job Details</h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Recipient:</span>
                <span className="text-white font-bold">{selectedJob.recipientEmail || selectedJob.recipientPhone}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">Status:</span>
                <span className="text-[#D4AF37] font-bold uppercase">{selectedJob.status}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-white/40">SMTP Response / Error:</span>
                <span className="text-white/90">{selectedJob.smtpResponse || selectedJob.lastError || 'None'}</span>
              </div>

              <div>
                <span className="text-white/40 block mb-1">Thread Execution Events:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar bg-black p-3 rounded-xl border border-white/10">
                  {(selectedJob.events || []).map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="text-[#D4AF37] font-bold shrink-0">{ev.event}:</span>
                      <span className="text-white/70 flex-1">{ev.details}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  retryJob(selectedJob.id);
                  setSelectedJob(null);
                  showToast({
                    type: 'info',
                    title: 'Message Re-queued',
                    message: `${selectedJob.recipientEmail} re-queued for transmission.`,
                    autoCloseMs: 3000,
                  });
                }}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold"
              >
                Force Re-queue
              </button>

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
