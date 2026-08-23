import { BounceNotification, Contact, SuppressionEntry } from '../types';

export const INITIAL_BOUNCE_FEED: BounceNotification[] = [
  {
    id: 'bnc_001',
    email: 'unknown.recipient@bad-address.io',
    campaignId: 'cmp_002',
    campaignName: 'East Africa Tech Summit 2026 VIP Pass',
    bounceType: 'hard',
    bounceCategory: 'mailbox_unknown',
    smtpCode: '550',
    enhancedCode: '5.1.1',
    rawDsn: '550 5.1.1 <unknown.recipient@bad-address.io>: Recipient address rejected: User unknown in virtual mailbox table',
    recipientMx: 'mail.bad-address.io (198.51.100.22)',
    consecutiveCount: 1,
    autoSuppressed: true,
    timestamp: '2026-08-20T08:33:04Z',
    diagnosticDetails: 'Permanent hard bounce. Mailbox does not exist on remote mail server. Auto-suppressed to protect sender reputation.',
  },
  {
    id: 'bnc_002',
    email: 'cto@busy-corporate-server.tz',
    campaignId: 'cmp_002',
    campaignName: 'East Africa Tech Summit 2026 VIP Pass',
    bounceType: 'soft',
    bounceCategory: 'rate_limited',
    smtpCode: '421',
    enhancedCode: '4.7.0',
    rawDsn: '421 4.7.0 [196.201.214.15] Connection rate limit exceeded from your IP. Try again in 300 seconds.',
    recipientMx: 'mx01.busy-corporate-server.tz (102.134.12.8)',
    consecutiveCount: 2,
    autoSuppressed: false,
    timestamp: '2026-08-20T08:32:04Z',
    diagnosticDetails: 'Transient soft bounce. Remote server is greylisting or rate-limiting inbound SMTP threads. Auto-retry scheduled with backoff.',
  },
  {
    id: 'bnc_003',
    email: 'overquota.account@cloud-storage.ke',
    campaignId: 'cmp_001',
    campaignName: 'Enterprise Cloud Infrastructure Security Update',
    bounceType: 'soft',
    bounceCategory: 'mailbox_full',
    smtpCode: '452',
    enhancedCode: '4.2.2',
    rawDsn: '452 4.2.2 Mailbox is full / quota exceeded (storage limit 15360MB)',
    recipientMx: 'mailstore.cloud-storage.ke (102.134.44.19)',
    consecutiveCount: 1,
    autoSuppressed: false,
    timestamp: '2026-08-19T14:12:30Z',
    diagnosticDetails: 'Transient soft bounce. Recipient storage limit exceeded. Contact kept active, retry in 12 hours.',
  },
  {
    id: 'bnc_004',
    email: 'policy-reject@finance-secure.co.ke',
    campaignId: 'cmp_001',
    campaignName: 'Enterprise Cloud Infrastructure Security Update',
    bounceType: 'hard',
    bounceCategory: 'dmarc_spf_failed',
    smtpCode: '550',
    enhancedCode: '5.7.26',
    rawDsn: '550 5.7.26 Unauthenticated email from sending domain is not accepted due to DMARC policy. (p=reject)',
    recipientMx: 'inbound-smtp.finance-secure.co.ke (41.89.20.10)',
    consecutiveCount: 1,
    autoSuppressed: true,
    timestamp: '2026-08-18T10:05:12Z',
    diagnosticDetails: 'Permanent hard bounce. DMARC/SPF authentication mismatch. Suppressed immediately to prevent further policy violations.',
  },
  {
    id: 'bnc_005',
    email: 'spam-blocked@security-gateway.com',
    campaignId: 'cmp_001',
    campaignName: 'Enterprise Cloud Infrastructure Security Update',
    bounceType: 'hard',
    bounceCategory: 'content_blocked',
    smtpCode: '554',
    enhancedCode: '5.7.1',
    rawDsn: '554 5.7.1 Spamhaus ZEN / Barracuda reputation score below threshold: Message rejected as spam',
    recipientMx: 'gateway.security-gateway.com (198.51.100.77)',
    consecutiveCount: 1,
    autoSuppressed: true,
    timestamp: '2026-08-17T11:45:00Z',
    diagnosticDetails: 'Permanent hard bounce. Remote anti-spam filter rejected message payload.',
  },
];

export const BOUNCE_PRESET_PAYLOADS = [
  {
    label: 'Google Workspace: 550 5.1.1 User Unknown (Hard Bounce)',
    smtpCode: '550',
    enhancedCode: '5.1.1',
    type: 'hard' as const,
    category: 'mailbox_unknown' as const,
    rawDsn: '550-5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient\'s email address for typos or unnecessary spaces. Learn more at https://support.google.com/mail/?p=NoSuchUser 1740009923 mx.google.com/smtp/v1',
    recipientMx: 'gmail-smtp-in.l.google.com (142.250.150.27)',
  },
  {
    label: 'Yahoo Mail: 421 4.7.0 Rate Limit / Greylisting (Soft Bounce)',
    smtpCode: '421',
    enhancedCode: '4.7.0',
    type: 'soft' as const,
    category: 'rate_limited' as const,
    rawDsn: '421 4.7.0 [TSS04] Messages from 196.201.214.15 temporarily deferred due to unexpected volume spikes. Please try again later.',
    recipientMx: 'mta5.am0.yahoodns.net (67.195.228.106)',
  },
  {
    label: 'Microsoft 365: 452 4.2.2 Mailbox Quota Full (Soft Bounce)',
    smtpCode: '452',
    enhancedCode: '4.2.2',
    type: 'soft' as const,
    category: 'mailbox_full' as const,
    rawDsn: '452 4.2.2 The recipient\'s mailbox is full and cannot accept messages now. Please try resending your message later, or contact the recipient directly. [MN2PEPF000045A9.namprd02.prod.outlook.com]',
    recipientMx: 'outlook-com.olc.protection.outlook.com (104.47.14.33)',
  },
  {
    label: 'Strict DMARC Policy Reject: 550 5.7.26 (Hard Bounce)',
    smtpCode: '550',
    enhancedCode: '5.7.26',
    type: 'hard' as const,
    category: 'dmarc_spf_failed' as const,
    rawDsn: '550 5.7.26 Unauthenticated email from domain is not accepted due to domain\'s DMARC policy. Please visit https://support.google.com/mail/answer/81126 for authentication guidelines.',
    recipientMx: 'aspmx.l.google.com (142.250.150.26)',
  },
  {
    label: 'Corporate Spam Filter: 554 5.7.1 Content Rejected (Hard Bounce)',
    smtpCode: '554',
    enhancedCode: '5.7.1',
    type: 'hard' as const,
    category: 'content_blocked' as const,
    rawDsn: '554 5.7.1 Relay access denied or rejected by high spam threat heuristic analysis (Cisco IronPort Anti-Spam)',
    recipientMx: 'ironport.corporate-edge.com (198.51.100.99)',
  },
];

export interface ProcessBounceResult {
  bounceNotification: BounceNotification;
  suppressionEntryCreated?: SuppressionEntry;
  contactUpdated?: boolean;
}

/**
 * Parses raw DSN / SMTP response strings, classifies bounce category & hard/soft status,
 * and produces auto-suppression instructions according to RFC 3464 and deliverability best practices.
 */
export function classifyBounce(
  email: string,
  rawDsnOrResponse: string,
  options?: {
    campaignId?: string;
    campaignName?: string;
    recipientMx?: string;
    currentConsecutiveCount?: number;
  }
): ProcessBounceResult {
  const dsn = (rawDsnOrResponse || '').trim();
  const lowerDsn = dsn.toLowerCase();

  // Extract SMTP 3-digit status code (e.g. 550, 421, 452, 554)
  const codeMatch = dsn.match(/\b([45]\d{2})\b/);
  const smtpCode = codeMatch ? codeMatch[1] : lowerDsn.startsWith('4') ? '450' : '550';

  // Extract Enhanced status code (e.g. 5.1.1, 4.7.0, 4.2.2, 5.7.26)
  const enhancedMatch = dsn.match(/\b([45]\.[0-7]\.\d{1,3})\b/);
  const enhancedCode = enhancedMatch ? enhancedMatch[1] : smtpCode.startsWith('4') ? '4.0.0' : '5.0.0';

  const isHard = smtpCode.startsWith('5') || ['5.1.1', '5.1.2', '5.7.1', '5.7.26'].includes(enhancedCode);
  const bounceType: 'hard' | 'soft' = isHard ? 'hard' : 'soft';

  let bounceCategory: BounceNotification['bounceCategory'] = 'other';

  if (
    lowerDsn.includes('user unknown') ||
    lowerDsn.includes('no such user') ||
    lowerDsn.includes('does not exist') ||
    lowerDsn.includes('invalid recipient') ||
    enhancedCode === '5.1.1'
  ) {
    bounceCategory = 'mailbox_unknown';
  } else if (
    lowerDsn.includes('domain not found') ||
    lowerDsn.includes('host unknown') ||
    lowerDsn.includes('nxdomain') ||
    enhancedCode === '5.1.2'
  ) {
    bounceCategory = 'domain_unknown';
  } else if (
    lowerDsn.includes('mailbox is full') ||
    lowerDsn.includes('quota exceeded') ||
    lowerDsn.includes('storage limit') ||
    enhancedCode === '4.2.2' ||
    enhancedCode === '5.2.2'
  ) {
    bounceCategory = 'mailbox_full';
  } else if (
    lowerDsn.includes('rate limit') ||
    lowerDsn.includes('greylist') ||
    lowerDsn.includes('server busy') ||
    lowerDsn.includes('too many connections') ||
    enhancedCode === '4.7.0' ||
    smtpCode === '421'
  ) {
    bounceCategory = 'rate_limited';
  } else if (
    lowerDsn.includes('dmarc') ||
    lowerDsn.includes('spf') ||
    lowerDsn.includes('dkim') ||
    lowerDsn.includes('unauthenticated') ||
    enhancedCode === '5.7.26'
  ) {
    bounceCategory = 'dmarc_spf_failed';
  } else if (
    lowerDsn.includes('spam') ||
    lowerDsn.includes('reputation') ||
    lowerDsn.includes('blocked') ||
    lowerDsn.includes('blacklisted') ||
    enhancedCode === '5.7.1' ||
    smtpCode === '554'
  ) {
    bounceCategory = 'content_blocked';
  } else if (lowerDsn.includes('relay') || lowerDsn.includes('access denied')) {
    bounceCategory = 'relay_denied';
  }

  const consecutiveCount = (options?.currentConsecutiveCount || 0) + 1;
  const shouldAutoSuppress = isHard || consecutiveCount >= 3;

  const bounceNotification: BounceNotification = {
    id: `bnc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email,
    campaignId: options?.campaignId || 'cmp_manual',
    campaignName: options?.campaignName || 'System Ingested DSN Notice',
    bounceType,
    bounceCategory,
    smtpCode,
    enhancedCode,
    rawDsn: dsn || `${smtpCode} ${enhancedCode} Mail delivery failure`,
    recipientMx: options?.recipientMx || 'mx.remote-destination.net',
    consecutiveCount,
    autoSuppressed: shouldAutoSuppress,
    timestamp: new Date().toISOString(),
    diagnosticDetails: isHard
      ? `Permanent hard bounce (${smtpCode} ${enhancedCode} - ${bounceCategory}). Contact immediately suppressed.`
      : `Transient soft bounce (${smtpCode} ${enhancedCode} - ${bounceCategory}). Failure count: ${consecutiveCount}/3.`,
  };

  let suppressionEntryCreated: SuppressionEntry | undefined;
  if (shouldAutoSuppress) {
    suppressionEntryCreated = {
      id: `sup_${Date.now()}`,
      email,
      reason: isHard ? 'bounce_hard' : 'bounce_soft',
      source: `Automated Bounce Handler (${smtpCode} ${enhancedCode})`,
      createdAt: new Date().toISOString(),
      details: dsn,
    };
  }

  return {
    bounceNotification,
    suppressionEntryCreated,
    contactUpdated: true,
  };
}
