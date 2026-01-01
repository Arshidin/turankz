# Documentation Portal - Complete Architecture

## Overview

Full-featured documentation portal implemented entirely within the existing Lovable + Supabase stack. No external services, no separate deployments.

---

## 1. ROUTING & HOSTNAME HANDLING

### Strategy

**Single App, Conditional Routing:**
- Same Lovable build serves both main portal and docs portal
- Client-side hostname detection determines which router to use
- No server-side configuration needed

### Implementation

**File:** `src/lib/hostname.ts`

```typescript
isDocsSubdomain() → boolean
getDocsBasePath() → string
```

**Logic:**
- Production: `docs.turanstandard.kz` → Docs portal (base: `/`)
- Local dev: Path starts with `/docs` → Docs portal (base: `/docs`)
- Main domain: All other paths → Main portal

**File:** `src/App.tsx`

```typescript
const isDocs = isDocsSubdomain();
{isDocs ? <DocsRouter /> : <MainPortalRoutes />}
```

**Result:**
- `docs.turanstandard.kz` → Renders docs portal
- `turanstandard.kz` → Renders main portal
- Same codebase, same deployment

---

## 2. SUPABASE SCHEMA

### Tables

#### `docs_pages`
```sql
- id (uuid, pk)
- slug (text, unique)           -- URL identifier
- title_ru (text)                -- Russian title
- title_en (text)                -- English title
- content_ru (text)              -- Markdown content (RU)
- content_en (text)              -- Markdown content (EN)
- section (text)                 -- Top-level grouping
- order_index (integer)          -- Sort order
- is_published (boolean)         -- Visibility flag
- created_at, updated_at
```

**Constraints:**
- `slug` must be URL-safe: `^[a-z0-9/-]+$`
- Unique on `slug`

#### `docs_navigation`
```sql
- id (uuid, pk)
- section (text)                 -- Grouping
- parent_id (uuid, nullable)     -- For nested nav (future)
- slug (text)                    -- References docs_pages.slug
- label_ru (text)                -- Navigation label (RU)
- label_en (text)                -- Navigation label (EN)
- order_index (integer)          -- Sort order
- created_at
```

**Constraints:**
- Foreign key to `docs_pages.slug`
- Cascade delete if page deleted

### RLS Policies

**Public Read:**
- `docs_pages`: `is_published = true`
- `docs_navigation`: All items

**Admin Write:**
- All CRUD operations on both tables
- Admins can read unpublished pages

**Migration:** `supabase/migrations/20250121000002_create_docs_schema.sql`

---

## 3. DOCS LAYOUT COMPONENTS

### DocsLayout (`src/components/docs/DocsLayout.tsx`)

**Structure:**
```
┌─────────────────────────────────────┐
│ Top Bar: Logo + Language Switcher  │
├──────────┬──────────────────────────┤
│          │                          │
│ Sidebar  │   Main Content Area      │
│ (Nav)    │   (Markdown Rendered)    │
│          │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

**Features:**
- Persistent left sidebar
- Collapsible on mobile
- Active page highlighting
- Language switcher in top bar
- Responsive design

### MarkdownRenderer (`src/components/docs/MarkdownRenderer.tsx`)

**Custom Implementation:**
- No external dependencies (no react-markdown)
- Supports: headings, paragraphs, lists, code, tables, callouts
- Inline: bold, italic, code, links
- Client-side rendering

**Why Custom:**
- Full control over styling
- No bundle size increase
- Consistent with existing UI components

---

## 4. NAVIGATION RENDERING

### Logic

**File:** `src/components/docs/DocsLayout.tsx`

1. Fetch navigation from `docs_navigation` table
2. Group by `section`
3. Sort by `order_index`
4. Render as collapsible sections
5. Highlight active page based on current slug

**Active Detection:**
- Compare current URL slug with navigation item slug
- Supports partial matches (for nested pages)

---

## 5. MARKDOWN RENDERING

### Approach

**Custom Parser:**
- Line-by-line processing
- Pattern matching for syntax
- React component output

**Supported Syntax:**
- Headings: `#`, `##`, `###`
- Bold: `**text**`
- Italic: `*text*`
- Code: `` `code` ``
- Code blocks: ` ```language ... ``` `
- Lists: `- item` or `1. item`
- Tables: `| col | col |`
- Links: `[text](url)`
- Callouts: `> **Warning**: text`

**Styling:**
- Uses Tailwind CSS classes
- Consistent with platform design
- Dark mode support

---

## 6. ADMIN CRUD

### Interface

**Route:** `/admin/docs`

**Tabs:**
1. **Pages** - CRUD for documentation pages
2. **Navigation** - CRUD for navigation items

### Features

**Pages Tab:**
- Create/Edit/Delete pages
- Markdown editor (textarea)
- Publish/unpublish toggle
- Section organization
- Slug validation

**Navigation Tab:**
- Link pages to navigation
- Set section and labels (RU/EN)
- Reorder via `order_index`
- Delete navigation items

**Hooks Used:**
- `useDocsPages()` - List all pages
- `useDocsNavigation()` - List navigation
- `useUpsertDocsPage()` - Create/update page
- `useDeleteDocsPage()` - Delete page
- `useUpsertDocsNavigation()` - Create/update nav
- `useDeleteDocsNavigation()` - Delete nav

---

## 7. SECURITY & RLS

### Row Level Security

**Public Access:**
```sql
-- Published pages only
CREATE POLICY "Public can read published docs pages"
ON docs_pages FOR SELECT
USING (is_published = true);
```

**Admin Access:**
```sql
-- All pages (including unpublished)
CREATE POLICY "Admins can read all docs pages"
ON docs_pages FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Full CRUD
CREATE POLICY "Admins can insert/update/delete docs pages"
ON docs_pages FOR ALL
USING (has_role(auth.uid(), 'admin'));
```

**Navigation:**
- Public read (no sensitive data)
- Admin write

### Application Layer

- No authentication required to read docs
- Admin check via `useAuthContext()` for management UI
- Protected route: `/admin/docs` requires admin role

---

## 8. LANGUAGE HANDLING

### URL Structure

**Format:** `/{basePath}/{language}/{slug}`

**Examples:**
- `/docs/ru/getting-started`
- `/docs/en/farmer/batch-lifecycle`
- `docs.turanstandard.kz/ru` (subdomain, base: `/`)

### Implementation

**State Management:**
- Language stored in URL (not localStorage)
- Language switcher updates URL
- Content fetched based on URL language

**Content Selection:**
```typescript
const content = language === 'ru' ? page.content_ru : page.content_en;
const title = language === 'ru' ? page.title_ru : page.title_en;
```

**Navigation Labels:**
```typescript
const label = language === 'ru' ? item.label_ru : item.label_en;
```

---

## 9. URL ROUTING DETAILS

### DocsRouter (`src/components/docs/DocsRouter.tsx`)

**Routes:**
```typescript
/ → Redirect to /ru
/ru → DocsHome (RU)
/en → DocsHome (EN)
/:lang → DocsPage (if lang is ru/en)
/:lang/:slug/* → DocsPage
* → Redirect to /ru
```

**Base Path Handling:**
- Subdomain: Base = `''` (root)
- Main domain: Base = `/docs`

### Path Parsing

**Example:** `/docs/ru/farmer/batch-lifecycle`

1. Remove base: `ru/farmer/batch-lifecycle`
2. Split: `['ru', 'farmer', 'batch-lifecycle']`
3. Language: `ru` (first part)
4. Slug: `farmer/batch-lifecycle` (rest)

---

## 10. DATA FLOW

### Reading a Page

1. User navigates to `/docs/ru/farmer/batch-lifecycle`
2. `DocsPage` component mounts
3. Extracts slug: `farmer/batch-lifecycle`
4. Extracts language: `ru`
5. Calls `useDocsPage('farmer/batch-lifecycle', 'ru')`
6. Hook queries Supabase with RLS filter
7. Returns page data
8. `MarkdownRenderer` renders content

### Admin Creating a Page

1. Admin navigates to `/admin/docs`
2. Clicks "New Page"
3. Fills form (slug, titles, content RU/EN)
4. Clicks "Save"
5. `useUpsertDocsPage()` hook called
6. Supabase insert/update (RLS allows admin)
7. Query cache invalidated
8. Page appears in list

---

## 11. PERFORMANCE

### Optimizations

1. **React Query Caching:**
   - Navigation cached until invalidated
   - Pages cached per slug+language
   - Reduces database queries

2. **Lazy Loading:**
   - Pages fetched on-demand
   - No preloading of all content

3. **Client-Side Rendering:**
   - Markdown parsed in browser
   - No server-side processing needed

4. **Indexes:**
   - `slug` indexed for fast lookups
   - `section` indexed for filtering
   - `is_published` indexed for public queries

---

## 12. MOBILE RESPONSIVENESS

### Implementation

**Sidebar:**
- Hidden by default on mobile
- Hamburger menu toggles visibility
- Overlay when open
- Full-width on mobile

**Content:**
- Responsive typography
- Tables scroll horizontally
- Code blocks wrap appropriately

---

## 13. ACCESSIBILITY

### Features

- Semantic HTML (`<article>`, `<nav>`, `<header>`)
- Keyboard navigation support
- ARIA labels (via shadcn/ui components)
- Focus management
- Screen reader friendly

---

## 14. TESTING CHECKLIST

- [x] Subdomain detection works
- [x] Docs routes render on subdomain
- [x] Language switching updates URL
- [x] Navigation populates from database
- [x] Markdown renders correctly
- [x] Admin can create/edit/delete pages
- [x] Admin can manage navigation
- [x] Public users see only published pages
- [x] Unpublished pages hidden from public
- [x] Mobile responsive
- [x] Breadcrumbs work
- [x] Active page highlighting
- [x] No linter errors

---

## 15. FUTURE ENHANCEMENTS (Not Implemented)

Per requirements, these were excluded:
- ❌ Versioning (v1/v2 docs)
- ❌ Search functionality
- ❌ Comments system
- ❌ External markdown services

Can be added later if needed.

---

## Conclusion

**Status:** ✅ **PRODUCTION READY**

The documentation portal is:
- Fully integrated with existing stack
- No external dependencies
- Clean, maintainable architecture
- Production-grade UX
- Secure (RLS enforced)
- Multilingual (RU/EN)
- Admin-manageable

Ready for content population and deployment.

