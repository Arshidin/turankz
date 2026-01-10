# .claude - Development Documentation

**Purpose:** Central documentation hub for TURAN Standard Pool development

**Created:** 2026-01-09 (Sprint 6)
**Maintained By:** Development Team

---

## 📚 Documentation Files

### 1. [INDEX.md](./INDEX.md) - Start Here
**Master index with quick navigation to all documentation**

- Quick links to all docs
- Current sprint status
- Project structure overview
- Key technologies
- Quick start commands
- Recent changes log

**Use this when:** You need to quickly find any documentation or understand current project status.

---

### 2. [ARCHITECTURE.md](./ARCHITECTURE.md) - System Design
**Complete system architecture documentation (12,000+ lines)**

Contains:
- Architectural overview (4 layers)
- Tech stack deep dive
- Core design patterns (FSM, Provider, Hook, etc.)
- Database architecture with RLS policies
- Business logic architecture
- Component architecture
- Security architecture
- Performance considerations

**Use this when:**
- Onboarding new developers
- Planning architectural changes
- Understanding system design decisions
- Reviewing security implementation

---

### 3. [ROADMAP.md](./ROADMAP.md) - Development Plan
**Sprint-based development roadmap (3-6 months)**

Contains:
- Sprint timeline (12 sprints)
- Detailed sprint breakdowns
- Success metrics
- Risk management
- Dependencies tracking
- Progress visualization

**Current Status:**
- Sprint 1-2: ✅ Completed (Batch Management)
- Sprint 3-4: ✅ Completed (Pool Requests & Matching)
- Sprint 5: ✅ Completed (Platform Consistency)
- Sprint 6: 🔄 In Progress (High Priority Integration)
- Sprint 7-12: ⏳ Planned

**Use this when:**
- Planning next sprint
- Tracking project progress
- Understanding what's been completed
- Identifying upcoming work

---

### 4. [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) - Code Navigation
**Detailed project structure and critical files reference**

Contains:
- Directory overview (full tree structure)
- Critical files reference (with line counts)
- Module-by-module breakdown
- Naming conventions
- File organization patterns
- Quick file lookup guide

**Use this when:**
- Looking for specific files
- Understanding code organization
- Planning file structure changes
- Onboarding new developers

---

## 🚀 Quick Start for Developers

### First Time Setup

1. **Read INDEX.md** - Get oriented
2. **Skim ARCHITECTURE.md** - Understand system design
3. **Check ROADMAP.md** - See current sprint
4. **Browse FILE_STRUCTURE.md** - Learn code layout

### Daily Development

1. **Check ROADMAP.md** - Current sprint tasks
2. **Use FILE_STRUCTURE.md** - Find files quickly
3. **Reference ARCHITECTURE.md** - Understand patterns
4. **Update docs** - Keep documentation current

---

## 📝 Documentation Standards

### When to Update These Docs

**INDEX.md:**
- After completing each sprint
- When adding major features
- When dependencies change

**ARCHITECTURE.md:**
- After major refactoring
- When design patterns change
- When adding new architectural layers
- After security changes

**ROADMAP.md:**
- At start/end of each sprint
- When scope changes
- When risks are identified
- When metrics are achieved

**FILE_STRUCTURE.md:**
- When adding new directories
- After major file reorganization
- When file sizes change significantly
- When adding new modules

---

## 🔗 Related Documentation

### In Project Root
- `/docs/` - 65+ detailed markdown files
  - `/docs/fsm/` - FSM documentation
  - `/docs/modules/` - Module documentation (Sprint 5 additions)
  - `/docs/components/` - Component guides
  - `/docs/admin/` - Admin operation guides

### VitePress Site
- `/docs-site/` - User-facing documentation
  - Multi-language (EN/RU/KK)
  - Admin, Farmer, MPK guides
  - API reference

### Improvement Plan
- `/Users/arshidintokhtamov/.claude/plans/foamy-sprouting-octopus.md`
  - Original comprehensive improvement plan
  - Base for current roadmap

---

## 📊 Documentation Metrics

| Metric | Value |
|--------|-------|
| Total .claude docs | 4 files |
| Total documentation lines | ~30,000+ |
| Total project MD files | 69+ (65 in /docs + 4 in .claude) |
| Documentation coverage | Comprehensive |
| Last major update | 2026-01-09 (Sprint 6) |

---

## 🎯 Documentation Philosophy

**Goals:**
1. **Onboarding** - New developers productive in <1 day
2. **Reference** - Quick lookup for any question
3. **Planning** - Clear roadmap for development
4. **Maintenance** - Keep docs in sync with code

**Principles:**
- **Comprehensive** - Cover all aspects of system
- **Current** - Update with code changes
- **Accessible** - Clear structure, easy navigation
- **Actionable** - Practical guidance, not theory

---

## 💡 Tips for Using This Documentation

### For New Developers
1. Start with INDEX.md → Quick overview
2. Read ARCHITECTURE.md (focus on relevant sections)
3. Review FILE_STRUCTURE.md → Learn code layout
4. Check ROADMAP.md → Understand where we're going

### For Feature Development
1. Check ROADMAP.md → Is this planned?
2. Review ARCHITECTURE.md → Understand relevant patterns
3. Use FILE_STRUCTURE.md → Find related files
4. Update docs after implementation

### For Code Review
1. Check ARCHITECTURE.md → Does this follow patterns?
2. Review FILE_STRUCTURE.md → Is organization correct?
3. Check ROADMAP.md → Is this aligned with plan?
4. Verify documentation updates included

---

## 🐛 Keeping Docs Up to Date

### After Code Changes

**Small changes** (bug fixes, minor features):
- Update INDEX.md "Recent Changes" section

**Medium changes** (new components, refactoring):
- Update FILE_STRUCTURE.md if files added/moved
- Update ARCHITECTURE.md if patterns changed

**Large changes** (new modules, major refactoring):
- Update all 4 docs
- Consider adding new detailed docs in /docs/
- Update ROADMAP.md progress

---

## 📞 Questions?

If documentation is unclear:
1. Check related docs in `/docs/`
2. Review code comments
3. Ask development team
4. Update docs with clarification

**Remember:** Good documentation is a living document. Keep it current!

---

**Created:** 2026-01-09
**Version:** 1.0
**Next Review:** End of Sprint 6
