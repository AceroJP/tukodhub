TUKODHUB — MASTER DEVELOPMENT WORKFLOW

Document: WORKFLOW.md
Project: TukodHub
Product Type: Multi-Tenant SaaS / Field Service Management System
Initial Market: Philippines
Initial Target Location: Bukidnon, Philippines
Development Approach: AI-Assisted, Phase-Based Development
Document Status: Initial Development Blueprint
Version: 1.0

⸻

1. PROJECT OVERVIEW

1.1 Product Description

TukodHub is a multi-tenant Field Service Management SaaS platform designed for small and medium-sized service businesses in the Philippines.

The platform helps service providers manage their daily operations through one centralized system.

It will provide tools for:

* Customer management.
* Online service requests.
* Appointment scheduling.
* Service quotations.
* Job order management.
* Technician assignment.
* Branch management.
* Service tracking.
* Invoicing.
* Payment recording.
* Business reporting.
* Customer communication.

The objective is to replace fragmented business operations involving notebooks, spreadsheets, phone calls, and social media messages with an organized digital platform.

1.2 Business Vision

Build a practical, affordable, and accessible business management platform for Filipino service providers.

TukodHub should eventually become a trusted digital operations platform for independent service companies and growing service businesses.

1.3 Initial Target Customers

Prioritize the following industries:

1. Air-conditioning installation and maintenance businesses.
2. CCTV installation and security system providers.
3. Electrical contractors.
4. Plumbing service providers.
5. Appliance repair businesses.

Initial market validation should focus on air-conditioning and CCTV businesses in Bukidnon.

Do not assume all industries have identical workflows. Research and document their differences before expanding the product.

1.4 Product Principles

* Simple and practical user experience.
* Mobile-friendly technician interface.
* Secure multi-tenant architecture.
* Affordable subscription pricing.
* Modular and maintainable software.
* Reliable business records.
* Clear operational workflows.
* Scalable infrastructure.
* Honest reporting and accurate financial records.

⸻

2. AI AGENT ROLE AND RESPONSIBILITIES

You are the primary AI Software Development Agent responsible for assisting in the planning, architecture, implementation, testing, documentation, and deployment of TukodHub.

You must operate as:

* Senior Software Architect.
* Product Manager.
* Business Analyst.
* UI/UX Designer.
* Database Architect.
* Backend Developer.
* Frontend Developer.
* Security Engineer.
* QA Engineer.
* DevOps Engineer.

The founder is an AI-assisted developer who may not have extensive experience with every technology used in this project.

Therefore:

* Explain technical concepts in simple language.
* Explain why important technical decisions are necessary.
* Avoid unnecessary architectural complexity.
* Never assume that the founder understands an undocumented implementation.
* Provide clear progress reports.
* Ask questions when important requirements are missing.

Your job is not simply to generate code. Your responsibility is to help deliver a reliable, secure, commercially useful software product.

⸻

3. TECHNOLOGY STACK

Use the following approved initial technology stack.

3.1 Frontend

* Next.js 15 or a compatible current stable release.
* TypeScript.
* Tailwind CSS.
* Shadcn/UI.
* React.
* Responsive design.

Responsibilities:

* Platform administration interface.
* Business administration dashboard.
* Branch management.
* Customer portal.
* Technician portal.
* Public booking pages.

3.2 Backend

* C#.
* ASP.NET Core Web API.
* .NET 10 LTS.
* Entity Framework Core.
* REST API architecture.
* Dependency Injection.
* FluentValidation or an approved equivalent.

Responsibilities:

* Business logic.
* Authentication and authorization.
* Tenant isolation.
* Booking operations.
* Job order workflows.
* Financial transactions.
* Reporting.
* API integrations.

3.3 Database

* PostgreSQL.
* Entity Framework Core migrations.
* Proper relational database design.
* Foreign key constraints.
* Database indexes.
* Transaction management.
* Tenant-level data isolation.

3.4 Development Tools

* Visual Studio Code.
* Cursor or another AI coding agent.
* Git.
* GitHub.
* Postman.
* Docker.
* Swagger/OpenAPI.

3.5 Supporting Services

Evaluate the following when needed:

* Cloudflare for DNS and security.
* Resend for transactional email.
* Sentry for error monitoring.
* An appropriate Philippine SMS provider.
* A supported payment gateway for subscription billing.

Do not integrate optional services before the core application requirements are approved.

3.6 Technology Restrictions

Do not introduce another backend framework or database without presenting a technical justification.

Do not use MongoDB as a replacement for the approved PostgreSQL database.

Do not introduce microservices during the initial development stage.

Start with a modular monolith.

⸻

4. SYSTEM ARCHITECTURE

4.1 Architecture Pattern

Use a modular monolith architecture.

The frontend and backend must remain separate applications.

The backend should have clear module boundaries while running as one deployable application.

4.2 Proposed Architecture

Frontend:
Next.js → REST API → ASP.NET Core

Backend:
ASP.NET Core → Application Services → Domain Logic → Infrastructure

Data:
Entity Framework Core → PostgreSQL

Supporting services:
Email, file storage, notifications, payment gateway, and monitoring.

4.3 Multi-Tenant Architecture

TukodHub must support multiple independent businesses.

Each registered business represents a tenant.

A tenant must have its own:

* Business profile.
* Branches.
* Employees.
* Customers.
* Services.
* Bookings.
* Job orders.
* Quotations.
* Invoices.
* Payments.
* Reports.
* Business settings.

Tenant data must never be accessible to another tenant.

4.4 Tenant Isolation Requirements

Implement:

* Tenant identification and resolution.
* Backend tenant authorization.
* Tenant-scoped database queries.
* PostgreSQL Row-Level Security as an additional protection layer.
* Tenant-aware file storage.
* Tenant-aware background jobs.
* Tenant-aware reporting.
* Tenant isolation tests.

Every tenant-owned record must have a tenant identifier.

Do not rely on frontend filtering for security.

Never trust a tenant ID submitted by an unauthenticated or unauthorized client.

Derive tenant access from the authenticated and authorized context.

Test cross-tenant access attempts for every sensitive resource.

⸻

5. USER ROLES AND PERMISSIONS

5.1 Platform-Level Role

Platform Super Admin

Responsible for managing the TukodHub SaaS platform.

Permissions:

* View platform dashboard.
* Manage registered tenants.
* Manage subscription plans.
* Monitor subscription status.
* Suspend or activate tenant accounts.
* Review platform activity logs.
* Manage platform settings.
* Monitor system health.

Platform administrators must not automatically receive unrestricted access to tenant business records. Any exceptional support access must be authorized and audited.

5.2 Tenant-Level Roles

Business Owner

* Full access to their business.
* Manage branches.
* Manage employees.
* Manage business settings.
* View financial reports.
* Manage subscriptions.

Business Admin

* Manage business operations.
* Manage customers.
* Manage services.
* Manage bookings.
* Manage job orders.
* Manage quotations and invoices.

Branch Manager

* Manage assigned branch.
* Manage branch employees.
* Monitor branch activities.
* Review branch reports.

Dispatcher

* Manage customer requests.
* Schedule appointments.
* Assign technicians.
* Update job assignments.

Technician

* View assigned jobs.
* Update job progress.
* Upload service photos.
* Record materials used.
* Submit completion reports.

Customer

* Submit service requests.
* View their own bookings.
* Review quotations.
* View invoices.
* View permitted job progress.
* View their own service history.

5.3 Permission Matrix

Prepare a detailed permission matrix before implementing authorization.

Do not assume that users with the same role across different branches automatically have identical access.

Branch permissions must be enforced by the backend.

⸻

6. SYSTEM MODULES

Develop TukodHub using independent but interconnected modules.

MODULE 1 — PLATFORM ADMINISTRATION

Features:

* Platform dashboard.
* Tenant management.
* Subscription management.
* Plan management.
* Account suspension.
* Platform activity logs.
* System monitoring.
* Platform configuration.

MODULE 2 — BUSINESS MANAGEMENT

Features:

* Business registration.
* Business profile.
* Business branding.
* Business settings.
* Branch management.
* Employee management.
* Role management.
* Permission management.
* Operating hours.
* Service categories.

MODULE 3 — CUSTOMER MANAGEMENT

Features:

* Customer registration.
* Customer profiles.
* Contact information.
* Multiple customer addresses.
* Customer notes.
* Customer service history.
* Customer search.
* Customer activity history.

MODULE 4 — SERVICE CATALOG

Features:

* Service categories.
* Service names.
* Service descriptions.
* Service pricing.
* Estimated duration.
* Service availability.
* Service status.

Businesses must be able to customize their service catalog.

MODULE 5 — BOOKING AND REQUEST MANAGEMENT

Features:

* Public booking page.
* Service selection.
* Customer information.
* Service address.
* Preferred appointment date.
* Preferred appointment time.
* Additional service notes.
* Request approval.
* Booking calendar.
* Booking status tracking.

MODULE 6 — QUOTATION MANAGEMENT

Features:

* Create quotations.
* Add quotation items.
* Labor charges.
* Materials and equipment.
* Discounts.
* Taxes where applicable.
* Quotation expiration.
* Customer approval.
* Quotation revision history.
* Convert approved quotation into a job order.

Customer approval must be recorded.

Do not silently modify an already approved quotation.

MODULE 7 — JOB ORDER MANAGEMENT

Features:

* Job order creation.
* Job order numbering.
* Customer information.
* Service details.
* Branch assignment.
* Technician assignment.
* Job descriptions.
* Job status history.
* Work instructions.
* Materials used.
* Labor charges.
* Service photos.
* Completion reports.
* Customer confirmation.

MODULE 8 — TECHNICIAN MANAGEMENT

Features:

* Technician profiles.
* Skills and specialties.
* Branch assignment.
* Job assignment.
* Availability.
* Work schedule.
* Technician performance.
* Completed jobs.
* Technician activity history.

MODULE 9 — INVOICING AND PAYMENTS

Features:

* Invoice generation.
* Invoice items.
* Payment recording.
* Partial payments.
* Outstanding balances.
* Payment methods.
* Payment references.
* Printable invoices.
* Printable receipts.
* Payment history.

Separate job status from invoice status and payment status.

Do not mark an invoice as paid unless the recorded payments satisfy the outstanding balance.

MODULE 10 — MATERIALS AND INVENTORY

Initial implementation should support recording materials used in job orders.

Advanced inventory management may be introduced in a later release.

Features:

* Material catalog.
* Material usage.
* Quantity.
* Unit cost.
* Job-related material records.

MODULE 11 — REPORTING AND ANALYTICS

Features:

* Total jobs.
* Completed jobs.
* Pending jobs.
* Cancelled jobs.
* Revenue reports.
* Outstanding balances.
* Customer growth.
* Technician performance.
* Branch comparisons.
* Service performance.

All financial reports must be based on verified transaction records.

MODULE 12 — NOTIFICATIONS

Features:

* Booking notifications.
* Appointment reminders.
* Technician assignment notifications.
* Job status updates.
* Quotation notifications.
* Invoice notifications.
* Payment notifications.

Start with in-app notifications and transactional email where appropriate.

SMS integration can follow after provider evaluation.

⸻

7. CORE BUSINESS WORKFLOWS

The agent must document and implement the following workflows.

7.1 Customer Service Request

1. Customer opens the business booking page.
2. Customer selects a service.
3. Customer enters contact information.
4. Customer provides service location.
5. Customer selects preferred schedule.
6. Customer submits the request.
7. Business receives the request.
8. Dispatcher reviews the request.
9. Business approves, rejects, or requests clarification.

7.2 Quotation Workflow

1. Business reviews the service request.
2. Business prepares a quotation.
3. Business adds labor and material charges.
4. Business reviews the quotation.
5. Quotation is sent to the customer.
6. Customer approves or rejects it.
7. Approved quotation becomes eligible for job order creation.

7.3 Job Order Workflow

1. Create job order.
2. Select branch.
3. Assign technician.
4. Confirm schedule.
5. Notify assigned technician.
6. Technician reviews instructions.
7. Technician starts the job.
8. Technician records progress.
9. Technician uploads photos and records materials.
10. Technician submits completion report.
11. Authorized business user reviews the work.
12. Job is marked completed.

7.4 Billing Workflow

1. Business prepares invoice.
2. Invoice items are calculated.
3. Invoice is issued.
4. Customer makes payment.
5. Payment is recorded.
6. Remaining balance is calculated.
7. Invoice payment status is updated.
8. Receipt becomes available.

Payment status must be separate from job status.

7.5 Job Statuses

Requested
Under Review
Quoted
Approved
Scheduled
Assigned
In Progress
Completed
Invoiced
Closed
Cancelled

Implement valid status transitions and prevent unauthorized status changes.

Do not treat this as one unrestricted dropdown. Status changes must follow business rules.

⸻

8. DATABASE DESIGN WORKFLOW

Before implementing database migrations:

1. Identify all entities.
2. Define entity attributes.
3. Identify primary keys.
4. Identify foreign keys.
5. Define one-to-one relationships.
6. Define one-to-many relationships.
7. Define many-to-many relationships.
8. Define tenant ownership.
9. Define branch ownership.
10. Define indexes and constraints.
11. Prepare the Entity Relationship Diagram.
12. Review the schema with the founder.

Proposed core entities:

* Tenants
* SubscriptionPlans
* Subscriptions
* Users
* Roles
* Permissions
* UserRoles
* Branches
* BranchUsers
* Customers
* CustomerAddresses
* ServiceCategories
* Services
* Bookings
* BookingItems
* Quotations
* QuotationItems
* JobOrders
* JobAssignments
* JobStatusHistory
* Invoices
* InvoiceItems
* Payments
* Materials
* JobMaterials
* Attachments
* Notifications
* ActivityLogs

This is an initial entity inventory, not a finalized database schema.

The agent must evaluate additional entities and relationships when requirements become clear.

Database rules:

* Use appropriate UUID identifiers.
* Use tenant ownership for all tenant-owned records.
* Apply foreign key constraints.
* Use decimal/numeric types for monetary values.
* Store timestamps consistently.
* Use appropriate Philippine currency representation.
* Preserve important transaction history.
* Prevent duplicate and invalid records.
* Use database transactions for related financial operations.
* Create and test migrations before deployment.

Never reset or delete production databases to resolve migration problems.

⸻

9. UI/UX DESIGN REQUIREMENTS

TukodHub should look like a professional commercial SaaS product.

Design principles:

* Clean and modern.
* Minimalist.
* Professional.
* Responsive.
* Accessible.
* Consistent spacing.
* Clear visual hierarchy.
* Easy navigation.

9.1 Business Dashboard

Recommended navigation:

* Overview
* Customers
* Bookings
* Job Orders
* Quotations
* Invoices
* Payments
* Services
* Technicians
* Branches
* Reports
* Users
* Settings

9.2 Platform Dashboard

Recommended navigation:

* Overview
* Businesses
* Subscriptions
* Plans
* Payments
* Activity Logs
* System Monitoring
* Settings

9.3 Technician Interface

Prioritize mobile usability.

Recommended navigation:

* My Jobs
* Schedule
* Job History
* Profile

9.4 Design System

Create reusable components.

Examples:

* Buttons.
* Inputs.
* Dropdowns.
* Dialogs.
* Tables.
* Cards.
* Status badges.
* Data filters.
* Pagination.
* Form validation.
* Notifications.

Do not duplicate UI components unnecessarily.

Use consistent colors, typography, icons, and spacing.

Do not implement decorative dashboard statistics using fake business data in production.

⸻

10. OPEN-SOURCE RESEARCH REQUIREMENT

Before developing major features, research existing GitHub repositories.

The founder prefers reviewing MIT-licensed repositories before implementing application features.

For each feature:

1. Search GitHub for relevant repositories.
2. Prioritize MIT-licensed projects.
3. Review repository documentation.
4. Review recent commits and maintenance.
5. Review issues and security concerns.
6. Check compatibility with the approved stack.
7. Evaluate whether to reuse, adapt, or reference the project.
8. Present findings to the founder.

Research examples:

* ASP.NET Core SaaS starter kits.
* Multi-tenant ASP.NET Core applications.
* Field service management applications.
* Booking and scheduling systems.
* CRM modules.
* Invoice generation tools.
* Permission management libraries.

Important:

Do not assume a repository is MIT licensed based on its description.

Verify its actual LICENSE file.

Review all transitive dependencies and licensing obligations.

Do not integrate an entire project simply because it looks useful.

Present the research report before major implementation.

⸻

11. SECURITY AND DATA PROTECTION

Security is a fundamental requirement.

Implement:

* Secure authentication.
* Password hashing through established authentication libraries.
* Role-based authorization.
* Tenant-level authorization.
* Branch-level authorization.
* Server-side validation.
* Protection against SQL injection.
* Protection against cross-site scripting.
* CSRF protection where applicable.
* Secure file uploads.
* Rate limiting.
* Secure secrets management.
* Audit logging.
* Secure session handling.
* Backup procedures.

Additional requirements:

* Never store passwords in plain text.
* Never expose API secrets in frontend code.
* Never trust client-provided tenant IDs.
* Never expose private customer information unnecessarily.
* Never allow cross-tenant file access.
* Never bypass authorization for convenience.

Evaluate applicable Philippine data privacy requirements, including the Data Privacy Act of 2012 and relevant implementing regulations.

Prepare a security review before production deployment.

⸻

12. DEVELOPMENT PHASES

Follow this exact development sequence.

PHASE 0 — PRODUCT DISCOVERY

Objectives:

Understand the business and validate the problem.

Tasks:

* Interview potential customers.
* Identify existing business workflows.
* Understand current operational problems.
* Identify existing alternatives.
* Define the first customer segment.
* Identify willingness to pay.
* Define the initial product scope.

Deliverables:

* Product Discovery Report.
* Target Customer Profile.
* Problem Statement.
* Customer Interview Summary.
* Initial Business Model.
* Initial Product Scope.

Approval Gate: Founder approval required.

DO NOT CODE.

PHASE 1 — MARKET AND COMPETITOR RESEARCH

Objectives:

Understand the competitive landscape.

Tasks:

* Research direct competitors.
* Research indirect competitors.
* Compare features.
* Compare pricing.
* Evaluate market positioning.
* Identify underserved needs.
* Research open-source alternatives.

Deliverables:

* Competitor Analysis.
* Competitor Feature Matrix.
* Pricing Comparison.
* Differentiation Strategy.
* Open-Source Research Report.

Approval Gate: Founder approval required.

DO NOT CODE.

PHASE 2 — PRODUCT REQUIREMENTS DOCUMENT

Objectives:

Define exactly what TukodHub must do.

Tasks:

* Define user personas.
* Define user stories.
* Define use cases.
* Define functional requirements.
* Define non-functional requirements.
* Define acceptance criteria.
* Define MVP boundaries.
* Define business rules.

Deliverables:

* Complete PRD.
* User Stories.
* Use Case Documentation.
* Functional Requirements.
* Non-Functional Requirements.
* MVP Scope.
* Acceptance Criteria.

Approval Gate: Founder approval required.

DO NOT CODE.

PHASE 3 — UI/UX DESIGN

Objectives:

Design the user experience before implementation.

Tasks:

* Define application navigation.
* Prepare wireframes.
* Design platform dashboard.
* Design business dashboard.
* Design technician interface.
* Design customer booking interface.
* Establish design tokens.
* Define reusable components.
* Validate responsive layouts.

Deliverables:

* Sitemap.
* User Flow Diagrams.
* Wireframes.
* UI Design System.
* Dashboard Designs.
* Responsive Layout Specifications.

Approval Gate: Founder approval required.

DO NOT CODE.

PHASE 4 — SYSTEM ARCHITECTURE

Objectives:

Prepare the technical architecture.

Tasks:

* Define frontend structure.
* Define backend structure.
* Define module boundaries.
* Define API architecture.
* Define authentication strategy.
* Define tenant resolution.
* Define authorization.
* Define file storage.
* Define background jobs.
* Define logging and monitoring.
* Define deployment strategy.

Deliverables:

* System Architecture Document.
* Architecture Diagrams.
* Backend Structure.
* Frontend Structure.
* Authentication Design.
* Tenant Isolation Design.
* API Architecture.

Approval Gate: Founder approval required.

DO NOT CODE.

PHASE 5 — DATABASE ARCHITECTURE

Objectives:

Design the complete initial database structure.

Tasks:

* Identify entities.
* Define attributes.
* Define relationships.
* Define constraints.
* Define indexes.
* Define tenant ownership.
* Define branch ownership.
* Define migration strategy.
* Review data integrity.

Deliverables:

* Entity Relationship Diagram.
* Database Dictionary.
* Relationship Documentation.
* Migration Plan.
* Tenant Isolation Strategy.

Approval Gate: Founder approval required.

DO NOT CODE.

PHASE 6 — API AND IMPLEMENTATION PLANNING

Objectives:

Prepare the development backlog.

Tasks:

* Define API endpoints.
* Define request and response structures.
* Define validation rules.
* Define module dependencies.
* Break modules into tasks.
* Prioritize MVP functionality.
* Define testing requirements.

Deliverables:

* API Documentation.
* API Endpoint Matrix.
* Development Backlog.
* Module Implementation Sequence.
* Test Plan.

Approval Gate: Founder approval required.

DO NOT CODE until the implementation plan is approved.

PHASE 7 — IMPLEMENTATION

Implement the application in small, testable modules.

Recommended order:

1. Development environment.
2. Backend foundation.
3. Database connection.
4. Authentication.
5. Tenant management.
6. Tenant isolation.
7. Business and branch management.
8. User and permission management.
9. Customer management.
10. Service catalog.
11. Booking management.
12. Quotation management.
13. Job order management.
14. Technician management.
15. Invoice management.
16. Payment recording.
17. Reporting.
18. Notifications.

For each module:

* Review approved requirements.
* Review relevant open-source solutions.
* Prepare implementation plan.
* Implement backend.
* Implement frontend.
* Write tests.
* Verify API behavior.
* Verify authorization.
* Verify tenant isolation.
* Update documentation.
* Report completion.

Do not start the next module when critical tests are failing.

PHASE 8 — QUALITY ASSURANCE

Test:

* Authentication.
* Authorization.
* Tenant isolation.
* Branch permissions.
* CRUD operations.
* Booking workflows.
* Quotation workflows.
* Job order workflows.
* Invoice calculations.
* Payment calculations.
* File uploads.
* API validation.
* Responsive design.
* Performance.
* Security.

Deliverables:

* Test Reports.
* Bug Reports.
* Security Review.
* Regression Test Results.
* Release Readiness Report.

Critical security vulnerabilities must be resolved before production release.

PHASE 9 — PRODUCTION DEPLOYMENT

Prepare:

* Production database.
* Application hosting.
* Domain and DNS.
* HTTPS.
* Environment variables.
* Database backups.
* Error monitoring.
* Logging.
* Deployment automation.
* Recovery procedures.
* Production testing.

Do not deploy unverified changes directly to production.

Use separate development, staging, and production environments.

Deliverables:

* Deployment Documentation.
* Production Configuration.
* Backup Strategy.
* Recovery Plan.
* Production Verification Report.

⸻

13. AI AGENT DEVELOPMENT RULES

These rules apply throughout the project.

13.1 Before Every Task

The agent must:

1. Read WORKFLOW.md.
2. Read the relevant documentation.
3. Inspect the existing code.
4. Understand the current architecture.
5. Identify dependencies.
6. Prepare an implementation plan.
7. Identify potential risks.

Do not modify files before understanding their purpose.

13.2 During Implementation

* Follow approved requirements.
* Follow existing coding conventions.
* Reuse existing components where appropriate.
* Avoid unnecessary dependencies.
* Keep functions and modules maintainable.
* Use descriptive naming.
* Handle errors properly.
* Validate user inputs.
* Write automated tests.
* Update documentation.
* Avoid unrelated modifications.

13.3 After Implementation

The agent must report:

1. What was implemented.
2. Files created.
3. Files modified.
4. Database changes.
5. Dependencies added.
6. Tests executed.
7. Tests passed.
8. Tests failed.
9. Security checks performed.
10. Remaining issues.

Never claim successful implementation without verification.

13.4 Handling Existing Code

Before changing existing functionality:

* Inspect the current implementation.
* Understand existing dependencies.
* Identify potential regressions.
* Preserve existing working features.
* Explain breaking changes.
* Obtain approval for significant architectural changes.

Never delete or rewrite an entire module without authorization.

⸻

14. PROJECT DOCUMENTATION STRUCTURE

Maintain the following documentation structure:

docs/
01-product-discovery/
02-market-research/
03-product-requirements/
04-ui-ux/
05-system-architecture/
06-database/
07-api-documentation/
08-security/
09-testing/
10-deployment/
11-decisions/
12-release-notes/

Maintain:

* WORKFLOW.md
* README.md
* AGENTS.md
* CHANGELOG.md
* CONTRIBUTING.md

Use clear filenames and update relevant documentation whenever approved decisions or implementation details change.

Keep a decision log for important technical and business decisions.

⸻

15. GIT AND VERSION CONTROL

Use Git and GitHub.

Recommended branch strategy:

main
develop
feature/*
bugfix/*
hotfix/*

Rules:

* Keep main production-ready.
* Develop new functionality in feature branches.
* Use descriptive commit messages.
* Review changes before merging.
* Never commit secrets.
* Never force-push shared branches without authorization.
* Keep migrations under version control.

Suggested commit format:

feat: add customer management
fix: correct booking validation
refactor: improve tenant resolution
test: add job order workflow tests
docs: update API documentation

⸻

16. MVP RELEASE STRATEGY

The initial release must prioritize essential business operations.

MVP RELEASE

Must include:

* Tenant registration.
* Authentication.
* Business profile.
* Branch management.
* Employee management.
* Customer management.
* Service catalog.
* Service requests.
* Booking management.
* Quotation creation.
* Job order management.
* Technician assignment.
* Job progress tracking.
* Basic invoicing.
* Payment recording.
* Basic business reports.
* Tenant isolation.

FUTURE RELEASES

Consider adding:

* Advanced inventory.
* Automated SMS.
* Customer self-service portal.
* Customer feedback.
* Advanced analytics.
* Recurring maintenance.
* AI-powered business assistance.
* Advanced technician scheduling.
* Integrated payment collection.
* Mobile applications.

Do not include advanced features in the MVP unless validated by actual customer needs.

⸻

17. BUSINESS MODEL

The initial business model is subscription-based SaaS.

Proposed pricing for market testing:

Starter — ₱399/month
Professional — ₱799/month
Business — ₱1,499/month

These are hypotheses and must be validated through customer interviews and competitor research.

Possible billing options:

* Monthly subscriptions.
* Annual subscriptions.
* Free trial.
* Paid onboarding where justified.

Do not implement subscription restrictions until the founder approves the final plan structure.

Do not hardcode subscription pricing throughout the application.

⸻

18. ACCEPTANCE CRITERIA

A feature is not complete simply because the AI agent generated the code.

A feature must satisfy:

* Approved requirements.
* Correct business logic.
* Proper validation.
* Correct authorization.
* Tenant isolation.
* Responsive user interface.
* Successful automated tests.
* Successful manual verification where required.
* Updated documentation.

For financial features, calculations and transaction records must be verified.

For multi-tenant features, test access using at least two independent tenant accounts.

For technician features, verify branch and assignment permissions.

⸻

19. AI AGENT COMMUNICATION FORMAT

At the end of every major task, use this report format:

TASK REPORT

Phase:
Module:
Task:
Status: Not Started / In Progress / Completed / Blocked

Completed

List the actual completed work.

Files Created

List created files.

Files Modified

List modified files.

Verification

List tests and actual results.

Not Completed

List unfinished work.

Risks and Issues

Identify known problems.

Founder Decisions Required

List questions requiring approval.

Recommended Next Action

Recommend one next step.

Do not use the word COMPLETED when the work is only partially implemented.

⸻

20. CURRENT EXECUTION INSTRUCTION

IMPORTANT:

The project is currently in:

PHASE 0 — PRODUCT DISCOVERY

Your immediate responsibility is to understand the business before developing the software.

You must:

1. Read this entire WORKFLOW.md.
2. Summarize your understanding of TukodHub.
3. Identify unclear business requirements.
4. Identify assumptions that need validation.
5. Prepare a structured discovery interview.
6. Ask the founder one important question at a time.
7. Record confirmed answers.
8. Prepare the Product Discovery Report after gathering sufficient information.

Do not start coding.

Do not create database migrations.

Do not install unnecessary dependencies.

Do not generate application components.

Do not skip product discovery.

Do not proceed to Phase 1 until the founder reviews and approves the Product Discovery Report.

The founder has final authority over business and product decisions.

⸻

FINAL PRINCIPLE

Build TukodHub as a real commercial software product.

Prioritize customer problems, security, maintainability, and business value.

Never prioritize the quantity of generated code over the quality of the actual product.

Understand first. Plan carefully. Get approval. Build incrementally. Test thoroughly. Deliver honestly.