import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderOpen,
  Upload,
  Image as ImageIcon,
  FileText,
  Copy,
  Check,
  Trash2,
  Search,
  ExternalLink,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';
import { MediaAsset } from '../../types';

export const MediaLibraryView: React.FC = () => {
  const { mediaAssets, setMediaAssets, addAuditLog } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'logo' | 'document'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload Form State
  const [assetName, setAssetName] = useState('');
  const [assetUrl, setAssetUrl] = useState('');
  const [assetType, setAssetType] = useState<'image' | 'logo' | 'document'>('image');

  const filteredAssets = (mediaAssets || []).filter((item) => {
    if (!item) return false;
    if (typeFilter !== 'all' && item.fileType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (item.name || '').toLowerCase().includes(q) || (item.url || '').toLowerCase().includes(q);
    }
    return true;
  });

  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteAsset = (id: string) => {
    setMediaAssets((prev) => prev.filter((a) => a.id !== id));
    addAuditLog('MEDIA_DELETED', 'MediaAsset', id, 'Deleted asset from library');
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName || !assetUrl) return;

    const newAsset: MediaAsset = {
      id: `med_${Date.now()}`,
      name: assetName.trim(),
      url: assetUrl.trim(),
      fileType: assetType,
      sizeBytes: Math.floor(Math.random() * 800000) + 150000,
      uploadedAt: new Date().toISOString(),
    };

    setMediaAssets((prev) => [newAsset, ...prev]);
    setShowUploadModal(false);
    setAssetName('');
    setAssetUrl('');
    addAuditLog('MEDIA_UPLOADED', 'MediaAsset', newAsset.id, `Uploaded asset ${newAsset.name}`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <FolderOpen className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Media &amp; Asset <span className="italic text-[#D4AF37]">Library</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            High-speed CDN hosting for newsletter imagery, brand logos, and downloadable campaign attachments.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-white text-black font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/20 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search asset filename or CDN URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto overflow-x-auto w-full sm:w-auto">
          {(['all', 'image', 'logo', 'document'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium uppercase font-mono transition-all ${
                typeFilter === t
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 font-bold'
                  : 'bg-white/[0.03] text-white/50 border border-white/5 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full py-16 text-center text-white/40 text-xs">
            No media assets found. Upload images or documents to use them across your templates.
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-[#0D0D0D] border border-white/10 rounded-2xl overflow-hidden shadow-xl group hover:border-[#D4AF37]/40 transition-all flex flex-col"
            >
              {/* Asset Preview Thumbnail */}
              <div className="h-44 bg-black/60 relative overflow-hidden flex items-center justify-center p-3">
                {asset.fileType === 'document' ? (
                  <div className="flex flex-col items-center gap-2 text-white/40">
                    <FileText className="w-12 h-12 text-[#D4AF37]" />
                    <span className="text-[10px] font-mono uppercase">PDF / Document</span>
                  </div>
                ) : (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                  />
                )}

                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyUrl(asset)}
                    className="p-1.5 rounded-lg bg-black/80 backdrop-blur-sm text-white hover:text-[#D4AF37] transition-colors border border-white/10"
                    title="Copy CDN URL"
                  >
                    {copiedId === asset.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="p-1.5 rounded-lg bg-black/80 backdrop-blur-sm text-white hover:text-rose-400 transition-colors border border-white/10"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Asset Information Footer */}
              <div className="p-4 border-t border-white/10 space-y-2 bg-[#121212]/50 mt-auto">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-white truncate">{asset.name}</div>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
                    {asset.fileType}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>{formatFileSize(asset.sizeBytes)}</span>
                  <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Asset Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0D] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-serif font-bold text-sm text-white">Add Asset to Media Library</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-white/50 mb-1 font-mono uppercase text-[10px]">Asset Name / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Header-Banner-Dark.jpg"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1 font-mono uppercase text-[10px]">Media Type</label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="image">Marketing Image</option>
                  <option value="logo">Corporate Logo</option>
                  <option value="document">PDF / Document</option>
                </select>
              </div>

              <div>
                <label className="block text-white/50 mb-1 font-mono uppercase text-[10px]">Hosted CDN or Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/... or https://cdn.yoursite.com/img.png"
                  value={assetUrl}
                  onChange={(e) => setAssetUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-white/60 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black font-serif font-bold uppercase tracking-wider transition-all shadow-lg"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
