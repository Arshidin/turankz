# UX/UI Implementation Guide
## Turan Standard Pool Documentation

This guide provides step-by-step instructions for implementing the UX/UI design for the documentation portal.

---

## Quick Start

### 1. Apply Custom Styles

The custom CSS file is already created at:
```
docs-site/.vitepress/theme/custom.css
```

To use it, add to your VitePress config:

```typescript
// .vitepress/config.ts
export default defineConfig({
  // ... other config
  head: [
    ['link', { rel: 'stylesheet', href: '/theme/custom.css' }],
  ],
})
```

### 2. Update VitePress Config

Key settings to add/update:

```typescript
export default defineConfig({
  // ... existing config
  
  // Theme configuration
  themeConfig: {
    // Logo (optional)
    logo: '/logo.svg',
    
    // Site title in nav
    siteTitle: 'Turan Standard Pool Docs',
    
    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Arshidin/turankz' }
    ],
    
    // Footer
    footer: {
      message: 'Turan Standard Pool Documentation',
      copyright: 'Copyright © 2025 TURAN'
    },
    
    // Edit link (optional)
    editLink: {
      pattern: 'https://github.com/Arshidin/turankz/edit/main/docs-site/:path',
      text: 'Edit this page on GitHub'
    },
    
    // Last updated
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  }
})
```

### 3. Create Custom Components

Create component files in `.vitepress/theme/components/`:

**Callout.vue:**
```vue
<template>
  <div :class="['custom-callout', type]">
    <div class="callout-header">
      <span class="callout-icon">{{ icon }}</span>
      <strong>{{ title }}</strong>
    </div>
    <div class="callout-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'note', 'warning', 'important'].includes(value)
  }
})

const icons = {
  info: 'ℹ️',
  note: '💡',
  warning: '⚠️',
  important: '🚨'
}

const titles = {
  info: 'Info',
  note: 'Note',
  warning: 'Warning',
  important: 'Important'
}

const icon = icons[props.type]
const title = titles[props.type]
</script>
```

**Breadcrumb.vue:**
```vue
<template>
  <nav class="breadcrumb" aria-label="Breadcrumb">
    <ol>
      <li v-for="(item, index) in items" :key="index">
        <router-link v-if="item.link" :to="item.link">{{ item.text }}</router-link>
        <span v-else>{{ item.text }}</span>
        <span v-if="index < items.length - 1" class="separator">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()

const items = computed(() => {
  const path = route.path.split('/').filter(Boolean)
  const breadcrumbs = [{ text: 'Docs', link: '/' }]
  
  path.forEach((segment, index) => {
    const link = '/' + path.slice(0, index + 1).join('/')
    const text = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    breadcrumbs.push({ text, link: index < path.length - 1 ? link : null })
  })
  
  return breadcrumbs
})
</script>
```

### 4. Register Components

Create `.vitepress/theme/index.ts`:

```typescript
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Callout from './components/Callout.vue'
import Breadcrumb from './components/Breadcrumb.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Callout', Callout)
    app.component('Breadcrumb', Breadcrumb)
  }
} satisfies Theme
```

---

## Component Usage in Markdown

### Callout Boxes

```markdown
<Callout type="info">
This is an informational message.
</Callout>

<Callout type="warning">
This is a warning message.
</Callout>
```

### Tables

Markdown tables will automatically use the custom styling:

```markdown
| Resource | Access | Notes |
|----------|--------|-------|
| Own batches | ✅ Full | |
| Other farmers | ❌ None | |
```

### Code Blocks

Use standard markdown code fences:

````markdown
```typescript
export const FARMER_PERMISSIONS = {
  canView: {
    ownBatches: true
  }
}
```
````

---

## Navigation Structure

The sidebar navigation is defined in the VitePress config. Update the `sidebar` configuration to match the structure in `UX_UI_DESIGN.md`.

Example structure:

```typescript
sidebar: {
  '/': [
    {
      text: 'Introduction',
      items: [
        { text: 'What is Turan Standard Pool', link: '/introduction/' }
      ]
    },
    {
      text: 'Role Model & Access Control',
      items: [
        { text: 'Overview', link: '/roles/' },
        { text: 'Farmer Permissions', link: '/roles/#farmer-permissions' },
        { text: 'MPK Permissions', link: '/roles/#mpk-permissions' },
        { text: 'Admin Permissions', link: '/roles/#admin-permissions' }
      ]
    },
    // ... more sections
  ]
}
```

---

## Language Switcher

VitePress handles language switching automatically when locales are configured. The switcher appears in the top navigation bar.

To customize:

```typescript
themeConfig: {
  // Language menu label
  langMenuLabel: 'Language',
  
  // Or customize in locales config
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      // ...
    },
    '/ru/': {
      label: 'Русский',
      lang: 'ru',
      // ...
    }
  }
}
```

---

## Search Configuration

### Option 1: Local Search (Built-in)

```typescript
themeConfig: {
  search: {
    provider: 'local',
    options: {
      translations: {
        button: {
          buttonText: 'Search',
          buttonAriaLabel: 'Search documentation'
        },
        modal: {
          noResultsText: 'No results found',
          resetButtonTitle: 'Clear search',
          footer: {
            selectText: 'to select',
            navigateText: 'to navigate',
            closeText: 'to close'
          }
        }
      }
    }
  }
}
```

### Option 2: Algolia DocSearch (Recommended for Production)

```typescript
themeConfig: {
  search: {
    provider: 'algolia',
    options: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_API_KEY',
      indexName: 'turan-standard-pool',
      locales: {
        root: {
          placeholder: 'Search documentation',
          translations: {
            // ... translations
          }
        }
      }
    }
  }
}
```

---

## Responsive Breakpoints

The custom CSS includes responsive styles. Key breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

Test on:
- iPhone (375px)
- iPad (768px)
- Desktop (1920px)

---

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Images have alt text
- [ ] Tables have headers
- [ ] Skip to content link present
- [ ] Screen reader tested
- [ ] ARIA labels on icons

---

## Performance Optimization

1. **Lazy Load Images:**
   ```html
   <img loading="lazy" src="..." alt="...">
   ```

2. **Code Splitting:**
   VitePress handles this automatically

3. **Prefetch Links:**
   Add to config:
   ```typescript
   markdown: {
     // Enable link prefetching
     linkify: true
   }
   ```

---

## Testing Checklist

### Functionality
- [ ] All sidebar links work
- [ ] Language switcher works
- [ ] Search returns results
- [ ] Breadcrumbs accurate
- [ ] Mobile menu works
- [ ] Tables scroll on mobile
- [ ] Code blocks copyable

### Visual
- [ ] Typography consistent
- [ ] Colors match design
- [ ] Spacing correct
- [ ] Tables readable
- [ ] Callouts display correctly
- [ ] Dark mode works (if enabled)

### Cross-browser
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome

---

## Next Steps

1. **Review Design Document**: `UX_UI_DESIGN.md`
2. **Apply Custom CSS**: Already created at `.vitepress/theme/custom.css`
3. **Create Components**: Follow examples above
4. **Update Config**: Add theme configuration
5. **Test**: Use checklist above
6. **Iterate**: Based on user feedback

---

## Resources

- **VitePress Docs**: https://vitepress.dev/
- **Stripe Docs** (Reference): https://docs.stripe.com/
- **Design Document**: `UX_UI_DESIGN.md`
- **Color Palette**: See design document
- **Typography**: Inter + Fira Code

---

## Support

For questions or issues:
1. Check VitePress documentation
2. Review design document
3. Test in browser dev tools
4. Check console for errors

