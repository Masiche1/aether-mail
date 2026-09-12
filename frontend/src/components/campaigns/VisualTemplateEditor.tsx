import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CampaignBlock, EmailTemplate } from '../../types';
import {
  Heading,
  AlignLeft,
  Image as ImageIcon,
  MousePointerClick,
  Columns,
  Minus,
  FileCode,
  Smartphone,
  Monitor,
  Split,
  Trash2,
  Plus,
  Sparkles,
  CheckCircle2,
  Save,
  Layers,
  Code,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VisualTemplateEditorProps {
  blocks?: CampaignBlock[];
  onChangeBlocks?: (blocks: CampaignBlock[]) => void;
  rawHtml?: string;
  onChangeHtml?: (html: string) => void;
  editorMode?: 'visual' | 'html';
  onChangeEditorMode?: (mode: 'visual' | 'html') => void;
  onSaveTemplate?: (template: EmailTemplate) => void;
}

export const VisualTemplateEditor: React.FC<VisualTemplateEditorProps> = ({
  blocks: propBlocks,
  onChangeBlocks: propOnChangeBlocks,
  rawHtml: propRawHtml,
  onChangeHtml: propOnChangeHtml,
  editorMode: propEditorMode,
  onChangeEditorMode: propOnChangeEditorMode,
  onSaveTemplate,
}) => {
  const { templates, setTemplates, addAuditLog } = useApp();

  // Selected template when in standalone mode
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates?.[0]?.id || 'tmpl_001'
  );

  // Local state fallbacks if not controlled by props
  const [localBlocks, setLocalBlocks] = useState<CampaignBlock[]>(() => {
    return propBlocks || templates?.[0]?.blocks || [];
  });
  const [localHtml, setLocalHtml] = useState<string>(() => {
    return (
      propRawHtml ||
      templates?.[0]?.htmlContent ||
      '<!DOCTYPE html>\n<html>\n<head></head>\n<body style="font-family: sans-serif; background-color: #0d0d0d; color: #ffffff; padding: 24px;">\n  <h1 style="color: #D4AF37;">Welcome to AetherMail</h1>\n  <p>Hello {{first_name}}, this is your premium communication.</p>\n</body>\n</html>'
    );
  });
  const [localEditorMode, setLocalEditorMode] = useState<'visual' | 'html'>(
    propEditorMode || 'visual'
  );
  const [templateName, setTemplateName] = useState<string>(
    templates?.[0]?.name || 'Standard Enterprise Announcement'
  );
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  // Active blocks & handlers
  const blocks = propBlocks !== undefined ? propBlocks : localBlocks;
  const rawHtml = propRawHtml !== undefined ? propRawHtml : localHtml;
  const editorMode = propEditorMode !== undefined ? propEditorMode : localEditorMode;

  const setBlocks = (newBlocks: CampaignBlock[]) => {
    if (propOnChangeBlocks) {
      propOnChangeBlocks(newBlocks);
    } else {
      setLocalBlocks(newBlocks);
    }
  };

  const setHtml = (newHtml: string) => {
    if (propOnChangeHtml) {
      propOnChangeHtml(newHtml);
    } else {
      setLocalHtml(newHtml);
    }
  };

  const setEditorMode = (newMode: 'visual' | 'html') => {
    if (propOnChangeEditorMode) {
      propOnChangeEditorMode(newMode);
    } else {
      setLocalEditorMode(newMode);
    }
  };

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile' | 'split'>('split');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    blocks?.[0]?.id || null
  );

  const handleSelectTemplate = (templateId: string) => {
    const tmpl = (templates || []).find((t) => t.id === templateId);
    if (tmpl) {
      setSelectedTemplateId(tmpl.id);
      setTemplateName(tmpl.name);
      if (tmpl.blocks && tmpl.blocks.length > 0) {
        setBlocks(tmpl.blocks);
        setSelectedBlockId(tmpl.blocks[0]?.id || null);
      }
      if (tmpl.rawHtml) {
        setHtml(tmpl.rawHtml);
      }
    }
  };

  const handleSaveCurrentTemplate = () => {
    const updatedTemplate: EmailTemplate = {
      id: selectedTemplateId || `tmpl_${Date.now()}`,
      name: templateName.trim() || 'Custom Email Template',
      category: 'promotional',
      subject: 'Special Announcement',
      blocks,
      rawHtml,
      editorMode,
      thumbnailUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80',
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => {
      const exists = (prev || []).some((t) => t.id === updatedTemplate.id);
      if (exists) {
        return (prev || []).map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t));
      }
      return [updatedTemplate, ...(prev || [])];
    });

    addAuditLog('TEMPLATE_UPDATED', 'EmailTemplate', updatedTemplate.id, `Saved template ${updatedTemplate.name}`);
    if (onSaveTemplate) {
      onSaveTemplate(updatedTemplate);
    }

    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 3000);
  };

  const handleCreateNewTemplate = () => {
    const newTmpl: EmailTemplate = {
      id: `tmpl_${Date.now()}`,
      name: 'New Custom Master Template',
      category: 'transactional',
      subject: 'Important Notification',
      editorMode: 'visual',
      blocks: [
        {
          id: `blk_${Date.now()}_1`,
          type: 'header',
          content: {
            title: 'Welcome to AetherMail Cloud',
            align: 'center',
            bgColor: '#000000',
            textColor: '#D4AF37',
          },
        },
        {
          id: `blk_${Date.now()}_2`,
          type: 'paragraph',
          content: {
            text: 'Hello {{first_name}},\n\nWe are delighted to welcome you to our enterprise communication infrastructure.',
            align: 'left',
          },
        },
        {
          id: `blk_${Date.now()}_3`,
          type: 'button',
          content: {
            buttonText: 'Access Your Portal →',
            buttonUrl: 'https://aethermail.net/login',
            align: 'center',
          },
        },
      ],
      rawHtml: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&auto=format&fit=crop&q=80',
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => [newTmpl, ...(prev || [])]);
    setSelectedTemplateId(newTmpl.id);
    setTemplateName(newTmpl.name);
    setBlocks(newTmpl.blocks || []);
    setSelectedBlockId(newTmpl.blocks?.[0]?.id || null);
    addAuditLog('TEMPLATE_CREATED', 'EmailTemplate', newTmpl.id, `Created template ${newTmpl.name}`);
  };

  const addBlock = (type: CampaignBlock['type']) => {
    const newB: CampaignBlock = {
      id: `blk_${Date.now()}`,
      type,
      content: {
        title: type === 'header' ? 'New Announcement Heading' : undefined,
        text:
          type === 'paragraph'
            ? 'Hello {{first_name}},\n\nWrite your personalized message here with merge tags.'
            : type === 'footer'
            ? 'Acme Enterprise Communications | <a href="{{unsubscribe_url}}">Unsubscribe</a>'
            : undefined,
        buttonText: type === 'button' ? 'Click to Review →' : undefined,
        buttonUrl: type === 'button' ? 'https://example.com/action?ref={{short_link}}' : undefined,
        imageUrl:
          type === 'image'
            ? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80'
            : undefined,
        align: 'left',
        bgColor: type === 'header' ? '#0f172a' : undefined,
        textColor: type === 'header' ? '#ffffff' : undefined,
        columnsCount: 2,
        leftCol: 'Left Column Content',
        rightCol: 'Right Column Content',
      },
    };

    const updated = [...(blocks || []), newB];
    setBlocks(updated);
    setSelectedBlockId(newB.id);
  };

  const removeBlock = (id: string) => {
    const updated = (blocks || []).filter((b) => b.id !== id);
    setBlocks(updated);
    if (selectedBlockId === id) {
      setSelectedBlockId(updated?.[0]?.id || null);
    }
  };

  const updateSelectedBlock = (partial: Partial<CampaignBlock['content']>) => {
    if (!selectedBlockId) return;
    const updated = (blocks || []).map((b) =>
      b.id === selectedBlockId ? { ...b, content: { ...b.content, ...partial } } : b
    );
    setBlocks(updated);
  };

  const activeBlock = (blocks || []).find((b) => b.id === selectedBlockId);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Standalone Template Studio Header */}
      {propBlocks === undefined && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <FileCode className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
                Email Template <span className="italic text-[#D4AF37]">Studio</span>
              </h1>
            </div>
            <p className="text-xs text-white/50 mt-1 font-light">
              Craft responsive modular email templates with merge tags, inline styles, and drag-and-drop elements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreateNewTemplate}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/90 text-xs font-semibold border border-white/10 transition-colors"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>New Template</span>
            </button>

            <button
              onClick={handleSaveCurrentTemplate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-white text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition-all font-serif"
            >
              <Save className="w-4 h-4" />
              <span>Save Template</span>
            </button>
          </div>
        </div>
      )}

      {/* Standalone Template Selector Bar */}
      {propBlocks === undefined && (
        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs text-white/50 font-serif">Select Template:</span>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="bg-black border border-white/15 text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#D4AF37] font-medium"
            >
              {(templates || []).map((t) => (
                <option key={t.id} value={t.id} className="bg-black text-white">
                  {t.name} ({t.category || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs text-white/50">Template Name:</span>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="bg-black border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] w-full md:w-72"
            />
          </div>

          {saveSuccessMessage && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved Successfully</span>
            </div>
          )}
        </div>
      )}

      {/* Editor Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D0D0D] border border-white/10 p-3 rounded-xl shadow-lg">
        <div className="flex items-center gap-2">
          <div className="bg-black/50 p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditorMode('visual')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                editorMode === 'visual'
                  ? 'bg-[#D4AF37] text-black font-bold shadow-md shadow-[#D4AF37]/20'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Visual Drag & Drop
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('html')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                editorMode === 'html'
                  ? 'bg-[#D4AF37] text-black font-bold shadow-md shadow-[#D4AF37]/20'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              HTML Source Mode
            </button>
          </div>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/40 font-mono">Viewport:</span>
          <div className="bg-black/50 p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                previewDevice === 'desktop' ? 'bg-white/[0.08] text-[#D4AF37]' : 'text-white/40 hover:text-white'
              }`}
              title="Desktop View (600px)"
            >
              <Monitor className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                previewDevice === 'mobile' ? 'bg-white/[0.08] text-[#D4AF37]' : 'text-white/40 hover:text-white'
              }`}
              title="Mobile View (360px)"
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('split')}
              className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5 ${
                previewDevice === 'split' ? 'bg-[#D4AF37] text-black font-bold shadow' : 'text-white/40 hover:text-white'
              }`}
              title="Split-Screen Preview (Desktop + Mobile Real-Time)"
            >
              <Split className="w-4 h-4" />
              <span className="text-[11px] font-bold">Split-Screen</span>
            </button>
          </div>
        </div>
      </div>

      {editorMode === 'visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Toolbar: Add Component Blocks */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-[#0D0D0D] border border-white/10 p-4 rounded-xl space-y-2.5">
              <h3 className="text-xs font-serif font-bold text-white tracking-wider">
                Add Block Element
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => addBlock('header')}
                  className="p-2.5 bg-black/40 hover:bg-white/[0.04] border border-white/10 hover:border-[#D4AF37]/40 rounded-xl text-left text-xs text-white/80 transition-colors flex items-center gap-2"
                >
                  <Heading className="w-4 h-4 text-[#D4AF37]" /> Header
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('paragraph')}
                  className="p-2.5 bg-black/40 hover:bg-white/[0.04] border border-white/10 hover:border-[#D4AF37]/40 rounded-xl text-left text-xs text-white/80 transition-colors flex items-center gap-2"
                >
                  <AlignLeft className="w-4 h-4 text-emerald-400" /> Text
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('button')}
                  className="p-2.5 bg-black/40 hover:bg-white/[0.04] border border-white/10 hover:border-[#D4AF37]/40 rounded-xl text-left text-xs text-white/80 transition-colors flex items-center gap-2"
                >
                  <MousePointerClick className="w-4 h-4 text-amber-400" /> Button
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('image')}
                  className="p-2.5 bg-black/40 hover:bg-white/[0.04] border border-white/10 hover:border-[#D4AF37]/40 rounded-xl text-left text-xs text-white/80 transition-colors flex items-center gap-2"
                >
                  <ImageIcon className="w-4 h-4 text-purple-400" /> Image
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('columns')}
                  className="p-2.5 bg-black/40 hover:bg-white/[0.04] border border-white/10 hover:border-[#D4AF37]/40 rounded-xl text-left text-xs text-white/80 transition-colors flex items-center gap-2"
                >
                  <Columns className="w-4 h-4 text-cyan-400" /> Columns
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('divider')}
                  className="p-2.5 bg-black/40 hover:bg-white/[0.04] border border-white/10 hover:border-[#D4AF37]/40 rounded-xl text-left text-xs text-white/80 transition-colors flex items-center gap-2"
                >
                  <Minus className="w-4 h-4 text-white/40" /> Divider
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('footer')}
                  className="p-2.5 bg-black/40 hover:bg-white/[0.04] border border-white/10 hover:border-[#D4AF37]/40 rounded-xl text-left text-xs text-white/80 transition-colors flex items-center gap-2 col-span-2"
                >
                  <FileCode className="w-4 h-4 text-rose-400" /> Footer (Unsubscribe)
                </button>
              </div>
            </div>

            {/* Merge Tags Helper */}
            <div className="bg-[#0D0D0D] border border-white/10 p-4 rounded-xl space-y-2 text-xs">
              <span className="text-[10px] font-bold text-white/50 uppercase font-mono tracking-wider">
                Personalization Merge Tags
              </span>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="p-1.5 bg-black/40 rounded-lg text-[#D4AF37] border border-white/10">
                  {'{{first_name}}'}
                </div>
                <div className="p-1.5 bg-black/40 rounded-lg text-[#D4AF37] border border-white/10">
                  {'{{last_name}}'}
                </div>
                <div className="p-1.5 bg-black/40 rounded-lg text-[#D4AF37] border border-white/10">
                  {'{{company}}'}
                </div>
                <div className="p-1.5 bg-black/40 rounded-lg text-amber-400 border border-white/10">
                  {'{{short_link}}'}
                </div>
                <div className="p-1.5 bg-black/40 rounded-lg text-rose-400 border border-white/10">
                  {'{{unsubscribe_url}}'}
                </div>
              </div>
            </div>
          </div>

          {/* Center Canvas: Live Visual Preview */}
          <div
            className={`flex justify-center bg-black/50 border border-white/10 rounded-2xl p-4 sm:p-6 min-h-[500px] ${
              previewDevice === 'split' ? 'lg:col-span-6 xl:col-span-6' : 'lg:col-span-6'
            }`}
          >
            {previewDevice === 'split' ? (
              /* Real-Time Split-Screen Dual Viewport (Desktop 600px + Mobile 360px) */
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between px-2 text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-[#D4AF37]">
                    <Monitor className="w-3.5 h-3.5" /> Desktop (600px Breakpoint)
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Smartphone className="w-3.5 h-3.5" /> Mobile (360px Stacked)
                  </span>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                  {/* Desktop Preview */}
                  <div className="bg-[#111111] text-white/90 border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                    <div className="bg-[#080808] px-3.5 py-2 border-b border-white/10 text-[11px] font-sans text-white/60 flex items-center justify-between">
                      <span className="truncate font-semibold text-white">Subject: Special Announcement</span>
                      <span className="text-[10px] font-mono text-emerald-400 shrink-0">DKIM Pass</span>
                    </div>

                    <div className="p-3 max-h-[560px] overflow-y-auto custom-scrollbar">
                      {(blocks || []).map((block) => (
                        <div
                          key={`dt_${block.id}`}
                          onClick={() => setSelectedBlockId(block.id)}
                          className={`p-3 relative group cursor-pointer transition-all border-2 rounded-lg mb-2 ${
                            selectedBlockId === block.id
                              ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                              : 'border-transparent hover:border-white/20'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBlock(block.id);
                            }}
                            className="absolute top-2 right-2 p-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {block.type === 'header' && (
                            <div
                              style={{
                                backgroundColor: block.content.bgColor || '#050505',
                                color: block.content.textColor || '#ffffff',
                                textAlign: block.content.align || 'center',
                              }}
                              className="p-4 rounded-lg border border-white/10"
                            >
                              <h2 className="text-lg font-serif font-bold tracking-tight">{block.content.title}</h2>
                              {block.content.text && (
                                <p className="text-xs mt-1 opacity-80 font-light">{block.content.text}</p>
                              )}
                            </div>
                          )}

                          {block.type === 'paragraph' && (
                            <div
                              style={{ textAlign: block.content.align || 'left' }}
                              className="text-xs leading-relaxed text-white/80 whitespace-pre-line font-sans"
                            >
                              {block.content.text}
                            </div>
                          )}

                          {block.type === 'image' && (
                            <div className="text-center">
                              <img
                                src={block.content.imageUrl}
                                alt="Email asset"
                                className="rounded-lg w-full max-h-40 object-cover mx-auto border border-white/10"
                              />
                            </div>
                          )}

                          {block.type === 'button' && (
                            <div style={{ textAlign: block.content.align || 'center' }} className="py-1.5">
                              <span
                                style={{
                                  backgroundColor: block.content.bgColor || '#D4AF37',
                                  color: block.content.textColor || '#000000',
                                }}
                                className="inline-block px-4 py-2 rounded-xl text-xs font-bold shadow-md tracking-tight uppercase tracking-wider"
                              >
                                {block.content.buttonText}
                              </span>
                            </div>
                          )}

                          {block.type === 'columns' && (
                            <div className="grid grid-cols-2 gap-2 text-xs text-white/80">
                              <div
                                className="p-2 bg-black/40 border border-white/10 rounded-lg text-[11px]"
                                dangerouslySetInnerHTML={{ __html: block.content.leftCol || '' }}
                              />
                              <div
                                className="p-2 bg-black/40 border border-white/10 rounded-lg text-[11px]"
                                dangerouslySetInnerHTML={{ __html: block.content.rightCol || '' }}
                              />
                            </div>
                          )}

                          {block.type === 'divider' && <hr className="border-t border-white/10 my-1.5" />}

                          {block.type === 'footer' && (
                            <div
                              style={{ textAlign: block.content.align || 'center' }}
                              className="text-[10px] text-white/50 border-t border-white/10 pt-2"
                              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Preview (Smartphone frame) */}
                  <div className="bg-[#111111] text-white/90 border-2 border-white/20 rounded-[28px] shadow-2xl overflow-hidden p-2 flex flex-col">
                    <div className="flex items-center justify-between px-3 py-1 text-[10px] font-mono text-white/60">
                      <span>9:41</span>
                      <div className="w-12 h-2.5 bg-black rounded-full mx-auto"></div>
                      <span>5G 100%</span>
                    </div>

                    <div className="bg-[#080808] px-3 py-1 border-b border-white/10 text-[10px] font-sans text-white/60 rounded-t-lg mt-1">
                      <span className="truncate font-semibold text-white block">Special Announcement</span>
                    </div>

                    <div className="p-2 max-h-[520px] overflow-y-auto custom-scrollbar">
                      {(blocks || []).map((block) => (
                        <div
                          key={`mob_${block.id}`}
                          onClick={() => setSelectedBlockId(block.id)}
                          className={`p-2 relative group cursor-pointer transition-all border-2 rounded-lg mb-2 ${
                            selectedBlockId === block.id
                              ? 'border-cyan-400 bg-cyan-400/5'
                              : 'border-transparent hover:border-white/20'
                          }`}
                        >
                          {block.type === 'header' && (
                            <div
                              style={{
                                backgroundColor: block.content.bgColor || '#050505',
                                color: block.content.textColor || '#ffffff',
                                textAlign: block.content.align || 'center',
                              }}
                              className="p-3 rounded-lg border border-white/10"
                            >
                              <h2 className="text-base font-serif font-bold tracking-tight leading-snug">{block.content.title}</h2>
                              {block.content.text && (
                                <p className="text-[10px] mt-1 opacity-80 font-light">{block.content.text}</p>
                              )}
                            </div>
                          )}

                          {block.type === 'paragraph' && (
                            <div
                              style={{ textAlign: block.content.align || 'left' }}
                              className="text-[11px] leading-relaxed text-white/80 whitespace-pre-line font-sans"
                            >
                              {block.content.text}
                            </div>
                          )}

                          {block.type === 'image' && (
                            <div className="text-center">
                              <img
                                src={block.content.imageUrl}
                                alt="Email asset"
                                className="rounded-lg w-full max-h-32 object-cover mx-auto border border-white/10"
                              />
                            </div>
                          )}

                          {block.type === 'button' && (
                            <div style={{ textAlign: block.content.align || 'center' }} className="py-1">
                              <span
                                style={{
                                  backgroundColor: block.content.bgColor || '#D4AF37',
                                  color: block.content.textColor || '#000000',
                                }}
                                className="block w-full py-2 text-center rounded-xl text-[11px] font-bold shadow-md tracking-tight uppercase tracking-wider"
                              >
                                {block.content.buttonText}
                              </span>
                            </div>
                          )}

                          {block.type === 'columns' && (
                            /* Mobile automatically stacks columns vertically */
                            <div className="grid grid-cols-1 gap-1.5 text-xs text-white/80">
                              <div
                                className="p-2 bg-black/40 border border-white/10 rounded-lg text-[10px]"
                                dangerouslySetInnerHTML={{ __html: block.content.leftCol || '' }}
                              />
                              <div
                                className="p-2 bg-black/40 border border-white/10 rounded-lg text-[10px]"
                                dangerouslySetInnerHTML={{ __html: block.content.rightCol || '' }}
                              />
                            </div>
                          )}

                          {block.type === 'divider' && <hr className="border-t border-white/10 my-1" />}

                          {block.type === 'footer' && (
                            <div
                              style={{ textAlign: block.content.align || 'center' }}
                              className="text-[9px] text-white/50 border-t border-white/10 pt-1.5"
                              dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="w-20 h-1 bg-white/20 rounded-full mx-auto my-1"></div>
                  </div>
                </div>
              </div>
            ) : (
              /* Single Viewport Mode */
              <div
                className={`bg-[#111111] text-white/90 border border-white/10 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ${
                  previewDevice === 'mobile' ? 'w-[360px]' : 'w-full max-w-[580px]'
                }`}
              >
                {(blocks || []).map((block) => (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`p-4 relative group cursor-pointer transition-all border-2 ${
                      selectedBlockId === block.id
                        ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                        : 'border-transparent hover:border-white/20'
                    }`}
                  >
                    {/* Delete button on hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBlock(block.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Header Render */}
                    {block.type === 'header' && (
                      <div
                        style={{
                          backgroundColor: block.content.bgColor || '#050505',
                          color: block.content.textColor || '#ffffff',
                          textAlign: block.content.align || 'center',
                        }}
                        className="p-5 rounded-lg border border-white/10"
                      >
                        <h2 className="text-xl font-serif font-bold tracking-tight">{block.content.title}</h2>
                        {block.content.text && (
                          <p className="text-xs mt-1.5 opacity-80 font-light">{block.content.text}</p>
                        )}
                      </div>
                    )}

                    {/* Paragraph Render */}
                    {block.type === 'paragraph' && (
                      <div
                        style={{ textAlign: block.content.align || 'left' }}
                        className="text-xs leading-relaxed text-white/80 whitespace-pre-line font-sans"
                      >
                        {block.content.text}
                      </div>
                    )}

                    {/* Image Render */}
                    {block.type === 'image' && (
                      <div className="text-center">
                        <img
                          src={block.content.imageUrl}
                          alt="Email asset"
                          className="rounded-lg w-full max-h-48 object-cover mx-auto border border-white/10"
                        />
                      </div>
                    )}

                    {/* Button Render */}
                    {block.type === 'button' && (
                      <div style={{ textAlign: block.content.align || 'center' }} className="py-2">
                        <span
                          style={{
                            backgroundColor: block.content.bgColor || '#D4AF37',
                            color: block.content.textColor || '#000000',
                          }}
                          className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold shadow-md tracking-tight uppercase tracking-wider"
                        >
                          {block.content.buttonText}
                        </span>
                      </div>
                    )}

                    {/* Columns Render */}
                    {block.type === 'columns' && (
                      <div className={`grid gap-3 text-xs text-white/80 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        <div
                          className="p-3 bg-black/40 border border-white/10 rounded-lg"
                          dangerouslySetInnerHTML={{ __html: block.content.leftCol || '' }}
                        />
                        <div
                          className="p-3 bg-black/40 border border-white/10 rounded-lg"
                          dangerouslySetInnerHTML={{ __html: block.content.rightCol || '' }}
                        />
                      </div>
                    )}

                    {/* Divider Render */}
                    {block.type === 'divider' && <hr className="border-t border-white/10 my-2" />}

                    {/* Footer Render */}
                    {block.type === 'footer' && (
                      <div
                        style={{ textAlign: block.content.align || 'center' }}
                        className="text-[11px] text-white/50 border-t border-white/10 pt-3"
                        dangerouslySetInnerHTML={{ __html: block.content.text || '' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Toolbar: Component Property Inspector */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-[#0D0D0D] border border-white/10 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-serif font-bold text-white tracking-wider">
                Block Inspector
              </h3>

              {activeBlock ? (
                <div className="space-y-3 text-xs font-sans">
                  <div className="text-[11px] font-mono text-[#D4AF37] font-bold uppercase">
                    Element: {activeBlock.type}
                  </div>

                  {activeBlock.content.title !== undefined && (
                    <div>
                      <label className="text-white/80 block mb-1 font-medium">Header Title</label>
                      <input
                        type="text"
                        value={activeBlock.content.title}
                        onChange={(e) => updateSelectedBlock({ title: e.target.value })}
                        className="w-full bg-[#050505] border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  )}

                  {activeBlock.content.text !== undefined && (
                    <div>
                      <label className="text-white/80 block mb-1 font-medium">Content Text</label>
                      <textarea
                        rows={4}
                        value={activeBlock.content.text}
                        onChange={(e) => updateSelectedBlock({ text: e.target.value })}
                        className="w-full bg-[#050505] border border-white/15 rounded-lg p-2.5 text-xs text-white resize-none focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  )}

                  {activeBlock.content.buttonText !== undefined && (
                    <div>
                      <label className="text-white/80 block mb-1 font-medium">Button Label</label>
                      <input
                        type="text"
                        value={activeBlock.content.buttonText}
                        onChange={(e) => updateSelectedBlock({ buttonText: e.target.value })}
                        className="w-full bg-[#050505] border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  )}

                  {activeBlock.content.buttonUrl !== undefined && (
                    <div>
                      <label className="text-white/80 block mb-1 font-medium">Destination URL</label>
                      <input
                        type="text"
                        value={activeBlock.content.buttonUrl}
                        onChange={(e) => updateSelectedBlock({ buttonUrl: e.target.value })}
                        className="w-full bg-[#050505] border border-white/15 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  )}

                  {activeBlock.content.imageUrl !== undefined && (
                    <div>
                      <label className="text-white/80 block mb-1 font-medium">Image URL</label>
                      <input
                        type="text"
                        value={activeBlock.content.imageUrl}
                        onChange={(e) => updateSelectedBlock({ imageUrl: e.target.value })}
                        className="w-full bg-[#050505] border border-white/15 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  )}

                  {activeBlock.content.align !== undefined && (
                    <div>
                      <label className="text-white/80 block mb-1 font-medium">Alignment</label>
                      <select
                        value={activeBlock.content.align}
                        onChange={(e) => updateSelectedBlock({ align: e.target.value as any })}
                        className="w-full bg-[#050505] border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="left" className="bg-[#050505] text-white">Left</option>
                        <option value="center" className="bg-[#050505] text-white">Center</option>
                        <option value="right" className="bg-[#050505] text-white">Right</option>
                      </select>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-white/40">Select any block from the canvas to edit styles.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Raw HTML Source Mode with Split Live Preview */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-white/60 mb-1">
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                <Code className="w-4 h-4" /> HTML Code Editor
              </span>
              <span className="text-[11px] font-mono">Real-time sync</span>
            </div>
            <textarea
              value={rawHtml || '<!DOCTYPE html>\n<html>\n<head></head>\n<body style="font-family: sans-serif; background-color: #0d0d0d; color: #ffffff; padding: 24px;">\n  <h1 style="color: #D4AF37;">Welcome to AetherMail</h1>\n  <p>Hello {{first_name}}, this is your premium communication.</p>\n</body>\n</html>'}
              onChange={(e) => setHtml(e.target.value)}
              rows={24}
              className="w-full h-[540px] bg-black/80 border border-white/15 rounded-xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-[#D4AF37] custom-scrollbar"
              placeholder="Paste or write your raw HTML email markup here..."
            />
          </div>

          <div className="lg:col-span-6 bg-black/50 border border-white/10 rounded-2xl p-4 flex flex-col justify-start">
            <div className="flex items-center justify-between text-xs text-white/60 mb-3 px-1 font-mono">
              <span className="text-[#D4AF37] font-bold flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> Live Rendered Preview
              </span>
              <span className="text-[11px] text-white/40 font-mono">
                {previewDevice === 'mobile' ? 'Mobile Frame (360px)' : previewDevice === 'split' ? 'Desktop + Mobile' : 'Desktop (600px)'}
              </span>
            </div>

            {previewDevice === 'split' ? (
              <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[500px] custom-scrollbar">
                {/* Desktop HTML render */}
                <div className="bg-white text-black rounded-xl overflow-hidden shadow-lg border border-white/20">
                  <div className="bg-slate-100 text-slate-700 px-3 py-1.5 text-[10px] font-mono border-b flex items-center justify-between">
                    <span>Desktop Preview (600px)</span>
                    <span className="text-emerald-600 font-bold">Live</span>
                  </div>
                  <div
                    className="p-4 overflow-x-auto text-sm"
                    dangerouslySetInnerHTML={{ __html: rawHtml }}
                  />
                </div>

                {/* Mobile HTML render */}
                <div className="max-w-[340px] mx-auto w-full bg-white text-black rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700">
                  <div className="bg-slate-800 text-white px-3 py-1 text-[9px] font-mono text-center">
                    Mobile Responsive View
                  </div>
                  <div
                    className="p-3 overflow-x-auto text-xs"
                    dangerouslySetInnerHTML={{ __html: rawHtml }}
                  />
                </div>
              </div>
            ) : (
              <div className={`mx-auto w-full bg-white text-black rounded-xl overflow-hidden shadow-xl border border-white/20 ${previewDevice === 'mobile' ? 'max-w-[360px]' : 'max-w-[600px]'}`}>
                <div className="bg-slate-100 text-slate-700 px-3 py-1.5 text-[11px] font-mono border-b flex items-center justify-between">
                  <span>{previewDevice === 'mobile' ? 'Mobile View (360px)' : 'Desktop View (600px)'}</span>
                  <span className="text-emerald-600 font-bold">Rendered</span>
                </div>
                <div
                  className="p-5 max-h-[460px] overflow-y-auto custom-scrollbar"
                  dangerouslySetInnerHTML={{ __html: rawHtml }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
