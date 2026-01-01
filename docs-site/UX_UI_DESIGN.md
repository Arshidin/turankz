# Documentation UX/UI Design
## Turan Standard Pool Platform

**Design Reference**: Stripe Docs (https://docs.stripe.com/)  
**Target Audience**: Product Managers, Engineers, System Architects, Auditors  
**Design Philosophy**: Institutional clarity, fast navigation, zero friction

---

## 1. Documentation Landing Page (/docs)

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  [Top Bar: Title | Language | Search]                   │
├──────────────┬──────────────────────────────────────────┤
│              │  ┌────────────────────────────────────┐  │
│              │  │  Turan Standard Pool                │  │
│              │  │  Documentation                      │  │
│              │  └────────────────────────────────────┘  │
│              │                                          │
│              │  [Short Description - 2-3 sentences]     │
│              │                                          │
│              │  ┌─────────────┐  ┌─────────────┐       │
│              │  │  Overview   │  │  For        │       │
│              │  │             │  │  Farmers    │       │
│              │  └─────────────┘  └─────────────┘       │
│              │                                          │
│              │  ┌─────────────┐  ┌─────────────┐       │
│              │  │  For MPKs   │  │  For Admins │       │
│              │  │             │  │             │       │
│              │  └─────────────┘  └─────────────┘       │
│              │                                          │
│              │  ┌─────────────┐                        │
│              │  │  Technical  │                        │
│              │  │  Reference  │                        │
│              │  └─────────────┘                        │
│              │                                          │
│              │  [Quick Links]                           │
│              │  • Getting Started                       │
│              │  • API Reference                         │
│              │  • Security Model                        │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### Content Blocks

**Hero Section:**
- Title: "Turan Standard Pool Documentation"
- Subtitle: "Complete platform documentation for Farmers, MPKs, and Administrators"
- Language switcher: [EN] [RU] (prominent, top-right)

**Entry Point Cards (4-column grid on desktop, 2-column on tablet, 1-column on mobile):**

1. **Product Overview**
   - Icon: Info circle
   - Description: "Understand platform purpose, principles, and architecture"
   - Link: `/docs/en/introduction/`

2. **For Farmers**
   - Icon: User
   - Description: "Complete guide for supply-side participants"
   - Link: `/docs/en/farmer-guide/`

3. **For MPKs**
   - Icon: Building
   - Description: "Complete guide for demand-side participants"
   - Link: `/docs/en/mpk-guide/`

4. **For Admins**
   - Icon: Settings
   - Description: "Administrative controls and coordination"
   - Link: `/docs/en/admin-guide/`

5. **Technical Reference**
   - Icon: Code
   - Description: "FSM, security, APIs, and system architecture"
   - Link: `/docs/en/fsm/`

**Quick Links Section:**
- Getting Started
- Role Model & Access Control
- Status Machines (FSM)
- Data & Security Model
- Glossary

---

## 2. Global Layout Structure

### Desktop Layout (≥1024px)

```
┌──────────────────────────────────────────────────────────────┐
│  TOP BAR (Fixed, 60px height)                                │
│  ┌──────────────┬──────────────────────┬──────────────────┐  │
│  │ Turan Docs   │ [Search...]          │ [EN] [RU]        │  │
│  └──────────────┴──────────────────────┴──────────────────┘  │
├──────────────┬────────────────────────────────────────────────┤
│              │  Breadcrumb: Docs > Farmer Guide > Batches     │
│  SIDEBAR     │  ────────────────────────────────────────────  │
│  (280px)     │                                                  │
│              │  [Page Title - H1]                              │
│  • Intro     │  [Page Description]                             │
│  • Roles     │                                                  │
│  • Farmer    │  [Content...]                                    │
│    - Guide   │                                                  │
│    - Batches │                                                  │
│  • MPK       │                                                  │
│  • Admin     │                                                  │
│  • FSM       │                                                  │
│  • Security  │                                                  │
│              │                                                  │
│  [Collapsed] │                                                  │
│              │                                                  │
└──────────────┴────────────────────────────────────────────────┘
```

### Top Bar Specifications

**Height**: 60px  
**Background**: White (#FFFFFF)  
**Border**: 1px solid #E5E7EB (bottom)

**Left Section:**
- Logo/Title: "Turan Standard Pool Docs"
- Font: 16px, semibold, #111827

**Center Section:**
- Search input (optional, can be hidden on mobile)
- Width: 400px (desktop), 300px (tablet)
- Placeholder: "Search documentation..."
- Icon: Search icon on left

**Right Section:**
- Language switcher: [EN] [RU]
- Active language: Blue underline
- Inactive: Gray text, hover underline

### Sidebar Specifications

**Width**: 280px (desktop), 240px (tablet)  
**Background**: #F9FAFB  
**Border**: 1px solid #E5E7EB (right)  
**Scroll**: Independent from main content

**Section Structure:**
- Top-level items: 14px, semibold, #374151
- Second-level items: 13px, regular, #6B7280
- Third-level items: 12px, regular, #9CA3AF
- Active item: Blue background (#EFF6FF), blue text (#2563EB)
- Hover: Light gray background (#F3F4F6)

**Collapsible Sections:**
- Chevron icon (right-aligned)
- Click to expand/collapse
- State persists during session

### Main Content Area

**Max Width**: 900px (centered)  
**Padding**: 48px (desktop), 32px (tablet), 24px (mobile)  
**Line Height**: 1.7  
**Font Size**: 16px (body), 14px (code)

**Typography Scale:**
- H1: 32px, semibold, #111827
- H2: 24px, semibold, #111827
- H3: 20px, semibold, #374151
- H4: 16px, semibold, #374151
- Body: 16px, regular, #374151
- Code: 14px, monospace, #1F2937

---

## 3. Sidebar Navigation Tree

### Complete Structure

```
📚 Documentation
│
├─ 📖 Introduction
│  └─ What is Turan Standard Pool
│
├─ 👥 Role Model & Access Control
│  ├─ Overview
│  ├─ Farmer Permissions
│  ├─ MPK Permissions
│  └─ Admin Permissions
│
├─ 👨‍🌾 Farmer Guide
│  ├─ Registration & Activation
│  ├─ Observer State
│  ├─ Herd Structure (Indicative)
│  ├─ Market Intent (Non-binding)
│  ├─ Batch Lifecycle
│  │  ├─ Creating Batches
│  │  ├─ Status Transitions
│  │  └─ Locking Rules
│  ├─ Premium Eligibility
│  └─ Pool Invitations
│
├─ 🏭 MPK Guide
│  ├─ Registration & Activation
│  ├─ Observer State
│  ├─ Pool Request Creation
│  ├─ Status Lifecycle
│  ├─ Matching Results
│  └─ Execution & Delivery
│
├─ ⚙️ Admin Guide
│  ├─ Coordinator Role
│  ├─ Matching Windows
│  ├─ Pool Matching Process
│  ├─ Conflict Resolution
│  ├─ Price Grid & Premiums
│  └─ Data Verification
│
├─ 🔄 Status Machines (FSM)
│  ├─ Batch FSM
│  ├─ Pool Request FSM
│  ├─ Matching Window FSM
│  ├─ Execution FSM
│  └─ Matching FSM
│
├─ 🛡️ Data & Security Model
│  ├─ Supabase Auth Overview
│  ├─ Role-Based Access Control
│  ├─ Row Level Security (RLS)
│  ├─ Audit Logging
│  └─ Data Masking Rules
│
├─ 📦 Core System Modules
│  ├─ Batch Lifecycle
│  ├─ Pool Requests
│  ├─ Matching Windows
│  ├─ Pool Matching
│  ├─ Contracts & Execution
│  ├─ Premium System
│  └─ Reference Price Grid
│
├─ ⚖️ Business Logic & Guardrails
│  ├─ Binding vs Non-binding
│  ├─ Herd Structure ≠ Supply
│  ├─ Market Intent ≠ Commitment
│  └─ Anti-price-fixing Safeguards
│
├─ ⚠️ Limitations & Non-Goals
│  ├─ What Platform Does NOT Do
│  ├─ Indicative Data Only
│  └─ Admin Mediation Required
│
└─ 📖 Glossary
   └─ Domain Terms (RU/EN)
```

### Sidebar Behavior

**Expansion State:**
- Current section: Always expanded
- Parent sections: Expanded if child is active
- Other sections: Collapsed by default (can be expanded)

**Active Item Highlighting:**
- Background: #EFF6FF (light blue)
- Text: #2563EB (blue)
- Left border: 3px solid #2563EB

**Scroll Behavior:**
- Auto-scroll to active item on page load
- Smooth scroll when clicking sidebar items
- Maintain scroll position when navigating

---

## 4. Page Template Structure

### Standard Documentation Page

```html
<DocumentationLayout>
  <TopBar>
    <Title>Turan Standard Pool Docs</Title>
    <Search />
    <LanguageSwitcher />
  </TopBar>
  
  <MainContainer>
    <Sidebar>
      <NavigationTree />
    </Sidebar>
    
    <ContentArea>
      <Breadcrumb />
      <PageHeader>
        <H1>Page Title</H1>
        <Description>Short description (1-2 sentences)</Description>
        <LastUpdated>Last updated: 2025-01-XX</LastUpdated>
      </PageHeader>
      
      <PageContent>
        <!-- Markdown content -->
        <H2>Section Title</H2>
        <Paragraph>Content...</Paragraph>
        
        <Table>
          <!-- Table content -->
        </Table>
        
        <CodeBlock>
          <!-- Code -->
        </CodeBlock>
        
        <Callout type="info">
          <!-- Callout content -->
        </Callout>
      </PageContent>
      
      <PageFooter>
        <PrevNextNavigation />
        <FeedbackLink />
      </PageFooter>
    </ContentArea>
  </MainContainer>
</DocumentationLayout>
```

### Page Header Component

**Structure:**
```
┌─────────────────────────────────────┐
│  [Breadcrumb: Docs > Section > Page] │
├─────────────────────────────────────┤
│  Page Title (H1)                     │
│  Short description (1-2 sentences)   │
│  Last updated: 2025-01-XX            │
└─────────────────────────────────────┘
```

**Styling:**
- H1: 32px, semibold, #111827, margin-bottom: 8px
- Description: 16px, regular, #6B7280, margin-bottom: 16px
- Last updated: 14px, regular, #9CA3AF, italic

### Breadcrumb Component

**Format**: `Docs > Section > Subsection > Page`

**Styling:**
- Font: 14px, regular, #6B7280
- Separator: `/` or `>` (gray)
- Links: Blue (#2563EB) on hover
- Active item: Not clickable, darker gray

---

## 5. Content Components

### Tables

**Styling:**
- Border: 1px solid #E5E7EB
- Header: Background #F9FAFB, semibold text
- Alternating rows: #FFFFFF and #F9FAFB
- Padding: 12px 16px
- Font: 14px

**Example:**
```
┌──────────────┬──────────┬──────────┐
│ Resource     │ Access   │ Notes    │
├──────────────┼──────────┼──────────┤
│ Own batches  │ ✅ Full  │          │
│ Other farmers│ ❌ None  │          │
└──────────────┴──────────┴──────────┘
```

### Code Blocks

**Styling:**
- Background: #1F2937 (dark gray)
- Text: #F9FAFB (light gray)
- Font: 14px, monospace (Fira Code or JetBrains Mono)
- Padding: 16px
- Border-radius: 6px
- Line numbers: Optional, gray

**Syntax Highlighting:**
- Use Prism.js or similar
- Theme: Dark, minimal

### Callout Boxes

**Types:**
1. **Info** (Blue)
   - Background: #EFF6FF
   - Border: 1px solid #93C5FD
   - Icon: Info circle (blue)
   - Text: #1E40AF

2. **Note** (Yellow)
   - Background: #FEF3C7
   - Border: 1px solid #FCD34D
   - Icon: Lightbulb (yellow)
   - Text: #92400E

3. **Warning** (Orange)
   - Background: #FFF7ED
   - Border: 1px solid #FDBA74
   - Icon: Alert triangle (orange)
   - Text: #9A3412

4. **Important** (Red)
   - Background: #FEE2E2
   - Border: 1px solid #FCA5A5
   - Icon: Alert circle (red)
   - Text: #991B1B

**Structure:**
```
┌─────────────────────────────────────┐
│  ℹ️  Info                            │
│  This is an informational callout.  │
└─────────────────────────────────────┘
```

### Step Lists

**Numbered Steps:**
1. Step title (bold)
   - Sub-step or detail
   - Another detail

2. Next step title
   - Detail

**Styling:**
- Numbers: Blue circle, white number
- Spacing: 24px between steps
- Indentation: 16px for sub-items

---

## 6. Interaction Rules

### Navigation

**Sidebar Click:**
- Load content via client-side navigation (no full page reload)
- Update URL: `/docs/en/farmer-guide/batch-lifecycle`
- Scroll to top of content area
- Highlight active sidebar item
- Maintain sidebar scroll position

**Breadcrumb Click:**
- Navigate to parent section
- Update sidebar active state
- Smooth scroll to top

**Language Switch:**
- Check if equivalent page exists in target language
- If exists: Navigate to translated page
- If not: Show message "This page is not available in [language]"
- Preserve current section context

**Search:**
- Full-text search across all documentation
- Results show: Title, snippet, section
- Click result: Navigate to page, highlight search term
- No results: Show "No results found" message

### State Persistence

**Session Storage:**
- Sidebar expansion state (which sections are open)
- Language preference
- Search history (last 5 queries)

**URL Structure:**
```
/docs/[lang]/[section]/[subsection]/[page]
```

**Examples:**
- `/docs/en/introduction/`
- `/docs/en/farmer-guide/batch-lifecycle`
- `/docs/ru/roles/`
- `/docs/en/fsm/batch-fsm`

### Loading States

**Page Load:**
- Show skeleton loader for content area
- Sidebar loads immediately (static)
- Content fades in when ready

**Navigation:**
- Show loading indicator in content area
- Fade out old content
- Fade in new content
- Duration: 200ms

---

## 7. Visual Style Guidelines

### Color Palette

**Primary Colors:**
- Blue (Primary): #2563EB
- Blue (Light): #EFF6FF
- Blue (Dark): #1E40AF

**Neutral Colors:**
- Gray 900 (Text): #111827
- Gray 700 (Text Secondary): #374151
- Gray 500 (Text Tertiary): #6B7280
- Gray 300 (Borders): #E5E7EB
- Gray 50 (Backgrounds): #F9FAFB
- White: #FFFFFF

**Status Colors:**
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Info: #3B82F6 (Blue)

### Typography

**Font Family:**
- Body: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- Code: "Fira Code", "JetBrains Mono", "Courier New", monospace

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Line Heights:**
- Headings: 1.2
- Body: 1.7
- Code: 1.5

### Spacing Scale

- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

**Usage:**
- Section spacing: 48px
- Paragraph spacing: 24px
- List item spacing: 16px
- Component padding: 16px-24px

### Shadows

**Elevation Levels:**
- Level 1: `0 1px 2px rgba(0, 0, 0, 0.05)`
- Level 2: `0 1px 3px rgba(0, 0, 0, 0.1)`
- Level 3: `0 4px 6px rgba(0, 0, 0, 0.1)`

**Usage:**
- Top bar: Level 1
- Sidebar: Level 1
- Cards: Level 2
- Modals: Level 3

### Borders

**Border Radius:**
- Small: 4px (buttons, badges)
- Medium: 6px (cards, code blocks)
- Large: 8px (modals)

**Border Width:**
- Default: 1px
- Emphasis: 2px (active states)

---

## 8. Responsive Design

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

### Mobile Layout

```
┌─────────────────────────┐
│  [☰] Turan Docs [EN][RU]│
├─────────────────────────┤
│                         │
│  [Content Area]          │
│                         │
│                         │
└─────────────────────────┘
```

**Mobile Behavior:**
- Sidebar: Hidden by default, accessible via hamburger menu
- Top bar: Compact, search hidden (icon only)
- Content: Full width, reduced padding (24px)
- Tables: Horizontal scroll
- Code blocks: Full width, smaller font (13px)

### Tablet Layout

```
┌─────────────────────────────────────┐
│  [☰] Turan Docs [Search] [EN][RU]   │
├──────┬──────────────────────────────┤
│      │  [Content]                    │
│ Side │                               │
│ bar  │                               │
│ (240)│                               │
│      │                               │
└──────┴──────────────────────────────┘
```

**Tablet Behavior:**
- Sidebar: Collapsible, 240px width
- Content: Adjusted padding (32px)
- Tables: May require horizontal scroll
- Code blocks: Full width

---

## 9. Accessibility

### Requirements

**WCAG 2.1 AA Compliance:**
- Color contrast: Minimum 4.5:1 for text
- Keyboard navigation: Full support
- Screen reader: Semantic HTML, ARIA labels
- Focus indicators: Visible on all interactive elements

**Keyboard Shortcuts:**
- `/` : Focus search
- `Esc` : Close sidebar (mobile)
- `←` / `→` : Previous/Next page

**Focus Management:**
- Focus moves to main content on page load
- Focus trap in modals
- Skip to content link (hidden, visible on focus)

---

## 10. Performance

### Optimization

**Loading:**
- Lazy load images
- Code splitting for sections
- Prefetch next/previous pages on hover

**Caching:**
- Static assets: Long-term cache
- Content: Cache with revalidation
- Search index: Client-side cache

**Metrics Target:**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

---

## 11. Implementation Notes

### Technology Stack

**Recommended:**
- Framework: VitePress (already in use)
- Styling: Tailwind CSS or CSS Modules
- Search: Algolia DocSearch or local search
- Analytics: Optional (privacy-focused)

### VitePress Configuration

**Key Settings:**
- `base: '/docs/'` (production)
- `lang: 'en'` (default)
- `locales` for RU/EN
- `themeConfig.sidebar` for navigation
- `themeConfig.search` for search

### Custom Components

**Required:**
- `<Callout>` - Info/Note/Warning boxes
- `<Breadcrumb>` - Navigation breadcrumb
- `<LanguageSwitcher>` - RU/EN toggle
- `<PrevNext>` - Page navigation
- `<Table>` - Styled tables

---

## 12. Quality Checklist

### Before Launch

- [ ] All pages accessible via sidebar
- [ ] Language switcher works on all pages
- [ ] Search returns relevant results
- [ ] Mobile navigation functional
- [ ] Keyboard navigation works
- [ ] All links valid (no 404s)
- [ ] Tables readable on mobile
- [ ] Code blocks copyable
- [ ] Callouts display correctly
- [ ] Breadcrumbs accurate
- [ ] Performance metrics met
- [ ] Accessibility audit passed

---

## Summary

This design creates a documentation experience comparable to Stripe Docs:
- **Clear hierarchy** through sidebar and breadcrumbs
- **Fast navigation** with client-side routing
- **Readable content** with proper typography and spacing
- **Responsive design** for all devices
- **Institutional tone** with minimal, professional styling

The design focuses on **usability over aesthetics**, prioritizing:
1. Finding information quickly
2. Understanding platform structure
3. Navigating between related topics
4. Accessing content on any device

All while maintaining the calm, professional tone appropriate for a B2B platform documentation portal.

