import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contact } from '../../types';
import {
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  Trash2,
  ShieldAlert,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  Tag,
  Eye,
  X,
} from 'lucide-react';

interface ContactsViewProps {
  onOpenImport: () => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ onOpenImport }) => {
  const { contacts, setContacts, contactLists, suppressContact, addAuditLog } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedList, setSelectedList] = useState<string>('all');
  const [showNewContactModal, setShowNewContactModal] = useState(false);

  // New Contact form
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCountry, setNewCountry] = useState('Kenya');

  const filteredContacts = (contacts || []).filter((c) => {
    if (!c) return false;
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (c.email || '').toLowerCase().includes(q) ||
      (c.firstName || '').toLowerCase().includes(q) ||
      (c.lastName || '').toLowerCase().includes(q) ||
      (c.company ? c.company.toLowerCase().includes(q) : false);

    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesList = selectedList === 'all' || (Array.isArray(c.lists) && c.lists.includes(selectedList));

    return matchesSearch && matchesStatus && matchesList;
  });

  const handleAddSingleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const newC: Contact = {
      id: `cnt_${Date.now()}`,
      organizationId: 'org_001',
      email: newEmail.trim(),
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      company: newCompany.trim(),
      phone: newPhone.trim(),
      country: newCountry.trim(),
      status: 'active',
      lists: selectedList !== 'all' ? [selectedList] : [contactLists?.[0]?.id || 'list_001'],
      tags: ['Direct-Entry'],
      engagementScore: 80,
      totalSent: 0,
      totalOpens: 0,
      totalClicks: 0,
      createdAt: new Date().toISOString(),
    };

    setContacts((prev) => [newC, ...prev]);
    addAuditLog('CONTACT_CREATED', 'Contact', newC.id, `Manually created contact ${newC.email}`);
    setShowNewContactModal(false);
    setNewEmail('');
    setNewFirstName('');
    setNewLastName('');
    setNewCompany('');
    setNewPhone('');
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Email,First Name,Last Name,Company,Phone,Country,Status,Engagement'].join(',') +
      '\n' +
      filteredContacts
        .map((c) =>
          [
            c.email,
            c.firstName,
            c.lastName,
            `"${c.company || ''}"`,
            c.phone || '',
            c.country || '',
            c.status,
            c.engagementScore,
          ].join(',')
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aethermail_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Contact <span className="italic text-[#D4AF37]">Directory</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Total {contacts.length.toLocaleString()} authenticated records with engagement scoring and suppression status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/80 text-xs font-semibold border border-white/10 transition-colors"
          >
            <Download className="w-4 h-4 text-white/50" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-[#D4AF37]" />
            <span>Import Wizard</span>
          </button>

          <button
            onClick={() => setShowNewContactModal(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition-all font-serif"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by email, name, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-black border border-white/15 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all" className="bg-black text-white">All Statuses</option>
              <option value="active" className="bg-black text-white">Active</option>
              <option value="unsubscribed" className="bg-black text-white">Unsubscribed</option>
              <option value="bounced" className="bg-black text-white">Bounced</option>
              <option value="suppressed" className="bg-black text-white">Suppressed</option>
            </select>
          </div>

          {/* List filter */}
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <span>List:</span>
            <select
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              className="bg-black border border-white/15 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all" className="bg-black text-white">All Lists</option>
              {(contactLists || []).map((l) => (
                <option key={l.id} value={l.id} className="bg-black text-white">
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/80 text-white/40 border-b border-white/10 font-mono text-[10px] uppercase">
              <tr>
                <th className="p-4 font-bold">Contact Profile</th>
                <th className="p-4 font-bold">Company / Country</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Engagement</th>
                <th className="p-4 font-bold">Activity (Sent / Opens / Clicks)</th>
                <th className="p-4 font-bold">Tags</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70 font-mono">
              {(filteredContacts || []).map((contact) => (
                <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white font-sans text-xs">
                      {contact.firstName || contact.lastName ? `${contact.firstName} ${contact.lastName}` : 'Anonymous Contact'}
                    </div>
                    <div className="text-[#D4AF37] text-xs flex items-center gap-1 mt-0.5 font-mono">
                      <Mail className="w-3 h-3 text-white/40" />
                      {contact.email}
                    </div>
                    {contact.phone && (
                      <div className="text-white/40 text-[11px] flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-white/30" />
                        {contact.phone}
                      </div>
                    )}
                  </td>

                  <td className="p-4 font-sans">
                    <div className="text-white font-medium text-xs flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-white/40" />
                      {contact.company || 'Direct Consumer'}
                    </div>
                    <div className="text-white/40 text-xs">{contact.city ? `${contact.city}, ` : ''}{contact.country}</div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        contact.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : contact.status === 'bounced'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : contact.status === 'unsubscribed'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-white/10 text-white/50 border border-white/10'
                      }`}
                    >
                      {contact.status ? contact.status.toUpperCase() : 'ACTIVE'}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-black h-2 rounded-full overflow-hidden border border-white/10">
                        <div
                          className={`h-full ${
                            contact.engagementScore > 75
                              ? 'bg-[#D4AF37]'
                              : contact.engagementScore > 40
                              ? 'bg-emerald-400'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${contact.engagementScore}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-xs text-white">{contact.engagementScore}%</span>
                    </div>
                  </td>

                  <td className="p-4 text-white/50 text-xs">
                    <span className="text-white/80">{contact.totalSent}</span> sent •{' '}
                    <span className="text-[#D4AF37] font-bold">{contact.totalOpens}</span> opens •{' '}
                    <span className="text-amber-400 font-bold">{contact.totalClicks}</span> clicks
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(contact.tags || []).map((t) => (
                        <span key={t} className="bg-white/[0.05] border border-white/10 text-white/70 px-2 py-0.5 rounded text-[10px] font-sans">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    {contact.status !== 'suppressed' ? (
                      <button
                        onClick={() => suppressContact(contact.id, 'Manual administrator suppression')}
                        title="Suppress this contact globally"
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                      >
                        Suppress
                      </button>
                    ) : (
                      <span className="text-[11px] text-white/30">Suppressed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Single Contact Modal */}
      {showNewContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-[#050505] border border-white/15 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base font-serif font-bold text-white tracking-wide">Add Contact Profile</h2>
              <button
                onClick={() => setShowNewContactModal(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSingleContact} className="space-y-4">
              <div>
                <label className="text-xs text-white/80 font-medium block mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  placeholder="name@company.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/80 font-medium block mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/80 font-medium block mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/80 font-medium block mb-1.5">Company</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/80 font-medium block mb-1.5">Phone (E.164)</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+2547..."
                    className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/80 font-medium block mb-1.5">Country</label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewContactModal(false)}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white/80 rounded-xl text-xs font-medium transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/20"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
