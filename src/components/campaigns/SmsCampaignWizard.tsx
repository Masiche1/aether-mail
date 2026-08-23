import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Send, Radio, Sparkles, X, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SmsCampaignWizardProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const SmsCampaignWizard: React.FC<SmsCampaignWizardProps> = ({ isOpen = true, onClose }) => {
  const { gateways, contactLists, createSmsCampaign } = useApp();

  const [name, setName] = useState('Urgent Transaction Notice');
  const [senderId, setSenderId] = useState('AETHERMAIL');
  const [gatewayId, setGatewayId] = useState(gateways?.[0]?.id || '');
  const [targetId, setTargetId] = useState(contactLists?.[0]?.id || '');
  const [messageText, setMessageText] = useState(
    'Hello {{first_name}}, your monthly account statement is available. Review secure report here: {{short_link}}'
  );
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('2026-08-21T10:00');

  if (!isOpen) return null;

  // GSM 03.38 calculation (160 chars per segment, 153 for multi-part)
  const charLength = messageText.length;
  const segmentCount = charLength <= 160 ? 1 : Math.ceil(charLength / 153);
  const remainingInSegment = segmentCount === 1 ? 160 - charLength : 153 * segmentCount - charLength;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    createSmsCampaign({
      name,
      senderId,
      gatewayId: gatewayId || gateways?.[0]?.id || 'gw_001',
      targetId: targetId || contactLists?.[0]?.id || 'list_004',
      targetName: (contactLists || []).find((l) => l.id === targetId)?.name || 'SMS List',
      messageText,
      segmentCount,
      scheduledAt: isScheduled ? new Date(scheduledAt).toISOString() : undefined,
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    if (onClose) onClose();
  };

  const isModal = Boolean(onClose);

  const content = (
    <div className={`bg-[#050505] border border-white/15 rounded-2xl w-full ${isModal ? 'max-w-xl shadow-2xl p-6' : 'max-w-3xl mx-auto p-6 md:p-8 shadow-xl'} space-y-5`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-white tracking-wide">
              Create SMS Broadcast <span className="italic text-[#D4AF37]">Campaign</span>
            </h2>
            <p className="text-xs text-white/50 font-light">Carrier SMPP direct dispatch with GSM-7 segmenting</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/80 font-medium block mb-1.5">Campaign Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/80 font-medium block mb-1.5">Alphanumeric Sender ID</label>
              <input
                type="text"
                maxLength={11}
                value={senderId}
                onChange={(e) => setSenderId(e.target.value.toUpperCase())}
                className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="AETHERMAIL"
              />
            </div>

            <div>
              <label className="text-xs text-white/80 font-medium block mb-1.5">Carrier SMPP Gateway</label>
              <select
                value={gatewayId}
                onChange={(e) => setGatewayId(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono transition-colors"
              >
                {(gateways || []).map((gw) => (
                  <option key={gw.id} value={gw.id} className="bg-[#0D0D0D] text-white">
                    {gw.name} ({(gw.creditsRemaining || 0).toLocaleString()} credits)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-white/80 font-medium block mb-1.5">Target Audience</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
            >
              {(contactLists || []).map((l) => (
                <option key={l.id} value={l.id} className="bg-[#0D0D0D] text-white">
                  {l.name} ({(l.contactCount || 0).toLocaleString()} members)
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-white/80 font-medium">SMS Message Body</label>
              <span className="text-[11px] font-mono text-[#D4AF37]">
                {charLength} chars • {segmentCount} SMS part(s) ({remainingInSegment} chars left)
              </span>
            </div>
            <textarea
              rows={4}
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37] resize-none transition-colors"
            />
          </div>

          {/* Merge Tags */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-white/40 text-[11px]">Insert Tag:</span>
            {['{{first_name}}', '{{company}}', '{{short_link}}'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setMessageText((prev) => prev + ' ' + tag)}
                className="px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-[#D4AF37] border border-white/10 rounded-lg text-[11px] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white/80 rounded-xl text-xs font-medium transition-colors border border-white/10"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 flex items-center gap-1.5 transition-all font-serif"
            >
              <Send className="w-4 h-4" /> Dispatch SMS Campaign
            </button>
          </div>
        </form>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
        {content}
      </div>
    );
  }

  return <div className="p-6 md:p-8 max-w-[1600px] mx-auto">{content}</div>;
};
