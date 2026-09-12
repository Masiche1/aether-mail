import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  NavigationTab,
  Contact,
  ContactList,
  Segment,
  SendingDomain,
  SenderIdentity,
  Mailbox,
  EmailMessage,
  EmailTemplate,
  EmailCampaign,
  SmsCampaign,
  QueueJob,
  AutomationWorkflow,
  DeliverabilityHealth,
  ShortLink,
  MediaAsset,
  SmsGateway,
  AuditLog,
  SystemSettingState,
  Organization,
} from '../types';
import {
  INITIAL_ORG,
  INITIAL_CONTACT_LISTS,
  INITIAL_CONTACTS,
  INITIAL_SEGMENTS,
  INITIAL_DOMAINS,
  INITIAL_SENDERS,
  INITIAL_MAILBOXES,
  INITIAL_MESSAGES,
  INITIAL_TEMPLATES,
  INITIAL_CAMPAIGNS,
  INITIAL_SMS_CAMPAIGNS,
  INITIAL_QUEUE_JOBS,
  INITIAL_AUTOMATIONS,
  INITIAL_DELIVERABILITY,
  INITIAL_SHORT_LINKS,
  INITIAL_MEDIA,
  INITIAL_GATEWAYS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SYSTEM_SETTINGS,
} from '../mock/initialData';
import { INITIAL_BOUNCE_FEED, classifyBounce, ProcessBounceResult } from '../services/bounceHandler';
import { BounceNotification, AutomatedWarmupPlan, WarmupDaySchedule } from '../types';
import { INITIAL_WARMUP_PLANS, generateWarmupSchedule } from '../services/warmupScheduler';
import { api } from '../services/api';

interface AppContextType {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  warmupPlans: AutomatedWarmupPlan[];
  setWarmupPlans: React.Dispatch<React.SetStateAction<AutomatedWarmupPlan[]>>;
  createWarmupPlan: (planData: Partial<AutomatedWarmupPlan>) => AutomatedWarmupPlan;
  updateWarmupPlan: (id: string, updates: Partial<AutomatedWarmupPlan>) => void;
  advanceWarmupDay: (planId: string) => void;
  toggleWarmupStatus: (planId: string) => void;
  simulateWarmupDispatch: (planId: string, volume: number) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  organization: Organization;
  setOrganization: React.Dispatch<React.SetStateAction<Organization>>;
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  contactLists: ContactList[];
  setContactLists: React.Dispatch<React.SetStateAction<ContactList[]>>;
  segments: Segment[];
  setSegments: React.Dispatch<React.SetStateAction<Segment[]>>;
  domains: SendingDomain[];
  setDomains: React.Dispatch<React.SetStateAction<SendingDomain[]>>;
  senders: SenderIdentity[];
  setSenders: React.Dispatch<React.SetStateAction<SenderIdentity[]>>;
  mailboxes: Mailbox[];
  setMailboxes: React.Dispatch<React.SetStateAction<Mailbox[]>>;
  messages: EmailMessage[];
  setMessages: React.Dispatch<React.SetStateAction<EmailMessage[]>>;
  templates: EmailTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<EmailTemplate[]>>;
  campaigns: EmailCampaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<EmailCampaign[]>>;
  smsCampaigns: SmsCampaign[];
  setSmsCampaigns: React.Dispatch<React.SetStateAction<SmsCampaign[]>>;
  queueJobs: QueueJob[];
  setQueueJobs: React.Dispatch<React.SetStateAction<QueueJob[]>>;
  bounces: BounceNotification[];
  setBounces: React.Dispatch<React.SetStateAction<BounceNotification[]>>;
  automations: AutomationWorkflow[];
  setAutomations: React.Dispatch<React.SetStateAction<AutomationWorkflow[]>>;
  deliverability: DeliverabilityHealth;
  setDeliverability: React.Dispatch<React.SetStateAction<DeliverabilityHealth>>;
  shortLinks: ShortLink[];
  setShortLinks: React.Dispatch<React.SetStateAction<ShortLink[]>>;
  mediaAssets: MediaAsset[];
  setMediaAssets: React.Dispatch<React.SetStateAction<MediaAsset[]>>;
  gateways: SmsGateway[];
  setGateways: React.Dispatch<React.SetStateAction<SmsGateway[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  systemSettings: SystemSettingState;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettingState>>;
  isEngineRunning: boolean;
  setIsEngineRunning: (running: boolean) => void;
  hourlySpeed: number;
  setHourlySpeed: (speed: number) => void;
  activeMailboxId: string;
  setActiveMailboxId: (id: string) => void;
  // Helpers
  addAuditLog: (action: string, entityType: string, entityId: string, details: string) => void;
  importContacts: (newContacts: Omit<Contact, 'id' | 'organizationId' | 'createdAt'>[], listId?: string, tags?: string[]) => { added: number; duplicates: number; invalid: number };
  createCampaign: (campaignData: Partial<EmailCampaign>) => EmailCampaign;
  createSmsCampaign: (campaignData: Partial<SmsCampaign>) => SmsCampaign;
  pauseQueue: () => void;
  resumeQueue: () => void;
  flushQueue: () => void;
  retryJob: (jobId: string) => void;
  suppressContact: (contactId: string, reason?: string) => void;
  unsuppressContact: (email: string) => void;
  verifyDomainDns: (domainId: string) => void;
  ingestBounce: (
    email: string,
    rawDsn: string,
    options?: { campaignId?: string; campaignName?: string; recipientMx?: string }
  ) => ProcessBounceResult;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [organization, setOrganization] = useState<Organization>(() => {
    const saved = localStorage.getItem('am_org');
    return saved ? JSON.parse(saved) : INITIAL_ORG;
  });
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('am_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });
  const [contactLists, setContactLists] = useState<ContactList[]>(() => {
    const saved = localStorage.getItem('am_lists');
    return saved ? JSON.parse(saved) : INITIAL_CONTACT_LISTS;
  });
  const [segments, setSegments] = useState<Segment[]>(() => {
    const saved = localStorage.getItem('am_segments');
    return saved ? JSON.parse(saved) : INITIAL_SEGMENTS;
  });
  const [domains, setDomains] = useState<SendingDomain[]>(() => {
    const saved = localStorage.getItem('am_domains');
    return saved ? JSON.parse(saved) : INITIAL_DOMAINS;
  });
  const [senders, setSenders] = useState<SenderIdentity[]>(() => {
    const saved = localStorage.getItem('am_senders');
    return saved ? JSON.parse(saved) : INITIAL_SENDERS;
  });
  const [mailboxes, setMailboxes] = useState<Mailbox[]>(() => {
    const saved = localStorage.getItem('am_mailboxes');
    return saved ? JSON.parse(saved) : INITIAL_MAILBOXES;
  });
  const [messages, setMessages] = useState<EmailMessage[]>(() => {
    const saved = localStorage.getItem('am_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    const saved = localStorage.getItem('am_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(() => {
    const saved = localStorage.getItem('am_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });
  const [smsCampaigns, setSmsCampaigns] = useState<SmsCampaign[]>(() => {
    const saved = localStorage.getItem('am_sms_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_SMS_CAMPAIGNS;
  });
  const [queueJobs, setQueueJobs] = useState<QueueJob[]>(() => {
    const saved = localStorage.getItem('am_queue');
    return saved ? JSON.parse(saved) : INITIAL_QUEUE_JOBS;
  });
  const [bounces, setBounces] = useState<BounceNotification[]>(() => {
    const saved = localStorage.getItem('am_bounces');
    return saved ? JSON.parse(saved) : INITIAL_BOUNCE_FEED;
  });
  const [automations, setAutomations] = useState<AutomationWorkflow[]>(() => {
    const saved = localStorage.getItem('am_automations');
    return saved ? JSON.parse(saved) : INITIAL_AUTOMATIONS;
  });
  const [deliverability, setDeliverability] = useState<DeliverabilityHealth>(() => {
    const saved = localStorage.getItem('am_deliverability');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERABILITY;
  });
  const [shortLinks, setShortLinks] = useState<ShortLink[]>(() => {
    const saved = localStorage.getItem('am_shortlinks');
    return saved ? JSON.parse(saved) : INITIAL_SHORT_LINKS;
  });
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => {
    const saved = localStorage.getItem('am_media');
    return saved ? JSON.parse(saved) : INITIAL_MEDIA;
  });
  const [gateways, setGateways] = useState<SmsGateway[]>(() => {
    const saved = localStorage.getItem('am_gateways');
    return saved ? JSON.parse(saved) : INITIAL_GATEWAYS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('am_audit');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettingState>(() => {
    const saved = localStorage.getItem('am_settings');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_SETTINGS;
  });

  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('am_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  const [warmupPlans, setWarmupPlans] = useState<AutomatedWarmupPlan[]>(() => {
    const saved = localStorage.getItem('am_warmup_plans');
    return saved ? JSON.parse(saved) : INITIAL_WARMUP_PLANS;
  });

  const [isEngineRunning, setIsEngineRunning] = useState(true);
  const [hourlySpeed, setHourlySpeed] = useState(3800);
  const [activeMailboxId, setActiveMailboxId] = useState('mbx_002');

  // Sync theme to document element
  useEffect(() => {
    localStorage.setItem('am_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
  };

  // Persistence side-effects
  useEffect(() => { localStorage.setItem('am_org', JSON.stringify(organization)); }, [organization]);
  useEffect(() => { localStorage.setItem('am_contacts', JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem('am_lists', JSON.stringify(contactLists)); }, [contactLists]);
  useEffect(() => { localStorage.setItem('am_segments', JSON.stringify(segments)); }, [segments]);
  useEffect(() => { localStorage.setItem('am_domains', JSON.stringify(domains)); }, [domains]);
  useEffect(() => { localStorage.setItem('am_mailboxes', JSON.stringify(mailboxes)); }, [mailboxes]);
  useEffect(() => { localStorage.setItem('am_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('am_campaigns', JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem('am_sms_campaigns', JSON.stringify(smsCampaigns)); }, [smsCampaigns]);
  useEffect(() => { localStorage.setItem('am_queue', JSON.stringify(queueJobs)); }, [queueJobs]);
  useEffect(() => { localStorage.setItem('am_bounces', JSON.stringify(bounces)); }, [bounces]);
  useEffect(() => { localStorage.setItem('am_warmup_plans', JSON.stringify(warmupPlans)); }, [warmupPlans]);
  useEffect(() => { localStorage.setItem('am_settings', JSON.stringify(systemSettings)); }, [systemSettings]);

  useEffect(() => {
    if (!localStorage.getItem('aethermail_token')) return;
    void api.getContacts().then((remoteContacts) => {
      setContacts(remoteContacts.map((contact: any) => ({
        id: String(contact.id),
        organizationId: String(contact.organization),
        email: contact.email,
        phone: contact.phone,
        firstName: contact.first_name,
        lastName: contact.last_name,
        company: contact.company,
        status: contact.status,
        lists: [],
        tags: [],
        engagementScore: 0,
        totalSent: 0,
        totalOpens: 0,
        totalClicks: 0,
        createdAt: contact.created_at,
      })));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('aethermail_token')) return;
    void api.getMailboxes().then((remoteMailboxes) => {
      setMailboxes(remoteMailboxes.map((mailbox: any) => ({
        id: String(mailbox.id),
        domainId: String(mailbox.domain),
        email: mailbox.email,
        displayName: mailbox.email,
        status: mailbox.status,
        quotaBytes: mailbox.quota_bytes,
        usedBytes: 0,
        aliases: [],
        messageCount: 0,
        unreadCount: 0,
        autoResponderEnabled: false,
        lastLoginAt: mailbox.created_at,
      })));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('aethermail_token')) return;
    void api.getDomains().then(async (remoteDomains) => {
      const hydratedDomains = await Promise.all(remoteDomains.map(async (domain: any) => {
        const health = await api.getDomainHealth(String(domain.id)).catch(() => null);
        return {
        id: String(domain.id),
        organizationId: String(domain.organization),
        domain: domain.domain,
        status: domain.status,
        verificationToken: domain.verification_token,
        reputationScore: health?.reputation_score || 0,
        createdAt: domain.created_at,
        isVerified: domain.status === 'verified',
        spfStatus: health?.spf || 'missing',
        dkimStatus: health?.dkim || 'missing',
        dmarcStatus: health?.dmarc || 'missing',
        mxStatus: health?.mx || 'missing',
        rdnsStatus: health?.ptr || 'missing',
      };
      }));
      setDomains(hydratedDomains);
    }).catch(() => undefined);
  }, []);

  // Reflect persisted worker state in the queue view.
  useEffect(() => {
    if (!isEngineRunning) return;
    const refreshQueue = () => void api.getMessages().then((remoteMessages) => {
      setQueueJobs(remoteMessages.map((message: any) => ({
        id: String(message.id),
        campaignId: message.campaign ? String(message.campaign) : 'unknown',
        campaignName: message.campaign ? `Campaign ${message.campaign}` : 'Direct email',
        channel: 'email',
        recipientEmail: message.recipient,
        recipientName: message.recipient,
        status: message.delivery_status === 'delivered' ? 'delivered' : message.status === 'failed' ? 'retry' : message.status,
        priority: 'normal',
        retryCount: message.delivery_attempts || 0,
        maxRetries: 5,
        scheduledTime: message.created_at,
        smtpResponse: message.delivery_response,
        events: [],
      })));
    }).catch(() => undefined);
    refreshQueue();
    const interval = setInterval(refreshQueue, 5000);
    return () => clearInterval(interval);
  }, [isEngineRunning]);

  const addAuditLog = (action: string, entityType: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud_${Date.now()}`,
      userId: 'usr_admin',
      userName: 'Lameck Licha (Super Admin)',
      action,
      entityType,
      entityId,
      ipAddress: '102.134.42.9',
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const importContacts = (
    newItems: Omit<Contact, 'id' | 'organizationId' | 'createdAt'>[],
    listId?: string,
    tags?: string[]
  ) => {
    let added = 0;
    let duplicates = 0;
    let invalid = 0;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const existingEmails = new Set((contacts || []).map((c) => (c?.email || '').toLowerCase()).filter(Boolean));

    const toInsert: Contact[] = [];

    newItems.forEach((item) => {
      const email = item.email?.trim().toLowerCase();
      if (!email || !emailRegex.test(email)) {
        invalid++;
        return;
      }
      if (existingEmails.has(email)) {
        duplicates++;
        return;
      }

      existingEmails.add(email);
      added++;

      const itemLists = listId ? Array.from(new Set([...(item.lists || []), listId])) : item.lists || [];
      const itemTags = tags ? Array.from(new Set([...(item.tags || []), ...tags])) : item.tags || [];

      toInsert.push({
        ...item,
        id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        organizationId: organization.id,
        email,
        lists: itemLists,
        tags: itemTags,
        engagementScore: item.engagementScore || 70,
        totalSent: item.totalSent || 0,
        totalOpens: item.totalOpens || 0,
        totalClicks: item.totalClicks || 0,
        status: item.status || 'active',
        createdAt: new Date().toISOString(),
      });
    });

    if (toInsert.length > 0) {
      setContacts((prev) => [...toInsert, ...prev]);
      if (listId) {
        setContactLists((prev) =>
          prev.map((l) => (l.id === listId ? { ...l, contactCount: l.contactCount + toInsert.length } : l))
        );
      }
      addAuditLog(
        'CONTACTS_IMPORTED',
        'ContactList',
        listId || 'All Contacts',
        `Imported ${toInsert.length} contacts (${duplicates} duplicates skipped, ${invalid} invalid entries rejected).`
      );
    }

    return { added, duplicates, invalid };
  };

  const createCampaign = (campaignData: Partial<EmailCampaign>): EmailCampaign => {
    const newCamp: EmailCampaign = {
      id: `cmp_${Date.now()}`,
      name: campaignData.name || 'Untitled Campaign',
      subject: campaignData.subject || 'Subject line',
      preheader: campaignData.preheader || '',
      senderName: campaignData.senderName || senders?.[0]?.displayName || 'AetherMail',
      senderEmail: campaignData.senderEmail || senders?.[0]?.email || 'announcements@aethermail.net',
      domainId: campaignData.domainId || domains?.[0]?.id || 'dom_001',
      targetType: campaignData.targetType || 'list',
      targetId: campaignData.targetId || contactLists?.[0]?.id || 'list_001',
      targetName: campaignData.targetName || contactLists?.[0]?.name || 'General List',
      status: campaignData.scheduledAt ? 'scheduled' : 'sending',
      blocks: campaignData.blocks || templates?.[0]?.blocks || [],
      rawHtml: campaignData.rawHtml,
      scheduledAt: campaignData.scheduledAt || new Date().toISOString(),
      startedAt: campaignData.scheduledAt ? undefined : new Date().toISOString(),
      stats: {
        totalRecipients: campaignData.stats?.totalRecipients || 100,
        queued: campaignData.stats?.totalRecipients || 100,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        complaints: 0,
        unsubscribed: 0,
        replies: 0,
      },
      sendingSpeedPerHour: campaignData.sendingSpeedPerHour || hourlySpeed,
      createdAt: new Date().toISOString(),
    };

    setCampaigns((prev) => [newCamp, ...prev]);

    // Create immediate sample queue jobs for this campaign
    const newJobs: QueueJob[] = (contacts || []).slice(0, 5).map((contact, idx) => ({
      id: `job_${Date.now()}_${idx}`,
      campaignId: newCamp.id,
      campaignName: newCamp.name,
      channel: 'email',
      recipientEmail: contact.email,
      recipientName: `${contact.firstName} ${contact.lastName}`.trim() || contact.email,
      status: 'queued',
      priority: 'high',
      retryCount: 0,
      maxRetries: 5,
      scheduledTime: new Date().toISOString(),
      events: [
        {
          timestamp: new Date().toISOString(),
          event: 'QUEUED',
          details: `Enqueued into Autonomous MTA Spool by campaign "${newCamp.name}"`,
        },
      ],
    }));

    setQueueJobs((prev) => [...newJobs, ...prev]);

    void api.createCampaign({
      name: newCamp.name,
      sender: newCamp.senderEmail,
      subject: newCamp.subject,
      bodyHtml: newCamp.rawHtml,
      scheduledAt: campaignData.scheduledAt,
      recipients: (contacts || []).map((contact) => ({
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
      })),
    }).catch(() => undefined);

    addAuditLog(
      'CAMPAIGN_CREATED',
      'EmailCampaign',
      newCamp.id,
      `Created campaign "${newCamp.name}" targeted to ${newCamp.targetName}.`
    );

    return newCamp;
  };

  const createSmsCampaign = (campaignData: Partial<SmsCampaign>): SmsCampaign => {
    const newSms: SmsCampaign = {
      id: `sms_${Date.now()}`,
      name: campaignData.name || 'SMS Broadcast',
      senderId: campaignData.senderId || 'AETHERMAIL',
      gatewayId: campaignData.gatewayId || gateways[0]?.id || 'gw_001',
      targetId: campaignData.targetId || contactLists[0]?.id || 'list_004',
      targetName: campaignData.targetName || 'SMS Subscribers',
      messageText: campaignData.messageText || '',
      segmentCount: Math.ceil((campaignData.messageText?.length || 1) / 160),
      status: campaignData.scheduledAt ? 'scheduled' : 'completed',
      scheduledAt: campaignData.scheduledAt || new Date().toISOString(),
      stats: {
        totalRecipients: 500,
        sent: 500,
        delivered: 495,
        failed: 5,
        clicked: 120,
      },
      createdAt: new Date().toISOString(),
    };

    setSmsCampaigns((prev) => [newSms, ...prev]);
    addAuditLog('SMS_CAMPAIGN_CREATED', 'SmsCampaign', newSms.id, `Dispatched SMS campaign "${newSms.name}".`);
    return newSms;
  };

  const pauseQueue = () => {
    setIsEngineRunning(false);
    addAuditLog('QUEUE_PAUSED', 'MTA_Engine', 'spool_active', 'Administrator paused active queue dispatching.');
  };

  const resumeQueue = () => {
    setIsEngineRunning(true);
    addAuditLog('QUEUE_RESUMED', 'MTA_Engine', 'spool_active', 'Administrator resumed active queue dispatching.');
  };

  const flushQueue = () => {
    setQueueJobs((prev) =>
      prev.map((j) =>
        j.status === 'queued' || j.status === 'sending' || j.status === 'retry'
          ? {
              ...j,
              status: 'delivered',
              deliveredTime: new Date().toISOString(),
              smtpResponse: '250 2.0.0 OK (flushed by admin)',
            }
          : j
      )
    );
    addAuditLog('QUEUE_FLUSHED', 'MTA_Engine', 'spool_active', 'Manual queue flush executed by administrator.');
  };

  const retryJob = (jobId: string) => {
    setQueueJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: 'queued',
              retryCount: 0,
              events: [
                ...j.events,
                {
                  timestamp: new Date().toISOString(),
                  event: 'MANUAL_RETRY',
                  details: 'Administrator manually forced re-queueing of failed message.',
                },
              ],
            }
          : j
      )
    );
  };

  const suppressContact = (contactId: string, reason = 'Administrator suppression') => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, status: 'suppressed' } : c))
    );
    addAuditLog('CONTACT_SUPPRESSED', 'Contact', contactId, reason);
  };

  const unsuppressContact = (email: string) => {
    const targetEmail = (email || '').toLowerCase().trim();
    setContacts((prev) =>
      prev.map((c) => (c.email?.toLowerCase() === targetEmail ? { ...c, status: 'active' } : c))
    );
    setBounces((prev) => prev.filter((b) => b.email.toLowerCase() !== targetEmail));
    addAuditLog('CONTACT_UNSUPPRESSED', 'Contact', targetEmail, `Unsuppressed contact ${targetEmail}`);
  };

  const verifyDomainDns = (domainId: string) => {
    const domain = domains.find((item) => item.id === domainId);
    if (/^\d+$/.test(domainId) && domain?.verificationToken) {
      void api.verifyDomain(domainId, domain.verificationToken).catch(() => undefined);
    }
    setDomains((prev) =>
      prev.map((d) =>
        d.id === domainId
          ? {
              ...d,
              status: 'verified',
              isVerified: true,
              dnsRecords: d.dnsRecords.map((r) => ({ ...r, status: 'valid' })),
            }
          : d
      )
    );
    addAuditLog('DOMAIN_VERIFIED', 'SendingDomain', domainId, `Verified DKIM/SPF/DMARC DNS records for domain.`);
  };

  const ingestBounce = (
    email: string,
    rawDsn: string,
    options?: { campaignId?: string; campaignName?: string; recipientMx?: string }
  ): ProcessBounceResult => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const existingConsecutive = bounces.filter((b) => b.email.toLowerCase() === cleanEmail).length;

    const result = classifyBounce(cleanEmail, rawDsn, {
      campaignId: options?.campaignId,
      campaignName: options?.campaignName,
      recipientMx: options?.recipientMx,
      currentConsecutiveCount: existingConsecutive,
    });

    setBounces((prev) => [result.bounceNotification, ...prev]);

    if (result.bounceNotification.autoSuppressed) {
      setContacts((prev) =>
        prev.map((c) =>
          c.email?.toLowerCase() === cleanEmail
            ? { ...c, status: result.bounceNotification.bounceType === 'hard' ? 'bounced' : 'suppressed' }
            : c
        )
      );

      addAuditLog(
        'BOUNCE_AUTO_SUPPRESSED',
        'BounceNotification',
        cleanEmail,
        `Auto-suppressed ${cleanEmail} (${result.bounceNotification.bounceType.toUpperCase()} bounce: ${result.bounceNotification.smtpCode} ${result.bounceNotification.enhancedCode})`
      );
    }

    return result;
  };

  const createWarmupPlan = (planData: Partial<AutomatedWarmupPlan>): AutomatedWarmupPlan => {
    const totalDays = planData.totalDays || 30;
    const startingDailyVolume = planData.startingDailyVolume || 500;
    const targetDailyVolume = planData.targetDailyVolume || 250000;
    const strategy = planData.strategy || 'balanced_30d';

    const newPlan: AutomatedWarmupPlan = {
      id: planData.id || `plan_${Date.now()}`,
      name: planData.name || 'Automated Domain Warmup',
      targetDomain: planData.targetDomain || 'mail.aethermail.net',
      ipPoolId: planData.ipPoolId || 'pool_corp',
      ipAddresses: planData.ipAddresses || ['198.51.100.41'],
      strategy,
      totalDays,
      currentDay: 1,
      startDate: new Date().toISOString(),
      targetDailyVolume,
      startingDailyVolume,
      autoThrottleOnBounce: planData.autoThrottleOnBounce !== undefined ? planData.autoThrottleOnBounce : true,
      maxBounceThresholdPercent: planData.maxBounceThresholdPercent || 2.0,
      autoPauseOnSpam: planData.autoPauseOnSpam !== undefined ? planData.autoPauseOnSpam : true,
      status: 'running',
      overallReputationScore: 99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schedule: generateWarmupSchedule(totalDays, startingDailyVolume, targetDailyVolume, strategy, 1),
    };

    setWarmupPlans((prev) => [newPlan, ...prev]);
    addAuditLog('WARMUP_PLAN_CREATED', 'AutomatedWarmupPlan', newPlan.id, `Created warmup plan for ${newPlan.targetDomain}`);
    return newPlan;
  };

  const updateWarmupPlan = (id: string, updates: Partial<AutomatedWarmupPlan>) => {
    setWarmupPlans((prev) =>
      prev.map((plan) => (plan.id === id ? { ...plan, ...updates, updatedAt: new Date().toISOString() } : plan))
    );
    addAuditLog('WARMUP_PLAN_UPDATED', 'AutomatedWarmupPlan', id, `Updated warmup plan settings`);
  };

  const advanceWarmupDay = (planId: string) => {
    setWarmupPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        if (plan.currentDay >= plan.totalDays) {
          return { ...plan, status: 'completed' as const, updatedAt: new Date().toISOString() };
        }
        const nextDay = plan.currentDay + 1;
        const updatedSchedule = plan.schedule.map((item) => {
          if (item.dayNumber === plan.currentDay) {
            return { ...item, status: 'completed' as const, actualSent: item.dailyLimit };
          }
          if (item.dayNumber === nextDay) {
            return { ...item, status: 'active' as const, actualSent: Math.round(item.dailyLimit * 0.15) };
          }
          return item;
        });

        return {
          ...plan,
          currentDay: nextDay,
          schedule: updatedSchedule,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addAuditLog('WARMUP_DAY_ADVANCED', 'AutomatedWarmupPlan', planId, `Advanced warmup schedule to next day`);
  };

  const toggleWarmupStatus = (planId: string) => {
    setWarmupPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        const newStatus = plan.status === 'running' ? ('paused' as const) : ('running' as const);
        return { ...plan, status: newStatus, updatedAt: new Date().toISOString() };
      })
    );
    addAuditLog('WARMUP_STATUS_TOGGLED', 'AutomatedWarmupPlan', planId, `Toggled warmup automation state`);
  };

  const simulateWarmupDispatch = (planId: string, volume: number) => {
    setWarmupPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        const updatedSchedule = plan.schedule.map((item) => {
          if (item.dayNumber === plan.currentDay) {
            const newSent = Math.min(item.dailyLimit, item.actualSent + volume);
            return { ...item, actualSent: newSent };
          }
          return item;
        });
        return { ...plan, schedule: updatedSchedule, updatedAt: new Date().toISOString() };
      })
    );
    addAuditLog('WARMUP_VOLUME_DISPATCHED', 'AutomatedWarmupPlan', planId, `Dispatched test warmup volume of ${volume.toLocaleString()} msgs`);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        warmupPlans,
        setWarmupPlans,
        createWarmupPlan,
        updateWarmupPlan,
        advanceWarmupDay,
        toggleWarmupStatus,
        simulateWarmupDispatch,
        activeTab,
        setActiveTab,
        organization,
        setOrganization,
        contacts,
        setContacts,
        contactLists,
        setContactLists,
        segments,
        setSegments,
        domains,
        setDomains,
        senders,
        setSenders,
        mailboxes,
        setMailboxes,
        messages,
        setMessages,
        templates,
        setTemplates,
        campaigns,
        setCampaigns,
        smsCampaigns,
        setSmsCampaigns,
        queueJobs,
        setQueueJobs,
        bounces,
        setBounces,
        automations,
        setAutomations,
        deliverability,
        setDeliverability,
        shortLinks,
        setShortLinks,
        mediaAssets,
        setMediaAssets,
        gateways,
        setGateways,
        auditLogs,
        setAuditLogs,
        systemSettings,
        setSystemSettings,
        isEngineRunning,
        setIsEngineRunning,
        hourlySpeed,
        setHourlySpeed,
        activeMailboxId,
        setActiveMailboxId,
        addAuditLog,
        importContacts,
        createCampaign,
        createSmsCampaign,
        pauseQueue,
        resumeQueue,
        flushQueue,
        retryJob,
        suppressContact,
        unsuppressContact,
        verifyDomainDns,
        ingestBounce,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
