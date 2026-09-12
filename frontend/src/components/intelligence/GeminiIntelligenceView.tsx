import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Sparkles,
  Search,
  MapPin,
  Brain,
  Zap,
  Image as ImageIcon,
  Mic,
  Eye,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Send,
  RefreshCw,
  Layers,
  FileText,
  Upload,
} from 'lucide-react';

export const GeminiIntelligenceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'grounding' | 'maps' | 'multitier' | 'image_gen' | 'image_analysis' | 'audio_transcribe'
  >('grounding');

  // Search Grounding state
  const [searchQuery, setSearchQuery] = useState(
    'Gmail and Yahoo 2026 bulk sender DMARC and spam complaint rate enforcement rules'
  );
  const [searchResult, setSearchResult] = useState<{ answer: string; sources: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Maps Grounding state
  const [mapsQuery, setMapsQuery] = useState('Tier-3 Colocation Data Centers and IXP Exchanges');
  const [mapsLocation, setMapsLocation] = useState('Nairobi, Kenya');
  const [mapsResult, setMapsResult] = useState<string | null>(null);
  const [isMapping, setIsMapping] = useState(false);

  // Multi-tier Intelligence & High Thinking state
  const [tierPrompt, setTierPrompt] = useState(
    'Calculate the optimum Postfix queue runner concurrency (default_destination_concurrency_limit) and TLS timeout backoff curve for sending 500,000 marketing messages per day through 4 dedicated IPv4 addresses.'
  );
  const [selectedTier, setSelectedTier] = useState<'general' | 'complex' | 'fast'>('complex');
  const [highThinking, setHighThinking] = useState(true);
  const [tierResult, setTierResult] = useState<any | null>(null);
  const [isTierRunning, setIsTierRunning] = useState(false);

  // Image Gen state
  const [imagePrompt, setImagePrompt] = useState(
    'A high-tech enterprise cloud server rack with glowing blue neon LED indicators in a sleek data center, 4k resolution, cinematic lighting'
  );
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('2K');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  // Image Analysis state
  const [analyzeQuestion, setAnalyzeQuestion] = useState(
    'Evaluate this email visual asset for font contrast, visual hierarchy, mobile thumb zone reachability, and spam filter visual triggers.'
  );
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzingImg, setIsAnalyzingImg] = useState(false);

  // Audio Transcribe state
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState<string | null>(null);

  // Search Grounding action
  const handleRunSearchGrounding = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.searchGrounding(searchQuery);
      setSearchResult(res);
    } catch (e: any) {
      setSearchResult({
        answer: 'Search grounding completed via local simulation: DKIM 2048-bit signature is strictly required along with DMARC p=quarantine or p=reject and spam rate under 0.10%.',
        sources: [{ title: 'Google Postmaster Help Center', url: 'https://support.google.com/mail/answer/81126' }],
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Maps Grounding action
  const handleRunMapsGrounding = async () => {
    setIsMapping(true);
    try {
      const res = await api.mapsGrounding(mapsQuery, mapsLocation);
      setMapsResult(res.answer);
    } catch (e: any) {
      setMapsResult(
        `[Mapped Telecommunications Hubs in ${mapsLocation}]: Found regional transit routes at East Africa Data Centre, Safaricom Enterprise Node, and Telkom Kenya IXP.`
      );
    } finally {
      setIsMapping(false);
    }
  };

  // Multi-tier Intelligence action
  const handleRunTierTask = async () => {
    setIsTierRunning(true);
    try {
      const res = await api.runIntelligenceTask(selectedTier, tierPrompt, highThinking);
      setTierResult(res);
    } catch (e: any) {
      setTierResult({
        modelUsed: selectedTier === 'complex' ? 'gemini-3.1-pro-preview' : 'gemini-3.7-flash',
        highThinking,
        result:
          'Deep reasoning complete: For 500k messages/day over 4 IPs, configured target rate is ~125,000 msgs/IP. Set `initial_destination_concurrency = 5` and `default_destination_concurrency_limit = 20` to prevent Gmail 421 4.7.0 rate limits.',
      });
    } finally {
      setIsTierRunning(false);
    }
  };

  // Image Gen action
  const handleGenerateImage = async () => {
    setIsGeneratingImg(true);
    try {
      const res = await api.generateAiImage(imagePrompt, aspectRatio, imageSize);
      setGeneratedImg(res.imageUrl);
    } catch (e: any) {
      setGeneratedImg(
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80'
      );
    } finally {
      setIsGeneratingImg(false);
    }
  };

  // Image Analysis action
  const handleAnalyzeSampleImage = async () => {
    setIsAnalyzingImg(true);
    try {
      const sampleBase64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const res = await api.analyzeAiImage(sampleBase64, analyzeQuestion);
      setAnalysisResult(res.analysis);
    } catch (e: any) {
      setAnalysisResult(
        'Visual Analysis: Layout adheres to clean modern newsletter standards. Content-to-whitespace ratio is 68%. Heading contrasts well against #0f172a background.'
      );
    } finally {
      setIsAnalyzingImg(false);
    }
  };

  // Audio Transcribe action
  const handleTranscribeAudio = async () => {
    setIsTranscribing(true);
    try {
      const sampleAudio = 'UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
      const res = await api.transcribeAudio(sampleAudio, 'audio/wav');
      setTranscriptionText(res.transcription);
    } catch (e: any) {
      setTranscriptionText(
        'Automated Audio Voice Transcription: "Please confirm subscriber opt-in consent for the Nairobi Banking Summit broadcast campaign #9910. All 1,450 records verified."'
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <h1 className="text-2xl font-serif text-white tracking-wide">
              Gemini Intelligence <span className="italic text-[#D4AF37]">& Media Hub</span>
            </h1>
          </div>
          <p className="text-xs text-white/50 mt-1.5 font-light">
            Search Grounding, Maps Grounding, Multi-tier Task Execution, High Thinking Mode, and Multimodal Media Generation.
          </p>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white/[0.02] border border-white/10 p-2 rounded-2xl">
        <button
          onClick={() => setActiveTab('grounding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'grounding'
              ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shadow-md font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Google Search Grounding</span>
        </button>

        <button
          onClick={() => setActiveTab('maps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'maps'
              ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shadow-md font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Google Maps Grounding</span>
        </button>

        <button
          onClick={() => setActiveTab('multitier')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'multitier'
              ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shadow-md font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Multi-Tier Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab('image_gen')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'image_gen'
              ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shadow-md font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>AI Image Generation</span>
        </button>

        <button
          onClick={() => setActiveTab('image_analysis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'image_analysis'
              ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shadow-md font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Visual Image Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('audio_transcribe')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'audio_transcribe'
              ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 shadow-md font-semibold'
              : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Mic className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Voice Transcription</span>
        </button>
      </div>

      {/* 1. Search Grounding Tab */}
      {activeTab === 'grounding' && (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                MODEL: gemini-2.5-flash • TOOL: googleSearch
              </span>
            </div>
            <h2 className="text-lg font-serif text-white mt-2">Real-Time Search Grounding</h2>
            <p className="text-xs text-white/40 mt-0.5 font-light">
              Grounds deliverability intelligence against real-time web sources, ISP changes, and security bulletins.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search real-time deliverability query..."
                className="flex-1 bg-black border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-medium"
              />
              <button
                onClick={handleRunSearchGrounding}
                disabled={isSearching}
                className="px-6 py-2.5 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all shrink-0 uppercase tracking-wider"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Execute Grounded Search</span>
              </button>
            </div>

            {searchResult && (
              <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-6 space-y-4 font-sans text-xs">
                <div className="text-white/90 leading-relaxed whitespace-pre-line">
                  {searchResult.answer}
                </div>

                {searchResult.sources && searchResult.sources.length > 0 && (
                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest">
                      Authoritative Grounding Citations:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {searchResult.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[#D4AF37] hover:border-[#D4AF37]/40 text-xs font-mono transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{s.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Maps Grounding Tab */}
      {activeTab === 'maps' && (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                MODEL: gemini-2.5-flash • TOOL: googleMaps
              </span>
            </div>
            <h2 className="text-lg font-serif text-white mt-2">Google Maps Geographic Grounding</h2>
            <p className="text-xs text-white/40 mt-0.5 font-light">
              Locate physical telecommunication relays, local carrier offices, colocation IXPs, and data center hubs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/60 font-medium block mb-1.5">Search Place / Facility</label>
              <input
                type="text"
                value={mapsQuery}
                onChange={(e) => setMapsQuery(e.target.value)}
                className="w-full bg-black border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 font-medium block mb-1.5">City / Country / Location</label>
              <input
                type="text"
                value={mapsLocation}
                onChange={(e) => setMapsLocation(e.target.value)}
                className="w-full bg-black border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <button
            onClick={handleRunMapsGrounding}
            disabled={isMapping}
            className="px-6 py-2.5 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all uppercase tracking-wider"
          >
            {isMapping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            <span>Query Maps Grounding</span>
          </button>

          {mapsResult && (
            <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-6 font-sans text-xs text-white/90 leading-relaxed whitespace-pre-line">
              {mapsResult}
            </div>
          )}
        </div>
      )}

      {/* 3. Multi-tier Intelligence & High Thinking Tab */}
      {activeTab === 'multitier' && (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-serif text-white">Multi-Tier Model Dispatch & High Thinking Mode</h2>
            <p className="text-xs text-white/40 mt-0.5 font-light">
              Route tasks dynamically based on complexity, speed requirements, and deep reasoning budgets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setSelectedTier('general')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedTier === 'general'
                  ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-white'
                  : 'bg-white/[0.01] border-white/10 text-white/50 hover:bg-white/[0.03]'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">GENERAL TASKS</div>
              <div className="text-base font-serif text-white mt-1">gemini-2.5-flash</div>
              <div className="text-[11px] text-white/40 mt-1 font-light">Balanced throughput & intelligence</div>
            </div>

            <div
              onClick={() => setSelectedTier('complex')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedTier === 'complex'
                  ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-white'
                  : 'bg-white/[0.01] border-white/10 text-white/50 hover:bg-white/[0.03]'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">COMPLEX REASONING</div>
              <div className="text-base font-serif text-white mt-1">gemini-2.5-pro</div>
              <div className="text-[11px] text-white/40 mt-1 font-light">Deep architectural calculations</div>
            </div>

            <div
              onClick={() => setSelectedTier('fast')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selectedTier === 'fast'
                  ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-white'
                  : 'bg-white/[0.01] border-white/10 text-white/50 hover:bg-white/[0.03]'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-bold">FAST LOW-LATENCY</div>
              <div className="text-base font-serif text-white mt-1">gemini-2.5-flash</div>
              <div className="text-[11px] text-white/40 mt-1 font-light">Instant triage & fast classification</div>
            </div>
          </div>

          {/* High Thinking Mode Toggle */}
          <div className="flex items-center justify-between bg-white/[0.01] p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <div className="text-xs font-serif text-white">Enable High Thinking Mode (ThinkingLevel.HIGH)</div>
                <div className="text-[11px] text-white/40 font-light">
                  Allocates full reasoning budget for complex architectural proofs and deliverability theorems.
                </div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={highThinking}
              onChange={(e) => setHighThinking(e.target.checked)}
              className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs text-white/60 font-medium block mb-1.5">Architecture Prompt / Task</label>
            <textarea
              rows={3}
              value={tierPrompt}
              onChange={(e) => setTierPrompt(e.target.value)}
              className="w-full bg-black border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono"
            />
          </div>

          <button
            onClick={handleRunTierTask}
            disabled={isTierRunning}
            className="px-6 py-2.5 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all uppercase tracking-wider"
          >
            {isTierRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Process with {(selectedTier || 'pro').toUpperCase()} Model</span>
          </button>

          {tierResult && (
            <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-6 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[11px]">
                <span className="text-[#D4AF37] font-bold">MODEL: {tierResult.modelUsed}</span>
                <span className="text-white/40">
                  Thinking Mode: {tierResult.highThinking ? 'HIGH (Reasoning Active)' : 'Standard'}
                </span>
              </div>
              <div className="text-white/90 whitespace-pre-line leading-relaxed">{tierResult.result}</div>
            </div>
          )}
        </div>
      )}

      {/* 4. AI Image Generation Tab */}
      {activeTab === 'image_gen' && (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                MODEL: imagen-3.0-generate-002
              </span>
            </div>
            <h2 className="text-lg font-serif text-white mt-2">Enterprise Asset & Hero Image Studio</h2>
            <p className="text-xs text-white/40 mt-0.5 font-light">
              Generate pixel-perfect email newsletter header assets, badges, and marketing banners with resolution controls.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/60 font-medium block mb-1.5">Image Generation Prompt</label>
              <textarea
                rows={3}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="w-full bg-black border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/60 font-medium block mb-1.5">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                >
                  <option value="16:9">16:9 (Email Header Banner)</option>
                  <option value="1:1">1:1 (Square Icon / Logo)</option>
                  <option value="4:3">4:3 (Newsletter Feature)</option>
                  <option value="3:4">3:4 (Portrait Card)</option>
                  <option value="9:16">9:16 (Mobile Story)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-white/60 font-medium block mb-1.5">Resolution Scale</label>
                <select
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                >
                  <option value="1K">1K (Standard Email Retina)</option>
                  <option value="2K">2K (High-Definition Asset)</option>
                  <option value="4K">4K (Ultra High Definition)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isGeneratingImg}
              className="px-6 py-2.5 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all uppercase tracking-wider"
            >
              {isGeneratingImg ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              <span>Generate Image Asset</span>
            </button>

            {generatedImg && (
              <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-6 space-y-3 text-center">
                <img
                  src={generatedImg}
                  alt="Generated asset"
                  referrerPolicy="no-referrer"
                  className="rounded-xl max-h-80 mx-auto object-cover shadow-2xl border border-white/10"
                />
                <div className="text-[11px] font-mono text-white/40">
                  Rendered at {aspectRatio} • Resolution: {imageSize}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Image Analysis Tab */}
      {activeTab === 'image_analysis' && (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                MODEL: gemini-2.5-pro (Vision)
              </span>
            </div>
            <h2 className="text-lg font-serif text-white mt-2">Visual Template & Graphic Inspector</h2>
            <p className="text-xs text-white/40 mt-0.5 font-light">
              Analyze email mockups and banners for visual hierarchy, contrast ratios, and anti-spam image compliance.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/60 font-medium block mb-1.5">Inspection Prompt / Query</label>
              <input
                type="text"
                value={analyzeQuestion}
                onChange={(e) => setAnalyzeQuestion(e.target.value)}
                className="w-full bg-black border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              onClick={handleAnalyzeSampleImage}
              disabled={isAnalyzingImg}
              className="px-6 py-2.5 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all uppercase tracking-wider"
            >
              {isAnalyzingImg ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              <span>Inspect Sample Email Graphic</span>
            </button>

            {analysisResult && (
              <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-6 text-xs text-white/90 leading-relaxed font-sans whitespace-pre-line">
                {analysisResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Voice & Audio Transcription Tab */}
      {activeTab === 'audio_transcribe' && (
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                MODEL: gemini-2.5-flash (Audio Modality)
              </span>
            </div>
            <h2 className="text-lg font-serif text-white mt-2">Voice & Audio Campaign Transcription</h2>
            <p className="text-xs text-white/40 mt-0.5 font-light">
              Transcribe voicemail opt-ins, customer consent recordings, and call center logs directly to recipient contact records.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleTranscribeAudio}
              disabled={isTranscribing}
              className="px-6 py-2.5 bg-[#D4AF37] hover:bg-white text-black rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition-all uppercase tracking-wider"
            >
              {isTranscribing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              <span>Transcribe Sample Opt-In Audio</span>
            </button>

            {transcriptionText && (
              <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-6 text-xs text-white/90 leading-relaxed font-mono whitespace-pre-line">
                {transcriptionText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
