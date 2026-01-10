# TURAN Standard Pool - Admin Handbook

**Version:** 1.0
**Sprint:** 7-8
**Last Updated:** 2026-01-09

---

## Table of Contents

1. [Introduction](#introduction)
2. [Admin Role Overview](#admin-role-overview)
3. [Core Workflows](#core-workflows)
4. [Matching Window Management](#matching-window-management)
5. [Pool Request Management](#pool-request-management)
6. [Batch Management](#batch-management)
7. [Execution & Settlement](#execution--settlement)
8. [Admin Override Actions](#admin-override-actions)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Best Practices](#best-practices)

---

## Introduction

This handbook provides comprehensive guidance for TURAN Standard Pool administrators. As an admin, you are responsible for:

- Managing matching windows
- Overseeing pool request lifecycle
- Facilitating supply-demand matching
- Monitoring execution and settlement
- Performing administrative overrides when necessary

### Key Principles

1. **Transparency** - All actions are logged and auditable
2. **Minimal Intervention** - Only override when absolutely necessary
3. **Communication** - Keep stakeholders informed of system changes
4. **Documentation** - Always provide reasons for administrative actions

---

## Admin Role Overview

### Permissions

| Action | Permission |
|--------|------------|
| View all batches | Yes |
| View all pool requests | Yes |
| Create matching windows | Yes |
| Modify matching windows | Yes |
| Override batch locks | Yes |
| Transition pool requests | Yes |
| Schedule deliveries | Yes |
| Confirm compliance | Yes |
| Calculate settlements | Yes |
| Close executions | Yes |

### Access Points

- **Admin Dashboard**: `/admin`
- **Pool Matching**: `/admin/pool-matching`
- **Execution Management**: `/admin/execution-management`
- **Matching Windows**: `/admin/matching-windows`
- **Override Log**: `/admin/override-log`

---

## Core Workflows

### Daily Admin Tasks

1. **Morning Review**
   - Check pending pool requests
   - Review matching window status
   - Check execution pipeline

2. **Matching Window Monitoring**
   - Monitor countdown to lock_date
   - Review submission rates
   - Identify at-risk requests

3. **Matching Execution**
   - Run matching algorithm after lock_date
   - Review match confidence scores
   - Confirm or adjust matches

4. **End-of-Day**
   - Review completed executions
   - Check for blocked items
   - Update any override log notes

---

## Matching Window Management

### Window Lifecycle

```
Upcoming → Active → Locked → Closed
```

### Status Definitions

| Status | Description |
|--------|-------------|
| **Upcoming** | Window created but not yet started |
| **Active** | Accepting submissions (before lock_date) |
| **Locked** | Submissions closed, matching in progress |
| **Closed** | All matching completed |

### Creating a Matching Window

1. Navigate to **Admin → Matching Windows**
2. Click **Create New Window**
3. Fill in required fields:
   - **Name**: Descriptive name (e.g., "Q1 2026 Week 2")
   - **Start Date**: When submissions open
   - **Lock Date**: When submissions close
   - **End Date**: Final completion date
   - **Target Week**: Delivery week reference

### Best Practices for Windows

1. **Timing**
   - Allow 5-7 days for submissions
   - Lock 2-3 days before matching
   - Keep windows consistent in length

2. **Communication**
   - Announce new windows 1 week in advance
   - Send reminders 24h before lock_date
   - Notify of any schedule changes

3. **Avoid Common Mistakes**
   - Don't create overlapping windows
   - Don't shorten window during active period
   - Always have reason for extensions

### Window Extension (Override)

When extending a window:

1. Ensure valid business reason
2. Document reason in override log
3. Notify affected MPKs
4. Update lock_date via Admin Override

---

## Pool Request Management

### Request Lifecycle

```
Draft → Submitted → Matching → Partial/Fulfilled → Closed
```

### Admin Actions by Status

| Status | Available Actions |
|--------|-------------------|
| Draft | View only (MPK manages) |
| Submitted | Transition to Matching, Cancel |
| Matching | Transition to Partial/Fulfilled, Cancel |
| Partial | Transition to Fulfilled, Cancel |
| Fulfilled | Transition to Closed |
| Closed | No actions (terminal) |

### Transition Guidelines

1. **Submitted → Matching**
   - Only after matching window locks
   - Verify request criteria are valid
   - System can auto-transition after lock_date

2. **Matching → Partial/Fulfilled**
   - After executing matches
   - Verify matched_volume calculation
   - Update fill rate

3. **Fulfilled → Closed**
   - All executions must be settled
   - Verify no pending deliveries
   - Final closure is irreversible

---

## Batch Management

### Batch Lifecycle

```
Draft → Forecast → SoftCommitted → Confirmed → Matched → Closed
```

### Admin Override: Unlocking Batches

Batches are locked for editing after certain status transitions. Admin can unlock when:

1. **Farmer reports data entry error**
   - Must provide specific correction needed
   - Document what will be changed

2. **System synchronization issue**
   - Technical reason for incorrect data
   - Coordinate with support team

3. **Exceptional circumstances**
   - Business-critical adjustment
   - Requires manager approval

### Override Process

1. Navigate to batch detail page
2. Click "Admin Override" button
3. Select action type (Unlock/Relock)
4. Provide detailed reason (min 10 characters)
5. Check acknowledgment box
6. Confirm action

**Warning:** All overrides are logged with timestamp, performer, and reason.

---

## Execution & Settlement

### Execution Lifecycle (Irreversible)

```
Matched → Scheduled → Delivered → Confirmed → Settled → Closed
```

**Important:** Sprint 7-8 removed all reversions. The execution flow is now one-way only.

### Stage Responsibilities

| Stage | Actor | Action |
|-------|-------|--------|
| Matched | Admin | Schedule delivery window |
| Scheduled | MPK | Confirm delivery receipt |
| Delivered | Admin | Verify compliance |
| Confirmed | Admin | Calculate indicative settlement |
| Settled | Admin | Close execution |

### Settlement Calculation

Formula:
```
Indicative Total = Reference Price + Premiums Applied
```

**Note:** TURAN does not handle actual payments. Settlement is indicative only for reference between parties.

### Compliance Verification

Before confirming compliance, verify:

1. **Volume Match** - Delivered quantity matches agreed amount (±5%)
2. **Delivery Window** - Within scheduled dates
3. **Quality Grade** - Meets specified requirements
4. **Health Certificate** - Valid veterinary documentation
5. **Weight Range** - Within acceptance criteria

---

## Admin Override Actions

### Types of Overrides

| Type | Purpose | Risk Level |
|------|---------|------------|
| Batch Unlock | Allow editing locked batch | Medium |
| Batch Relock | Remove unlock override | Low |
| Window Extend | Extend submission deadline | Medium |
| Window Adjust | Modify window parameters | High |

### Override Log

All overrides are recorded with:
- Timestamp
- Admin performer
- Target (batch/window)
- Previous value
- New value
- Detailed reason

Access log at: **Admin → Override Log**

### Guidelines for Overrides

1. **Minimum Intervention**
   - Only override when no alternative exists
   - Consider impact on other users

2. **Documentation**
   - Always provide clear, specific reason
   - Reference ticket/request if applicable

3. **Communication**
   - Notify affected parties
   - Update relevant stakeholders

4. **Review**
   - Regularly audit override log
   - Identify patterns requiring process changes

---

## Troubleshooting Guide

### Common Issues

#### "Farmer can't edit batch"

**Cause:** Batch is in locked status (SoftCommitted or higher)

**Solution:**
1. Verify current status
2. If valid reason for edit, use Admin Override → Unlock
3. Inform farmer of editing window
4. Re-lock after changes complete

#### "MPK submission rejected"

**Cause:** Matching window is locked or closed

**Solution:**
1. Check window status
2. If window should be open, verify dates
3. Consider window extension if valid reason
4. Otherwise, guide MPK to next window

#### "Execution stuck at Delivered"

**Cause:** Admin hasn't confirmed compliance

**Solution:**
1. Review delivery documentation
2. Verify compliance criteria met
3. Confirm compliance or document issues
4. If issues, work with parties to resolve

#### "Match confidence is low"

**Cause:** Criteria mismatch between batch and request

**Solution:**
1. Review confidence breakdown
2. Identify mismatched factors
3. Consider if match is viable
4. Adjust or proceed with documented reason

---

## Best Practices

### General

- Check dashboard at start and end of each day
- Review pending actions before leaving
- Keep override reasons detailed and actionable
- Communicate proactively with users

### Matching Windows

- Maintain consistent schedules
- Announce changes in advance
- Allow buffer time before lock_date
- Have contingency plans for extensions

### Pool Requests

- Monitor fill rates across active requests
- Identify at-risk requests early
- Balance supply across multiple requests
- Prioritize based on business needs

### Executions

- Process in order (FIFO)
- Don't batch too many at once
- Verify compliance thoroughly
- Document any discrepancies

### Overrides

- Treat as exception, not rule
- Always get verbal approval first
- Document thoroughly
- Review patterns monthly

---

## Quick Reference

### Keyboard Shortcuts (Admin Pages)

| Key | Action |
|-----|--------|
| `R` | Refresh data |
| `F` | Focus filter |
| `N` | New item (context-dependent) |
| `Esc` | Close dialog |

### Status Color Codes

| Color | Meaning |
|-------|---------|
| Blue | New/Submitted |
| Amber | In Progress/Scheduled |
| Purple | Matching/Delivered |
| Green | Success/Completed |
| Slate | Closed |
| Red | Cancelled/Error |

### Contact

- **Technical Support**: support@turan.kz
- **User Issues**: helpdesk@turan.kz
- **Escalation**: admin@turan.kz

---

**Document Version:** 1.0
**Maintained By:** Development Team
**Next Review:** End of Sprint 9-10
