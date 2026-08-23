import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Activity,
  Calendar,
  FileText,
  Sparkles,
} from 'lucide-react';
import { AuditLog } from '../../types';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const filteredLogs = (auditLogs || []).filter((log) => {
    if (!log) return false;
    if (entityFilter !== 'all' && log.entityType !== entityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (log.action || '').toLowerCase().includes(q) ||
        (log.userName || '').toLowerCase().includes(q) ||
        (log.details || '').toLowerCase().includes(q) ||
        (log.ipAddress || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCsv = () => {
    const headers = ['ID,Timestamp,User,Action,EntityType,EntityID,IPAddress,Details'];
    const rows = filteredLogs.map((l) =>
      `"${l.id}","${l.timestamp}","${l.userName}","${l.action}","${l.entityType}","${l.entityId}","${l.ipAddress}","${l.details.replace(/"/g, '""')}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aethermail_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Security &amp; Audit <span className="italic text-[#D4AF37]">Logs</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Immutable system event trail, administrative actions, MTA daemon triggers, and security compliance telemetry.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/10 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#D4AF37]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search action, IP, user, details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto overflow-x-auto w-full sm:w-auto">
          {['all', 'SendingDomain', 'EmailCampaign', 'Contact', 'MTA_Engine', 'ShortLink'].map((ent) => (
            <button
              key={ent}
              onClick={() => setEntityFilter(ent)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium uppercase font-mono transition-all whitespace-nowrap ${
                entityFilter === ent
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 font-bold'
                  : 'bg-white/[0.03] text-white/50 border border-white/5 hover:text-white'
              }`}
            >
              {ent}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-xl overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141414] text-white/40 border-b border-white/10 uppercase text-[10px]">
              <tr>
                <th className="p-4">Timestamp &amp; User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Origin IP</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/40 font-sans">
                    No audit log records match your filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="text-white font-medium">{new Date(log.timestamp).toLocaleString()}</div>
                      <div className="text-[11px] text-[#D4AF37] mt-0.5">{log.userName}</div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-white font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="text-white/60">{log.entityType}</span>
                    </td>

                    <td className="p-4 text-white/40 font-mono">{log.ipAddress}</td>

                    <td className="p-4 font-sans text-xs text-white/80 max-w-md">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
