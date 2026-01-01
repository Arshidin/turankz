# Documentation Portal - Deployment Guide

## Quick Start

### 1. Apply Database Migration

```bash
# Run the migration in Supabase
supabase migration up
```

Or apply manually via Supabase dashboard:
- Go to SQL Editor
- Run `supabase/migrations/20250121000002_create_docs_schema.sql`

### 2. Verify Tables Created

Check that these tables exist:
- `docs_pages`
- `docs_navigation`

### 3. Create Initial Content (Optional)

Default pages are inserted by migration:
- `getting-started` (RU/EN)
- `farmer-guide/overview` (RU/EN)
- `mpk-guide/overview` (RU/EN)

### 4. Configure DNS (Production)

Point `docs.turanstandard.kz` to the same server as `turanstandard.kz`.

Both subdomains serve the same Lovable app build.

---

## Testing

### Local Development

1. **Test on main domain:**
   ```
   http://localhost:5173/docs/ru
   http://localhost:5173/docs/en
   http://localhost:5173/docs/ru/getting-started
   ```

2. **Test admin management:**
   - Login as admin
   - Navigate to `/admin/docs`
   - Create/edit pages
   - Manage navigation

### Production

1. **Subdomain:**
   ```
   https://docs.turanstandard.kz/ru
   https://docs.turanstandard.kz/en
   ```

2. **Main domain (if needed):**
   ```
   https://turanstandard.kz/docs/ru
   ```

---

## Content Management Workflow

### Creating a New Page

1. Admin → Documentation Management
2. Click "New Page"
3. Fill in:
   - **Slug**: `farmer/batch-lifecycle` (URL-friendly)
   - **Section**: `Farmer Guide`
   - **Title (RU)**: `Жизненный цикл партии`
   - **Title (EN)**: `Batch Lifecycle`
   - **Content (RU)**: Markdown content
   - **Content (EN)**: Markdown content
   - **Published**: Toggle on to make visible
4. Save

### Adding to Navigation

1. Go to "Navigation" tab
2. Click "New Item"
3. Select page slug from dropdown
4. Set:
   - **Section**: `Farmer Guide`
   - **Label (RU)**: `Жизненный цикл`
   - **Label (EN)**: `Lifecycle`
   - **Order**: `1` (for sorting)
5. Save

---

## Markdown Syntax Guide

### Headings
```markdown
# H1 Heading
## H2 Heading
### H3 Heading
```

### Text Formatting
```markdown
**Bold text**
*Italic text*
`Inline code`
```

### Code Blocks
````markdown
```typescript
const example = "code";
```
````

### Lists
```markdown
- Unordered item
- Another item

1. Ordered item
2. Another item
```

### Tables
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

### Callouts
```markdown
> **Warning**: This is important
> ⚠ Critical information
> ℹ Note about something
```

### Links
```markdown
[Link text](https://example.com)
```

---

## Troubleshooting

### Pages Not Showing

1. Check `is_published = true` in database
2. Verify RLS policies are correct
3. Check browser console for errors

### Navigation Not Updating

1. Refresh page (navigation is cached)
2. Check `docs_navigation` table has entries
3. Verify `slug` references exist in `docs_pages`

### Language Not Switching

1. Check URL format: `/docs/{lang}/{slug}`
2. Verify language state updates
3. Check browser console for navigation errors

### Subdomain Not Working

1. Verify DNS points to correct server
2. Check hostname detection logic
3. Test with `/docs/*` paths on main domain

---

## Security Checklist

- [x] RLS policies enforce public read for published pages
- [x] Admin-only write access
- [x] No authentication required for reading
- [x] Navigation is public (no sensitive data)
- [x] Slug validation prevents injection

---

## Performance Notes

- Navigation cached by React Query
- Pages fetched on-demand
- Markdown rendering is client-side (fast)
- No external dependencies for rendering

---

## Maintenance

### Regular Tasks

1. **Content Updates:**
   - Admin can update pages anytime
   - Changes reflect immediately (no cache)

2. **Navigation Reorganization:**
   - Update `order_index` to reorder items
   - Use `parent_id` for nested navigation (future)

3. **Unpublishing:**
   - Set `is_published = false` to hide from public
   - Page still accessible to admins

---

## Status: ✅ READY FOR PRODUCTION

