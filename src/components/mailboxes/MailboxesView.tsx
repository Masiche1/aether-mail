import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Inbox,
  Send,
  Trash2,
  Star,
  Mail,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Clock,
  HardDrive,
  Reply,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { EmailMessage, Mailbox } from '../../types';

export const MailboxesView: React.FC = () => {
  const {
    mailboxes,
    setMailboxes,
    messages,
    setMessages,
    domains,
    activeMailboxId,
    setActiveMailboxId,
    addAuditLog,
  } = useApp();

  const [activeFolder, setActiveFolder] = useState<'inbox' | 'replies' | 'sent' | 'starred' | 'trash'>('replies');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(messages[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showNewMailboxModal, setShowNewMailboxModal] = useState(false);

  // Compose State
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // New Mailbox State
  const [newEmailPrefix, setNewEmailPrefix] = useState('');
  const [newDomainId, setNewDomainId] = useState(domains[0]?.id || '');
  const [newDisplayName, setNewDisplayName] = useState('');

  const currentMailbox = (mailboxes || []).find((m) => m.id === activeMailboxId) || mailboxes[0];

  // Filter messages
  const filteredMessages = (messages || []).filter((msg) => {
    if (!msg) return false;
    if (activeFolder === 'starred') {
      if (!msg.isStarred) return false;
    } else if (msg.folder !== activeFolder) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = (msg.subject || '').toLowerCase().includes(q);
      const matchFrom = (msg.from || '').toLowerCase().includes(q);
      const matchSnippet = (msg.snippet || '').toLowerCase().includes(q);
      if (!matchSub && !matchFrom && !matchSnippet) return false;
    }
    return true;
  });

  const selectedMessage = (messages || []).find((m) => m.id === selectedMessageId) || filteredMessages[0];

  const handleToggleStar = (msgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isStarred: !m.isStarred } : m))
    );
  };

  const handleMarkAsRead = (msgId: string) => {
    setSelectedMessageId(msgId);
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isRead: true } : m))
    );
  };

  const handleDeleteMessage = (msgId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    if (selectedMessageId === msgId) {
      setSelectedMessageId(null);
    }
    addAuditLog('MESSAGE_DELETED', 'EmailMessage', msgId, 'Message moved to trash or deleted.');
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject) return;

    const newMsg: EmailMessage = {
      id: `msg_${Date.now()}`,
      mailboxId: currentMailbox?.id || 'mbx_001',
      from: `${currentMailbox?.displayName || 'AetherMail'} <${currentMailbox?.email || 'replies@aethermail.net'}>`,
      to: composeTo,
      subject: composeSubject,
      snippet: composeBody.slice(0, 80),
      bodyHtml: `<p>${composeBody.replace(/\n/g, '<br/>')}</p>`,
      bodyText: composeBody,
      folder: 'sent',
      isRead: true,
      isStarred: false,
      receivedAt: new Date().toISOString(),
      hasAttachments: false,
      headers: {
        'Message-ID': `<AM-${Date.now()}@${currentMailbox?.email?.split('@')[1] || 'aethermail.net'}>`,
        'DKIM-Signature': 'v=1; a=rsa-sha256; c=relaxed/relaxed; d=aethermail.net',
      },
    };

    setMessages((prev) => [newMsg, ...prev]);
    setShowComposeModal(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    addAuditLog('MESSAGE_SENT', 'EmailMessage', newMsg.id, `Outbound message sent to ${composeTo}`);
  };

  const handleCreateMailbox = (e: React.FormEvent) => {
    e.preventDefault();
    const selDomain = (domains || []).find((d) => d.id === newDomainId) || domains[0];
    const email = `${newEmailPrefix.trim().toLowerCase()}@${selDomain?.domain || 'aethermail.net'}`;

    const newMbx: Mailbox = {
      id: `mbx_${Date.now()}`,
      domainId: selDomain?.id || 'dom_001',
      email,
      displayName: newDisplayName || newEmailPrefix,
      status: 'active',
      quotaBytes: 21474836480, // 20GB
      usedBytes: 0,
      aliases: [],
      messageCount: 0,
      unreadCount: 0,
      autoResponderEnabled: false,
      lastLoginAt: new Date().toISOString(),
    };

    setMailboxes((prev) => [...prev, newMbx]);
    setActiveMailboxId(newMbx.id);
    setShowNewMailboxModal(false);
    setNewEmailPrefix('');
    setNewDisplayName('');
    addAuditLog('MAILBOX_CREATED', 'Mailbox', newMbx.id, `Created virtual IMAP/Dovecot mailbox ${email}`);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Inbox className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Private Mailboxes <span className="italic text-[#D4AF37]">&amp; Webmail</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Integrated Dovecot IMAP/LMTP private mailboxes for inbound campaign replies, lead responses, and bounce tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewMailboxModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-white/80 border border-white/10 text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Mailbox</span>
          </button>
          <button
            onClick={() => setShowComposeModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-white text-black font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/20"
          >
            <Send className="w-4 h-4" />
            <span>Compose</span>
          </button>
        </div>
      </div>

      {/* Mailbox Selector & Quota Pill */}
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono uppercase text-white/40 mr-1">Active Mailbox:</span>
          {(mailboxes || []).map((mbx) => (
            <button
              key={mbx.id}
              onClick={() => setActiveMailboxId(mbx.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                activeMailboxId === mbx.id
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 shadow-sm'
                  : 'bg-white/[0.03] text-white/60 border border-white/5 hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{mbx.email}</span>
              {mbx.unreadCount > 0 && (
                <span className="bg-[#D4AF37] text-black text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {mbx.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {currentMailbox && (
          <div className="flex items-center gap-4 text-xs font-mono text-white/60">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-white/80">Dovecot IMAP: Active</span>
            </div>
            <div className="text-white/40">
              Storage: {(currentMailbox.usedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB / {(currentMailbox.quotaBytes / (1024 * 1024 * 1024)).toFixed(0)} GB
            </div>
          </div>
        )}
      </div>

      {/* Main Mail Client Interface: Sidebar + List + Reader */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[550px]">
        {/* Folders Column */}
        <div className="lg:col-span-2 bg-[#0D0D0D] border border-white/10 rounded-2xl p-3 flex flex-row lg:flex-col gap-1 shadow-xl overflow-x-auto">
          {[
            { id: 'replies', label: 'Campaign Replies', icon: Reply, count: (messages || []).filter((m) => m.folder === 'replies' && !m.isRead).length },
            { id: 'inbox', label: 'Daemon / Inbox', icon: Inbox, count: (messages || []).filter((m) => m.folder === 'inbox' && !m.isRead).length },
            { id: 'starred', label: 'Starred', icon: Star, count: (messages || []).filter((m) => m.isStarred).length },
            { id: 'sent', label: 'Sent Messages', icon: Send, count: (messages || []).filter((m) => m.folder === 'sent').length },
            { id: 'trash', label: 'Trash', icon: Trash2, count: (messages || []).filter((m) => m.folder === 'trash').length },
          ].map((f) => {
            const Icon = f.icon;
            const isActive = activeFolder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFolder(f.id as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-white/40'}`} />
                  <span className="whitespace-nowrap">{f.label}</span>
                </div>
                {f.count > 0 && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/80">
                    {f.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Message List Column */}
        <div className="lg:col-span-4 bg-[#0D0D0D] border border-white/10 rounded-2xl flex flex-col shadow-xl overflow-hidden">
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search messages, headers, senders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar max-h-[550px]">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-xs">
                No messages found in this folder.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleMarkAsRead(msg.id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#D4AF37]/10 border-l-2 border-[#D4AF37]'
                        : 'hover:bg-white/[0.02]'
                    } ${!msg.isRead ? 'bg-white/[0.02] font-semibold' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 truncate">
                        {!msg.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0" />
                        )}
                        <span className="text-xs text-white truncate">{msg.from}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => handleToggleStar(msg.id, e)}
                          className="text-white/30 hover:text-[#D4AF37] transition-colors"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              msg.isStarred ? 'fill-[#D4AF37] text-[#D4AF37]' : ''
                            }`}
                          />
                        </button>
                        <span className="text-[10px] font-mono text-white/40">
                          {new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-white/90 truncate mb-1">{msg.subject}</div>
                    <div className="text-[11px] text-white/40 line-clamp-1 font-light">{msg.snippet}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Reader Column */}
        <div className="lg:col-span-6 bg-[#0D0D0D] border border-white/10 rounded-2xl flex flex-col shadow-xl overflow-hidden">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
              {/* Message Header */}
              <div className="p-5 border-b border-white/10 bg-black/40 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-base font-serif font-bold text-white tracking-wide">
                    {selectedMessage.subject}
                  </h2>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleStar(selectedMessage.id, {} as any)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-[#D4AF37] hover:bg-white/5 transition-colors"
                      title="Star message"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          selectedMessage.isStarred ? 'fill-[#D4AF37] text-[#D4AF37]' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-white/40 font-mono">From: </span>
                    <span className="text-white font-medium">{selectedMessage.from}</span>
                  </div>
                  <div className="text-white/40 font-mono text-[11px]">
                    {new Date(selectedMessage.receivedAt).toLocaleString()}
                  </div>
                </div>

                <div>
                  <span className="text-white/40 font-mono text-xs">To: </span>
                  <span className="text-white/80 font-mono text-xs">{selectedMessage.to}</span>
                </div>

                {/* Cryptographic Security Badges */}
                {selectedMessage.headers && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                    {selectedMessage.headers.SPF && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        SPF PASS
                      </span>
                    )}
                    {selectedMessage.headers.DKIM && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[10px] font-mono text-[#D4AF37]">
                        <CheckCircle2 className="w-3 h-3" />
                        DKIM VERIFIED
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-white/40">
                      TLSv1.3 Encrypted Handshake
                    </span>
                  </div>
                )}
              </div>

              {/* Message Body Content */}
              <div className="p-6 flex-1 text-xs text-white/80 leading-relaxed font-light space-y-4">
                {selectedMessage.bodyHtml ? (
                  <div
                    className="prose prose-invert max-w-none text-xs"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-xs">{selectedMessage.bodyText}</pre>
                )}
              </div>

              {/* Reply Quick Action Bar */}
              <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
                <button
                  onClick={() => {
                    setComposeTo(selectedMessage.from);
                    setComposeSubject(`Re: ${selectedMessage.subject.replace(/^Re:\s*/i, '')}`);
                    setShowComposeModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-semibold transition-all border border-white/10"
                >
                  <Reply className="w-4 h-4 text-[#D4AF37]" />
                  <span>Reply to Sender</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white/30 space-y-2">
              <Mail className="w-8 h-8 text-white/20" />
              <p className="text-xs">Select a message from the list to preview its contents and headers.</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Email Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/15 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-serif font-bold text-sm text-white">New Outbound Message</h3>
              </div>
              <button
                onClick={() => setShowComposeModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-white/50 mb-1 font-mono uppercase text-[10px]">From Mailbox</label>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono">
                  {currentMailbox?.email || 'announcements@aethermail.net'}
                </div>
              </div>

              <div>
                <label className="block text-white/50 mb-1 font-mono uppercase text-[10px]">To Recipient</label>
                <input
                  type="email"
                  required
                  placeholder="recipient@domain.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1 font-mono uppercase text-[10px]">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Subject line..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1 font-mono uppercase text-[10px]">Message Body</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Type your message here..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 rounded-xl text-white/60 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black font-serif font-bold uppercase tracking-wider transition-all shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Mailbox Modal */}
      {showNewMailboxModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-serif font-bold text-sm text-white">Create Virtual IMAP Mailbox</h3>
              </div>
              <button
                onClick={() => setShowNewMailboxModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMailbox} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-white/50 mb-1 font-mono uppercase text-[10px]">Email Username</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="support, ceo, hello"
                    value={newEmailPrefix}
                    onChange={(e) => setNewEmailPrefix(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <span className="text-white/40 font-mono">@</span>
                  <select
                    value={newDomainId}
                    onChange={(e) => setNewDomainId(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {(domains || []).map((dom) => (
                      <option key={dom.id} value={dom.id}>
                        {dom.domain}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/50 mb-1 font-mono uppercase text-[10px]">Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Concierge Desk"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewMailboxModal(false)}
                  className="px-4 py-2 rounded-xl text-white/60 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black font-serif font-bold uppercase tracking-wider transition-all shadow-lg"
                >
                  Provision Mailbox
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
