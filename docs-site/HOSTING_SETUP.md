# Hosting Setup Recommendations

## Overview

This guide provides recommendations for hosting the Turan Standard Pool documentation at `https://turanstandard.kz/docs`.

---

## Recommended Platform: VitePress

### Why VitePress?

✅ **Markdown-based** - All docs are already in Markdown  
✅ **Built-in search** - Full-text search out of the box  
✅ **Language switcher** - Native multi-language support  
✅ **Fast** - Built on Vite, extremely fast  
✅ **Customizable** - Easy to brand and customize  
✅ **Free** - Open source, no cost  

### Alternative Options

- **Docusaurus** - More features, slightly more complex
- **GitBook** - Commercial option, easier setup
- **MkDocs** - Python-based, simple
- **Nextra** - Next.js-based, modern

---

## VitePress Setup Guide

### Step 1: Install VitePress

```bash
cd /path/to/turankz
npm install -D vitepress
```

### Step 2: Create VitePress Config

**File**: `docs-site/.vitepress/config.ts`

```typescript
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Turan Standard Pool Documentation',
  description: 'Complete documentation for Turan Standard Pool platform',
  base: '/docs/',
  
  // Language configuration
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      link: '/docs/en/',
      themeConfig: {
        nav: [
          { text: 'Introduction', link: '/en/introduction/' },
          { text: 'Roles', link: '/en/roles/' },
          { text: 'Farmer Guide', link: '/en/farmer-guide/' },
          { text: 'MPK Guide', link: '/en/mpk-guide/' },
          { text: 'Admin Guide', link: '/en/admin-guide/' },
        ],
        sidebar: {
          '/en/': [
            {
              text: 'Introduction',
              items: [
                { text: 'What is Turan Standard Pool', link: '/en/introduction/' }
              ]
            },
            {
              text: 'Role Model & Access Control',
              items: [
                { text: 'Overview', link: '/en/roles/' }
              ]
            },
            {
              text: 'Farmer Guide',
              items: [
                { text: 'Registration & Activation', link: '/en/farmer-guide/' }
              ]
            },
            {
              text: 'MPK Guide',
              items: [
                { text: 'Registration & Activation', link: '/en/mpk-guide/' }
              ]
            },
            {
              text: 'Admin Guide',
              items: [
                { text: 'Coordinator Role', link: '/en/admin-guide/' }
              ]
            },
            {
              text: 'Core System Modules',
              items: [
                { text: 'Overview', link: '/en/modules/' }
              ]
            },
            {
              text: 'Business Logic & Guardrails',
              items: [
                { text: 'Overview', link: '/en/business-logic/' }
              ]
            },
            {
              text: 'Status Machines (FSM)',
              items: [
                { text: 'Overview', link: '/en/fsm/' }
              ]
            },
            {
              text: 'Data & Security Model',
              items: [
                { text: 'Overview', link: '/en/security/' }
              ]
            },
            {
              text: 'Limitations & Non-Goals',
              items: [
                { text: 'Overview', link: '/en/limitations/' }
              ]
            },
            {
              text: 'Glossary',
              items: [
                { text: 'Domain Terms', link: '/en/glossary/' }
              ]
            }
          ]
        }
      }
    },
    ru: {
      label: 'Русский',
      lang: 'ru',
      link: '/docs/ru/',
      themeConfig: {
        nav: [
          { text: 'Введение', link: '/ru/introduction/' },
          { text: 'Роли', link: '/ru/roles/' },
          { text: 'Руководство для фермеров', link: '/ru/farmer-guide/' },
          { text: 'Руководство для МПК', link: '/ru/mpk-guide/' },
          { text: 'Руководство для администраторов', link: '/ru/admin-guide/' },
        ],
        sidebar: {
          '/ru/': [
            // Russian sidebar structure (mirror English)
          ]
        }
      }
    }
  },
  
  // Search configuration
  themeConfig: {
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Search',
                buttonAriaLabel: 'Search'
              },
              modal: {
                noResultsText: 'No results found',
                resetButtonTitle: 'Reset',
                footer: {
                  selectText: 'to select',
                  navigateText: 'to navigate',
                  closeText: 'to close'
                }
              }
            }
          },
          ru: {
            translations: {
              button: {
                buttonText: 'Поиск',
                buttonAriaLabel: 'Поиск'
              },
              modal: {
                noResultsText: 'Результатов не найдено',
                resetButtonTitle: 'Сбросить',
                footer: {
                  selectText: 'выбрать',
                  navigateText: 'перейти',
                  closeText: 'закрыть'
                }
              }
            }
          }
        }
      }
    },
    
    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/turanstandard' }
    ],
    
    // Footer
    footer: {
      message: 'Turan Standard Pool Documentation',
      copyright: 'Copyright © 2025 TURAN'
    }
  }
})
```

### Step 3: Create Package.json Scripts

**File**: `docs-site/package.json`

```json
{
  "name": "turan-docs",
  "version": "1.0.0",
  "scripts": {
    "docs:dev": "vitepress dev docs-site",
    "docs:build": "vitepress build docs-site",
    "docs:preview": "vitepress preview docs-site"
  },
  "devDependencies": {
    "vitepress": "^1.0.0"
  }
}
```

### Step 4: Run Development Server

```bash
npm run docs:dev
```

Visit: `http://localhost:5173/docs/`

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros:**
- Free for open source
- Automatic deployments
- Custom domains
- Fast CDN

**Steps:**

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd docs-site
vercel
```

3. Configure:
- Set build command: `npm run docs:build`
- Set output directory: `docs-site/.vitepress/dist`
- Set base path: `/docs`

### Option 2: Netlify

**Pros:**
- Free tier available
- Easy setup
- Custom domains

**Steps:**

1. Create `netlify.toml`:
```toml
[build]
  command = "npm run docs:build"
  publish = "docs-site/.vitepress/dist"

[[redirects]]
  from = "/docs/*"
  to = "/docs/:splat"
  status = 200
```

2. Deploy via Netlify dashboard or CLI

### Option 3: GitHub Pages

**Pros:**
- Free
- Integrated with GitHub
- Simple setup

**Steps:**

1. Create GitHub Actions workflow (`.github/workflows/docs.yml`):
```yaml
name: Deploy Docs

on:
  push:
    branches: [main]
    paths:
      - 'docs-site/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run docs:build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs-site/.vitepress/dist
```

2. Enable GitHub Pages in repository settings

### Option 4: Self-Hosted (Nginx)

**Steps:**

1. Build documentation:
```bash
npm run docs:build
```

2. Copy to server:
```bash
scp -r docs-site/.vitepress/dist/* user@server:/var/www/docs/
```

3. Configure Nginx:
```nginx
server {
    listen 80;
    server_name turanstandard.kz;
    
    location /docs {
        alias /var/www/docs;
        try_files $uri $uri/ /docs/index.html;
    }
}
```

---

## Custom Domain Setup

### DNS Configuration

1. Add CNAME record:
   - Name: `docs`
   - Value: `your-hosting-provider.com`

2. Or A record:
   - Name: `docs`
   - Value: `your-server-ip`

### SSL Certificate

Use Let's Encrypt (free):
```bash
certbot --nginx -d docs.turanstandard.kz
```

---

## Performance Optimization

### 1. Enable Compression

**Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 2. Cache Static Assets

**Nginx:**
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. CDN Configuration

Use Cloudflare or similar:
- Enable caching
- Minify HTML/CSS/JS
- Enable Brotli compression

---

## Monitoring & Analytics

### Google Analytics

Add to VitePress config:
```typescript
head: [
  ['script', { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=GA_ID' }],
  ['script', {}, "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'GA_ID');"]
]
```

### Search Analytics

Track search queries to improve documentation.

---

## Maintenance

### Regular Updates

- Update dependencies monthly
- Review broken links quarterly
- Update content as platform evolves

### Backup Strategy

- Version control (Git)
- Automated backups
- Document versioning

---

## Troubleshooting

### Issue: Links not working

**Solution**: Check `base` path in config matches deployment path

### Issue: Language switcher not working

**Solution**: Verify locale configuration in config file

### Issue: Search not working

**Solution**: Ensure search provider is configured correctly

---

## Next Steps

1. Choose hosting platform
2. Set up VitePress
3. Configure deployment
4. Test language switcher
5. Verify all links work
6. Deploy to production

See `QA_CHECKLIST.md` for quality assurance steps.

