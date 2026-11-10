# Open-Source Research Report

**Research date:** 2026-11-10  
**Status:** Initial screening; no code has been reused

## OpenFieldService

- Repository: [clawnify/OpenFieldService](https://github.com/clawnify/OpenFieldService)
- License file: [MIT LICENSE](https://raw.githubusercontent.com/clawnify/OpenFieldService/main/LICENSE)
- Public description: field-service scheduling and management, including work
  orders, scheduling/dispatch, customer/job history, and self-hosting.
- Compatibility: conceptually relevant to TukodHub, but compatibility with the
  approved Next.js and ASP.NET Core stack must be assessed before any reuse.
- Risk: a repository's feature claims, maintenance quality, dependencies,
  security posture, and production readiness require direct review. MIT status
  alone is not a recommendation to integrate it.

## Odoo

- Repository: [odoo/odoo](https://github.com/odoo/odoo)
- License: [LGPLv3 license file](https://raw.githubusercontent.com/odoo/odoo/19.0/LICENSE)
- Relevance: broad ERP capabilities and possible field-service functionality.
- Constraint: it is not MIT licensed and is not aligned with TukodHub's
  approved ASP.NET Core/PostgreSQL modular-monolith stack as a direct base.

## ERPNext

- Repository: [frappe/erpnext](https://github.com/frappe/erpnext)
- License: [GPLv3 license file](https://raw.githubusercontent.com/frappe/erpnext/version-15/license.txt)
- Relevance: broad business-management and service-related capabilities.
- Constraint: GPLv3 obligations and a different technology stack make direct
  reuse inappropriate without a specific legal and technical review.

## Recommendation

Do not integrate an entire open-source product during Phase 1. Treat
OpenFieldService as a candidate for patterns and further review, not as an
approved dependency. Any future reuse requires reviewing repository history,
dependencies, security issues, license obligations, and compatibility with the
approved stack.
