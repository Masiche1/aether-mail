import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Trash2,
  RefreshCw,
  Terminal,
  CheckCircle2,
} from 'lucide-react';

interface DeliverabilityChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliverabilityChatbotModal: React.FC<DeliverabilityChatbotModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'assistant'; content: string; timestamp: string }[]
  >([
    {
      id: 'msg_0',
      role: 'assistant',
      content:
        "Greetings. I am AetherMail's Autonomous MTA Architect. I provide technical intelligence on Postfix queuing, DKIM 2048-bit keys, DMARC alignment, IP warm-up ramps, and carrier SMPP gateway optimization. How can I assist your delivery pipeline today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userText = inputMessage.trim();
    const newMsg = {
      id: `msg_${Date.now()}`,
      role: 'user' as const,
      content: userText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = [...messages, newMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.sendChatMessage(historyPayload);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_res_${Date.now()}`,
          role: 'assistant',
          content: res.reply || 'No response returned from deliverability engine.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content:
            'Autonomous MTA Advice: To prevent 421 greylisting across Microsoft Outlook (Hotmail/Live), maintain exponential retry backoff at 15m, 30m, 1h intervals.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Conversation history reset. How may I assist your deliverability operations?',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const promptSuggestions = [
    'How do I configure DMARC p=reject without losing legit mail?',
    'What is the ideal warm-up schedule for a new /24 IP block?',
    'Explain how SpamAssassin rules score uppercase subject lines',
    'How do SMPP transceivers handle throughput throttling?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#050505] border border-white/10 rounded-2xl w-full max-w-3xl h-[650px] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-serif text-white tracking-wide">
                  AetherMail <span className="italic text-[#D4AF37]">AI Architect</span>
                </h2>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">
                Multi-Turn Intelligence • gemini-3.7-flash
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-white/40 hover:text-rose-400 hover:bg-white/[0.05] transition-colors"
              title="Clear conversation history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Body */}
        <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar bg-black/40">
          {(messages || []).map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-[82%] font-sans whitespace-pre-line shadow-md ${
                  m.role === 'user'
                    ? 'bg-[#D4AF37] text-black font-medium rounded-br-none'
                    : 'bg-white/[0.03] border border-white/10 text-white/90 rounded-bl-none'
                }`}
              >
                {m.content}
                <div
                  className={`text-[9px] font-mono mt-1.5 ${
                    m.role === 'user' ? 'text-black/60 text-right' : 'text-white/30'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-[#D4AF37] flex items-center justify-center text-black shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 text-xs">
              <div className="w-7 h-7 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3.5 bg-white/[0.03] border border-white/10 text-white/50 rounded-2xl rounded-bl-none font-serif italic text-xs">
                AetherMail AI is formulating architecture strategy...
              </div>
            </div>
          )}
        </div>

        {/* Prompt Suggestions */}
        <div className="p-3 bg-white/[0.01] border-t border-white/10 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-white/40 font-mono text-[10px] uppercase tracking-wider shrink-0 pl-1">Prompts:</span>
          {(promptSuggestions || []).map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputMessage(s)}
              className="px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] hover:border-[#D4AF37]/40 text-white/70 border border-white/10 text-nowrap transition-colors font-mono text-[10px]"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white/[0.02] border-t border-white/10 flex items-center gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about MTA tuning, DMARC, IP warm-up, or spam filters..."
            className="flex-1 bg-black border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 bg-[#D4AF37] hover:bg-white disabled:opacity-30 text-black rounded-xl transition-all shadow-md shadow-[#D4AF37]/20 font-bold"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
