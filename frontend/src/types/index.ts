export type NavigationTab =
  | 'dashboard'
  | 'campaigns'
  | 'sms-campaigns'
  | 'automation'
  | 'templates'
  | 'contacts'
  | 'lists'
  | 'segments'
  | 'suppressions'
  | 'domains'
  | 'mailboxes'
  | 'webmail'
  | 'queue'
  | 'delivery-status'
  | 'diagnostics'
  | 'deliverability'
  | 'sms-gateways'
  | 'shortlinks'
  | 'media'
  | 'analytics'
  | 'settings'
  | 'audit-logs'
  | 'ai-assistant'
  | 'workspace'
  | 'intelligence';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  defaultSenderId: string;
  createdAt: string;
  warmupMode: boolean;
  maxHourlyRate: number;
}

export interface Contact {
  id: string;
  organizationId: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  company?: string;
  city?: string;
  country?: string;
  status: 'active' | 'unsubscribed' | 'bounced' | 'complained' | 'suppressed';
  lists: string[]; // List IDs
  tags: string[];
  engagementScore: number; // 0-100
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  lastOpenedAt?: string;
  lastClickedAt?: string;
  createdAt: string;
  customFields?: Record<string, string>;
}

export interface ContactList {
  id: string;
  name: string;
  description: string;
  contactCount: number;
  activeCount: number;
  bouncedCount: number;
  tags: string[];
  createdAt: string;
}

export interface SegmentRule {
  field: 'country' | 'status' | 'engagementScore' | 'totalOpens' | 'totalClicks' | 'tag' | 'company' | 'listId';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: string;
}

export interface Segment {
  id: string;
  name: string;
  description: string;
  rules: SegmentRule[];
  matchType: 'all' | 'any';
  estimatedCount: number;
  createdAt: string;
}

export interface DnsRecord {
  type: string;
  host: string;
  value: string;
  status: 'pass' | 'fail' | 'pending' | 'warning';
}

export interface SendingDomain {
  id: string;
  organizationId?: string;
  domain: string;
  status: 'verified' | 'pending' | 'failed' | 'warning';
  spfStatus?: 'pass' | 'fail' | 'missing';
  dkimStatus?: 'pass' | 'fail' | 'missing';
  dmarcStatus?: 'pass' | 'fail' | 'missing';
  mxStatus?: 'pass' | 'fail' | 'missing';
  rdnsStatus?: 'pass' | 'fail' | 'missing';
  verificationToken?: string;
  reputationScore: number; // 0-100
  dailyQuota?: number;
  sentToday?: number;
  createdAt: string;
  dkimSelector?: string;
  dkimPublicKey?: string;
  spfRecord?: string;
  dmarcRecord?: string;
  mxRecord?: string;
  customReturnPath?: string;
  isVerified?: boolean;
  dnsRecords?: DnsRecord[];
}

export interface SenderIdentity {
  id: string;
  domainId: string;
  displayName: string;
  email: string;
  replyTo?: string;
  isDefault: boolean;
}

export interface Mailbox {
  id: string;
  domainId: string;
  email: string;
  displayName: string;
  status: 'active' | 'suspended' | 'maintenance';
  quotaBytes: number;
  usedBytes: number;
  aliases: string[];
  messageCount: number;
  unreadCount: number;
  autoResponderEnabled: boolean;
  autoResponderMessage?: string;
  lastLoginAt: string;
}

export interface EmailMessage {
  id: string;
  mailboxId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  bodyHtml: string;
  bodyText: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash' | 'spam' | 'replies';
  campaignId?: string;
  contactId?: string;
  isRead: boolean;
  isStarred: boolean;
  receivedAt: string;
  hasAttachments: boolean;
  headers?: Record<string, string>;
}

export interface CampaignBlock {
  id: string;
  type: 'header' | 'paragraph' | 'image' | 'button' | 'columns' | 'divider' | 'signature' | 'footer' | 'html';
  content: {
    title?: string;
    text?: string;
    imageUrl?: string;
    buttonText?: string;
    buttonUrl?: string;
    align?: 'left' | 'center' | 'right';
    bgColor?: string;
    textColor?: string;
    columnsCount?: 2 | 3;
    leftCol?: string;
    rightCol?: string;
    rawHtml?: string;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  previewText?: string;
  blocks: CampaignBlock[];
  rawHtml?: string;
  editorMode: 'visual' | 'html';
  thumbnailUrl?: string;
  updatedAt: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  senderName: string;
  senderEmail: string;
  domainId: string;
  targetType: 'list' | 'segment' | 'all';
  targetId: string;
  targetName: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused' | 'failed';
  templateId?: string;
  blocks: CampaignBlock[];
  rawHtml?: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  stats: {
    totalRecipients: number;
    queued: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    complaints: number;
    unsubscribed: number;
    replies: number;
  };
  sendingSpeedPerHour: number;
  createdAt: string;
}

export interface SmsCampaign {
  id: string;
  name: string;
  senderId: string;
  gatewayId: string;
  targetId: string;
  targetName: string;
  messageText: string;
  segmentCount: number; // 1-3 SMS segments
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  scheduledAt?: string;
  stats: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    failed: number;
    clicked: number;
  };
  createdAt: string;
}

export interface QueueJob {
  id: string;
  campaignId: string;
  campaignName: string;
  channel: 'email' | 'sms';
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName: string;
  status: 'queued' | 'sending' | 'delivered' | 'retry' | 'bounced' | 'failed' | 'suppressed';
  priority: 'high' | 'normal' | 'low';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  scheduledTime: string;
  sentTime?: string;
  deliveredTime?: string;
  smtpResponse?: string;
  events: {
    timestamp: string;
    event: string;
    details: string;
  }[];
}

export interface AutomationNode {
  id: string;
  type: 'trigger' | 'action_email' | 'action_sms' | 'delay' | 'condition' | 'action_tag';
  title: string;
  description: string;
  config: Record<string, any>;
  yesBranchId?: string;
  noBranchId?: string;
  nextId?: string;
}

export interface AutomationStep {
  id: string;
  type: 'delay' | 'send_email' | 'send_sms' | 'condition' | 'add_tag';
  delayHours?: number;
  emailSubject?: string;
  emailTemplateId?: string;
  smsMessage?: string;
  conditionField?: string;
  conditionValue?: string;
  yesStepId?: string;
  noStepId?: string;
  tagToAdd?: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  isActive?: boolean;
  status?: 'active' | 'paused' | 'draft';
  trigger?: 'contact_added' | 'tag_applied' | 'campaign_opened' | 'link_clicked' | 'custom_api';
  enrolledCount?: number;
  completedCount?: number;
  totalEnrolled?: number;
  totalCompleted?: number;
  nodes?: AutomationNode[];
  steps?: AutomationStep[];
  createdAt: string;
}

export interface DeliverabilityHealth {
  overallScore: number;
  domainScore: number;
  ipScore: number;
  bounceScore: number;
  complaintScore: number;
  engagementScore: number;
  blacklistStatus: 'clean' | 'listed' | 'warning';
  activeIps: {
    ip: string;
    hostname: string;
    reputation: 'excellent' | 'good' | 'warmup' | 'throttled';
    currentVolumePerHour: number;
    maxVolumePerHour: number;
  }[];
  recentBounces: {
    id: string;
    email: string;
    type: 'hard' | 'soft' | 'policy' | 'spam';
    smtpCode: string;
    reason: string;
    timestamp: string;
  }[];
}

export interface ShortLink {
  id: string;
  shortCode: string;
  destinationUrl: string;
  domain: string;
  campaignId?: string;
  totalClicks: number;
  uniqueClicks: number;
  createdAt: string;
  recentClicks: {
    timestamp: string;
    ip: string;
    country: string;
    browser: string;
    device: 'desktop' | 'mobile' | 'tablet';
  }[];
}

export interface MediaAsset {
  id: string;
  name: string;
  fileType: 'image' | 'document' | 'logo';
  url: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface SmsGateway {
  id: string;
  name: string;
  type?: 'SMPP' | 'GSM_MODEM' | 'HTTP_REST';
  provider?: string;
  host?: string;
  port?: number;
  systemId?: string;
  apiKeyOrToken?: string;
  senderIds?: string[];
  costPerSmsUsd?: number;
  status: 'connected' | 'disconnected' | 'error' | 'active';
  creditsRemaining: number;
  sentTotal?: number;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}

export interface SystemSettingState {
  platformName: string;
  defaultTimezone: string;
  defaultCurrency: string;
  defaultFromEmail: string;
  defaultFromName: string;
  smtpHostname: string;
  smtpPort: number;
  postfixQueuePath: string;
  maxAttachmentSizeMb: number;
  autoThrottleOnBounceThreshold: number; // e.g. 2.5%
  autoPauseOnComplaintThreshold: number; // e.g. 0.08%
  warmupEnabled: boolean;
  suppressUnsubscribesGlobally: boolean;
  rspamdFilteringEnabled: boolean;
  clamAvScanEnabled: boolean;
  smppKeepAliveIntervalSec: number;
  theme?: 'dark' | 'light';
  highContrastMode?: boolean;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  actionLabel?: string;
  actionTab?: NavigationTab;
  onAction?: () => void;
  timestamp: string;
  autoCloseMs?: number;
}

export interface BounceNotification {
  id: string;
  email: string;
  campaignId?: string;
  campaignName?: string;
  bounceType: 'hard' | 'soft';
  bounceCategory:
    | 'mailbox_unknown'
    | 'domain_unknown'
    | 'mailbox_full'
    | 'rate_limited'
    | 'content_blocked'
    | 'dmarc_spf_failed'
    | 'relay_denied'
    | 'other';
  smtpCode: string;
  enhancedCode: string;
  rawDsn: string;
  recipientMx: string;
  consecutiveCount: number;
  autoSuppressed: boolean;
  timestamp: string;
  diagnosticDetails?: string;
}

export interface DomainDiagnosticResult {
  domain: string;
  checkedAt: string;
  overallScore: number;
  smtpCheck: {
    status: 'pass' | 'warning' | 'fail';
    host: string;
    port: number;
    latencyMs: number;
    tlsVersion: string;
    authSupported: boolean;
    banner: string;
    heloResponse: string;
    errors: string[];
  };
  dnsChecks: {
    mx: {
      status: 'pass' | 'warning' | 'fail';
      records: { priority: number; host: string; ip: string }[];
      details: string;
    };
    spf: {
      status: 'pass' | 'warning' | 'fail';
      rawRecord: string;
      includes: string[];
      ip4s: string[];
      lookupCount: number;
      isAligned: boolean;
      details: string;
    };
    dkim: {
      status: 'pass' | 'warning' | 'fail';
      selector: string;
      keyLengthBits: number;
      rawRecord: string;
      isAligned: boolean;
      details: string;
    };
    dmarc: {
      status: 'pass' | 'warning' | 'fail';
      policy: string;
      pct: number;
      rua: string;
      rawRecord: string;
      isAligned: boolean;
      details: string;
    };
    ptr: {
      status: 'pass' | 'warning' | 'fail';
      ip: string;
      hostname: string;
      isMatching: boolean;
      details: string;
    };
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    suggestedFix: string;
  }[];
}

export interface SmtpErrorCodeDefinition {
  code: string;
  enhancedCode: string;
  statusClass: '2xx_success' | '4xx_transient' | '5xx_permanent' | 'auth_error';
  name: string;
  category: 'DNS & Network' | 'Authentication' | 'Mailbox State' | 'Rate Limiting' | 'Spam & Policy' | 'Deliverability';
  description: string;
  typicalRootCause: string;
  recommendedAction: string;
}

export interface SuppressionEntry {
  id: string;
  email: string;
  reason: 'bounce_hard' | 'bounce_soft' | 'spam_complaint' | 'manual_admin' | 'unsubscribe';
  source: string;
  createdAt: string;
  details?: string;
}

export type WarmupPaceStrategy = 'conservative_45d' | 'balanced_30d' | 'aggressive_14d' | 'custom';

export interface IspWarmupAllocation {
  ispName: 'Gmail' | 'Microsoft 365' | 'Yahoo / AOL' | 'Apple iCloud' | 'Enterprise Other';
  percentage: number;
  dailyCap: number;
  currentSent: number;
  status: 'healthy' | 'warning' | 'throttled';
  reputationScore: number;
}

export interface WarmupDaySchedule {
  dayNumber: number;
  date: string;
  dailyLimit: number;
  hourlySpeedLimit: number;
  actualSent: number;
  deliverySuccessRate: number;
  bounceRate: number;
  complaintRate: number;
  status: 'completed' | 'active' | 'upcoming' | 'paused_safety';
  ispAllocations: {
    gmail: number;
    microsoft: number;
    yahoo: number;
    icloud: number;
    corporate: number;
  };
}

export interface AutomatedWarmupPlan {
  id: string;
  name: string;
  targetDomain: string;
  ipPoolId: string;
  ipAddresses: string[];
  strategy: WarmupPaceStrategy;
  totalDays: number;
  currentDay: number;
  startDate: string;
  targetDailyVolume: number;
  startingDailyVolume: number;
  autoThrottleOnBounce: boolean;
  maxBounceThresholdPercent: number;
  autoPauseOnSpam: boolean;
  status: 'running' | 'paused' | 'completed' | 'scheduled';
  schedule: WarmupDaySchedule[];
  overallReputationScore: number;
  createdAt: string;
  updatedAt: string;
}



