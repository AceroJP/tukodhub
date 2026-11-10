# Database Dictionary

**Status:** Draft for founder approval  
**Scope:** Initial MVP logical model

## Common conventions

All tables use a UUID primary key unless noted otherwise. Tenant-owned tables
include `tenant_id`. Timestamps use UTC with timezone-aware storage. Mutable
records include `created_at`, `updated_at`, and, where appropriate,
`created_by_user_id` and `updated_by_user_id`. Financial values use
`numeric(19,4)` or an approved equivalent; currency is stored explicitly as
`PHP` for MVP records.

## Platform and identity

| Table | Purpose | Important columns |
|---|---|---|
| `tenants` | Independent business workspaces | `id`, `name`, `slug`, `status`, `created_at` |
| `subscription_plans` | Platform plan definitions | `id`, `name`, `currency`, `monthly_price`, `limits_json`, `status` |
| `subscriptions` | Tenant subscription state | `id`, `tenant_id`, `plan_id`, `status`, `starts_at`, `ends_at` |
| `users` | Authenticated people | `id`, `email`, `display_name`, `phone`, `status`, `created_at` |
| `roles` | Role definitions | `id`, `scope`, `name`, `status` |
| `permissions` | Atomic permission definitions | `id`, `code`, `description` |
| `role_permissions` | Role-to-permission relation | `role_id`, `permission_id` |
| `memberships` | User membership in a tenant | `id`, `tenant_id`, `user_id`, `role_id`, `status` |
| `branch_memberships` | Branch scope for a membership | `membership_id`, `branch_id` |
| `sessions` | Revocable authenticated sessions | `id`, `user_id`, `tenant_id`, `expires_at`, `revoked_at` |

## Business and customers

| Table | Purpose | Important columns |
|---|---|---|
| `business_profiles` | Tenant business identity and settings | `tenant_id`, `legal_name`, `display_name`, `phone`, `address`, `timezone`, `currency` |
| `branches` | Tenant operating locations | `id`, `tenant_id`, `name`, `address`, `phone`, `status` |
| `operating_hours` | Branch availability | `id`, `branch_id`, `day_of_week`, `opens_at`, `closes_at`, `is_closed` |
| `customers` | Customer identity and contact data | `id`, `tenant_id`, `name`, `phone`, `email`, `notes`, `status` |
| `customer_addresses` | Service locations | `id`, `tenant_id`, `customer_id`, `label`, `address_text`, `latitude`, `longitude` |
| `customer_notes` | Internal customer notes | `id`, `tenant_id`, `customer_id`, `body`, `created_by_user_id` |

## Services and requests

| Table | Purpose | Important columns |
|---|---|---|
| `service_categories` | Tenant service group | `id`, `tenant_id`, `name`, `status` |
| `services` | Customizable service catalog | `id`, `tenant_id`, `category_id`, `name`, `description`, `default_price`, `estimated_minutes`, `status` |
| `inquiries` | Incoming service request | `id`, `tenant_id`, `customer_id`, `service_address_id`, `source_channel`, `status`, `preferred_start`, `notes`, `created_by_user_id` |
| `inquiry_services` | Services requested by an inquiry | `inquiry_id`, `service_id`, `quantity`, `notes` |
| `inquiry_follow_ups` | Follow-up activity and due dates | `id`, `tenant_id`, `inquiry_id`, `due_at`, `completed_at`, `outcome`, `assigned_to_user_id` |
| `bookings` | Confirmed appointment | `id`, `tenant_id`, `branch_id`, `inquiry_id`, `customer_id`, `starts_at`, `ends_at`, `status`, `confirmed_at` |
| `booking_services` | Services in a booking | `booking_id`, `service_id`, `quantity`, `price_snapshot` |

## Quotations and jobs

| Table | Purpose | Important columns |
|---|---|---|
| `quotations` | Stable quotation identity | `id`, `tenant_id`, `inquiry_id`, `customer_id`, `status`, `expires_at`, `approved_at` |
| `quotation_revisions` | Immutable quotation versions | `id`, `quotation_id`, `revision_number`, `subtotal`, `discount`, `tax`, `total`, `currency`, `created_at` |
| `quotation_items` | Versioned labor/material/service items | `id`, `quotation_revision_id`, `service_id`, `description`, `quantity`, `unit_price`, `line_total` |
| `quotation_approvals` | Approval or rejection evidence | `id`, `tenant_id`, `quotation_id`, `revision_id`, `decision`, `actor_type`, `actor_user_id`, `decided_at` |
| `job_orders` | Work execution record | `id`, `tenant_id`, `branch_id`, `booking_id`, `customer_id`, `status`, `instructions`, `confirmed_completed_at` |
| `job_assignments` | Technician assignment and schedule | `id`, `tenant_id`, `job_order_id`, `membership_id`, `starts_at`, `ends_at`, `status` |
| `job_status_history` | Job transition audit trail | `id`, `tenant_id`, `job_order_id`, `from_status`, `to_status`, `changed_by_user_id`, `changed_at`, `reason` |
| `job_submissions` | Technician completion submissions | `id`, `tenant_id`, `job_order_id`, `submitted_by_user_id`, `submitted_at`, `review_status`, `reviewed_by_user_id`, `reviewed_at`, `review_notes` |
| `materials` | Tenant material catalog | `id`, `tenant_id`, `name`, `unit`, `default_unit_cost`, `status` |
| `job_materials` | Materials used on a job | `id`, `tenant_id`, `job_order_id`, `material_id`, `quantity`, `unit_cost_snapshot` |

## Billing, files, and communication

| Table | Purpose | Important columns |
|---|---|---|
| `invoices` | Bill issued for confirmed work | `id`, `tenant_id`, `job_order_id`, `customer_id`, `status`, `subtotal`, `discount`, `tax`, `total`, `currency`, `issued_at` |
| `invoice_items` | Invoice line items | `id`, `invoice_id`, `description`, `quantity`, `unit_price`, `line_total` |
| `payments` | Recorded offline payment | `id`, `tenant_id`, `invoice_id`, `customer_id`, `amount`, `method`, `paid_at`, `reference`, `status`, `recorded_by_user_id` |
| `attachments` | File metadata | `id`, `tenant_id`, `uploaded_by_user_id`, `resource_type`, `resource_id`, `storage_key`, `content_type`, `size_bytes`, `status` |
| `customer_links` | Scoped expiring customer access | `id`, `tenant_id`, `customer_id`, `resource_type`, `resource_id`, `token_hash`, `expires_at`, `revoked_at`, `last_accessed_at` |
| `notifications` | In-app or email notification record | `id`, `tenant_id`, `recipient_user_id`, `type`, `payload_json`, `status`, `sent_at` |
| `outbox_messages` | Durable event delivery record | `id`, `tenant_id`, `event_type`, `payload_json`, `available_at`, `processed_at`, `attempt_count` |
| `activity_logs` | Security and business audit record | `id`, `tenant_id`, `actor_user_id`, `action`, `resource_type`, `resource_id`, `metadata_json`, `occurred_at` |

## Deliberate exclusions

Online payment transactions, offline sync queues, advanced inventory
movements, and full customer accounts are not part of this initial logical
model.
