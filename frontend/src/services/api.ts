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
  authHeaders() {
    const token = localStorage.getItem('aethermail_token');
    return token ? { Authorization: `Token ${token}` } : {};
  },

  async createCampaign(data: {
    name: string;
    sender: string;
    subject: string;
    bodyText?: string;
    bodyHtml?: string;
    scheduledAt?: string;
    recipients: { email: string; firstName?: string; lastName?: string }[];
  }) {
    const res = await fetch('/api/campaigns/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...api.authHeaders() },
      body: JSON.stringify({
        name: data.name,
        sender: data.sender,
        subject: data.subject,
        body_text: data.bodyText || '',
        body_html: data.bodyHtml || '',
        scheduled_at: data.scheduledAt || null,
        recipients: data.recipients.map((recipient) => ({
          email: recipient.email,
          first_name: recipient.firstName || '',
          last_name: recipient.lastName || '',
        })),
      }),
    });
    if (!res.ok) throw new Error('Failed to create campaign');
    return await res.json();
  },

  async dispatchCampaign(campaignId: number) {
    const res = await fetch(`/api/campaigns/${campaignId}/dispatch/`, { method: 'POST', headers: api.authHeaders() });
    if (!res.ok) throw new Error('Failed to dispatch campaign');
    return await res.json();
  },

  async uploadMedia(file: File, name?: string) {
    const form = new FormData();
    form.append('file', file);
    if (name) form.append('name', name);
    const res = await fetch('/api/media/', { method: 'POST', headers: api.authHeaders(), body: form });
    if (!res.ok) throw new Error('Failed to upload media');
    return await res.json();
  },

  async getContacts() {
    const res = await fetch('/api/contacts/', { headers: api.authHeaders() });
    if (!res.ok) throw new Error('Failed to load contacts');
    return await res.json();
  },

  async getDomains() {
    const res = await fetch('/api/domains/', { headers: api.authHeaders() });
    if (!res.ok) throw new Error('Failed to load domains');
    return await res.json();
  },

  async verifyDomain(domainId: string, token: string) {
    const res = await fetch(`/api/domains/${Number(domainId)}/verify/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...api.authHeaders() },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) throw new Error('Domain verification failed');
    return await res.json();
  },

  async getDomainHealth(domainId: string) {
    const res = await fetch(`/api/domains/${Number(domainId)}/health/`, { headers: api.authHeaders() });
    if (!res.ok) throw new Error('Failed to load domain health');
    return await res.json();
  },

  async getMessages() {
    const res = await fetch('/api/messages/', { headers: api.authHeaders() });
    if (!res.ok) throw new Error('Failed to load messages');
    return await res.json();
  },

  async getMailboxes() {
    const res = await fetch('/api/mailboxes/', { headers: api.authHeaders() });
    if (!res.ok) throw new Error('Failed to load mailboxes');
    return await res.json();
  },

  async sendMessage(data: { mailboxId: string; recipient: string; subject: string; bodyText: string; bodyHtml: string }) {
    const res = await fetch('/api/messages/send/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...api.authHeaders() },
      body: JSON.stringify({
        mailbox_id: Number(data.mailboxId), recipient: data.recipient, subject: data.subject,
        body_text: data.bodyText, body_html: data.bodyHtml,
      }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return await res.json();
  },

  async createMailbox(data: { domainId: string; localPart: string; password: string }) {
    const res = await fetch('/api/mailboxes/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...api.authHeaders() },
      body: JSON.stringify({ domain: Number(data.domainId), local_part: data.localPart, password: data.password }),
    });
    if (!res.ok) throw new Error('Failed to create mailbox');
    return await res.json();
  },

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
