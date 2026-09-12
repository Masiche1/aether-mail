import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AutomationWorkflow, AutomationStep } from '../../types';
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Clock,
  Mail,
  MessageSquare,
  Tag,
  GitBranch,
  CheckCircle2,
  Trash2,
  ArrowDown,
  Sparkles,
  Users,
  X,
  Zap,
  Activity,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export const AutomationsView: React.FC = () => {
  const { automations: workflows, setAutomations: setWorkflows, addAuditLog } = useApp();
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(workflows?.[0] || null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowTrigger, setNewWorkflowTrigger] = useState<NonNullable<AutomationWorkflow['trigger']>>('contact_added');

  // Add Step State
  const [stepType, setStepType] = useState<'delay' | 'send_email' | 'send_sms' | 'condition'>('delay');
  const [stepDelayHours, setStepDelayHours] = useState(24);
  const [stepEmailSubject, setStepEmailSubject] = useState('');
  const [stepSmsText, setStepSmsText] = useState('');
  const [stepConditionField, setStepConditionField] = useState('has_opened');

  const activeWorkflowsCount = (workflows || []).filter(
    (w) => (w.status || (w.isActive ? 'active' : 'paused')) === 'active'
  ).length;

  const totalRunsCount = (workflows || []).reduce(
    (acc, w) => acc + (w.totalEnrolled || w.enrolledCount || 0),
    0
  );

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const nextStatus = (w.status || (w.isActive ? 'active' : 'paused')) === 'active' ? 'paused' : 'active';
          return { ...w, status: nextStatus, isActive: nextStatus === 'active' };
        }
        return w;
      })
    );
    if (selectedWorkflow && selectedWorkflow.id === id) {
      const nextStatus = (selectedWorkflow.status || (selectedWorkflow.isActive ? 'active' : 'paused')) === 'active' ? 'paused' : 'active';
      setSelectedWorkflow({ ...selectedWorkflow, status: nextStatus, isActive: nextStatus === 'active' });
    }
  };

  const handleDeleteWorkflow = (id: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    addAuditLog('AUTOMATION_DELETED', 'AutomationWorkflow', id, 'Deleted drip automation journey');
    if (selectedWorkflow?.id === id) {
      const remaining = (workflows || []).filter((w) => w.id !== id);
      setSelectedWorkflow(remaining[0] || null);
    }
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;

    const newWf: AutomationWorkflow = {
      id: `wf_${Date.now()}`,
      name: newWorkflowName.trim(),
      description: 'Autonomous multi-channel behavioral lifecycle sequence',
      status: 'active',
      isActive: true,
      trigger: newWorkflowTrigger,
      steps: [
        {
          id: `step_${Date.now()}_1`,
          type: 'delay',
          delayHours: 1,
        },
        {
          id: `step_${Date.now()}_2`,
          type: 'send_email',
          emailSubject: 'Welcome onboard! Here is your quick start guide',
        },
        {
          id: `step_${Date.now()}_3`,
          type: 'condition',
          conditionField: 'has_opened',
          conditionValue: 'true',
          yesStepId: 'step_yes',
          noStepId: 'step_no',
        },
      ],
      totalEnrolled: 1,
      totalCompleted: 0,
      createdAt: new Date().toISOString(),
    };

    setWorkflows([newWf, ...(workflows || [])]);
    setSelectedWorkflow(newWf);
    addAuditLog('AUTOMATION_CREATED', 'AutomationWorkflow', newWf.id, `Created automation workflow ${newWf.name}`);
    setShowNewModal(false);
    setNewWorkflowName('');
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkflow) return;

    let newStep: AutomationStep;
    const stepId = `step_${Date.now()}`;

    if (stepType === 'delay') {
      newStep = { id: stepId, type: 'delay', delayHours: stepDelayHours };
    } else if (stepType === 'send_email') {
      newStep = { id: stepId, type: 'send_email', emailSubject: stepEmailSubject || 'Automated Behavioral Broadcast' };
    } else if (stepType === 'send_sms') {
      newStep = { id: stepId, type: 'send_sms', smsMessage: stepSmsText || 'Quick update regarding your account.' };
    } else {
      newStep = {
        id: stepId,
        type: 'condition',
        conditionField: stepConditionField,
        conditionValue: 'true',
        yesStepId: 'step_yes',
        noStepId: 'step_no',
      };
    }

    const updatedSteps = [...(selectedWorkflow.steps || []), newStep];
    const updatedWorkflow = { ...selectedWorkflow, steps: updatedSteps };

    setWorkflows((prev) => prev.map((w) => (w.id === selectedWorkflow.id ? updatedWorkflow : w)));
    setSelectedWorkflow(updatedWorkflow);
    setShowAddStepModal(false);
    setStepEmailSubject('');
    setStepSmsText('');
  };

  const handleDeleteStep = (stepId: string) => {
    if (!selectedWorkflow) return;
    const updatedSteps = (selectedWorkflow.steps || []).filter((s) => s.id !== stepId);
    const updatedWorkflow = { ...selectedWorkflow, steps: updatedSteps };
    setWorkflows((prev) => prev.map((w) => (w.id === selectedWorkflow.id ? updatedWorkflow : w)));
    setSelectedWorkflow(updatedWorkflow);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Workflow className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Automated Drip <span className="italic text-[#D4AF37]">Sequences</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1 font-light">
            Build event-driven customer journeys with autonomous delays, conditional branching, email dispatches, and SMS nudges.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4AF37]/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Drip Sequence</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-white/40 text-xs font-mono uppercase mb-2">
            <span>Active Journeys</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {activeWorkflowsCount} / {(workflows || []).length}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Autonomous Engine Running</span>
          </div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-white/40 text-xs font-mono uppercase mb-2">
            <span>Enrolled Contacts</span>
            <Users className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-bold text-[#D4AF37]">
            {totalRunsCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-white/40 mt-1 font-mono">Contacts in active lifecycle sequence</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-white/40 text-xs font-mono uppercase mb-2">
            <span>Condition Branches</span>
            <GitBranch className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">99.8%</div>
          <div className="text-[10px] text-cyan-400 mt-1 font-mono">Behavioral decision accuracy</div>
        </div>

        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-white/40 text-xs font-mono uppercase mb-2">
            <span>Avg Completion Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">84.2%</div>
          <div className="text-[10px] text-white/40 mt-1 font-mono">Full journey progression</div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left List of Workflows */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-white/40 px-1">
            Configured Sequences ({(workflows || []).length})
          </div>

          {(workflows || []).map((wf) => {
            const isSelected = selectedWorkflow?.id === wf.id;
            const isWfActive = (wf.status || (wf.isActive ? 'active' : 'paused')) === 'active';

            return (
              <div
                key={wf.id}
                onClick={() => setSelectedWorkflow(wf)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 bg-[#0D0D0D] ${
                  isSelected
                    ? 'border-[#D4AF37]/50 shadow-xl shadow-[#D4AF37]/5 ring-1 ring-[#D4AF37]/30'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      isWfActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {isWfActive ? 'Active Engine' : 'Paused'}
                  </span>

                  <span className="text-xs text-white/40 font-mono flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {(wf.totalEnrolled || wf.enrolledCount || 0).toLocaleString()} enrolled
                  </span>
                </div>

                <div>
                  <h2 className="text-sm font-serif font-bold text-white tracking-wide">{wf.name}</h2>
                  <p className="text-xs text-white/40 mt-1 line-clamp-1 font-light">{wf.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-white/5 font-mono">
                  <span className="text-[10px] text-white/40 uppercase">
                    Trigger: {(wf.trigger || 'contact_added').replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWorkflowStatus(wf.id);
                      }}
                      className={`text-xs font-semibold ${
                        isWfActive ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      {isWfActive ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkflow(wf.id);
                      }}
                      className="text-white/30 hover:text-rose-400 transition-colors"
                      title="Delete Journey"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Canvas: Visual Workflow Node Steps */}
        <div className="lg:col-span-8 bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 flex flex-col justify-between">
          {selectedWorkflow ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-mono text-[#D4AF37] font-bold px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                      {selectedWorkflow.id}
                    </span>
                    <h2 className="text-lg font-serif font-bold text-white tracking-wide">
                      {selectedWorkflow.name}
                    </h2>
                  </div>
                  <p className="text-xs text-white/50 mt-1 font-light flex items-center gap-2">
                    <span>Autonomous Entry Trigger:</span>
                    <strong className="text-[#D4AF37] uppercase font-mono">
                      {(selectedWorkflow.trigger || 'contact_added').replace('_', ' ')}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddStepModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Add Step</span>
                  </button>

                  <button
                    onClick={() => toggleWorkflowStatus(selectedWorkflow.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md ${
                      (selectedWorkflow.status || (selectedWorkflow.isActive ? 'active' : 'paused')) === 'active'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                        : 'bg-[#D4AF37] text-black hover:bg-white'
                    }`}
                  >
                    {(selectedWorkflow.status || (selectedWorkflow.isActive ? 'active' : 'paused')) === 'active' ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {(selectedWorkflow.status || (selectedWorkflow.isActive ? 'active' : 'paused')) === 'active'
                        ? 'Pause Journey'
                        : 'Activate Journey'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Visual Interactive Flow Canvas */}
              <div className="flex flex-col items-center space-y-4 py-2">
                {/* Journey Trigger Node */}
                <div className="w-full max-w-lg bg-gradient-to-b from-[#1C1608] to-[#0D0D0D] border border-[#D4AF37]/40 rounded-2xl p-5 text-center shadow-2xl relative overflow-hidden">
                  <div className="text-[10px] font-mono uppercase text-[#D4AF37] font-bold tracking-widest flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>JOURNEY ENTRY TRIGGER</span>
                  </div>
                  <div className="text-sm font-serif font-bold text-white mt-1.5">
                    Event: {(selectedWorkflow.trigger || 'contact_added').toUpperCase().replace('_', ' ')}
                  </div>
                  <div className="text-[11px] text-white/50 mt-1 font-light">
                    Incoming leads and tagged contacts immediately enter this queue
                  </div>
                </div>

                <ArrowDown className="w-5 h-5 text-[#D4AF37]/50" />

                {/* Steps sequence */}
                {(selectedWorkflow.steps || []).map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <div className="w-full max-w-lg bg-[#050505] border border-white/10 rounded-2xl p-5 shadow-xl space-y-3 hover:border-[#D4AF37]/40 transition-all group relative">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#D4AF37] font-bold">
                          STEP {idx + 1} • {(step.type || 'action').toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/30">{step.id}</span>
                          <button
                            onClick={() => handleDeleteStep(step.id)}
                            className="text-white/20 hover:text-rose-400 transition-colors p-0.5 opacity-0 group-hover:opacity-100"
                            title="Delete step"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {step.type === 'delay' && (
                        <div className="flex items-center gap-3 text-xs bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                          <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          <div className="text-white/80">
                            Wait duration: <strong className="text-[#D4AF37]">{step.delayHours || 24} Hours</strong> before dispatching next action
                          </div>
                        </div>
                      )}

                      {step.type === 'send_email' && (
                        <div className="flex items-start gap-3 text-xs bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl">
                          <Mail className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-white">Send Email Broadcast</div>
                            <div className="text-white/60 text-[11px] mt-0.5">"{step.emailSubject}"</div>
                          </div>
                        </div>
                      )}

                      {step.type === 'send_sms' && (
                        <div className="flex items-start gap-3 text-xs bg-purple-500/5 border border-purple-500/20 p-3 rounded-xl">
                          <MessageSquare className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-white">Direct Carrier SMS Nudge</div>
                            <div className="text-white/60 text-[11px] mt-0.5">"{step.smsMessage || (step as any).smsText || 'Automated SMS notification'}"</div>
                          </div>
                        </div>
                      )}

                      {step.type === 'condition' && (
                        <div className="space-y-2 text-xs bg-[#121212] border border-white/10 p-3.5 rounded-xl">
                          <div className="flex items-center gap-2 text-[#D4AF37] font-semibold">
                            <GitBranch className="w-4 h-4" />
                            <span>Evaluate Condition: {step.conditionField} = {step.conditionValue}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-center font-medium">
                              YES → Advance to next action
                            </div>
                            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center font-medium">
                              NO → Exit Sequence
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {idx < (selectedWorkflow.steps || []).length - 1 && (
                      <ArrowDown className="w-5 h-5 text-[#D4AF37]/50" />
                    )}
                  </React.Fragment>
                ))}

                {/* Journey Complete Node */}
                <ArrowDown className="w-5 h-5 text-[#D4AF37]/50" />
                <div className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 font-mono text-xs flex items-center gap-2 shadow-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Journey Lifecycle Completed</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-white/40 text-xs">
              Select or create a sequence from the left panel to inspect the visual flow.
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0D0D0D] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="text-sm font-serif font-bold text-white tracking-wide">Create Drip Journey</h2>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-white/60 block mb-1 font-mono uppercase text-[10px]">Sequence Title *</label>
                <input
                  type="text"
                  required
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="e.g. VIP Customer Onboarding & Retention Journey"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-white/60 block mb-1 font-mono uppercase text-[10px]">Entry Trigger</label>
                <select
                  value={newWorkflowTrigger}
                  onChange={(e) => setNewWorkflowTrigger(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                >
                  <option value="contact_added">Contact Ingested / Created</option>
                  <option value="tag_applied">Tag Applied (VIP / Lead)</option>
                  <option value="link_clicked">Link Clicked in Campaign</option>
                  <option value="custom_event">API Webhook / Custom Event</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-white/60 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-serif font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#D4AF37]/20"
                >
                  Create Journey
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Step Modal */}
      {showAddStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#0D0D0D] border border-white/15 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="text-sm font-serif font-bold text-white tracking-wide">Add Node to Journey</h2>
              </div>
              <button
                onClick={() => setShowAddStepModal(false)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStep} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-white/60 block mb-1 font-mono uppercase text-[10px]">Node Action Type</label>
                <select
                  value={stepType}
                  onChange={(e) => setStepType(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                >
                  <option value="delay">Autonomous Wait / Delay</option>
                  <option value="send_email">Send Email Broadcast</option>
                  <option value="send_sms">Send Carrier SMS Nudge</option>
                  <option value="condition">Conditional Branch Rule</option>
                </select>
              </div>

              {stepType === 'delay' && (
                <div>
                  <label className="text-white/60 block mb-1 font-mono uppercase text-[10px]">Delay Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={stepDelayHours}
                    onChange={(e) => setStepDelayHours(parseInt(e.target.value) || 24)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              )}

              {stepType === 'send_email' && (
                <div>
                  <label className="text-white/60 block mb-1 font-mono uppercase text-[10px]">Email Subject Line</label>
                  <input
                    type="text"
                    required
                    value={stepEmailSubject}
                    onChange={(e) => setStepEmailSubject(e.target.value)}
                    placeholder="e.g. Exclusive insight for {{first_name}}"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              )}

              {stepType === 'send_sms' && (
                <div>
                  <label className="text-white/60 block mb-1 font-mono uppercase text-[10px]">SMS Text Body</label>
                  <input
                    type="text"
                    required
                    value={stepSmsText}
                    onChange={(e) => setStepSmsText(e.target.value)}
                    placeholder="e.g. Hi {{first_name}}, check your inbox for today's briefing."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              )}

              {stepType === 'condition' && (
                <div>
                  <label className="text-white/60 block mb-1 font-mono uppercase text-[10px]">Condition Field to Evaluate</label>
                  <select
                    value={stepConditionField}
                    onChange={(e) => setStepConditionField(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                  >
                    <option value="has_opened">Has Opened Previous Email</option>
                    <option value="has_clicked">Has Clicked Link in Campaign</option>
                    <option value="is_vip">Contact Tag includes 'VIP'</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddStepModal(false)}
                  className="px-4 py-2 text-white/60 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-white text-black font-serif font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#D4AF37]/20"
                >
                  Add Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

