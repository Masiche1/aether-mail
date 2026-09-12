import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SendingDomain, DnsRecord } from '../../types';
import { DomainDiagnosticsModal } from './DomainDiagnosticsModal';
import {
  Globe,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Server,
  Lock,
  ArrowRight,
  Activity,
  X,
  Stethoscope,
} from 'lucide-react';

export const DomainsManager: React.FC = () => {
  const { domains, setDomains, verifyDomainDns, addAuditLog } = useApp();
  const [selectedDomain, setSelectedDomain] = useState<SendingDomain | null>(domains?.[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [diagnosticsTargetDomain, setDiagnosticsTargetDomain] = useState<string>('aethermail.net');
  const [newDomainName, setNewDomainName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleOpenDiagnostics = (domainName?: string) => {
    setDiagnosticsTargetDomain(domainName || selectedDomain?.domain || 'aethermail.net');
    setShowDiagnosticsModal(true);
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName.trim()) return;

    const domainClean = newDomainName.trim().toLowerCase().replace(/^https?:\/\//, '');

    const newDom: SendingDomain = {
      id: `dom_${Date.now()}`,
      organizationId: 'org_001',
      domain: domainClean,
      status: 'pending',
      dkimSelector: 'aethermail',
      dkimPublicKey:
        'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyP3L9tQ4bN1x9zR7v8W3kL0m2...',
      spfRecord: 'v=spf1 include:_spf.aethermail.net ~all',
      dmarcRecord: 'v=DMARC1; p=reject; rua=mailto:dmarc@' + domainClean,
      mxRecord: '10 mail.' + domainClean,
      customReturnPath: 'bounces.' + domainClean,
      isVerified: false,
      reputationScore: 92,
      dnsRecords: [
        {
          type: 'TXT',
          host: `aethermail._domainkey.${domainClean}`,
          value: 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyP3L9tQ4bN1x9zR7...',
          status: 'pending',
        },
        {
          type: 'TXT',
          host: domainClean,
          value: 'v=spf1 include:_spf.aethermail.net ~all',
          status: 'pending',
        },
        {
          type: 'TXT',
          host: `_dmarc.${domainClean}`,
          value: `v=DMARC1; p=reject; rua=mailto:dmarc@${domainClean}`,
          status: 'pending',
        },
        {
          type: 'CNAME',
          host: `bounces.${domainClean}`,
          value: 'mail.aethermail.net',
          status: 'pending',
        },
        {
          type: 'MX',
          host: domainClean,
          value: `10 mail.${domainClean}`,
          status: 'pending',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setDomains([newDom, ...(domains || [])]);
    setSelectedDomain(newDom);
    addAuditLog('DOMAIN_ADDED', 'SendingDomain', newDom.id, `Registered sending domain ${newDom.domain}`);
    setShowAddModal(false);
    setNewDomainName('');
  };

  const handleRunVerify = async () => {
    if (!selectedDomain) return;
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 1200));
    verifyDomainDns(selectedDomain.id);
    setIsVerifying(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Sending <span className="italic text-[#D4AF37]">Domains</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Configure DKIM 2048-bit cryptographic signatures, SPF policy, strict DMARC, custom Return-Path bounce handling, and rDNS validation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="open-diagnostics-suite-btn"
            onClick={() => handleOpenDiagnostics(selectedDomain?.domain)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#181818] hover:bg-[#222222] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-bold uppercase tracking-wider transition-all font-serif shadow-lg shadow-black/40"
          >
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>SMTP &amp; DNS Diagnostic Tool</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition-all font-serif"
          >
            <Plus className="w-4 h-4" />
            <span>Add Sending Domain</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Domain List */}
        <div className="lg:col-span-4 space-y-3">
          {(domains || []).map((dom) => (
            <div
              key={dom.id}
              onClick={() => setSelectedDomain(dom)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                selectedDomain?.id === dom.id
                  ? 'bg-[#0D0D0D] border-[#D4AF37] shadow-xl ring-1 ring-[#D4AF37]/30'
                  : 'bg-[#0D0D0D]/60 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white font-mono">{dom.domain}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                    dom.status === 'verified'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {dom.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-white/50 font-mono pt-1">
                <span>Reputation: <strong className="text-[#D4AF37]">{dom.reputationScore}%</strong></span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDiagnostics(dom.domain);
                  }}
                  className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  <span>Diagnose</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DNS Records Inspector */}
        <div className="lg:col-span-8 bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-base font-serif font-bold text-white font-mono tracking-wide">{selectedDomain?.domain}</h2>
              </div>
              <p className="text-xs text-white/50 mt-0.5 font-light">
                Add the following DNS records to your DNS provider (Cloudflare, Route53, Namecheap, GoDaddy).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenDiagnostics(selectedDomain?.domain)}
                className="px-3.5 py-2 bg-black hover:bg-white/10 text-white/80 border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Run Diagnostic Probe</span>
              </button>

              <button
                onClick={handleRunVerify}
                disabled={isVerifying}
                className="px-4 py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{isVerifying ? 'Querying Nameservers...' : 'Verify DNS Records'}</span>
              </button>
            </div>
          </div>

          {/* DNS Table */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">
              Required Zone DNS Records
            </h3>

            <div className="bg-black border border-white/10 rounded-xl overflow-hidden shadow-inner">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#141414] text-white/40 border-b border-white/10 text-[10px] uppercase">
                  <tr>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Host / Name</th>
                    <th className="p-3.5">Required Target Value</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/70">
                  {(selectedDomain?.dnsRecords || []).map((rec, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-bold text-[#D4AF37]">{rec.type}</td>
                      <td className="p-3.5 text-white truncate max-w-[140px]">{rec.host}</td>
                      <td className="p-3.5 text-white/50 truncate max-w-[220px]" title={rec.value}>
                        {rec.value}
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            rec.status === 'valid' || rec.status === 'pass'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {(rec.status || 'valid').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleCopy(rec.value, `${i}`)}
                          className="p-1.5 text-white/40 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                          title="Copy record value"
                        >
                          {copiedKey === `${i}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#050505] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-serif font-bold text-white tracking-wide">Register Sending Domain</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDomain} className="space-y-4">
              <div>
                <label className="text-xs text-white/80 font-medium block mb-1.5">Domain Name *</label>
                <input
                  type="text"
                  required
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  placeholder="e.g. notifications.acme-corp.com"
                  className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
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
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/20"
                >
                  Add Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diagnostics Modal */}
      <DomainDiagnosticsModal
        isOpen={showDiagnosticsModal}
        onClose={() => setShowDiagnosticsModal(false)}
        initialDomain={diagnosticsTargetDomain}
      />
    </div>
  );
};
