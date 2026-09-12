import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ContactList } from '../../types';
import { ListFilter, Plus, Users, CheckCircle2, AlertTriangle, ArrowRight, Tag, X } from 'lucide-react';

export const ListsManager: React.FC = () => {
  const { contactLists, setContactLists, addAuditLog, setActiveTab } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [listName, setListName] = useState('');
  const [listDesc, setListDesc] = useState('');
  const [listTags, setListTags] = useState('B2B, Target');

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;

    const newList: ContactList = {
      id: `list_${Date.now()}`,
      name: listName.trim(),
      description: listDesc.trim() || 'Audience contact list',
      contactCount: 0,
      activeCount: 0,
      bouncedCount: 0,
      tags: listTags.split(',').map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    setContactLists([...contactLists, newList]);
    addAuditLog('LIST_CREATED', 'ContactList', newList.id, `Created contact list "${newList.name}".`);
    setShowModal(false);
    setListName('');
    setListDesc('');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <ListFilter className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Contact <span className="italic text-[#D4AF37]">Lists</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Organize contacts by business vertical, subscription channel, conference, or lifecycle stage.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition-all font-serif"
        >
          <Plus className="w-4 h-4" />
          <span>New Contact List</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {(contactLists || []).map((list) => (
          <div
            key={list.id}
            className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-[#D4AF37]/30 transition-all space-y-5"
          >
            <div>
              <div className="flex items-center justify-between text-white/40 text-xs font-mono">
                <span className="text-[#D4AF37] font-bold">{list.id}</span>
                <span>{new Date(list.createdAt).toLocaleDateString()}</span>
              </div>

              <h2 className="text-base font-serif font-bold text-white mt-2 tracking-wide">{list.name}</h2>
              <p className="text-xs text-white/50 mt-1 line-clamp-2 font-light">{list.description}</p>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-xl p-3.5 grid grid-cols-2 gap-2 text-center font-mono">
              <div>
                <div className="text-lg font-bold text-white">{(list.contactCount || 0).toLocaleString()}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Total Contacts</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-400">
                  {list.contactCount > 0 ? (((list.activeCount || 0) / list.contactCount) * 100).toFixed(0) : 100}%
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">Active Health</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {(list.tags || []).map((t) => (
                  <span key={t} className="bg-white/[0.05] border border-white/10 text-white/70 px-2 py-0.5 rounded text-[10px] font-sans">
                    {t}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setActiveTab('contacts')}
                className="w-full py-2.5 bg-white/[0.05] hover:bg-white/[0.1] text-white/80 border border-white/10 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> View Members
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create List Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#050505] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-serif font-bold text-white tracking-wide">Create Contact List</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="text-xs text-white/80 font-medium block mb-1.5">List Name *</label>
                <input
                  type="text"
                  required
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="e.g. Q3 VIP Summit Attendees"
                  className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-white/80 font-medium block mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={listDesc}
                  onChange={(e) => setListDesc(e.target.value)}
                  placeholder="Audience description and purpose..."
                  className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] resize-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-white/80 font-medium block mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  value={listTags}
                  onChange={(e) => setListTags(e.target.value)}
                  placeholder="e.g. VIP, EastAfrica, Banking"
                  className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white/80 rounded-xl text-xs font-medium transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/20"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
