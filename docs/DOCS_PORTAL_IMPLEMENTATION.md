# Documentation Portal Implementation

**Date:** 2025-01-XX  
**Status:** ✅ **COMPLETE**

## Overview

Full-featured documentation portal implemented at `/docs` for the Turan Standard Pool platform. The portal supports subdomain routing (`docs.turanstandard.kz`), multilingual content (RU/EN), and is fully integrated with Supabase for content management.

---

## Architecture

### 1. Subdomain Routing

**Implementation:**
- Hostname detection via `src/lib/hostname.ts`
- Conditional routing in `App.tsx` based on `isDocsSubdomain()`
- Same Lovable app serves both main portal and docs portal

**Routes:**
- `docs.turanstandard.kz` → Docs portal (base path: `/`)
- `turanstandard.kz` → Main portal
- Local dev: `/docs/*` → Docs portal

**Files:**
- `src/lib/hostname.ts` - Hostname detection utility
- `src/App.tsx` - Conditional routing logic
- `src/components/docs/DocsRouter.tsx` - Docs-specific routes

---

### 2. Database Schema (Supabase)

**Tables Created:**

#### `docs_pages`
- Stores documentation page content
- Multilingual: `title_ru`, `title_en`, `content_ru`, `content_en`
- Fields: `slug`, `section`, `order_index`, `is_published`
- Unique constraint on `slug`

#### `docs_navigation`
- Stores navigation structure
- Links to `docs_pages` via `slug` foreign key
- Supports hierarchical navigation via `parent_id`
- Multilingual labels: `label_ru`, `label_en`

**Migration:**
- `supabase/migrations/20250121000002_create_docs_schema.sql`

**RLS Policies:**
- Public read access for published pages
- Admin-only write access
- Navigation: public read, admin write

---

### 3. Frontend Components

#### Docs Layout (`src/components/docs/DocsLayout.tsx`)
- Left sidebar with navigation
- Top bar with language switcher
- Responsive mobile menu
- Active page highlighting

#### Markdown Renderer (`src/components/docs/MarkdownRenderer.tsx`)
- Custom markdown renderer (no external dependencies)
- Supports: headings, paragraphs, lists, code blocks, tables, callouts
- Inline markdown: bold, italic, code, links

#### Docs Pages
- `src/pages/docs/DocsHome.tsx` - Home page with section overview
- `src/pages/docs/DocsPage.tsx` - Individual page renderer

---

### 4. Data Hooks (`src/hooks/useDocs.ts`)

**Hooks:**
- `useDocsPage(slug, language)` - Fetch single page
- `useDocsPages(section?)` - Fetch all pages (filtered by section)
- `useDocsNavigation(language)` - Fetch navigation structure
- `useUpsertDocsPage()` - Create/update page (admin)
- `useDeleteDocsPage()` - Delete page (admin)
- `useUpsertDocsNavigation()` - Create/update nav item (admin)
- `useDeleteDocsNavigation()` - Delete nav item (admin)

---

### 5. Admin Management

**Page:** `src/pages/admin/DocsManagement.tsx`

**Features:**
- CRUD for documentation pages
- CRUD for navigation items
- Markdown editor (textarea)
- Publish/unpublish toggle
- Section organization
- Order management

**Access:**
- Route: `/admin/docs`
- Role: Admin only
- Added to admin sidebar navigation

---

### 6. Language Support

**Implementation:**
- Language stored in URL: `/docs/ru/...` or `/docs/en/...`
- Language switcher in top bar
- Content fetched based on current language
- Navigation labels switch based on language

**Default:** Russian (`ru`)

---

### 7. URL Structure

**Production (subdomain):**
- `https://docs.turanstandard.kz/ru` - Home (RU)
- `https://docs.turanstandard.kz/en` - Home (EN)
- `https://docs.turanstandard.kz/ru/farmer/batch-lifecycle` - Page (RU)
- `https://docs.turanstandard.kz/en/farmer/batch-lifecycle` - Page (EN)

**Local Development:**
- `http://localhost:5173/docs/ru` - Home (RU)
- `http://localhost:5173/docs/en` - Home (EN)
- `http://localhost:5173/docs/ru/farmer/batch-lifecycle` - Page (RU)

---

## Security

### RLS Policies

**Public Access:**
- Can read published `docs_pages`
- Can read all `docs_navigation`

**Admin Access:**
- Can read all pages (including unpublished)
- Can create/update/delete pages
- Can manage navigation

**No Authentication Required:**
- Documentation is publicly accessible
- No login required to read docs

---

## Deployment Notes

### Subdomain Configuration

For production deployment:

1. **DNS Configuration:**
   - Point `docs.turanstandard.kz` to same server as `turanstandard.kz`
   - Both subdomains serve the same Lovable app

2. **Lovable Configuration:**
   - No special configuration needed
   - Hostname detection happens client-side
   - Same build serves both domains

3. **Testing:**
   - Local: Use `/docs/*` paths
   - Production: Use `docs.turanstandard.kz` subdomain

---

## Content Management

### Creating Documentation

1. **As Admin:**
   - Navigate to `/admin/docs`
   - Click "New Page"
   - Fill in:
     - Slug (URL-friendly, e.g., `farmer/batch-lifecycle`)
     - Section (e.g., "Farmer Guide")
     - Titles (RU/EN)
     - Content (Markdown, RU/EN)
     - Publish status
   - Save

2. **Adding to Navigation:**
   - Go to "Navigation" tab
   - Click "New Item"
   - Select page slug
   - Set section and labels (RU/EN)
   - Set order index
   - Save

### Markdown Syntax

Supported:
- Headings: `# H1`, `## H2`, etc.
- Bold: `**text**`
- Italic: `*text*`
- Code: `` `code` ``
- Code blocks: ` ```language ... ``` `
- Lists: `- item` or `1. item`
- Tables: `| col1 | col2 |`
- Links: `[text](url)`
- Callouts: `> **Warning**: text` or `> ⚠ text`

---

## Files Created/Modified

### New Files:
- `supabase/migrations/20250121000002_create_docs_schema.sql`
- `src/lib/hostname.ts`
- `src/hooks/useDocs.ts`
- `src/components/docs/DocsLayout.tsx`
- `src/components/docs/MarkdownRenderer.tsx`
- `src/components/docs/DocsRouter.tsx`
- `src/pages/docs/DocsHome.tsx`
- `src/pages/docs/DocsPage.tsx`
- `src/pages/admin/DocsManagement.tsx`

### Modified Files:
- `src/App.tsx` - Added docs routing logic
- `src/components/layout/Sidebar.tsx` - Updated docs link to internal admin page

---

## Testing Checklist

- [x] Subdomain detection works
- [x] Docs routes render correctly
- [x] Language switching works
- [x] Navigation sidebar populates from database
- [x] Markdown renders correctly
- [x] Admin can create/edit/delete pages
- [x] Admin can manage navigation
- [x] Public users can read published docs
- [x] Unpublished docs hidden from public
- [x] Mobile responsive
- [x] Breadcrumbs work
- [x] Active page highlighting

---

## Future Enhancements (Not Implemented)

These were explicitly excluded per requirements:
- ❌ Versioning (v1/v2)
- ❌ Search functionality
- ❌ Comments
- ❌ External markdown services

Can be added later if needed.

---

## Conclusion

The documentation portal is **production-ready** and fully integrated with the existing Lovable + Supabase stack. It provides:

✅ Clean, Stripe-like UX  
✅ Multilingual support (RU/EN)  
✅ Admin content management  
✅ Public read access  
✅ Subdomain routing  
✅ No external dependencies  
✅ Maintainable architecture  

**Status:** Ready for deployment and content population.

