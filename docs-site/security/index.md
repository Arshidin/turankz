# Data & Security Model

## Overview

This section documents the security architecture, data access patterns, and audit mechanisms of the Turan Standard Pool platform.

---

## Supabase Auth Overview

### Authentication

The platform uses **Supabase Auth** for user authentication:

- Email/password authentication
- Role-based access control (RBAC)
- Session management
- User profile management

### User Roles

Roles are stored in `user_roles` table:
- `admin` - Platform coordinators
- `farmer` - Supply-side participants
- `mpk` - Demand-side participants

### Role Assignment

- Roles assigned during registration
- Admin can update roles (with note)
- Single role per user (no multi-role)

---

## Role-Based Access Control (RBAC)

### Permission Model

Permissions are defined in `src/lib/access-control.ts`:

- **Farmer Permissions** - Own data only
- **MPK Permissions** - Aggregated supply, own requests
- **Admin Permissions** - Full platform access

### Permission Checks

**Frontend:**
```typescript
import { usePermissions } from '@/hooks/usePermissions';

const { canViewAllFarmers } = usePermissions();
if (!canViewAllFarmers()) {
  return <AccessDenied />;
}
```

**Backend:**
- RLS policies enforce permissions
- Database-level security
- No bypass possible

---

## Row Level Security (RLS)

### RLS Philosophy

**All tables have RLS enabled:**
- Data access enforced at database level
- Policies based on user role and ownership
- No data exposure without proper permissions

### RLS Policies

#### Batches Table

**Farmers:**
- SELECT: Own batches only (`auth.uid() = user_id`)
- INSERT: Own batches only
- UPDATE: Own batches only
- DELETE: Own batches only

**MPKs:**
- SELECT: All batches (anonymized - application layer filters fields)
  - Policy: `"MPKs can view anonymized batches"`
  - Application must exclude: `user_id`, `batch_number`, `notes`, `mpk_interest`
  - Application includes: `id`, `heads`, `grade`, `region`, `status`, `target_week`, `avg_weight`

**Admins:**
- SELECT: All batches (`has_role(auth.uid(), 'admin')`)
- UPDATE: All batches (`has_role(auth.uid(), 'admin')`)
- INSERT/DELETE: All batches

#### Pool Requests Table

**MPKs:**
- SELECT: Own requests only (via `mpk_id` matching `user_id`)
- INSERT: Own requests only
- UPDATE: Own draft requests only (status = 'draft')

**Admins:**
- SELECT/INSERT/UPDATE/DELETE: All requests (`has_role(auth.uid(), 'admin')`)

#### Pool Matches Table

**Farmers:**
- SELECT: Matches for own batches only (anonymized - no MPK identity)
  - Policy: `"Farmers can view own batch matchings"`
  - Can see: matched volume, matching date, target week, required grade
  - Cannot see: MPK identity, request details, other farmers' matches

**MPKs:**
- SELECT: Matches for own requests (anonymized - no farmer identity)
  - Policy: `"MPKs can view own request matches"`

**Admins:**
- SELECT/INSERT/UPDATE/DELETE: All matches (`has_role(auth.uid(), 'admin')`)

#### Execution Table

**Farmers:**
- SELECT: Executions for own batches
  - Policy: `"Farmers can view own batch executions"`

**MPKs:**
- SELECT: Executions for own requests
  - Policy: `"MPKs can view own request executions"`
- UPDATE: Own request executions (for delivery confirmation)
  - Policy: `"MPKs can update own request executions for delivery confirmation"`

**Admins:**
- SELECT/INSERT/UPDATE: All executions (`has_role(auth.uid(), 'admin')`)

#### Herd Structure Table

**Farmers:**
- SELECT/INSERT: Own snapshots only
- DELETE: Own snapshots (within 24 hours)

**Admins:**
- SELECT: All snapshots
- UPDATE: Verification status only (cannot edit farmer-submitted data)

#### Market Intent Table

**Farmers:**
- SELECT/INSERT/DELETE: Own intents only

**Admins:**
- SELECT: All intents

### Policy Examples

```sql
-- Farmers can only see own batches
CREATE POLICY "Farmers can view own batches"
ON public.batches FOR SELECT
USING (farmer_id = (SELECT id FROM public.farmers WHERE user_id = auth.uid()));

-- MPKs can view aggregated supply (via RPC functions)
-- No direct table access to batches

-- Admins can view all
CREATE POLICY "Admins can view all batches"
ON public.batches FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
```

---

## Audit Logging

### Logged Actions

**All critical actions are logged:**

| Action Category | Logged Events |
|-----------------|---------------|
| Status Changes | Batch readiness, Request status updates |
| Grading Updates | Farmer grading changes |
| Access Restrictions | Apply/remove restrictions |
| Pool Operations | Match proposals, approvals |
| Admin Overrides | Status overrides, data corrections |

### Audit Log Structure

```typescript
{
  event_type: string;
  actor_role: 'admin' | 'farmer' | 'mpk' | 'system';
  actor_name: string;
  description: string;
  target_type: string;
  target_id: string;
  metadata: object;
  created_at: timestamp;
}
```

### Audit Log Access

- **Farmers**: Own activity only (limited)
- **MPKs**: Own activity only (limited)
- **Admins**: Full audit log access

---

## Realtime Updates

### Supabase Realtime

The platform uses Supabase Realtime for:
- Status updates
- Matching progress
- Window status changes
- Notification delivery

### Subscription Patterns

**Farmers subscribe to:**
- Own batch status changes
- Pool invitations
- Own execution updates

**MPKs subscribe to:**
- Own request status changes
- Matching progress
- Own execution updates

**Admins subscribe to:**
- All status changes
- Matching events
- System-wide updates

---

## Data Isolation

### Identity Isolation

**Farmer ↔ MPK:**
- Identities never cross-exposed
- All relationships mediated by Admin
- Aggregated data only for visibility

### Data Segregation

**By Role:**
- Farmers: Own data only
- MPKs: Aggregated supply, own requests
- Admins: Full visibility

**By Table:**
- RLS policies enforce segregation
- No cross-role data access
- Admin mediation required

---

## Security Best Practices

### Frontend Security

- Permission checks before rendering
- Route protection by account status
- No sensitive data in client-side code

### Backend Security

- RLS policies on all tables
- Function-level security (SECURITY DEFINER)
- Input validation
- SQL injection prevention

### Data Protection

- No identity cross-exposure
- Aggregated data only for visibility
- Audit trail for all changes
- Mandatory notes for overrides

---

## Next Steps

- [Role Model & Access Control](/docs/en/roles/) - Detailed role permissions
- [Business Logic](/docs/en/business-logic/) - Guardrails and constraints
- [Admin Guide](/docs/en/admin-guide/) - Admin security responsibilities

