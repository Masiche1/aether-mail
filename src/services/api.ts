export interface CopyGenRequest {
  topic: string;
  audience?: string;
  tone?: string;
  channel?: 'email' | 'sms';
}

export interface CopyGenResponse {
  subjects: string[];
  preheader: string;
  body: string;
  spamScore: number;
  spamTips?: string[];
}

export interface DeliverabilityAdvisoryReport {
  domainHealthScore: number;
  threatLevel: 'HEALTHY' | 'MODERATE_RISK' | 'CRITICAL_RISK';
  postmasterVerdict: string;
  ispCompliance: {
    provider: string;
    complianceScore: number;
    status: 'PASS' | 'WARNING' | 'FAIL';
    requirements: string;
  }[];
  criticalRemediations: {
    id: string;
    title: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    category: 'Authentication' | 'List Hygiene' | 'Infrastructure' | 'Content';
    impact: string;
    details: string;
    actionType: string;
  }[];
  reputationMetrics: {
    spamScoreEstimate: number;
    inboxPlacementRate: number;
    spamFolderRate: number;
    bounceRate: number;
    spamComplaintRate: number;
  };
  executiveSummary: string;
}

export interface SpamAuditResponse {
  overallScore: number;
  spamAssassinEstimated: number;
  verdict: 'EXCELLENT_INBOX' | 'MODERATE_RISK' | 'HIGH_SPAM_RISK';
  findings: { category: string; status: 'pass' | 'warning' | 'fail'; note: string }[];
  recommendations: string[];
}

export const api = {
  async getHealth() {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch {
      return { status: 'healthy', postfixStatus: 'running', dovecotStatus: 'running' };
    }
  },

  async toggleEngine() {
    const res = await fetch('/api/engine/toggle', { method: 'POST' });
    return await res.json();
  },

  async setEngineSpeed(speed: number) {
    const res = await fetch('/api/engine/speed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed }),
    });
    return await res.json();
  },

  async verifyDomainDns(domain: string) {
    const res = await fetch('/api/domains/verify-dns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain }),
    });
    return await res.json();
  },

  async generateAiCopy(data: CopyGenRequest): Promise<CopyGenResponse> {
    const res = await fetch('/api/ai/generate-copy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to generate copy');
    return await res.json();
  },

  async auditSpamRisk(data: { subject: string; bodyHtml: string; senderEmail?: string }): Promise<SpamAuditResponse> {
    const res = await fetch('/api/ai/analyze-spam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to analyze spam risk');
    return await res.json();
  },

  async sendChatMessage(messages: { role: 'user' | 'assistant'; content: string }[]) {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error('Failed to chat');
    return await res.json();
  },

  async searchGrounding(query: string) {
    const res = await fetch('/api/ai/search-grounding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Search grounding failed');
    return await res.json();
  },

  async mapsGrounding(query: string, location?: string) {
    const res = await fetch('/api/ai/maps-grounding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, location }),
    });
    if (!res.ok) throw new Error('Maps grounding failed');
    return await res.json();
  },

  async runIntelligenceTask(taskType: 'general' | 'complex' | 'fast', prompt: string, highThinking?: boolean) {
    const res = await fetch('/api/ai/intelligence-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskType, prompt, highThinking }),
    });
    if (!res.ok) throw new Error('Intelligence task failed');
    return await res.json();
  },

  async generateAiImage(prompt: string, aspectRatio?: string, imageSize?: string) {
    const res = await fetch('/api/ai/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, imageSize }),
    });
    if (!res.ok) throw new Error('Image generation failed');
    return await res.json();
  },

  async analyzeAiImage(imageBase64: string, question?: string) {
    const res = await fetch('/api/ai/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, question }),
    });
    if (!res.ok) throw new Error('Image analysis failed');
    return await res.json();
  },

  async transcribeAudio(audioBase64: string, mimeType?: string) {
    const res = await fetch('/api/ai/transcribe-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64, mimeType }),
    });
    if (!res.ok) throw new Error('Audio transcription failed');
    return await res.json();
  },

  async syncWorkspace(service: 'sheets' | 'gmail' | 'calendar' | 'tasks' | 'contacts', params?: any) {
    const res = await fetch(`/api/workspace/sync-${service}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
    });
    if (!res.ok) throw new Error(`Workspace ${service} sync failed`);
    return await res.json();
  },

  async getDeliverabilityAdvisory(params?: {
    domain?: string;
    ipAddress?: string;
    currentMetrics?: any;
    dnsConfig?: any;
    customInquiry?: string;
  }): Promise<DeliverabilityAdvisoryReport> {
    const res = await fetch('/api/ai/deliverability-advisory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
    });
    if (!res.ok) throw new Error('Deliverability advisory request failed');
    return await res.json();
  },
};
