import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Segment, SegmentRule } from '../../types';
import { Layers, Plus, Trash2, CheckCircle2, Sparkles, Filter, Users, ArrowRight, X } from 'lucide-react';

export const SegmentsBuilder: React.FC = () => {
  const { segments, setSegments, contacts, addAuditLog, setActiveTab } = useApp();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [segName, setSegName] = useState('');
  const [segDesc, setSegDesc] = useState('');
  const [matchType, setMatchType] = useState<'all' | 'any'>('all');
  const [rules, setRules] = useState<SegmentRule[]>([
    { field: 'country', operator: 'equals', value: 'Kenya' },
    { field: 'status', operator: 'equals', value: 'active' },
  ]);

  const handleAddRule = () => {
    setRules([...rules, { field: 'engagementScore', operator: 'greater_than', value: '50' }]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleRuleChange = (index: number, key: keyof SegmentRule, val: string) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [key]: val };
    setRules(updated);
  };

  const calculateMatches = () => {
    return (contacts || []).filter((c) => {
      if (!c) return false;
      const results = (rules || []).map((r) => {
        const val = (r.value || '').toLowerCase();
        if (r.field === 'country') return (c.country || '').toLowerCase().includes(val);
        if (r.field === 'status') return c.status === r.value;
        if (r.field === 'engagementScore') return (c.engagementScore || 0) >= Number(r.value || 0);
        if (r.field === 'totalOpens') return (c.totalOpens || 0) >= Number(r.value || 0);
        if (r.field === 'totalClicks') return (c.totalClicks || 0) >= Number(r.value || 0);
        if (r.field === 'company') return (c.company || '').toLowerCase().includes(val);
        return true;
      });

      return matchType === 'all' ? results.every(Boolean) : results.some(Boolean);
    }).length;
  };

  const handleSaveSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!segName.trim()) return;

    const newSeg: Segment = {
      id: `seg_${Date.now()}`,
      name: segName.trim(),
      description: segDesc.trim() || 'Custom segmented cohort',
      rules,
      matchType,
      estimatedCount: calculateMatches() || 1,
      createdAt: new Date().toISOString(),
    };

    setSegments([newSeg, ...segments]);
    addAuditLog('SEGMENT_CREATED', 'Segment', newSeg.id, `Created dynamic segment "${newSeg.name}".`);
    setShowCreateModal(false);
    setSegName('');
    setSegDesc('');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Dynamic <span className="italic text-[#D4AF37]">Segments</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Build autonomous behavioral cohorts based on location, engagement scoring, campaign response, and tags.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition-all font-serif"
        >
          <Plus className="w-4 h-4" />
          <span>New Smart Segment</span>
        </button>
      </div>

      {/* Segments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(segments || []).map((seg) => (
          <div
            key={seg.id}
            className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-[#D4AF37]/30 transition-all space-y-5"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full tracking-wider">
                  Match {(seg.matchType || 'all').toUpperCase()}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  ~{(seg.estimatedCount || 0).toLocaleString()} Contacts
                </span>
              </div>

              <h2 className="text-base font-serif font-bold text-white mt-3 tracking-wide">{seg.name}</h2>
              <p className="text-xs text-white/50 mt-1 line-clamp-2 font-light">{seg.description}</p>
            </div>

            {/* Rules list */}
            <div className="bg-[#141414] border border-white/5 rounded-xl p-3.5 space-y-1.5 font-mono text-[11px]">
              <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Active Evaluation Criteria:</div>
              {(seg.rules || []).map((rule, idx) => (
                <div key={idx} className="text-white/70 flex items-center gap-1.5">
                  <span className="text-[#D4AF37]">{rule.field}</span>
                  <span className="text-white/40">{(rule.operator || '').replace('_', ' ')}</span>
                  <span className="text-emerald-400">"{rule.value}"</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[11px] text-white/40 font-mono">
                Created {new Date(seg.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => setActiveTab('campaigns')}
                className="text-[#D4AF37] hover:text-white font-semibold flex items-center gap-1 transition-colors"
              >
                Target in Campaign <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Segment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#050505] border border-white/15 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-white tracking-wide">Create Dynamic Segment</h2>
                <p className="text-xs text-white/50 font-light mt-0.5">Rules evaluate dynamically in real-time as contacts interact.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-xs px-2.5 py-1 rounded-full font-mono font-bold">
                  {calculateMatches()} Matches
                </span>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveSegment} className="space-y-4">
              <div>
                <label className="text-xs text-white/80 font-medium block mb-1.5">Segment Name *</label>
                <input
                  type="text"
                  required
                  value={segName}
                  onChange={(e) => setSegName(e.target.value)}
                  placeholder="e.g. High-Spenders in Kenya (Active)"
                  className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-white/80 font-medium block mb-1.5">Description</label>
                <input
                  type="text"
                  value={segDesc}
                  onChange={(e) => setSegDesc(e.target.value)}
                  placeholder="e.g. Contacts with engagement > 80% and opened last campaign"
                  className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-white/50">Contacts must match:</span>
                <button
                  type="button"
                  onClick={() => setMatchType('all')}
                  className={`px-3 py-1 text-xs rounded-xl font-mono font-bold transition-colors ${
                    matchType === 'all' ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20' : 'bg-[#0D0D0D] border border-white/10 text-white/50 hover:text-white'
                  }`}
                >
                  ALL Rules (AND)
                </button>
                <button
                  type="button"
                  onClick={() => setMatchType('any')}
                  className={`px-3 py-1 text-xs rounded-xl font-mono font-bold transition-colors ${
                    matchType === 'any' ? 'bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20' : 'bg-[#0D0D0D] border border-white/10 text-white/50 hover:text-white'
                  }`}
                >
                  ANY Rule (OR)
                </button>
              </div>

              {/* Rules rows */}
              <div className="space-y-2.5 bg-[#0D0D0D] p-4 rounded-xl border border-white/10">
                <label className="text-xs font-mono font-bold text-white/60 block mb-2 uppercase">
                  Criteria Condition Rules
                </label>

                {rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={rule.field}
                      onChange={(e) => handleRuleChange(idx, 'field', e.target.value as any)}
                      className="bg-[#050505] border border-white/15 text-xs text-white rounded-lg p-2 font-mono flex-1 focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="country" className="bg-[#050505] text-white">Country</option>
                      <option value="status" className="bg-[#050505] text-white">Status</option>
                      <option value="engagementScore" className="bg-[#050505] text-white">Engagement Score (%)</option>
                      <option value="totalOpens" className="bg-[#050505] text-white">Total Opens (Count)</option>
                      <option value="totalClicks" className="bg-[#050505] text-white">Total Clicks (Count)</option>
                      <option value="company" className="bg-[#050505] text-white">Company</option>
                    </select>

                    <select
                      value={rule.operator}
                      onChange={(e) => handleRuleChange(idx, 'operator', e.target.value as any)}
                      className="bg-[#050505] border border-white/15 text-xs text-white rounded-lg p-2 font-mono focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="equals" className="bg-[#050505] text-white">Equals</option>
                      <option value="not_equals" className="bg-[#050505] text-white">Not Equals</option>
                      <option value="greater_than" className="bg-[#050505] text-white">Greater than (&gt;=)</option>
                      <option value="less_than" className="bg-[#050505] text-white">Less than (&lt;=)</option>
                      <option value="contains" className="bg-[#050505] text-white">Contains text</option>
                    </select>

                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => handleRuleChange(idx, 'value', e.target.value)}
                      className="bg-[#050505] border border-white/15 text-xs text-white rounded-lg p-2 font-mono flex-1 focus:outline-none focus:border-[#D4AF37]"
                      placeholder="Value..."
                    />

                    {rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(idx)}
                        className="p-2 text-white/40 hover:text-rose-400 rounded-lg hover:bg-white/[0.05] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddRule}
                  className="mt-2 text-xs text-[#D4AF37] hover:text-white font-semibold flex items-center gap-1 font-mono transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Condition Rule
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white/80 rounded-xl text-xs font-medium transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/20"
                >
                  Save Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
