# TSP Landing Page Design System

> **Purpose:** Instructions for Claude Code when creating/modifying the TURAN Standard Pool landing page.
> **Style:** Enterprise-conservative, institutional (Blackstone, BRS inspired)
> **Version:** 1.0

---

## 1. Core Principles

| Principle | Description |
|-----------|-------------|
| Authority through Contrast | Black/white contrast for institutional strength. Accent color only for CTAs. |
| Typography Carries Weight | Serif headings create authority. Typography is the primary hierarchy tool. |
| Deliberate Restraint | Minimal decoration. Every element must earn its place. |
| Asymmetric Balance | Create visual interest through intentional asymmetry. |
| Hierarchy through Scale | Size over decoration for importance. |

---

## 2. Typography

### Font Stack

| Purpose | Font | Weights | Usage |
|---------|------|---------|-------|
| Headings | Playfair Display | 400, 500, 600, 700 | All headings (h1-h6), hero text, section titles |
| Body | DM Sans | 400, 500, 600, 700 | Body text, buttons, navigation, UI elements |
| Mono | JetBrains Mono | 400, 500 | Code, technical data |

### Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
```

### Typography Scale (1.25 ratio)

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| text-xs | 12px | 1.5 | 400 | Captions, fine print |
| text-sm | 14px | 1.5 | 400 | Secondary text, UI labels |
| text-base | 16px | 1.6 | 400 | Body text |
| text-lg | 18px | 1.6 | 400 | Lead paragraphs |
| text-xl | 20px | 1.4 | 500 | H6, card headings |
| text-2xl | 24px | 1.35 | 500 | H5 |
| text-3xl | 30px | 1.3 | 600 | H4 |
| text-4xl | 36px | 1.25 | 600 | H3 |
| text-5xl | 48px | 1.15 | 700 | H2, section headlines |
| text-6xl | 60px | 1.1 | 700 | H1, hero headlines |
| text-7xl | 72px | 1.05 | 700 | Display, marketing |

---

## 3. Color Tokens

### Light Mode

```css
/* Backgrounds */
--color-bg-primary: #FFFFFF;
--color-bg-secondary: #F8F9FA;
--color-bg-tertiary: #F1F3F5;
--color-bg-inverse: #0A0A0A;      /* Hero sections, footer */

/* Text */
--color-text-primary: #0A0A0A;
--color-text-secondary: #4A5568;
--color-text-tertiary: #718096;
--color-text-inverse: #FFFFFF;

/* Brand */
--color-brand-primary: #2563EB;
--color-brand-primary-hover: #1D4ED8;
--color-brand-primary-active: #1E40AF;
--color-brand-secondary: #3B82F6;
--color-brand-light: #DBEAFE;

/* Borders */
--color-border-default: #E2E8F0;
--color-border-subtle: #F1F5F9;
--color-border-strong: #CBD5E1;
```

### HSL Format (for CSS variables)

```css
--landing-v2-bg-inverse: 0 0% 4%;        /* #0A0A0A */
--landing-v2-text-inverse: 0 0% 100%;    /* #FFFFFF */
--landing-v2-brand: 217 91% 60%;         /* #2563EB */
--landing-v2-brand-hover: 217 91% 55%;   /* #1D4ED8 */
--landing-v2-bg-light: 210 20% 98%;      /* #F8F9FA */
--landing-v2-text-primary: 0 0% 9%;      /* #171717 */
--landing-v2-text-secondary: 0 0% 45%;   /* #737373 */
--landing-v2-border-subtle: 0 0% 90%;    /* #E5E5E5 */
```

---

## 4. Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight gaps, icon padding |
| space-2 | 8px | Icon-text gap, related elements |
| space-3 | 12px | List items, tight padding |
| space-4 | 16px | Standard padding, form gaps |
| space-5 | 20px | Card internal padding |
| space-6 | 24px | Component gaps |
| space-8 | 32px | Section internal spacing |
| space-10 | 40px | Card padding desktop |
| space-12 | 48px | Large gaps |
| space-16 | 64px | Section padding small |
| space-20 | 80px | Section padding medium |
| space-24 | 96px | Section padding large |
| space-32 | 128px | Hero spacing |

---

## 5. Component Specifications

### Primary Button

```css
.button-primary {
  background: #2563EB;
  color: #FFFFFF;
  border: none;
  border-radius: 24px;  /* PILL SHAPE - CRITICAL */
  height: 48px;
  padding: 0 32px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 15px;
  transition: all 150ms ease-out;
}

.button-primary:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
}

.button-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
}
```

### Secondary Button

```css
.button-secondary {
  background: transparent;
  color: #2563EB;
  border: 1.5px solid currentColor;
  border-radius: 24px;  /* PILL SHAPE */
  height: 48px;
  padding: 0 32px;
}
```

### Inverse Button (on dark backgrounds)

```css
.button-inverse {
  background: #FFFFFF;
  color: #0A0A0A;
  border: none;
  border-radius: 24px;  /* PILL SHAPE */
}
```

### Cards

```css
.card {
  background: #FFFFFF;
  border-radius: 0;  /* SHARP CORNERS - CRITICAL */
  border: 1px solid #E2E8F0;
  overflow: hidden;
}

.card-interactive:hover {
  border-color: #CBD5E1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07);
}
```

### Hero Section

```css
.hero {
  min-height: 100vh;
  background: #0A0A0A;  /* DARK BACKGROUND - CRITICAL */
  color: #FFFFFF;
  display: flex;
  align-items: center;
  padding: 80px 32px;
}

.hero-headline {
  font-family: 'Playfair Display', Georgia, serif;  /* SERIF - CRITICAL */
  font-size: 60px;  /* text-6xl */
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
}
```

---

## 6. Absolute Constraints

### NEVER Do

1. Primary buttons without pill shape (border-radius: 24px)
2. Headings without serif font (Playfair Display)
3. Cards with rounded corners
4. Hero sections with light background
5. Touch targets below 44px
6. Text contrast below 4.5:1

### ALWAYS Do

1. Use Playfair Display for ALL headings
2. Use pill-shape for primary buttons
3. Use sharp corners for cards
4. Use dark background (#0A0A0A) for hero sections
5. Use spacing from defined scale (base 4px)
6. Add visible focus states (3px ring)

---

## 7. TSP Content Guidelines

### FORBIDDEN Language

| Term | Reason |
|------|--------|
| Marketplace | Implies intermediation |
| Platform (as primary) | Tech-product connotation |
| Trading, Buy/Sell | TSP doesn't trade |
| Matching | TSP doesn't match parties |
| Guarantee | TSP doesn't guarantee outcomes |
| Price | TSP doesn't set prices |
| Deal/Transaction | Commercial language |
| Users/Customers | Use "participants" |
| Sign up / Get started | SaaS language |
| Free / Pricing | Commercial framing |
| Benefits | Marketing language |
| Solution | Product language |
| Disrupt / Innovate | Startup language |

### REQUIRED Language

| Term | Context |
|------|---------|
| Coordination | Core function description |
| Commitment | Participant declarations |
| Pool | Aggregated commitments |
| Standard contract | Pre-defined terms |
| Association | Governing body |
| Participant | Users of the system |
| Voluntary | Nature of participation |
| Transparent | Information accessibility |
| Neutral | TSP's market position |
| Infrastructure | System characterization |

### Writing Style

**DO:**
```
TSP coordinates voluntary commitments between market participants.
```

**DON'T:**
```
TSP helps you get better deals in the cattle market.
```

**DO:**
```
Participation requires formal registration and acceptance of standard terms.
```

**DON'T:**
```
Join thousands of farmers already benefiting from TSP.
```

---

## 8. Page Structure

### Home Page Sections

1. **Dark Hero** (bg: #0A0A0A)
   - Navigation
   - Brand mark (TURAN STANDARD POOL)
   - Institutional statement (1 sentence)
   - CTAs: "Узнать об участии" + "Войти на платформу"

2. **System Definition** (light background)
   - What TSP is
   - NOT a marketplace disclaimer

3. **Explicit Boundaries** (light gray)
   - "What TSP Does NOT Do" section
   - List with X icons

4. **Participant Pathways** (white)
   - 4 cards for: Farmers, Processors, Institutions, Partners
   - Sharp corners, no promotional language

5. **Governance** (dark)
   - Association backing
   - Regulatory context

6. **Footer**
   - Documentation links
   - Legal notices
   - Contact

---

## 9. Validation Checklist

Before publishing any landing page content:

- [ ] Is TSP presented as infrastructure, not product?
- [ ] Is language institutional, not promotional?
- [ ] Are TSP's limitations explicitly stated?
- [ ] Are all participant types treated equally?
- [ ] Could this language create antitrust concerns?
- [ ] Can a first-time visitor understand this?
- [ ] Is there any urgency or scarcity messaging?
- [ ] Are there any superlatives or unsubstantiated claims?

### Red Flags (DO NOT publish if present)

- Language implying price influence
- Language implying trade execution
- Language implying guarantees
- Testimonials or social proof
- Urgency messaging
- "Get started" or "Sign up" as primary CTAs
- Metrics about market size or traction
- Screenshots of platform functionality
- Stock photos of happy farmers/handshakes

---

## 10. Tailwind Classes Reference

### Common Landing Classes

```tsx
// Hero headline
className="font-landing-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight"

// Body text on dark
className="font-landing-body text-lg text-white/80 leading-relaxed"

// Primary button
className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full h-12 px-8 font-medium transition-all hover:-translate-y-0.5"

// Card
className="bg-white border border-gray-200 rounded-none p-6 hover:border-gray-300 transition-colors"

// Section padding
className="py-16 md:py-20 lg:py-24 px-4 md:px-8"
```

---

*This document is the authoritative reference for landing page design decisions.*
