# Matching Window Management - Best Practices

**Version:** 1.0
**Sprint:** 7-8
**Last Updated:** 2026-01-09

---

## Overview

Matching windows are time-bounded periods during which MPKs can submit pool requests. Proper window management is critical for smooth marketplace operations.

---

## Window Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    MATCHING WINDOW FLOW                       │
│                                                               │
│  Upcoming ──────► Active ──────► Locked ──────► Closed       │
│     │               │              │              │           │
│  Created        Submissions     No new        Matching       │
│  awaiting       accepted        requests      completed      │
│  start date                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Best Practices

### 1. Window Creation

**Timing Recommendations:**

| Parameter | Recommended | Minimum | Maximum |
|-----------|-------------|---------|---------|
| Active Period | 5-7 days | 3 days | 14 days |
| Buffer (lock → end) | 2-3 days | 1 day | 5 days |
| Notice Before Start | 7 days | 3 days | - |

**Naming Convention:**
```
[Year] [Quarter/Month] - Week [Number]
Example: "2026 Q1 - Week 2"
```

**Checklist Before Creating:**
- [ ] Previous window closed
- [ ] Delivery dates don't overlap
- [ ] Stakeholders notified
- [ ] Calendar conflicts checked

### 2. During Active Period

**Daily Monitoring:**
- Check submission count
- Review request criteria distribution
- Identify potential supply gaps
- Monitor countdown to lock_date

**Red Flags to Watch:**
- Very low submission rate
- Unusually high volume requests
- Criteria that can't be matched
- Multiple similar requests

**Recommended Actions:**
1. Send reminder at 72h before lock
2. Send reminder at 24h before lock
3. Contact inactive MPKs if needed

### 3. Lock Period Management

**Pre-Lock Checklist:**
- [ ] All expected submissions received
- [ ] Supply overview prepared
- [ ] Matching priorities defined
- [ ] Emergency contact list ready

**At Lock Time:**
- System auto-transitions submitted → matching
- No new submissions accepted
- Begin matching analysis

**Post-Lock:**
- Run match confidence analysis
- Identify best matches
- Prepare matching proposals

### 4. Window Extension Guidelines

**Valid Reasons for Extension:**
1. System downtime during active period
2. Critical mass of submissions not reached
3. Major market event requiring adjustment
4. Stakeholder communication failure

**Invalid Reasons:**
1. Single MPK request for more time
2. Minor inconvenience
3. No documented reason

**Extension Process:**
1. Document reason thoroughly
2. Calculate new lock_date
3. Notify all active participants
4. Update via Admin Override
5. Log extension in audit trail

### 5. Window Closure

**Pre-Closure Checklist:**
- [ ] All matches finalized
- [ ] Unmatched requests addressed
- [ ] Fill rates documented
- [ ] Execution records created

**Closure Actions:**
- Transition window to "Closed"
- Generate window summary report
- Archive for historical reference

---

## Common Mistakes to Avoid

### 1. Overlapping Windows

**Problem:** Multiple active windows cause confusion.

**Prevention:**
- Check calendar before creation
- One active window per delivery period
- Clear naming convention

### 2. Too Short Active Period

**Problem:** MPKs don't have time to submit.

**Prevention:**
- Minimum 3-day active period
- Account for weekends/holidays
- Consider MPK workload

### 3. Last-Minute Extensions

**Problem:** Creates uncertainty and poor planning.

**Prevention:**
- Set realistic initial dates
- Build in buffer time
- Have extension criteria predefined

### 4. Poor Communication

**Problem:** Stakeholders unaware of window timing.

**Prevention:**
- Announce windows 1 week ahead
- Send multiple reminders
- Use consistent channels

### 5. Ignoring Low Submission Rates

**Problem:** Window closes with insufficient demand data.

**Prevention:**
- Monitor daily during active period
- Proactive outreach to MPKs
- Consider targeted extensions

---

## Window Configuration Reference

### Status Definitions

| Status | Submissions | Matching | Editable |
|--------|-------------|----------|----------|
| Upcoming | No | No | Yes |
| Active | Yes | No | Limited |
| Locked | No | Yes | No |
| Closed | No | No | No |

### Key Dates

| Date | Purpose | Changeable |
|------|---------|------------|
| start_date | When submissions open | Before active |
| lock_date | When submissions close | Via override |
| end_date | Target completion | Via override |

### Validation Rules

1. `start_date < lock_date < end_date`
2. Active period minimum: 3 days
3. Can't modify closed windows
4. Extensions only during active/locked

---

## Emergency Procedures

### Window Won't Lock

**Symptoms:** Window stuck in "Active" after lock_date

**Resolution:**
1. Check server time synchronization
2. Manually trigger status update
3. If persists, contact technical support

### Critical Submission Missed

**Scenario:** Major MPK missed deadline

**Options:**
1. **Extend window** (if within policy)
2. **Wait for next window** (preferred)
3. **Manual exception** (last resort, requires override)

### System Outage During Window

**Response:**
1. Document outage start/end
2. Assess impact on submissions
3. Extend by outage duration
4. Notify all participants
5. Log in override audit

---

## Metrics to Track

### Window Performance

| Metric | Target | Warning |
|--------|--------|---------|
| Submission rate | >80% of expected | <50% |
| Fill rate | >70% | <40% |
| Match confidence avg | >75 | <50 |
| Extensions per quarter | 0-1 | >2 |

### Timing Analysis

- Average days from start to first submission
- Submission distribution (early/mid/late)
- Time from lock to first match
- Window-to-close duration

---

## Templates

### Window Announcement Template

```
Тема: Открытие нового окна сопоставления

Уважаемые партнёры,

Сообщаем об открытии нового окна сопоставления:

Название: [Window Name]
Период подачи: [start_date] - [lock_date]
Доставка: [target_week]

Пожалуйста, подайте ваши заявки до [lock_date].

По вопросам обращайтесь: [contact]
```

### Extension Notification Template

```
Тема: Продление окна сопоставления

Уважаемые партнёры,

Сообщаем о продлении окна "[Window Name]":

Новая дата закрытия: [new_lock_date]
Причина: [reason]

Используйте дополнительное время для подачи заявок.
```

---

## Checklist Summary

### New Window

- [ ] Previous window closed
- [ ] Dates validated
- [ ] No overlaps
- [ ] Announcement sent
- [ ] Reminders scheduled

### Daily Active

- [ ] Submission count checked
- [ ] Fill rate projected
- [ ] Issues identified
- [ ] Stakeholders updated

### At Lock

- [ ] Final reminder sent
- [ ] Status transitioned
- [ ] Matching begun
- [ ] Unmatched tracked

### Closure

- [ ] All matches done
- [ ] Report generated
- [ ] Status closed
- [ ] Next window planned

---

**Document Maintained By:** Development Team
**Next Review:** End of Sprint 9-10
