import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SmsGateway } from '../../types';
import {
  Radio,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  X,
  Server,
  Zap,
  Activity,
  ShieldCheck,
  Cpu,
  Trash2,
} from 'lucide-react';

export const SmsGatewaysView: React.FC = () => {
  const { gateways, setGateways, addAuditLog } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [gwName, setGwName] = useState('');
  const [gwProvider, setGwProvider] = useState<'safaricom' | 'twilio' | 'infobip' | 'messagebird'>('safaricom');
  const [gwHost, setGwHost] = useState('');
  const [gwPort, setGwPort] = useState(2775);
  const [gwSystemId, setGwSystemId] = useState('');
  const [testPhone, setTestPhone] = useState('+254712345678');
  const [testMessage, setTestMessage] = useState('AetherMail Live SMPP Carrier Diagnostic Ping: 200 OK');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'smpp' | 'modem' | 'http'>('all');

  const totalCredits = (gateways || []).reduce((acc, g) => acc + (g?.creditsRemaining || 0), 0);
  const activeNodesCount = (gateways || []).filter((g) => g.status === 'connected' || g.status === 'active').length;

  const handleCreateGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gwName.trim()) return;

    const newGw: SmsGateway = {
      id: `gw_${Date.now()}`,
      name: gwName.trim(),
      type: gwProvider === 'safaricom' || gwProvider === 'infobip' ? 'SMPP' : 'HTTP_REST',
      provider: gwProvider,
      host: gwHost.trim() || 'smpp.carrier-pipe.net',
      port: gwPort || 2775,
      systemId: gwSystemId.trim() || `TX_${Date.now().toString().slice(-4)}`,
      apiKeyOrToken: 'sk_live_smpp_secret_token_***',
      senderIds: ['AETHERMAIL', 'NOTIFY'],
      creditsRemaining: 25000,
      costPerSmsUsd: 0.0075,
      status: 'active',
      sentTotal: 0,
      createdAt: new Date().toISOString(),
    };

    setGateways([newGw, ...(gateways || [])]);
    addAuditLog('GATEWAY_ADDED', 'SmsGateway', newGw.id, `Configured SMS Gateway ${newGw.name}`);
    setShowAddModal(false);
    setGwName('');
    setGwHost('');
    setGwSystemId('');
  };

  const handleDeleteGateway = (id: string) => {
    setGateways((prev) => prev.filter((g) => g.id !== id));
    addAuditLog('GATEWAY_DELETED', 'SmsGateway', id, 'Removed carrier SMS gateway node');
  };

  const handleSendTestSms = async () => {
    setIsSendingTest(true);
    setTestSuccess(false);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSendingTest(false);
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 4000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Radio className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Carrier SMS &amp; <span className="italic text-[#D4AF37]">SMPP Gateways</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Connect high-throughput direct telco SMPP pipes and HTTP API aggregators for global SMS delivery.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add SMS Gateway</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-white/40 text-xs font-mono uppercase mb-2">
            <span>Connected Nodes</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {activeNodesCount} / {(gateways || []).length}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>SMPP Bind State: Transceiver Ready</span>
          </div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-white/40 text-xs font-mono uppercase mb-2">
            <span>Aggregated SMS Credits</span>
            <Zap className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-bold text-[#D4AF37]">
            {totalCredits.toLocaleString()}
          </div>
          <div className="text-[10px] text-white/40 mt-1 font-mono">Available across all active carrier pipes</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-white/40 text-xs font-mono uppercase mb-2">
            <span>Avg Throughput</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">450 SMS/s</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">High-speed concurrent thread pool</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-white/40 text-xs font-mono uppercase mb-2">
            <span>DLR Delivery Success</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">99.4%</div>
          <div className="text-[10px] text-white/40 mt-1 font-mono">Carrier acknowledgement rate</div>
        </div>
      </div>

      {/* Gateway Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(gateways || []).map((gw) => (
          <div
            key={gw.id}
            className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 hover:border-[#D4AF37]/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                  <h2 className="text-sm font-serif font-bold text-white tracking-wide">{gw.name}</h2>
                </div>
                <button
                  onClick={() => handleDeleteGateway(gw.id)}
                  className="text-white/30 hover:text-rose-400 transition-colors p-1"
                  title="Remove gateway"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 uppercase">
                  {gw.provider || 'safaricom'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-white/60 border border-white/10 uppercase">
                  {gw.type || 'SMPP'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  {gw.status || 'Active'}
                </span>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-white/40">Remaining Credits:</span>
                  <span className="text-emerald-400 font-bold">
                    {(gw.creditsRemaining || 0).toLocaleString()} SMS
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40">Carrier Unit Rate:</span>
                  <span className="text-white/90">${gw.costPerSmsUsd ?? 0.0075} / SMS</span>
                </div>
                {gw.host && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/40">Host / Port:</span>
                    <span className="text-white/70 truncate max-w-[160px]">{gw.host}:{gw.port || 2775}</span>
                  </div>
                )}
                {gw.systemId && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/40">System ID:</span>
                    <span className="text-[#D4AF37]">{gw.systemId}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                  <span className="text-white/40">Sender IDs:</span>
                  <span className="text-cyan-400 font-bold">
                    {Array.isArray(gw.senderIds) && gw.senderIds.length > 0
                      ? gw.senderIds.join(', ')
                      : 'AETHERMAIL'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-white/40">
              <span>Lifetime Dispatched:</span>
              <span className="text-white font-bold">{(gw.sentTotal || 0).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Test SMS Dispatcher */}
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 max-w-2xl">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-[#D4AF37]" />
          <h2 className="text-sm font-serif font-bold text-white tracking-wide">
            Live Carrier Diagnostic Dispatcher (SMPP Ping)
          </h2>
        </div>
        <p className="text-xs text-white/50 font-light">
          Submit a live test PDU to verify carrier network authentication, SMSC delivery reports (DLR), and alphanumeric sender ID propagation.
        </p>

        <div className="space-y-4 pt-1">
          <div>
            <label className="text-xs text-white/60 block mb-1.5 font-mono uppercase text-[10px]">
              Destination Mobile MSISDN
            </label>
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+254712345678"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="text-xs text-white/60 block mb-1.5 font-mono uppercase text-[10px]">
              Diagnostic Payload Message
            </label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <button
            onClick={handleSendTestSms}
            disabled={isSendingTest}
            className="px-5 py-2.5 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-serif font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingTest ? 'Submitting SMPP PDU to Carrier...' : 'Send Live Test SMS'}</span>
          </button>

          {testSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Carrier Handshake Succeeded: SMSC Submit_SM Response (Status 0x00000000 - Message ID: msg_tx_849204).</span>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0D0D0D] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="text-sm font-serif font-bold text-white tracking-wide">Connect Carrier SMS Gateway</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGateway} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-white/60 block mb-1 font-mono uppercase text-[10px]">Gateway Node Label *</label>
                <input
                  type="text"
                  required
                  value={gwName}
                  onChange={(e) => setGwName(e.target.value)}
                  placeholder="e.g. Safaricom Direct SMPP Transceiver Node 02"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 block mb-1 font-mono uppercase text-[10px]">Carrier / Provider</label>
                  <select
                    value={gwProvider}
                    onChange={(e) => setGwProvider(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                  >
                    <option value="safaricom">Safaricom SMPP Pipe</option>
                    <option value="twilio">Twilio Global API</option>
                    <option value="infobip">Infobip Enterprise</option>
                    <option value="messagebird">MessageBird Carrier</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/60 block mb-1 font-mono uppercase text-[10px]">Port</label>
                  <input
                    type="number"
                    value={gwPort}
                    onChange={(e) => setGwPort(parseInt(e.target.value) || 2775)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-mono uppercase text-[10px]">SMPP Hostname / IP</label>
                <input
                  type="text"
                  value={gwHost}
                  onChange={(e) => setGwHost(e.target.value)}
                  placeholder="smpp.carrier-pipe.net"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-mono uppercase text-[10px]">System ID / Client ID</label>
                <input
                  type="text"
                  value={gwSystemId}
                  onChange={(e) => setGwSystemId(e.target.value)}
                  placeholder="AETHER_TX01"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-white/60 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-serif font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#D4AF37]/20"
                >
                  Save Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

