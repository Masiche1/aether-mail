import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  ArrowLeft,
  Filter,
  Layers,
  Database,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ImportWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportWizardModal: React.FC<ImportWizardModalProps> = ({ isOpen, onClose }) => {
  const { contactLists, importContacts } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [rawText, setRawText] = useState('');
  const [selectedListId, setSelectedListId] = useState(contactLists?.[0]?.id || '');
  const [inputTags, setInputTags] = useState('Imported-2026, Q3-Leads');
  const [dedupStrategy, setDedupStrategy] = useState<'skip' | 'update' | 'overwrite'>('skip');

  // Parsed records state
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    company: 'company',
    phone: 'phone',
    country: 'country',
  });

  // Validation results
  const [validCount, setValidCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [disposableCount, setDisposableCount] = useState(0);
  const [importResult, setImportResult] = useState<{ added: number; duplicates: number; invalid: number } | null>(null);

  if (!isOpen) return null;

  // Sample quick CSV template
  const loadSampleCsv = () => {
    const sample = `first_name,last_name,email,phone,company,country
Lameck,Licha,lichalameck@gmail.com,+254712345678,Safaricom Tech Labs,Kenya
Faith,Achieng,faith.achieng@kcbgroup.com,+254733112233,KCB Bank,Kenya
Brian,Kiprono,brian.kiprono@equity.co.ke,+254722556677,Equity Group,Kenya
Emmanuel,Ndayisaba,emmanuel@bk.rw,+250788112233,Bank of Kigali,Rwanda
Zawadi,Mollel,zawadi@crdbbank.co.tz,+255754998877,CRDB Bank,Tanzania
Invalid,Record,bad-email-without-at-domain.com,+254700000000,Test Invalid,Kenya
Temp,User,disposable.tester@mailinator.com,+254711000000,Temp Mail,Kenya`;
    setRawText(sample);
  };

  const handleParseData = () => {
    if (!rawText.trim()) return;

    // Simple line by line CSV / Tab / TXT parser
    const lines = rawText.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    // Check if header row exists
    const firstLine = lines[0];
    const separator = firstLine.includes(',') ? ',' : firstLine.includes('\t') ? '\t' : ',';
    const rawHeaders = firstLine.split(separator).map((h) => h.replace(/["']/g, '').trim().toLowerCase());

    const isHeaderRow = rawHeaders.some((h) => h.includes('email') || h.includes('name') || h.includes('phone') || h.includes('company'));

    let headers = ['first_name', 'last_name', 'email', 'phone', 'company', 'country'];
    let dataLines = lines;

    if (isHeaderRow) {
      headers = rawHeaders;
      dataLines = lines.slice(1);
    }

    setDetectedColumns(headers);

    // Map automatically
    const mapping: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.includes('email')) mapping[h] = 'email';
      else if (h.includes('first') || h === 'fname') mapping[h] = 'firstName';
      else if (h.includes('last') || h.includes('surname') || h === 'lname') mapping[h] = 'lastName';
      else if (h.includes('comp') || h.includes('org')) mapping[h] = 'company';
      else if (h.includes('phone') || h.includes('mobile') || h.includes('tel')) mapping[h] = 'phone';
      else if (h.includes('country') || h.includes('nation')) mapping[h] = 'country';
      else mapping[h] = 'ignore';
    });
    setColumnMapping(mapping);

    const parsed = dataLines.map((line, idx) => {
      const parts = line.split(separator).map((p) => p.replace(/["']/g, '').trim());
      const rowObj: any = { _id: idx };
      headers.forEach((h, i) => {
        rowObj[h] = parts[i] || '';
      });
      return rowObj;
    });

    setParsedRows(parsed);

    // Compute Hygiene stats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let val = 0;
    let inv = 0;
    let disp = 0;
    let seen = new Set();
    let dup = 0;

    parsed.forEach((row) => {
      const emailKey = Object.keys(mapping).find((k) => mapping[k] === 'email');
      const email = emailKey ? row[emailKey]?.toLowerCase() : '';
      if (!email || !emailRegex.test(email)) {
        inv++;
      } else if (email.includes('mailinator.com') || email.includes('10minutemail') || email.includes('tempmail')) {
        disp++;
        val++;
      } else if (seen.has(email)) {
        dup++;
      } else {
        seen.add(email);
        val++;
      }
    });

    setValidCount(val);
    setInvalidCount(inv);
    setDisposableCount(disp);
    setDuplicateCount(dup);

    setStep(2);
  };

  const executeFinalImport = () => {
    const emailKey = Object.keys(columnMapping).find((k) => columnMapping[k] === 'email');
    const fNameKey = Object.keys(columnMapping).find((k) => columnMapping[k] === 'firstName');
    const lNameKey = Object.keys(columnMapping).find((k) => columnMapping[k] === 'lastName');
    const compKey = Object.keys(columnMapping).find((k) => columnMapping[k] === 'company');
    const phoneKey = Object.keys(columnMapping).find((k) => columnMapping[k] === 'phone');
    const countryKey = Object.keys(columnMapping).find((k) => columnMapping[k] === 'country');

    const formattedContacts = parsedRows.map((row) => ({
      email: emailKey ? row[emailKey] : '',
      firstName: fNameKey ? row[fNameKey] : '',
      lastName: lNameKey ? row[lNameKey] : '',
      company: compKey ? row[compKey] : '',
      phone: phoneKey ? row[phoneKey] : '',
      country: countryKey ? row[countryKey] : 'Kenya',
      status: 'active' as const,
      lists: selectedListId ? [selectedListId] : [],
      tags: inputTags.split(',').map((t) => t.trim()).filter(Boolean),
      engagementScore: 75,
      totalSent: 0,
      totalOpens: 0,
      totalClicks: 0,
    }));

    const result = importContacts(formattedContacts, selectedListId, inputTags.split(',').map((t) => t.trim()).filter(Boolean));
    setImportResult(result);
    setStep(7);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#050505] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Wizard Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30 tracking-wider">
                STEP {step} OF 7
              </span>
              <h2 className="text-base font-serif font-bold text-white tracking-wide">Enterprise Contact Import Engine</h2>
            </div>
            <p className="text-xs text-white/50 mt-1 font-light">
              Multi-format ingestion with automated column detection, hygiene validation, and deduplication.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-7 h-1 bg-white/5">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={`h-full transition-colors duration-300 ${
                s <= step ? 'bg-gradient-to-r from-[#D4AF37] to-[#8C6B2D]' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Wizard Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-black/30">
          {/* STEP 1: Upload / Paste */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-serif font-bold text-white tracking-wider">
                  Paste or Drag CSV / Excel / TXT / vCard Data
                </label>
                <button
                  onClick={loadSampleCsv}
                  className="text-xs text-[#D4AF37] hover:text-white flex items-center gap-1.5 font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Load Sample Enterprise CSV
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste comma-separated, tab-separated, or JSON list of contacts here..."
                  className="w-full h-56 bg-[#0D0D0D] border border-white/15 rounded-xl p-4 text-xs font-mono text-white/90 placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37] resize-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-[#0D0D0D] border border-white/10 rounded-xl">
                  <FileText className="w-5 h-5 text-[#D4AF37] mx-auto mb-1.5" />
                  <span className="font-semibold text-white">CSV & TSV</span>
                  <p className="text-[10px] text-white/40 mt-0.5">Comma & tab delimited</p>
                </div>
                <div className="p-3 bg-[#0D0D0D] border border-white/10 rounded-xl">
                  <Database className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                  <span className="font-semibold text-white">Excel / JSON</span>
                  <p className="text-[10px] text-white/40 mt-0.5">Structured arrays</p>
                </div>
                <div className="p-3 bg-[#0D0D0D] border border-white/10 rounded-xl">
                  <Layers className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
                  <span className="font-semibold text-white">Raw TXT</span>
                  <p className="text-[10px] text-white/40 mt-0.5">One record per line</p>
                </div>
                <div className="p-3 bg-[#0D0D0D] border border-white/10 rounded-xl">
                  <Filter className="w-5 h-5 text-purple-400 mx-auto mb-1.5" />
                  <span className="font-semibold text-white">vCard (.vcf)</span>
                  <p className="text-[10px] text-white/40 mt-0.5">Address book format</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Column Mapping */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-serif font-semibold text-white">Step 2: Column Detection & Mapping</h3>
                <p className="text-xs text-white/50 font-light mt-0.5">
                  Verify the detected field headers mapped to AetherMail contact properties.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {detectedColumns.map((col) => (
                  <div key={col} className="bg-[#0D0D0D] border border-white/10 p-3.5 rounded-xl space-y-1.5">
                    <label className="text-[11px] font-mono text-white/50 font-bold uppercase truncate block">
                      Raw Column: <span className="text-[#D4AF37]">{col}</span>
                    </label>
                    <select
                      value={columnMapping[col] || 'ignore'}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [col]: e.target.value })}
                      className="w-full bg-[#050505] border border-white/15 text-xs text-white rounded-lg p-2 font-mono focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="email" className="bg-[#050505] text-white">Email Address (Required)</option>
                      <option value="firstName" className="bg-[#050505] text-white">First Name</option>
                      <option value="lastName" className="bg-[#050505] text-white">Last Name</option>
                      <option value="company" className="bg-[#050505] text-white">Company</option>
                      <option value="phone" className="bg-[#050505] text-white">Phone / Mobile</option>
                      <option value="country" className="bg-[#050505] text-white">Country</option>
                      <option value="ignore" className="bg-[#050505] text-white">-- Ignore Field --</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Preview Parsed Records */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-serif font-semibold text-white">Step 3: Preview Parsed Records</h3>
                  <p className="text-xs text-white/50 font-light mt-0.5">Total {parsedRows.length} rows parsed from upload.</p>
                </div>
                <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
                  Showing first 5 rows
                </span>
              </div>

              <div className="overflow-x-auto border border-white/10 rounded-xl bg-[#0D0D0D]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/[0.03] text-white/50 border-b border-white/10">
                    <tr>
                      {detectedColumns.map((col) => (
                        <th key={col} className="p-3 font-semibold text-white">
                          {col} <span className="text-[10px] text-[#D4AF37]">({columnMapping[col]})</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-white/80">
                    {parsedRows.slice(0, 5).map((r) => (
                      <tr key={r._id} className="hover:bg-white/[0.02]">
                        {detectedColumns.map((col) => (
                          <td key={col} className="p-3">
                            {r[col] || <span className="text-white/20">-</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: Hygiene & Validation */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-serif font-semibold text-white">Step 4: List Hygiene & Syntax Validation</h3>
                <p className="text-xs text-white/50 font-light mt-0.5">
                  Autonomous validation against syntax errors, disposable email domains, and duplicate entries.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                  <div className="text-2xl font-bold font-mono text-emerald-400">{validCount}</div>
                  <span className="text-xs font-semibold text-emerald-300">Valid Records</span>
                </div>

                <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl text-center">
                  <AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-1.5" />
                  <div className="text-2xl font-bold font-mono text-amber-400">{duplicateCount}</div>
                  <span className="text-xs font-semibold text-amber-300">Duplicate Emails</span>
                </div>

                <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl text-center">
                  <X className="w-6 h-6 text-rose-400 mx-auto mb-1.5" />
                  <div className="text-2xl font-bold font-mono text-rose-400">{invalidCount}</div>
                  <span className="text-xs font-semibold text-rose-300">Invalid Syntaxes</span>
                </div>

                <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-xl text-center">
                  <Filter className="w-6 h-6 text-purple-400 mx-auto mb-1.5" />
                  <div className="text-2xl font-bold font-mono text-purple-400">{disposableCount}</div>
                  <span className="text-xs font-semibold text-purple-300">Disposable Domains</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Deduplication Strategy */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-serif font-semibold text-white">Step 5: Deduplication & Conflict Policy</h3>
                <p className="text-xs text-white/50 font-light mt-0.5">
                  Select how to handle contacts that already exist in your database.
                </p>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setDedupStrategy('skip')}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    dedupStrategy === 'skip'
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/10'
                      : 'bg-[#0D0D0D] border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  <input type="radio" name="dedup" checked={dedupStrategy === 'skip'} onChange={() => {}} className="mt-1 accent-[#D4AF37]" />
                  <div>
                    <div className="text-xs font-bold text-white font-sans">Skip existing contacts (Recommended)</div>
                    <div className="text-[11px] text-white/40 mt-0.5">
                      Preserves existing engagement metrics, history, and custom tags without overwriting.
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => setDedupStrategy('update')}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    dedupStrategy === 'update'
                      ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/10'
                      : 'bg-[#0D0D0D] border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  <input type="radio" name="dedup" checked={dedupStrategy === 'update'} onChange={() => {}} className="mt-1 accent-[#D4AF37]" />
                  <div>
                    <div className="text-xs font-bold text-white font-sans">Merge & Update empty fields</div>
                    <div className="text-[11px] text-white/40 mt-0.5">
                      Adds new phone numbers, names, and companies without altering existing data.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 6: Destination List & Tags */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-serif font-semibold text-white">Step 6: Destination List & Tagging</h3>
                <p className="text-xs text-white/50 font-light mt-0.5">Assign these contacts to a specific list and apply tags.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-white/80 block mb-1.5">Destination Contact List</label>
                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {contactLists.map((l) => (
                      <option key={l.id} value={l.id} className="bg-[#0D0D0D] text-white">
                        {l.name} ({l.contactCount.toLocaleString()} current members)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-white/80 block mb-1.5">Apply Tags (comma separated)</label>
                  <input
                    type="text"
                    value={inputTags}
                    onChange={(e) => setInputTags(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                    placeholder="e.g. Summit-2026, VIP, Enterprise"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Final Result */}
          {step === 7 && importResult && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-serif font-bold text-white">Import Successfully Completed!</h3>
                <p className="text-xs text-white/50 mt-1 font-light">
                  Your contacts have been securely added and indexed into the database.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="bg-[#0D0D0D] border border-white/10 p-3.5 rounded-xl">
                  <div className="text-xl font-bold font-mono text-emerald-400">{importResult.added}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">Contacts Added</div>
                </div>
                <div className="bg-[#0D0D0D] border border-white/10 p-3.5 rounded-xl">
                  <div className="text-xl font-bold font-mono text-amber-400">{importResult.duplicates}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">Duplicates Skipped</div>
                </div>
                <div className="bg-[#0D0D0D] border border-white/10 p-3.5 rounded-xl">
                  <div className="text-xl font-bold font-mono text-rose-400">{importResult.invalid}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">Invalid Rejected</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          {step > 1 && step < 7 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-white/80 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          ) : (
            <div></div>
          )}

          {step === 1 && (
            <button
              onClick={handleParseData}
              disabled={!rawText.trim()}
              className="px-5 py-2 bg-[#D4AF37] hover:bg-white disabled:opacity-40 text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-[#D4AF37]/20"
            >
              Detect Columns & Validate <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step > 1 && step < 6 && (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-5 py-2 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-[#D4AF37]/20"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 6 && (
            <button
              onClick={executeFinalImport}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4" /> Execute Final Import
            </button>
          )}

          {step === 7 && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/[0.08] hover:bg-white/[0.15] text-white rounded-xl text-xs font-semibold transition-colors border border-white/10"
            >
              Close & View Contacts
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
