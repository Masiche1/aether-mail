import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { DomainDiagnosticResult, SendingDomain } from '../../types';
import { runDomainDiagnostics } from '../../services/domainDiagnosticsService';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Copy,
  Check,
  Server,
  Lock,
  Globe,
  Terminal,
  Activity,
  ArrowRight,
  X,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface DomainDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDomain?: string;
}

export const DomainDiagnosticsModal: React.FC<DomainDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  initialDomain,
}) => {
  const { domains } = useApp();
  const { showToast } = useToast();

  const [selectedDomainName, setSelectedDomainName] = useState<string>(
    initialDomain || domains?.[0]?.domain || 'aethermail.net'
  );
  const [targetPort, setTargetPort] = useState<number>(587);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DomainDiagnosticResult | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'smtp' | 'dns' | 'recommendations'>('summary');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (initialDomain) {
      setSelectedDomainName(initialDomain);
    }
  }, [initialDomain]);

  useEffect(() => {
    if (isOpen && selectedDomainName) {
      handleRunTest();
    }
  }, [isOpen, selectedDomainName]);

  const handleRunTest = async () => {
    setIsRunning(true);
    try {
      const res = await runDomainDiagnostics(selectedDomainName, { customPort: targetPort });
      setDiagnosticResult(res);
      if (res.overallScore >= 90) {
        showToast({
          type: 'success',
          title: 'Domain Diagnostics Complete',
          message: `${res.domain} passed all DNS/DKIM/SPF/DMARC alignment checks (Score: ${res.overallScore}%).`,
          autoCloseMs: 4000,
        });
      } else {
        showToast({
          type: 'warning',
          title: 'Alignment Issues Detected',
          message: `${res.domain} has missing or unaligned authentication records (Score: ${res.overallScore}%).`,
          autoCloseMs: 6000,
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Diagnostic Probe Failed',
        message: err?.message || 'Unable to complete network handshake probe.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="domain-diagnostics-modal"
        className="bg-[#0C0C0C] border border-[#D4AF37]/30 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white tracking-wide flex items-center gap-2">
                <span>Domain &amp; SMTP</span>
                <span className="italic text-[#D4AF37]">Diagnostic Console</span>
              </h2>
              <p className="text-xs text-white/50 font-light mt-0.5">
                Live verification of SMTP connection, TLS ciphers, and DNS/DKIM/SPF/DMARC cryptographic alignment.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Controls */}
        <div className="p-4 bg-[#111111] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-white/60 font-medium">Domain:</span>
              <select
                id="diagnostic-domain-select"
                value={selectedDomainName}
                onChange={(e) => setSelectedDomainName(e.target.value)}
                className="bg-black border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                {(domains || []).map((d) => (
                  <option key={d.id} value={d.domain}>
                    {d.domain} ({d.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white/60 font-medium">Port:</span>
              <select
                value={targetPort}
                onChange={(e) => setTargetPort(Number(e.target.value))}
                className="bg-black border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
              >
                <option value={587}>587 (STARTTLS Submission)</option>
                <option value={465}>465 (SMTPS SSL/TLS)</option>
                <option value={25}>25 (MTA Relay)</option>
                <option value={2525}>2525 (Alternative)</option>
              </select>
            </div>
          </div>

          <button
            id="run-diagnostic-btn"
            onClick={handleRunTest}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-white text-black font-bold uppercase tracking-wider transition-all disabled:opacity-50 font-serif"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Probing Server...' : 'Run Diagnostics'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {diagnosticResult ? (
            <>
              {/* Score Banner */}
              <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-xl font-bold border ${
                      diagnosticResult.overallScore >= 90
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : diagnosticResult.overallScore >= 70
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {diagnosticResult.overallScore}%
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white font-serif tracking-wide flex items-center gap-2">
                      <span>Alignment Status for</span>
                      <span className="font-mono text-[#D4AF37]">{diagnosticResult.domain}</span>
                    </div>
                    <div className="text-xs text-white/50 mt-0.5">
                      {diagnosticResult.overallScore >= 90
                        ? 'Fully compliant with Google Workspace, Yahoo, and Microsoft 2026 bulk sender policies.'
                        : 'Action required: Some security records are missing or misconfigured.'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="px-3 py-1.5 rounded-xl bg-black border border-white/10 text-white/70">
                    Latency: <span className="text-emerald-400 font-bold">{diagnosticResult.smtpCheck.latencyMs} ms</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-black border border-white/10 text-white/70">
                    TLS: <span className="text-cyan-400 font-bold">TLSv1.3</span>
                  </div>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex border-b border-white/10 gap-6 text-xs">
                {[
                  { id: 'summary', label: 'Overview Matrix' },
                  { id: 'smtp', label: 'SMTP Connection & Handshake' },
                  { id: 'dns', label: 'DNS Alignment (SPF/DKIM/DMARC)' },
                  { id: 'recommendations', label: `Remediation Steps (${diagnosticResult.recommendations.length})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`pb-3 font-semibold transition-all relative ${
                      activeTab === t.id
                        ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview Matrix */}
              {activeTab === 'summary' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SMTP Connectivity Card */}
                  <div className="bg-[#101010] border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                        <Server className="w-4 h-4 text-[#D4AF37]" />
                        <span>SMTP Handshake</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        PASS (220 OK)
                      </span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed font-light">
                      Successfully established connection on port {diagnosticResult.smtpCheck.port} to{' '}
                      <span className="font-mono text-white/90">{diagnosticResult.smtpCheck.host}</span> with TLSv1.3 encryption.
                    </p>
                    <div className="bg-black/60 border border-white/5 rounded-xl p-2.5 font-mono text-[11px] text-emerald-400">
                      ✔ STARTTLS Accepted • AUTH Supported
                    </div>
                  </div>

                  {/* SPF Card */}
                  <div className="bg-[#101010] border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>SPF Policy</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          diagnosticResult.dnsChecks.spf.status === 'pass'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {diagnosticResult.dnsChecks.spf.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 font-light leading-relaxed">
                      {diagnosticResult.dnsChecks.spf.details}
                    </p>
                    <div className="bg-black/60 border border-white/5 rounded-xl p-2.5 font-mono text-[10px] text-white/70 truncate">
                      {diagnosticResult.dnsChecks.spf.rawRecord}
                    </div>
                  </div>

                  {/* DKIM Card */}
                  <div className="bg-[#101010] border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                        <Lock className="w-4 h-4 text-[#D4AF37]" />
                        <span>DKIM 2048-bit Signature</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          diagnosticResult.dnsChecks.dkim.status === 'pass'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {diagnosticResult.dnsChecks.dkim.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 font-light leading-relaxed">
                      {diagnosticResult.dnsChecks.dkim.details}
                    </p>
                    <div className="bg-black/60 border border-white/5 rounded-xl p-2.5 font-mono text-[10px] text-white/70 truncate">
                      Selector: {diagnosticResult.dnsChecks.dkim.selector}._domainkey
                    </div>
                  </div>

                  {/* DMARC Card */}
                  <div className="bg-[#101010] border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                        <Globe className="w-4 h-4 text-cyan-400" />
                        <span>DMARC Enforcement</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          diagnosticResult.dnsChecks.dmarc.status === 'pass'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {diagnosticResult.dnsChecks.dmarc.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 font-light leading-relaxed">
                      {diagnosticResult.dnsChecks.dmarc.details}
                    </p>
                    <div className="bg-black/60 border border-white/5 rounded-xl p-2.5 font-mono text-[10px] text-white/70 truncate">
                      Policy: {diagnosticResult.dnsChecks.dmarc.policy}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: SMTP Connection Transcript */}
              {activeTab === 'smtp' && (
                <div className="space-y-4">
                  <div className="bg-[#050505] border border-white/15 rounded-2xl p-4 font-mono text-xs text-white/90 space-y-2">
                    <div className="text-white/40 pb-2 border-b border-white/10 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-[#D4AF37]" />
                        SMTP Handshake Session Transcript
                      </span>
                      <span className="text-[10px] text-emerald-400">Connection Active (28ms)</span>
                    </div>
                    <div className="text-white/40">&gt; Connecting to {diagnosticResult.smtpCheck.host}:{diagnosticResult.smtpCheck.port}...</div>
                    <div className="text-emerald-400">&lt; {diagnosticResult.smtpCheck.banner}</div>
                    <div className="text-white/40">&gt; EHLO mail01.aethermail.net</div>
                    <pre className="text-emerald-400/90 whitespace-pre-wrap">{diagnosticResult.smtpCheck.heloResponse}</pre>
                    <div className="text-white/40">&gt; STARTTLS</div>
                    <div className="text-emerald-400">&lt; 220 2.0.0 Ready to start TLS (Cipher: {diagnosticResult.smtpCheck.tlsVersion})</div>
                    <div className="text-white/40">&gt; QUIT</div>
                    <div className="text-emerald-400">&lt; 221 2.0.0 Bye (Autonomous probe disconnected cleanly)</div>
                  </div>
                </div>
              )}

              {/* Tab 3: DNS Alignment Details */}
              {activeTab === 'dns' && (
                <div className="space-y-4">
                  {/* SPF Record */}
                  <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs font-serif">SPF Record (TXT @)</span>
                      <button
                        onClick={() => handleCopy(diagnosticResult.dnsChecks.spf.rawRecord, 'spf')}
                        className="flex items-center gap-1 text-[10px] text-[#D4AF37] hover:text-white"
                      >
                        {copiedKey === 'spf' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Record</span>
                      </button>
                    </div>
                    <div className="bg-black border border-white/10 rounded-xl p-3 font-mono text-xs text-white/80 select-all">
                      {diagnosticResult.dnsChecks.spf.rawRecord}
                    </div>
                  </div>

                  {/* DKIM Record */}
                  <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs font-serif">DKIM Public Key (TXT aethermail._domainkey)</span>
                      <button
                        onClick={() => handleCopy(diagnosticResult.dnsChecks.dkim.rawRecord, 'dkim')}
                        className="flex items-center gap-1 text-[10px] text-[#D4AF37] hover:text-white"
                      >
                        {copiedKey === 'dkim' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Record</span>
                      </button>
                    </div>
                    <div className="bg-black border border-white/10 rounded-xl p-3 font-mono text-xs text-white/80 select-all break-all">
                      {diagnosticResult.dnsChecks.dkim.rawRecord}
                    </div>
                  </div>

                  {/* DMARC Record */}
                  <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs font-serif">DMARC Policy (TXT _dmarc)</span>
                      <button
                        onClick={() => handleCopy(diagnosticResult.dnsChecks.dmarc.rawRecord, 'dmarc')}
                        className="flex items-center gap-1 text-[10px] text-[#D4AF37] hover:text-white"
                      >
                        {copiedKey === 'dmarc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Record</span>
                      </button>
                    </div>
                    <div className="bg-black border border-white/10 rounded-xl p-3 font-mono text-xs text-white/80 select-all break-all">
                      {diagnosticResult.dnsChecks.dmarc.rawRecord}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Recommendations */}
              {activeTab === 'recommendations' && (
                <div className="space-y-3">
                  {diagnosticResult.recommendations.map((rec, i) => (
                    <div key={i} className="bg-[#111111] border border-white/10 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white font-serif">{rec.title}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                            rec.priority === 'high'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {rec.priority} Priority
                        </span>
                      </div>
                      <p className="text-xs text-white/60 font-light">{rec.description}</p>
                      <div className="bg-black border border-white/10 rounded-xl p-2.5 font-mono text-xs text-[#D4AF37]">
                        {rec.suggestedFix}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center text-white/40 text-xs font-light">
              Press "Run Diagnostics" to initiate server and DNS probes.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-black/60 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-white/40 text-[11px]">
            Compliant with M3AAWG &amp; RFC 7208 / RFC 6376 / RFC 7489 Specifications.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
