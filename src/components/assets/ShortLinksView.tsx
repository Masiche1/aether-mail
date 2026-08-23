import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Link2,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Search,
  MousePointerClick,
  Globe,
  Trash2,
  BarChart2,
  QrCode,
  Sparkles,
  X,
} from 'lucide-react';
import { ShortLink } from '../../types';

export const ShortLinksView: React.FC = () => {
  const { shortLinks, setShortLinks, addAuditLog } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<ShortLink | null>(shortLinks[0] || null);

  // Form State
  const [destinationUrl, setDestinationUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [domain, setDomain] = useState('go.aethermail.net');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmSource, setUtmSource] = useState('email_campaign');

  const filteredLinks = (shortLinks || []).filter((l) => {
    if (!l) return false;
    const q = (searchQuery || '').toLowerCase();
    return (
      (l.shortCode || '').toLowerCase().includes(q) ||
      (l.destinationUrl || '').toLowerCase().includes(q) ||
      (l.domain || '').toLowerCase().includes(q)
    );
  });

  const handleCopy = (link: ShortLink) => {
    const fullUrl = `https://${link.domain}/${link.shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationUrl) return;

    let finalUrl = destinationUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    if (utmCampaign || utmSource) {
      const urlObj = new URL(finalUrl);
      if (utmSource) urlObj.searchParams.set('utm_source', utmSource);
      if (utmCampaign) urlObj.searchParams.set('utm_campaign', utmCampaign);
      urlObj.searchParams.set('utm_medium', 'aethermail_mta');
      finalUrl = urlObj.toString();
    }

    const slug = customSlug.trim() || Math.random().toString(36).substring(2, 8);

    const newLink: ShortLink = {
      id: `lnk_${Date.now()}`,
      shortCode: slug,
      destinationUrl: finalUrl,
      domain,
      totalClicks: 0,
      uniqueClicks: 0,
      createdAt: new Date().toISOString(),
      recentClicks: [],
    };

    setShortLinks((prev) => [newLink, ...prev]);
    setSelectedLink(newLink);
    setShowCreateModal(false);
    setDestinationUrl('');
    setCustomSlug('');
    setUtmCampaign('');
    addAuditLog('SHORTLINK_CREATED', 'ShortLink', newLink.id, `Created branded shortlink ${domain}/${slug}`);
  };

  const handleDeleteLink = (id: string) => {
    setShortLinks((prev) => prev.filter((l) => l.id !== id));
    if (selectedLink?.id === id) {
      setSelectedLink(null);
    }
    addAuditLog('SHORTLINK_DELETED', 'ShortLink', id, 'Deleted shortlink');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Link2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Branded Short Links <span className="italic text-[#D4AF37]">&amp; Click Tracking</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Custom branded domain redirection, real-time click telemetry, device fingerprinting, and UTM injection.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-white text-black font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Short Link</span>
        </button>
      </div>

      {/* Main Grid: Links Table + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Links List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search short codes, destination URLs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#141414] text-white/40 border-b border-white/10 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Short URL &amp; Slug</th>
                    <th className="p-4">Target Destination</th>
                    <th className="p-4">Total / Unique Clicks</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/70">
                  {filteredLinks.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-white/40 font-sans">
                        No short links created yet.
                      </td>
                    </tr>
                  ) : (
                    filteredLinks.map((link) => {
                      const isSelected = selectedLink?.id === link.id;
                      return (
                        <tr
                          key={link.id}
                          onClick={() => setSelectedLink(link)}
                          className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#D4AF37]/10' : ''
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[#D4AF37] font-bold">
                                {link.domain}/{link.shortCode}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(link);
                                }}
                                className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                title="Copy Short URL"
                              >
                                {copiedId === link.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <div className="text-[10px] text-white/40 mt-0.5">
                              Created {new Date(link.createdAt).toLocaleDateString()}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="text-white/80 truncate max-w-xs font-sans text-xs">
                              {link.destinationUrl}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <MousePointerClick className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span className="text-white font-bold">{link.totalClicks.toLocaleString()}</span>
                              <span className="text-white/40 text-[10px]">({link.uniqueClicks} unique)</span>
                            </div>
                          </td>

                          <td className="p-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLink(link.id);
                              }}
                              className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Link Inspector / Telemetry */}
        <div className="lg:col-span-4 bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          {selectedLink ? (
            <>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">Link Details</span>
                <h3 className="font-serif font-bold text-lg text-white mt-1">
                  {selectedLink.domain}/{selectedLink.shortCode}
                </h3>
                <p className="text-xs text-white/60 break-all font-mono mt-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
                  {selectedLink.destinationUrl}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center">
                  <div className="text-white/40 text-[10px] font-mono uppercase">Total Clicks</div>
                  <div className="text-xl font-bold text-[#D4AF37] mt-1">{selectedLink.totalClicks}</div>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center">
                  <div className="text-white/40 text-[10px] font-mono uppercase">Unique Visitors</div>
                  <div className="text-xl font-bold text-white mt-1">{selectedLink.uniqueClicks}</div>
                </div>
              </div>

              {/* Recent Click Log */}
              <div>
                <div className="text-xs font-mono uppercase text-white/40 mb-2">Recent Click Telemetry</div>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {(selectedLink.recentClicks || []).length === 0 ? (
                    <div className="text-white/30 text-xs py-4 text-center">No click telemetry recorded yet.</div>
                  ) : (
                    (selectedLink.recentClicks || []).map((click, idx) => (
                      <div
                        key={idx}
                        className="bg-black/30 border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-mono"
                      >
                        <div>
                          <div className="text-white font-medium">{click.country} • {click.browser}</div>
                          <div className="text-white/40 text-[9px]">{click.ip}</div>
                        </div>
                        <div className="text-white/40 text-[10px]">
                          {new Date(click.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleCopy(selectedLink)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white transition-all"
                >
                  <Copy className="w-4 h-4 text-[#D4AF37]" />
                  <span>Copy Shortlink URL</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-white/30 space-y-2">
              <Link2 className="w-8 h-8 text-white/20 mx-auto" />
              <p className="text-xs">Select a shortlink to view its click analytics and telemetry.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-serif font-bold text-sm text-white">Create Branded Short Link</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLink} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-white/50 mb-1 font-mono uppercase text-[10px]">Target Destination URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://yourcompany.com/landing-page"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/50 mb-1 font-mono uppercase text-[10px]">Short Domain</label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="go.aethermail.net">go.aethermail.net</option>
                    <option value="link.safari-connect.io">link.safari-connect.io</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/50 mb-1 font-mono uppercase text-[10px]">Custom Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. vip-discount"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/50 mb-1 font-mono uppercase text-[10px]">UTM Campaign Tag</label>
                <input
                  type="text"
                  placeholder="e.g. black_friday_2026"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-white/60 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black font-serif font-bold uppercase tracking-wider transition-all shadow-lg"
                >
                  Generate Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
