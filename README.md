# AetherMail - Autonomous Email & SMS Delivery Platform

Project restructured according to the design specification with separate **backend**, **workers**, and **frontend** directories.

## Project Structure

```
aether-mail/
├── backend/                    # Django REST API backend
│   ├── config/                 # Django settings & configuration
│   ├── accounts/               # User authentication
│   ├── organizations/          # Multi-tenant support
│   ├── contacts/               # Contact management
│   ├── campaigns/              # Campaign management
│   ├── templates/              # Email templates
│   ├── email/                  # Email delivery models
│   ├── mailboxes/              # Dovecot mailbox management
│   ├── domains/                # Domain verification
│   ├── smtp/                   # SMTP configuration
│   ├── sms/                    # SMS delivery
│   ├── automation/             # Workflow automation
│   ├── scheduling/             # Campaign scheduling
│   ├── tracking/               # Delivery tracking
│   ├── analytics/              # Analytics & reporting
│   ├── notifications/          # Alert system
│   ├── reputation/             # Reputation scoring
│   ├── suppressions/           # Bounce/complaint suppression
│   ├── shortlinks/             # Branded URL shortening
│   ├── media/                  # Asset management
│   ├── audit/                  # Audit logging
│   ├── system/                 # Platform settings
│   ├── manage.py               # Django management script
│   └── requirements.txt        # Python dependencies
│
├── workers/                    # Celery background workers
│   ├── email_sender/           # Email delivery worker
│   ├── email_retry/            # Retry logic
│   ├── bounce_processor/       # Bounce handling
│   ├── mailbox_processor/      # Incoming mail processing
│   ├── tracking_processor/     # Tracking events
│   ├── sms_sender/             # SMS delivery
│   ├── sms_delivery/           # SMS delivery reports
│   ├── scheduler/              # Campaign scheduler
│   ├── reputation/             # Reputation calculation
│   ├── dns_monitor/            # DNS health monitoring
│   ├── notification/           # Notification sender
│   ├── celery_app.py           # Celery configuration
│   └── celery_beat_schedule.py # Scheduled tasks
│
├── frontend/                   # React/Vite frontend
│   ├── src/
│   │   ├── pages/              # Route pages
│   │   ├── components/         # Reusable components
│   │   ├── layouts/            # Layout components
│   │   ├── features/           # Feature modules
│   │   │   ├── contacts/
│   │   │   ├── campaigns/
│   │   │   ├── email/
│   │   │   ├── sms/
│   │   │   ├── domains/
│   │   │   ├── mailboxes/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API services
│   │   ├── stores/             # State management
│   │   ├── routes/             # Router config
│   │   └── index.css           # Tailwind styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── index.html
│
├── docker-compose.yml          # Multi-container setup
├── Dockerfile.backend          # Backend image
├── Dockerfile.frontend         # Frontend image
├── .env.example                # Environment template
├── nginx.conf                  # Reverse proxy config (create)
└── README.md                   # This file
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AETHER MAIL PLATFORM                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (React/Vite)  →  API Gateway (Nginx)  →  Django  │
│                                                   REST API   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                     │   │
│  │  (Contacts, Campaigns, Messages, Tracking, etc)     │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Redis Cache & Queue                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Celery Workers (Email, SMS, Bounce, Analytics)     │   │
│  └──────────────────────────────────────────────────────┘   │
│         ↓                    ↓                    ↓          │
│      Postfix            Dovecot            SMS Gateway      │
│     (SMTP/MTA)      (IMAP/Mailbox)          (SMPP)          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Python 3.11+ (for local development)
- Node.js 20+ (for frontend)
- PostgreSQL 15 (if not using Docker)
- Redis 7 (if not using Docker)

### Quick Start with Docker

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start all services
docker-compose up -d

# Run migrations
docker-compose exec api python manage.py migrate

# Create superuser
docker-compose exec api python manage.py createsuperuser

# Access application
# Frontend: http://localhost
# API: http://localhost:8000
# Admin: http://localhost:8000/admin
```

### Local Development

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

#### Celery Workers
```bash
# In another terminal
cd workers

# Start Celery worker
celery -A celery_app worker -l info

# Start Celery beat (scheduler)
celery -A celery_app beat -l info
```

## API Endpoints (Reference)

Core endpoints implemented in each module:

```
Authentication
  POST   /api/auth/login
  POST   /api/auth/register
  POST   /api/auth/logout

Contacts
  GET    /api/contacts
  POST   /api/contacts
  POST   /api/contacts/import
  GET    /api/lists
  POST   /api/lists

Campaigns
  GET    /api/campaigns
  POST   /api/campaigns
  POST   /api/campaigns/{id}/schedule
  POST   /api/campaigns/{id}/pause
  POST   /api/campaigns/{id}/resume

Domains
  GET    /api/domains
  POST   /api/domains
  POST   /api/domains/{id}/verify

Messages
  GET    /api/messages
  GET    /api/messages/{id}

Analytics
  GET    /api/analytics

Notifications
  GET    /api/notifications
  PATCH  /api/notifications/{id}
```

## Database Schema

Major models:

- **User** - Platform users
- **Organization** - Multi-tenant container
- **Contact** - Email/SMS recipients
- **ContactList** - Contact grouping
- **Campaign** - Email/SMS campaigns
- **EmailMessage** - Individual messages
- **SendingDomain** - Verified domains
- **Mailbox** - IMAP mailboxes
- **AuditLog** - Activity tracking

## Background Jobs (Celery)

Recurring tasks:

- Check scheduled campaigns (every 5 min)
- Process bounces (every 10 min)
- Aggregate tracking (every 15 min)
- Calculate reputation (every 6 hours)
- Monitor DNS (every 3 hours)

## Security

- JWT authentication
- Role-based access control (RBAC)
- Multi-tenant isolation
- Input validation
- Rate limiting
- CORS configuration
- Security headers (via Nginx)

## Deployment

For production:

1. Update `.env` with production values
2. Use strong `SECRET_KEY`
3. Enable `DEBUG=False`
4. Configure SSL certificates
5. Use production database
6. Set up monitoring/logging
7. Deploy via Docker Compose or Kubernetes

## Development Phases

1. **Foundation** (Current) - Project structure, Auth, RBAC
2. **Contacts** - Import, Lists, Segments, Suppressions
3. **Email** - Templates, Campaigns, Queue, Postfix
4. **Mailbox** - Dovecot, IMAP, Inbox, Replies
5. **Deliverability** - DNS, DKIM, SPF, DMARC, Reputation
6. **Tracking** - Events, Analytics, Dashboards
7. **SMS** - SMPP, Campaigns, Delivery
8. **Automation** - Workflows, Triggers, Branches
9. **Autonomous Intelligence** - Adaptive Throttling, Health Monitoring

## Contributing

1. Create feature branch
2. Make changes
3. Test locally
4. Submit PR

## Support

For issues or questions, contact: support@aethermail.local

---

**AetherMail** - Building the most capable autonomous email & SMS delivery platform.
