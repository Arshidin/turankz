# Role Model & Access Control

## Overview

The Turan Standard Pool platform operates on a strict role-based access control (RBAC) model. All data visibility and actions are determined by user roles.

### Global Access Principles

1. **Data visibility and actions are strictly role-based**
2. **No user can access another role's internal controls or governance data**
3. **All sensitive relationships are mediated by Admin**
4. **Farmer and MPK identities are never cross-exposed**

---

## Role Definitions

### Farmer

Farmers are supply-side participants who declare livestock batches and respond to pool invitations.

#### Account Statuses

Account status determines **what the user can do** (permissions). It is separate from farmer grading.

- **Observer** - Registration pending or under review, limited read-only access
- **Active** - Fully activated, can create batches and participate
- **Suspended** - Account temporarily suspended, access blocked

**Account Status Derivation:**
- For Farmers: Derived from `grading` field
  - `observer` grading → `observer` account status
  - `declared_supplier` or `standard_supplier` grading → `active` account status
  - `is_restricted` flag → `suspended` account status
- For MPKs: Derived from `registration_status` and `status` fields
  - `registration_status` ≠ `'active'` → `observer` account status
  - `registration_status = 'active'` and `status = 'active'` → `active` account status
  - `status = 'restricted'` or `'inactive'` → `suspended` account status
- For Admins: Always `active`

**Note**: Account status is separate from farmer grading. Grading (`observer`, `declared_supplier`, `standard_supplier`) affects premium eligibility, but account status determines platform access permissions.

#### Can View

| Resource | Access |
|----------|--------|
| Own profile | ✅ Full |
| Own livestock batches | ✅ Full |
| Own sales calendar | ✅ Full |
| Own herd structure snapshots | ✅ Full |
| Own market intents | ✅ Full |
| Pool invitations (received) | ✅ Limited (no MPK identity) |
| Aggregated demand signals | ✅ Anonymized (no MPK identities) |
| Reference price grid | ✅ Read-only |
| Other farmers | ❌ None |
| MPK identities | ❌ None |
| Pool request details | ❌ None |
| Own batch matches | ✅ Limited (no MPK identity) |
| System-wide data | ❌ None |
| National herd structure | ❌ None (admin-only) |

#### Can Act

| Action | Permission | Notes |
|--------|------------|-------|
| Declare new batches | ✅ | Must be Active status |
| Change batch readiness | ✅ | Forecast → Soft → Confirmed |
| Confirm pool invitations | ✅ | If Active |
| Decline pool invitations | ✅ | If Active |
| Create herd structure snapshots | ✅ | Indicative only |
| Create market intents | ✅ | Non-binding only |
| Express interest | ❌ | MPK-only action |
| Create pool requests | ❌ | MPK-only action |
| See MPK identities | ❌ | Never exposed |
| Edit other farmers' data | ❌ | Own data only |

#### Cannot Do

- View other farmers' batches or profiles
- See MPK identities or contact information
- Access admin governance controls
- View system-wide statistics
- See matches for other farmers' batches (only own matches visible)
- Access national herd structure aggregation

---

### MPK (Meat Processing Plant)

MPKs are demand-side participants who express interest and create purchase pool requests.

#### Account Statuses

- **Observer** - Registration pending or under review
- **Active** - Fully activated, can create pool requests

#### Can View

| Resource | Access |
|----------|--------|
| Own profile | ✅ Full |
| Aggregated supply (by region, month, readiness, grade) | ✅ Anonymized |
| Aggregated market intent | ✅ Anonymized |
| Watchlist items | ✅ Own only |
| Own purchase pool requests | ✅ Full |
| Request status and fill rate | ✅ Own only |
| Matching results (own requests) | ✅ Limited (no farmer identities) |
| Reference price grid | ✅ Read-only |
| Aggregated batch data (anonymized) | ✅ Limited (region, grade, status, heads only) |
| Individual farmer batches | ❌ None |
| Farmer identities | ❌ None |
| Individual batch ownership | ❌ None |
| Admin governance data | ❌ None |
| Farmer reliability scores | ❌ None |
| National herd structure | ❌ None (admin-only) |

#### Can Act

| Action | Permission | Notes |
|--------|------------|-------|
| Express interest in supply | ✅ | If Active |
| Create pool requests | ✅ | If Active, within matching window |
| Modify own draft pool requests | ✅ | Draft status only |
| Cancel own pool requests | ✅ | Before matching begins |
| Confirm delivery | ✅ | In execution lifecycle |
| View own request matches | ✅ | Can see matches for own pool requests (anonymized) |
| See farmer identities | ❌ | Never exposed |
| See individual batch details | ❌ | Aggregated only |
| Access governance controls | ❌ | Admin-only |

#### Cannot Do

- View individual farmer profiles or batches
- See farmer identities or contact information
- Access admin matching controls
- View system-wide statistics
- See other MPKs' requests
- Access national herd structure data

---

### Admin (TURAN / ZENGI)

Admins are the central coordinators with full platform control.

#### Admin Types

- **TURAN Admin** - Full platform access
- **ZENGI Admin** - Full platform access (same permissions)

#### Can View

| Resource | Access |
|----------|--------|
| All profiles | ✅ Full |
| All farmers | ✅ Full with identities |
| All MPKs | ✅ Full with identities |
| All batches | ✅ Full with ownership |
| All pool requests | ✅ Full |
| All pool matches | ✅ Full |
| All executions | ✅ Full |
| Reliability scores | ✅ Full |
| Audit logs | ✅ Full |
| Governance data | ✅ Full |
| National herd structure | ✅ Full (aggregated) |
| Market intent overview | ✅ Full |
| Matching windows | ✅ Full |
| Price grid management | ✅ Full |
| Premium settings | ✅ Full |

#### Can Act

| Action | Permission | Notes |
|--------|------------|-------|
| Update farmer grading | ✅ | With mandatory note |
| Update MPK status | ✅ | With mandatory note |
| Apply/remove access restrictions | ✅ | With mandatory note |
| Create matching windows | ✅ | Full control |
| Propose pool matches | ✅ | Matching workspace |
| Finalize pool matches | ✅ | After verification |
| Override any status | ✅ | With mandatory note |
| Manage price grid | ✅ | Create/activate versions |
| Manage premium settings | ✅ | Configure premiums |
| Verify herd structure data | ✅ | Set confidence levels |
| Full CRUD on all entities | ✅ | All tables |

#### Mandatory Notes

Admin actions that modify critical data **MUST** include a note:
- Farmer grading changes
- MPK status changes
- Access restrictions
- Status overrides
- Price grid activations

---

## Data Masking & Aggregation Rules

### Supply Data Shown to MPK

All supply data shown to MPK is:
- **Aggregated** by region, readiness status, grade, and target week
- **Anonymized** - no farmer identities, contacts, or batch numbers

**Example:**
```
✅ Shown: "Northern Region: 450 heads confirmed, 200 soft committed"
❌ Hidden: "Farm ABC (contact: +7...): Batch B-2024-042, 150 heads"
```

### Demand Data Shown to Farmer

All demand data shown to Farmer is:
- **Aggregated** by region, grade, and target week
- **Anonymized** - no MPK identities or request numbers

**Example:**
```
✅ Shown: "Demand for Grade A in Northern Region: 800 heads"
❌ Hidden: "MPK XYZ requests 500 heads, contact: ..."
```

### Batch Identifiers

| Viewer | Batch Numbers | Farmer Identity | Contact Info |
|--------|---------------|-----------------|--------------|
| Farmer | Own only | Own only | Own only |
| MPK | ❌ Hidden (anonymized batch data only) | ❌ Hidden | ❌ Hidden |
| Admin | ✅ All | ✅ All | ✅ All |

**Note**: MPKs can view anonymized batch data (region, grade, status, heads, target_week) for aggregated supply visibility, but cannot see batch numbers, farmer identities, or contact information.

### Reliability Signals

| Viewer | Farmer Reliability | MPK Fulfillment Rate |
|--------|-------------------|---------------------|
| Farmer | ❌ Hidden | ❌ Hidden |
| MPK | ❌ Hidden | Own only |
| Admin | ✅ All | ✅ All |

---

## Access Control Implementation

### Frontend Enforcement

Permissions are checked using the `usePermissions()` hook:

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { canViewAllFarmers, canUpdateFarmerGrading } = usePermissions();
  
  if (!canViewAllFarmers()) {
    return <AccessDenied />;
  }
  
  // Render component...
}
```

### Backend Enforcement (RLS Policies)

All data access is enforced at the database level via Row Level Security (RLS):

- **Farmers** can only SELECT/INSERT/UPDATE/DELETE their own batches
- **MPKs** can only see aggregated supply data and their own requests
- **Admin** has full access via `has_role(auth.uid(), 'admin')` policies

### Account Status Checks

Routes are protected by account status:

- **Observer** - Limited read-only access
- **Active** - Full role permissions
- **Restricted** - Access blocked (admin override)

---

## Audit & Safety Requirements

### Logged Actions

The following actions must be logged with timestamp, performer, and context:

| Action Category | Specific Actions |
|-----------------|------------------|
| Status Changes | Batch readiness changes, Request status updates |
| Grading Updates | Farmer grading level changes |
| Access Restrictions | Apply/remove farmer restrictions, Apply/remove MPK restrictions |
| Pool Operations | Match proposals, Match approvals, Request creation/modification |
| Admin Overrides | Any status override (requires mandatory note) |

### Audit Log Visibility

| Log Type | Farmer | MPK | Admin |
|----------|--------|-----|-------|
| Own activity | ✅ Limited | ✅ Limited | ✅ Full |
| Other users' activity | ❌ | ❌ | ✅ Full |
| System-wide logs | ❌ | ❌ | ✅ Full |

---

## Constraints

1. ❌ No authentication complexity beyond role-based access
2. ❌ No contracts, pricing, or financial permissions
3. ❌ No cross-role identity exposure
4. ✅ Keep implementation simple and explicit
5. ✅ Trust and power boundary, not technical security showcase

---

## Next Steps

- [Farmer Guide](/docs/en/farmer-guide/) - Detailed guide for Farmers
- [MPK Guide](/docs/en/mpk-guide/) - Detailed guide for MPKs
- [Admin Guide](/docs/en/admin-guide/) - Detailed guide for Admins

