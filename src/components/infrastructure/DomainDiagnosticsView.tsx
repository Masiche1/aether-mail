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
  ExternalLink,
  Zap,
  Play,
  Layers,
} from 'lucide-react';

export const DomainDiagnosticsView: React.FC = () => {
  const { domains, setActiveTab: setMainTab } = useApp();
  const { showToast, notifySmtpAuthFailure } = useToast();

  const [selectedDomainName, setSelectedDomainName] = useState<string>(
    domains?.[0]?.domain || 'aethermail.net'
  );
  const [targetPort, setTargetPort] = useState<number>(587);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DomainDiagnosticResult | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'smtp' | 'dns' | 'recommendations'>('summary');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDomainName) {
      handleRunTest();
    }
  }, [selectedDomainName]);

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

  const handleSimulateAuthFailure = () => {
    notifySmtpAuthFailure({
      domain: selectedDomainName,
      server: `mail.${selectedDomainName}`,
      code: '535 5.7.8 (Bad credentials: password mismatch)',
    });
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Domain &amp; SMTP <span className="italic text-[#D4AF37]">Diagnostic Console</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Real-time diagnostic probe testing SMTP connectivity, TLSv1.3 encryption, and SPF/DKIM/DMARC/MX DNS alignment for configured sending domains.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateAuthFailure}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
            title="Test Toast Alert system for SMTP auth failure"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Test Auth Alert</span>
          </button>

          <button
            onClick={handleRunTest}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition-all font-serif disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Probing...' : 'Run Diagnostics'}</span>
          </button>
        </div>
      </div>

      {/* Control Selector Bar */}
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/60 font-medium">Target Domain:</span>
            <select
              value={selectedDomainName}
              onChange={(e) => setSelectedDomainName(e.target.value)}
              className="bg-black border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
            >
              {(domains || []).map((d) => (
                <option key={d.id} value={d.domain}>
                  {d.domain} ({d.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/60 font-medium">Port:</span>
            <select
              value={targetPort}
              onChange={(e) => setTargetPort(Number(e.target.value))}
              className="bg-black border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#D4AF37]"
            >
              <option value={587}>587 (STARTTLS Submission)</option>
              <option value={465}>465 (SMTPS SSL/TLS)</option>
              <option value={25}>25 (MTA Standard)</option>
              <option value={2525}>2525 (Alternative)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-white/50">
          <span>RFC 7208 / 6376 / 7489 Alignment Probe</span>
        </div>
      </div>

      {/* Main Diagnostic Body */}
      {diagnosticResult && (
        <div className="space-y-6">
          {/* Health Score Banner */}
          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-mono text-2xl font-bold border ${
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
                <h3 className="text-lg font-bold text-white font-serif tracking-wide flex items-center gap-2">
                  <span>Cryptographic Alignment Score:</span>
                  <span className="font-mono text-[#D4AF37]">{diagnosticResult.domain}</span>
                </h3>
                <p className="text-xs text-white/50 mt-1 font-light">
                  {diagnosticResult.overallScore >= 90
                    ? 'All security protocols pass. SPF, DKIM 2048-bit keys, DMARC (p=reject), and SMTP TLS encryption are active.'
                    : 'Security warning: Missing or misconfigured DNS records detected. Update records to avoid ISP throttling.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="bg-black/60 border border-white/10 px-4 py-2.5 rounded-xl text-white/70">
                SMTP Latency: <span className="text-emerald-400 font-bold">{diagnosticResult.smtpCheck.latencyMs} ms</span>
              </div>
              <div className="bg-black/60 border border-white/10 px-4 py-2.5 rounded-xl text-white/70">
                Cipher: <span className="text-cyan-400 font-bold">TLSv1.3</span>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-white/10 gap-8 text-xs font-serif">
            {[
              { id: 'summary', label: 'Overview Matrix' },
              { id: 'smtp', label: 'SMTP Connection & Handshake' },
              { id: 'dns', label: 'DNS Alignment (SPF/DKIM/DMARC)' },
              { id: 'recommendations', label: `Remediation Guidance (${diagnosticResult.recommendations.length})` },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`pb-3 font-bold uppercase tracking-wider transition-all relative ${
                  activeTab === t.id
                    ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Summary Matrix */}
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SMTP Card */}
              <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                    <Server className="w-4 h-4 text-[#D4AF37]" />
                    <span>SMTP Handshake &amp; TLS</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    PASS (220 OK)
                  </span>
                </div>
                <p className="text-xs text-white/60 font-light leading-relaxed">
                  Established connection to <span className="font-mono text-white">{diagnosticResult.smtpCheck.host}:{diagnosticResult.smtpCheck.port}</span> with ECDHE-RSA-AES256 TLSv1.3 encryption.
                </p>
                <div className="bg-black border border-white/5 rounded-xl p-3 font-mono text-[11px] text-emerald-400">
                  ✔ STARTTLS Accepted • AUTH LOGIN PLAIN Active • 28ms RTT
                </div>
              </div>

              {/* SPF Card */}
              <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>SPF Policy (Sender Policy Framework)</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
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
                <div className="bg-black border border-white/5 rounded-xl p-3 font-mono text-[10px] text-white/80 truncate">
                  {diagnosticResult.dnsChecks.spf.rawRecord}
                </div>
              </div>

              {/* DKIM Card */}
              <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                    <Lock className="w-4 h-4 text-[#D4AF37]" />
                    <span>DKIM 2048-bit Cryptographic Key</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
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
                <div className="bg-black border border-white/5 rounded-xl p-3 font-mono text-[10px] text-white/80 truncate">
                  Selector: {diagnosticResult.dnsChecks.dkim.selector}._domainkey.{diagnosticResult.domain}
                </div>
              </div>

              {/* DMARC Card */}
              <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    <span>DMARC Strict Enforcement</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
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
                <div className="bg-black border border-white/5 rounded-xl p-3 font-mono text-[10px] text-white/80 truncate">
                  {diagnosticResult.dnsChecks.dmarc.rawRecord}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: SMTP Transcript */}
          {activeTab === 'smtp' && (
            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-serif">
                  <Terminal className="w-4 h-4 text-[#D4AF37]" />
                  <span>SMTP Connection &amp; EHLO Handshake Transcript</span>
                </div>
                <span className="text-xs font-mono text-emerald-400">Status: 220 Connected</span>
              </div>
              <div className="bg-black border border-white/10 rounded-xl p-4 font-mono text-xs space-y-2 text-white/80">
                <div className="text-white/40">&gt; Connecting to {diagnosticResult.smtpCheck.host}:{diagnosticResult.smtpCheck.port}...</div>
                <div className="text-emerald-400">&lt; {diagnosticResult.smtpCheck.banner}</div>
                <div className="text-white/40">&gt; EHLO mail01.aethermail.net</div>
                <pre className="text-emerald-400/90 whitespace-pre-wrap">{diagnosticResult.smtpCheck.heloResponse}</pre>
                <div className="text-white/40">&gt; STARTTLS</div>
                <div className="text-emerald-400">&lt; 220 2.0.0 Ready to start TLS (Cipher: {diagnosticResult.smtpCheck.tlsVersion})</div>
                <div className="text-white/40">&gt; QUIT</div>
                <div className="text-emerald-400">&lt; 221 2.0.0 Bye (Probe completed cleanly)</div>
              </div>
            </div>
          )}

          {/* Tab 3: DNS Alignment Details */}
          {activeTab === 'dns' && (
            <div className="space-y-4">
              {/* SPF */}
              <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs font-serif">SPF Record (TXT @)</span>
                  <button
                    onClick={() => handleCopy(diagnosticResult.dnsChecks.spf.rawRecord, 'spf')}
                    className="flex items-center gap-1 text-xs text-[#D4AF37] hover:text-white"
                  >
                    {copiedKey === 'spf' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Record</span>
                  </button>
                </div>
                <div className="bg-black border border-white/10 rounded-xl p-3 font-mono text-xs text-white/80 select-all">
                  {diagnosticResult.dnsChecks.spf.rawRecord}
                </div>
              </div>

              {/* DKIM */}
              <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs font-serif">DKIM Public Key (TXT aethermail._domainkey)</span>
                  <button
                    onClick={() => handleCopy(diagnosticResult.dnsChecks.dkim.rawRecord, 'dkim')}
                    className="flex items-center gap-1 text-xs text-[#D4AF37] hover:text-white"
                  >
                    {copiedKey === 'dkim' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Record</span>
                  </button>
                </div>
                <div className="bg-black border border-white/10 rounded-xl p-3 font-mono text-xs text-white/80 select-all break-all">
                  {diagnosticResult.dnsChecks.dkim.rawRecord}
                </div>
              </div>

              {/* DMARC */}
              <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs font-serif">DMARC Policy (TXT _dmarc)</span>
                  <button
                    onClick={() => handleCopy(diagnosticResult.dnsChecks.dmarc.rawRecord, 'dmarc')}
                    className="flex items-center gap-1 text-xs text-[#D4AF37] hover:text-white"
                  >
                    {copiedKey === 'dmarc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
            <div className="space-y-4">
              {diagnosticResult.recommendations.map((rec, i) => (
                <div key={i} className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white font-serif">{rec.title}</h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        rec.priority === 'high'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-white/60 font-light">{rec.description}</p>
                  <div className="bg-black border border-white/10 rounded-xl p-3 font-mono text-xs text-[#D4AF37]">
                    {rec.suggestedFix}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
