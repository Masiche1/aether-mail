import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Layers,
  FileSpreadsheet,
  Mail,
  Calendar,
  CheckSquare,
  Users,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const WorkspaceIntegrationView: React.FC = () => {
  const [syncState, setSyncState] = useState<{ [key: string]: boolean }>({});
  const [syncResults, setSyncResults] = useState<{ [key: string]: any }>({});
  const [spreadsheetId, setSpreadsheetId] = useState('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');

  const handleSync = async (service: 'sheets' | 'gmail' | 'calendar' | 'tasks' | 'contacts') => {
    setSyncState((prev) => ({ ...prev, [service]: true }));
    try {
      const res = await api.syncWorkspace(service, { spreadsheetId });
      setSyncResults((prev) => ({ ...prev, [service]: res }));
    } catch (e: any) {
      console.error(e);
    } finally {
      setSyncState((prev) => ({ ...prev, [service]: false }));
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-[#D4AF37]" />
            <h1 className="text-2xl font-serif text-white tracking-wide">
              Google Workspace <span className="italic text-[#D4AF37]">Integrations</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1.5 font-light">
            Real-time synchronization with Google Sheets, Gmail inbound reply processing, Google Calendar campaign scheduling, Google Tasks, and Google Contacts (People API).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/[0.02] border border-white/10 px-4 py-2 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-mono text-white/70">OAuth Scopes Configured</span>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Google Sheets */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                LIVE SYNC
              </span>
            </div>

            <div>
              <h2 className="text-base font-serif text-white">Google Sheets Importer</h2>
              <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
                Import lead lists, dynamic subscriber tables, and unsubscribe opt-outs directly from Google Drive spreadsheets.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-white/40">Spreadsheet ID / URL</label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                className="w-full bg-black border border-white/15 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {syncResults.sheets && (
              <div className="p-3 bg-white/[0.02] border border-[#D4AF37]/30 rounded-xl text-xs text-[#D4AF37] space-y-1 font-mono">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced {syncResults.sheets.importedContactsCount} Contacts
                </div>
                <div className="text-[10px] text-white/60">{syncResults.sheets.spreadsheetTitle}</div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleSync('sheets')}
            disabled={syncState.sheets}
            className="w-full py-2.5 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/20 uppercase tracking-wider"
          >
            {syncState.sheets ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Sync Google Sheet</span>
          </button>
        </div>

        {/* 2. Gmail Inbound Processing */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                GMAIL API
              </span>
            </div>

            <div>
              <h2 className="text-base font-serif text-white">Gmail Inbound & Reply Tracker</h2>
              <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
                Listens for recipient responses, parses automated out-of-office autoreplies, and registers one-click unsubscribe headers.
              </p>
            </div>

            <div className="p-3 bg-black rounded-xl border border-white/10 text-xs text-white/50 space-y-1 font-light">
              <div>• Auto-categorize positive sales leads</div>
              <div>• Parse 550 Mailbox Not Found NDRs</div>
              <div>• DMARC RUA Aggregate Report parsing</div>
            </div>

            {syncResults.gmail && (
              <div className="p-3 bg-white/[0.02] border border-[#D4AF37]/30 rounded-xl text-xs text-[#D4AF37] font-mono space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced {syncResults.gmail.inboxUnreadReplies} Inbound Replies
                </div>
                <div className="text-[10px] text-white/60">{syncResults.gmail.bouncesProcessed} NDR bounces updated.</div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleSync('gmail')}
            disabled={syncState.gmail}
            className="w-full py-2.5 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/20 uppercase tracking-wider"
          >
            {syncState.gmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Sync Gmail Mailbox</span>
          </button>
        </div>

        {/* 3. Google Calendar */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                CALENDAR SYNC
              </span>
            </div>

            <div>
              <h2 className="text-base font-serif text-white">Google Calendar Dispatch Scheduler</h2>
              <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
                Visualizes scheduled marketing campaign broadcasts and automated IP warm-up ramp transitions on your primary calendar.
              </p>
            </div>

            <div className="p-3 bg-black rounded-xl border border-white/10 text-xs text-white/50 space-y-1 font-light">
              <div>• Schedule campaign triggers via calendar events</div>
              <div>• IP warm-up stage milestones marked</div>
              <div>• Timezone-localized delivery windows</div>
            </div>

            {syncResults.calendar && (
              <div className="p-3 bg-white/[0.02] border border-[#D4AF37]/30 rounded-xl text-xs text-[#D4AF37] font-mono">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced {syncResults.calendar.scheduledCampaignsFound} Scheduled Events
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleSync('calendar')}
            disabled={syncState.calendar}
            className="w-full py-2.5 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/20 uppercase tracking-wider"
          >
            {syncState.calendar ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Sync Google Calendar</span>
          </button>
        </div>

        {/* 4. Google Tasks */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                TASKS API
              </span>
            </div>

            <div>
              <h2 className="text-base font-serif text-white">Google Tasks Deliverability To-Dos</h2>
              <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
                Generates autonomous reminders for DNS TTL expirations, PTR verification, and weekly spam threshold reviews.
              </p>
            </div>

            <div className="p-3 bg-black rounded-xl border border-white/10 text-xs text-white/50 space-y-1 font-light">
              <div>• Review IP warm-up stage 3 progress</div>
              <div>• Audit DMARC quarantine reports</div>
              <div>• Check Safaricom SMPP credit balance</div>
            </div>

            {syncResults.tasks && (
              <div className="p-3 bg-white/[0.02] border border-[#D4AF37]/30 rounded-xl text-xs text-[#D4AF37] font-mono">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced {syncResults.tasks.tasksCompleted} Deliverability Tasks
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleSync('tasks')}
            disabled={syncState.tasks}
            className="w-full py-2.5 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/20 uppercase tracking-wider"
          >
            {syncState.tasks ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Sync Google Tasks</span>
          </button>
        </div>

        {/* 5. Google Contacts (People API) */}
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                PEOPLE API
              </span>
            </div>

            <div>
              <h2 className="text-base font-serif text-white">Google Contacts (People API)</h2>
              <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
                Synchronizes company directories, VIP customer labels, phone numbers for SMS dispatches, and contact tags.
              </p>
            </div>

            <div className="p-3 bg-black rounded-xl border border-white/10 text-xs text-white/50 space-y-1 font-light">
              <div>• Sync corporate directory contacts</div>
              <div>• Import international E.164 phone numbers</div>
              <div>• Segment by Google Contact groups</div>
            </div>

            {syncResults.contacts && (
              <div className="p-3 bg-white/[0.02] border border-[#D4AF37]/30 rounded-xl text-xs text-[#D4AF37] font-mono">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced {syncResults.contacts.peopleContactsCount} People Contacts
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleSync('contacts')}
            disabled={syncState.contacts}
            className="w-full py-2.5 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/20 uppercase tracking-wider"
          >
            {syncState.contacts ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Sync Google Contacts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
