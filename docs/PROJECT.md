# VanYouthClub — Project Specification

## 1. Project Identity

Project Name: VanYouthClub

Brand Name: VAN YOUTH CLUB

Project Type: Youth and community event platform

Primary Language: Turkish

Current Phase: Repository foundation

---

## 2. Current Scope

The current development phase is limited to establishing a clean and version-controlled project foundation.

The following items are intentionally NOT implemented yet:

- Frontend framework
- Backend framework
- Database
- ORM
- Authentication system
- Admin panel
- Event management system
- API
- Production deployment
- External service integrations

Do not implement these systems unless a later project phase explicitly requires them.

---

## 3. Planned Product Direction

The platform is intended to provide a modern digital experience for discovering and managing youth-oriented social and community events in Van.

Planned capabilities include:

- Public event discovery
- Event categories
- Event detail pages
- Event locations
- Event participation/contact flows
- Gallery
- Social media integration
- Contact information
- Administrative content management
- Secure administrator authentication
- Event CRUD operations
- Category management
- Gallery management
- Site content management
- Site settings

---

## 4. Planned Event Categories

- Kamp
- Game Night
- Akustik
- Gezi
- Kahve & Tanışma
- Açık Hava Sineması
- Doğa & Spor
- Atölye & Sanat

---

## 5. Brand and UX Direction

The visual direction should be:

- Modern
- Minimal
- Premium
- Youth-oriented
- Professional
- Mobile-first
- Responsive

The planned visual language may use:

- Dark gray / black foundation
- Neon yellow
- Orange
- Vibrant purple
- Electric blue
- Glassmorphism-inspired surfaces

Typography should prioritize modern readable fonts such as Inter or Plus Jakarta Sans.

The interface must remain accessible, clear and usable rather than relying only on visual effects.

---

## 6. Contact and Social Information

Phone:

0536 426 19 30
0544 167 00 96

Instagram:

https://www.instagram.com/vanyouthclub/

The final implementation should support appropriate phone and WhatsApp actions where applicable.

---

## 7. Security Rules

Never commit:

- API keys
- Passwords
- JWT secrets
- Database credentials
- Private certificates
- Production environment variables
- Other confidential credentials

Real environment values must remain outside Git.

Use .env.example only for non-secret configuration examples.

---

## 8. Database Rule

A database must not be introduced silently.

Before implementing database functionality, the project must first document:

- Database technology
- ORM
- Schema
- Tables
- Relationships
- Migrations
- Environment configuration
- Security requirements
- Backup considerations
- API/data access strategy

Never:

- DROP DATABASE
- DROP TABLE
- TRUNCATE production data
- Delete migrations
- Reset a production database
- Modify production data destructively

without explicit approval.

---

## 9. AI Coding Agent Rules

Before making substantial changes, an AI coding agent must:

1. Inspect the actual repository structure.
2. Read the relevant documentation.
3. Understand the current project phase.
4. Avoid assuming frameworks or technologies that have not been selected.
5. Make the smallest safe change required.
6. Validate changed files.
7. Run appropriate tests/build checks when available.
8. Report exactly what was changed.
9. Report validation results.
10. Avoid unrelated refactoring.

The agent must not invent files, folders, APIs, database schemas or dependencies without establishing that they are required.

---

## 10. Repository Boundary

This repository is exclusively for VanYouthClub.

Do not copy, modify, merge or depend on unrelated projects.

In particular, existing KresPlatform projects are separate projects and must remain untouched.

---

## 11. Development Philosophy

The project should evolve in controlled phases.

Each phase should have:

- Clear scope
- Explicit acceptance criteria
- Implementation
- Validation
- Security review where relevant
- Documentation updates
- Git commit

Do not build the entire product prematurely.

The architecture should remain simple at the beginning and become more sophisticated only when justified by actual product requirements.

---

## 12. Current Milestone

Milestone: Repository Foundation

Acceptance criteria:

- Git repository initialized
- README.md exists
- .gitignore exists
- .env.example exists
- docs/PROJECT.md exists
- No application framework installed yet
- No database created
- No production credentials stored
- Repository is ready to be connected to GitHub

