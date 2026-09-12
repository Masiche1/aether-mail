import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CampaignBlock, EmailCampaign } from '../../types';
import { VisualTemplateEditor } from './VisualTemplateEditor';
import { api, SpamAuditResponse } from '../../services/api';
import {
  Mail,
  Sparkles,
  ShieldCheck,
  Send,
  Calendar,
  Layers,
  ListFilter,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  ArrowLeft,
  Clock,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EmailCampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailCampaignWizard: React.FC<EmailCampaignWizardProps> = ({ isOpen, onClose }) => {
  const {
    senders,
    domains,
    contactLists,
    segments,
    templates,
    createCampaign,
    hourlySpeed,
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states
  const [name, setName] = useState('Q3 Enterprise Delivery Update');
  const [subject, setSubject] = useState('Important: Upgraded MTA & Dedicated Infrastructure Announcement');
  const [preheader, setPreheader] = useState('Review your new dedicated rDNS and DKIM cluster features.');
  const [selectedSenderId, setSelectedSenderId] = useState(senders?.[0]?.id || '');
  const [selectedDomainId, setSelectedDomainId] = useState(domains?.[0]?.id || '');
  const [targetType, setTargetType] = useState<'list' | 'segment'>('list');
  const [targetId, setTargetId] = useState(contactLists?.[0]?.id || '');
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDate, setScheduledDate] = useState('2026-08-21T09:00');

  // Blocks & editor
  const [blocks, setBlocks] = useState<CampaignBlock[]>(templates?.[0]?.blocks || []);
  const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual');
  const [rawHtml, setRawHtml] = useState('');

  // AI Assistance states
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [spamAudit, setSpamAudit] = useState<SpamAuditResponse | null>(null);
  const [isAuditingSpam, setIsAuditingSpam] = useState(false);

  if (!isOpen) return null;

  const activeSender = (senders || []).find((s) => s.id === selectedSenderId) || senders?.[0] || {
    id: 'snd_default',
    displayName: 'AetherMail Announcements',
    email: 'announcements@aethermail.net',
  };
  const activeDomain = (domains || []).find((d) => d.id === selectedDomainId) || domains?.[0] || {
    id: 'dom_default',
    domain: 'aethermail.net',
    status: 'verified',
    reputationScore: 99,
  };

  const handleAiOptimizeSubject = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await api.generateAiCopy({
        topic: name,
        audience: targetType === 'list' ? 'Enterprise subscribers' : 'VIP High engagement leads',
        tone: 'Professional, trustworthy, high deliverability',
      });
      if (res?.subjects && res.subjects.length > 0) {
        setAiSuggestions(res.subjects);
        setSubject(res.subjects[0]);
        if (res.preheader) setPreheader(res.preheader);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleRunSpamAudit = async () => {
    setIsAuditingSpam(true);
    try {
      const sampleText = (blocks || []).map((b) => b?.content?.text || b?.content?.title || '').join(' ');
      const res = await api.auditSpamRisk({
        subject,
        bodyHtml: sampleText,
        senderEmail: activeSender?.email,
      });
      setSpamAudit(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditingSpam(false);
    }
  };

  const handleSubmitCampaign = () => {
    const targetName =
      targetType === 'list'
        ? contactLists.find((l) => l.id === targetId)?.name || 'Audience List'
        : segments.find((s) => s.id === targetId)?.name || 'Smart Segment';

    const targetRecipients =
      targetType === 'list'
        ? contactLists.find((l) => l.id === targetId)?.contactCount || 500
        : segments.find((s) => s.id === targetId)?.estimatedCount || 500;

    createCampaign({
      name,
      subject,
      preheader,
      senderName: activeSender?.displayName || 'AetherMail Announcements',
      senderEmail: activeSender?.email || 'announcements@aethermail.net',
      domainId: activeDomain?.id || 'dom_001',
      targetType,
      targetId,
      targetName,
      blocks,
      rawHtml: editorMode === 'html' ? rawHtml : undefined,
      scheduledAt: scheduleType === 'scheduled' ? new Date(scheduledDate).toISOString() : undefined,
      stats: {
        totalRecipients: targetRecipients,
        queued: targetRecipients,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        complaints: 0,
        unsubscribed: 0,
        replies: 0,
      },
      sendingSpeedPerHour: hourlySpeed,
    });

    confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#050505] border border-white/15 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Wizard Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30 tracking-wider">
                STEP {step} OF 4
              </span>
              <h2 className="text-base font-serif font-bold text-white tracking-wide">Create Autonomous Email Campaign</h2>
            </div>
            <p className="text-xs text-white/50 mt-1 font-light">
              Multi-channel MTA delivery with DKIM signing, bounce protection, and deliverability audit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 h-1 bg-white/5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-full transition-colors duration-300 ${
                s <= step ? 'bg-gradient-to-r from-[#D4AF37] to-[#8C6B2D]' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Wizard Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-black/30">
          {/* STEP 1: Campaign Metadata & Sender */}
          {step === 1 && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div>
                <label className="text-xs text-white/80 font-medium block mb-1.5">Campaign Internal Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q3 Enterprise Delivery Update"
                  className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              {/* Subject Line with AI optimization */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-white/80 font-medium">Email Subject Line *</label>
                  <button
                    type="button"
                    onClick={handleAiOptimizeSubject}
                    disabled={isGeneratingAi}
                    className="text-xs text-[#D4AF37] hover:text-white font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {isGeneratingAi ? 'Analyzing...' : 'AI Subject Optimizer'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white font-medium placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />

                {Array.isArray(aiSuggestions) && aiSuggestions.length > 0 && (
                  <div className="mt-2.5 p-3 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-serif italic text-[#D4AF37]">AI Suggested Variations:</span>
                    {aiSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSubject(s)}
                        className="w-full text-left text-xs text-white/80 hover:text-[#D4AF37] hover:bg-white/[0.04] p-1.5 rounded-lg block truncate transition-colors font-sans"
                      >
                        • {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-white/80 font-medium block mb-1.5">Preheader / Snippet</label>
                <input
                  type="text"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder="Preview text shown in recipient inbox..."
                  className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs text-white/80 font-medium block mb-1.5">Sender Identity</label>
                  <select
                    value={selectedSenderId}
                    onChange={(e) => setSelectedSenderId(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                  >
                    {(senders || []).map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#0D0D0D] text-white">
                        {s.displayName} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-white/80 font-medium block mb-1.5">Sending Domain</label>
                  <select
                    value={selectedDomainId}
                    onChange={(e) => setSelectedDomainId(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37] transition-colors"
                  >
                    {(domains || []).map((d) => (
                      <option key={d.id} value={d.id} className="bg-[#0D0D0D] text-white font-mono">
                        {d.domain} ({(d.status || 'verified').toUpperCase()} • Score {d.reputationScore || 100}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Audience Target Selection */}
          {step === 2 && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div>
                <h3 className="text-sm font-serif font-semibold text-white">Select Recipient Target Audience</h3>
                <p className="text-xs text-white/50 font-light mt-0.5">
                  Target a static contact list or dynamically computed smart segment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    setTargetType('list');
                    setTargetId(contactLists[0]?.id || '');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    targetType === 'list'
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/10'
                      : 'bg-[#0D0D0D] border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  <ListFilter className={`w-5 h-5 mb-2.5 ${targetType === 'list' ? 'text-[#D4AF37]' : 'text-white/40'}`} />
                  <div className="text-sm font-serif font-semibold text-white">Contact List</div>
                  <div className="text-xs text-white/50 mt-0.5 font-light">Target curated audience list</div>
                </div>

                <div
                  onClick={() => {
                    setTargetType('segment');
                    setTargetId(segments[0]?.id || '');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    targetType === 'segment'
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/10'
                      : 'bg-[#0D0D0D] border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  <Layers className={`w-5 h-5 mb-2.5 ${targetType === 'segment' ? 'text-[#D4AF37]' : 'text-white/40'}`} />
                  <div className="text-sm font-serif font-semibold text-white">Dynamic Smart Segment</div>
                  <div className="text-xs text-white/50 mt-0.5 font-light">Target based on real-time behavior</div>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/80 font-medium block mb-1.5">
                  Select {targetType === 'list' ? 'Contact List' : 'Smart Segment'}
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-medium"
                >
                  {targetType === 'list'
                    ? (contactLists || []).map((l) => (
                        <option key={l.id} value={l.id} className="bg-[#0D0D0D] text-white">
                          {l.name} ({(l.contactCount || 0).toLocaleString()} contacts)
                        </option>
                      ))
                    : (segments || []).map((s) => (
                        <option key={s.id} value={s.id} className="bg-[#0D0D0D] text-white">
                          {s.name} (~{(s.estimatedCount || 0).toLocaleString()} matching contacts)
                        </option>
                      ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Visual Template Composer */}
          {step === 3 && (
            <div className="space-y-4">
              <VisualTemplateEditor
                blocks={blocks}
                onChangeBlocks={setBlocks}
                rawHtml={rawHtml}
                onChangeHtml={setRawHtml}
                editorMode={editorMode}
                onChangeEditorMode={setEditorMode}
              />
            </div>
          )}

          {/* STEP 4: Review, Spam Risk Audit & Dispatch */}
          {step === 4 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-[#0D0D0D] border border-white/10 rounded-xl p-5 space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/40 font-sans">Campaign:</span>
                  <span className="text-white font-bold">{name}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/40 font-sans">Subject:</span>
                  <span className="text-[#D4AF37]">{subject}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/40 font-sans">Sender & Domain:</span>
                  <span className="text-white">
                    {activeSender?.displayName} &lt;{activeSender?.email}&gt;
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 font-sans">Target Audience:</span>
                  <span className="text-emerald-400 font-bold">
                    {targetType === 'list'
                      ? (contactLists || []).find((l) => l.id === targetId)?.name || 'All Contacts'
                      : (segments || []).find((s) => s.id === targetId)?.name || 'Audience Segment'}
                  </span>
                </div>
              </div>

              {/* Spam Risk Audit Tool */}
              <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      Pre-Send SpamAssassin & Deliverability Audit
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunSpamAudit}
                    disabled={isAuditingSpam}
                    className="text-xs text-[#D4AF37] hover:text-white font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {isAuditingSpam ? 'Running AI Scan...' : 'Run Spam Check'}
                  </button>
                </div>

                {spamAudit && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0D0D0D] border border-white/10 font-mono">
                      <div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">Estimated Deliverability Score</div>
                        <div className="text-xl font-bold text-emerald-400 mt-0.5">{spamAudit.overallScore} / 100</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                        {spamAudit.verdict}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {(spamAudit.findings || []).map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-white/70">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <span>
                            <strong className="text-white">{f.category}:</strong> {f.note}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Scheduling Options */}
              <div className="space-y-3">
                <label className="text-xs text-white/80 font-medium block">Delivery Schedule</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setScheduleType('immediate')}
                    className={`p-3.5 rounded-xl border text-left font-semibold text-xs transition-all ${
                      scheduleType === 'immediate'
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/10'
                        : 'bg-[#0D0D0D] border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-[#D4AF37] mb-1.5" />
                    Send Immediately via Autonomous Queue
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleType('scheduled')}
                    className={`p-3.5 rounded-xl border text-left font-semibold text-xs transition-all ${
                      scheduleType === 'scheduled'
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/10'
                        : 'bg-[#0D0D0D] border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-[#D4AF37] mb-1.5" />
                    Schedule for Future Timezone
                  </button>
                </div>

                {scheduleType === 'scheduled' && (
                  <div className="pt-2">
                    <input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white/80 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-5 py-2 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-[#D4AF37]/20"
            >
              Continue to Step {step + 1} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitCampaign}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
              <span>
                {scheduleType === 'immediate' ? 'Dispatch to Autonomous Spool' : 'Schedule Campaign'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
