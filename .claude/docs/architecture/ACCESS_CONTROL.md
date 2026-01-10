# Access Control & Permissions Framework
## Turan Standard Pool Platform v1.1

This document defines the trust and power boundaries across the platform. All data visibility and actions are strictly role-based.

---

## Purpose

This access control layer:
- Formalizes who can see, edit, and act on data
- Protects TURAN / ZENGI as the central coordinator
- Prevents bypassing the platform
- Ensures clarity, predictability, and minimal exposure

---

## Global Access Principles

1. **Data visibility and actions are strictly role-based**
2. **No user can access another role's internal controls or governance data**
3. **All sensitive relationships are mediated by Admin**
4. **Farmer and MPK identities are never cross-exposed**

---

## Role Definitions

### Farmer

Farmers are supply-side participants who declare livestock batches and respond to pool invitations.

#### Can View:
| Resource | Access |
|----------|--------|
| Own profile | ✅ Full |
| Own livestock batches | ✅ Full |
| Own sales calendar | ✅ Full |
| Pool invitations (received) | ✅ Limited |
| Aggregated demand signals | ✅ Anonymized (no MPK identities) |
| Other farmers | ❌ None |
| MPK identities | ❌ None |
| Pool request details | ❌ None |
| Individual batch matches | ❌ None |
| System-wide data | ❌ None |

#### Can Act:
| Action | Permission |
|--------|------------|
| Declare new batches | ✅ |
| Change readiness (Forecast → Soft → Confirmed) | ✅ |
| Confirm pool invitations | ✅ |
| Decline pool invitations | ✅ |
| Express interest | ❌ |
| Create pool requests | ❌ |
| See MPK identities | ❌ |

---

### MPK (Meat Processing Plant)

MPKs are demand-side participants who express interest and create purchase pool requests.

#### Can View:
| Resource | Access |
|----------|--------|
| Own profile | ✅ Full |
| Aggregated supply (by region, month, readiness, grade) | ✅ Anonymized |
| Watchlist items | ✅ Own only |
| Own purchase pool requests | ✅ Full |
| Request status and fill rate | ✅ Own only |
| Individual farmer batches in matches | ❌ None |
| Farmer identities | ❌ None |
| Individual batch ownership | ❌ None |
| Admin governance data | ❌ None |
| Farmer reliability scores | ❌ None |

#### Can Act:
| Action | Permission |
|--------|------------|
| Express interest in supply | ✅ |
| Create pool requests | ✅ (within limits) |
| Modify own draft pool requests | ✅ |
| Cancel own pool requests | ✅ |
| See farmer identities | ❌ |
| See individual batch details | ❌ |
| Access governance controls | ❌ |

---

### Admin (TURAN / ZENGI)

Admins are the central coordinators with full platform control.

#### Can View:
| Resource | Access |
|----------|--------|
| All profiles | ✅ Full |
| All farmers | ✅ Full with identities |
| All MPKs | ✅ Full with identities |
| All batches | ✅ Full with ownership |
| All pool requests | ✅ Full |
| All pool matches | ✅ Full |
| Reliability scores | ✅ Full |
| Audit logs | ✅ Full |
| Governance data | ✅ Full |

#### Can Act:
| Action | Permission |
|--------|------------|
| Update farmer grading | ✅ (with mandatory note) |
| Update MPK status | ✅ (with mandatory note) |
| Apply/remove access restrictions | ✅ (with mandatory note) |
| Propose pool matches | ✅ |
| Approve pool matches | ✅ |
| Override any status | ✅ (with mandatory note) |
| Full CRUD on all entities | ✅ |

---

## Data Masking & Aggregation Rules

### Supply Data Shown to MPK

All supply data shown to MPK is:
- **Aggregated** by region, readiness status, grade, and target week
- **Anonymized** - no farmer identities, contacts, or batch numbers

```
✅ Shown: "Northern Region: 450 heads confirmed, 200 soft committed"
❌ Hidden: "Farm ABC (contact: +7...): Batch B-2024-042, 150 heads"
```

### Batch Identifiers

| Viewer | Batch Numbers | Farmer Identity | Contact Info |
|--------|---------------|-----------------|--------------|
| Farmer | Own only | Own only | Own only |
| MPK | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| Admin | ✅ All | ✅ All | ✅ All |

### Reliability Signals

| Viewer | Farmer Reliability | MPK Fulfillment Rate |
|--------|-------------------|---------------------|
| Farmer | ❌ Hidden | ❌ Hidden |
| MPK | ❌ Hidden | Own only |
| Admin | ✅ All | ✅ All |

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

## Implementation Notes

### Frontend Enforcement

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

All data access is enforced at the database level via Row Level Security:

- Farmers can only SELECT/INSERT/UPDATE/DELETE their own batches
- MPK data access is mediated through Admin-controlled views
- Admin has full access via `true` policies (authenticated users with admin role)

### Mandatory Notes

Admin actions that modify grading, status, or restrictions MUST include a note:

```typescript
const { validateAction } = usePermissions();

const result = validateAction('overrideStatus', { 
  requiresNote: true, 
  note: userProvidedNote 
});

if (!result.allowed) {
  showError(result.reason);
  return;
}
```

---

## Constraints

1. ❌ No authentication complexity beyond role-based access
2. ❌ No contracts, pricing, or financial permissions
3. ❌ No cross-role identity exposure
4. ✅ Keep implementation simple and explicit
5. ✅ Trust and power boundary, not technical security showcase

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12 | Initial access control framework |
| 1.1 | 2024-12 | Added data masking rules, audit requirements |
