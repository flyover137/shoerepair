# astro-opening-hours

A standalone, highly customizable, timezone-aware business opening hours widget for **Astro** and **Sveltia / Decap CMS**. 

This package provides zero-dependency date/time logic, an interactive Astro UI status pill and schedule dropdown, a schema.org local business JSON-LD generator for SEO, and predefined schemas for content validation.

---

## Features

- 🌐 **Timezone-Aware**: Zero-dependency timezone conversion matching target business locations (using native `Intl.DateTimeFormat`).
- 🕒 **Midnight-Spanning Shifts**: Supports store hours that cross calendar midnights (e.g. `08:00 - 02:00` Friday is open at 1:30 AM Saturday).
- 📅 **Split Shifts & Override Dates**: Handles multiple shifts per day, closed days, and holiday/vacation override rules.
- 🎨 **Fully Themeable**: Design elements are modularized and customizable via standard CSS Custom Properties (variables) or Tailwind class injection.
- 🔍 **SEO Ready**: Automatically compiles and embeds schema.org `openingHoursSpecification` JSON-LD structures.
- 📝 **CMS Ready**: Prebuilt Sveltia CMS field configurations with input validation regex templates.

---

## Installation

Install the package via npm:

```bash
npm install astro-opening-hours
```

---

## 1. Content Collections Schema (Zod)

Define your content collections schema in your Astro project's `src/content/config.ts` using our prebuilt validator. This validator automatically handles input formatting and normalizes single-digit hours (e.g. `9:00` -> `09:00`):

```typescript
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { openingHoursConfigSchema } from 'astro-opening-hours';

const openingHoursCollection = defineCollection({
  loader: glob({ pattern: '**/opening-hours.json', base: './src/content/settings' }),
  schema: openingHoursConfigSchema
});

export const collections = {
  openingHoursSettings: openingHoursCollection
};
```

---

## 2. Astro UI Component Usage

To render the dynamic status badge and weekly hours dropdown inside your page template:

```astro
---
import { getEntry } from 'astro:content';
import OpeningHours from 'astro-opening-hours/OpeningHours.astro';

// 1. Fetch your configuration data
const entry = await getEntry('openingHoursSettings', 'openingHours');
const config = entry?.data;
---

<header>
  <div class="logo">My Brand</div>
  
  {config && (
    <OpeningHours 
      config={config} 
      businessName="Main Street Shoe Repairing"
      dayFormat="long" 
      timeFormat="12h" 
    />
  )}
</header>
```

### Component Props API

| Prop | Type | Default | Description |
|---|---|---|---|
| `config` | `OpeningHoursConfig` | *Required* | Config object matching the zod schema. |
| `dayFormat` | `'short' \| 'long'` | `'long'` | Display format of day labels (e.g. `Mon` vs `Monday`). |
| `timeFormat` | `'12h' \| '24h'` | `'12h'` | Display format of times (e.g. `6:00 PM` vs `18:00`). |
| `renderJsonLd` | `boolean` | `true` | Embed schema.org local business JSON-LD scripts. |
| `businessName` | `string` | `undefined` | Business name injected into the JSON-LD schema. |
| `businessType` | `string` | `'LocalBusiness'` | Schema.org type (e.g., `'ShoeRepair'`, `'Restaurant'`). |
| `classes` | `object` | `{}` | Direct CSS class injection overrides (see below). |

---

## 3. Styling & Customization

The component uses a standard CSS class structure (`oh-header-widget`, `oh-status-pill`, etc.) and inherits styles via **CSS Custom Properties (Variables)**.

### Customizing Themes (CSS Variables)

To change the look and feel, redefine these variables in your global style sheets or wrapping elements:

```css
:root {
  /* Fonts & Text Colors */
  --oh-font-sans: 'Inter', sans-serif;
  --oh-color-text: #1e293b;
  --oh-color-text-muted: #64748b;
  
  /* Open Pill theme */
  --oh-color-success: #10b981;
  --oh-color-success-bg: #ecfdf5;
  --oh-color-success-border: rgba(16, 185, 129, 0.2);
  --oh-open-text: #047857;

  /* Closed Pill theme */
  --oh-color-danger: #ef4444;
  --oh-color-danger-bg: #fef2f2;
  --oh-color-danger-border: rgba(239, 68, 68, 0.2);
  --oh-closed-text: #b91c1c;

  /* Popover Dropdown Card */
  --oh-card-bg: #ffffff;
  --oh-border-color: #e2e8f0;
  --oh-shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
}

/* Dark Mode Variables Mapping */
@media (prefers-color-scheme: dark) {
  :root {
    --oh-color-text-dark: #f8fafc;
    --oh-color-text-muted-dark: #94a3b8;
    --oh-color-success-bg-dark: rgba(52, 211, 153, 0.12);
    --oh-color-success-border-dark: rgba(52, 211, 153, 0.3);
    --oh-color-danger-bg-dark: rgba(248, 113, 113, 0.12);
    --oh-color-danger-border-dark: rgba(248, 113, 113, 0.3);
    --oh-card-bg-dark: #1e293b;
    --oh-border-color-dark: #334155;
    
    --oh-open-text-dark: #34d399;
    --oh-closed-text-dark: #f87171;
  }
}
```

### Direct Class Overrides (Tailwind CSS)

If you are using Tailwind CSS, you can pass classes directly into the sub-elements:

```astro
<OpeningHours 
  config={config} 
  classes={{
    container: "flex gap-2 items-center",
    pill: "px-4 py-2 text-sm border font-semibold rounded-full",
    dropdownCard: "absolute right-0 bg-slate-900 border border-slate-700 shadow-xl rounded-xl p-4 w-72"
  }}
/>
```

---

## 4. Sveltia / Decap CMS Fields Setup

To let content editors configure store hours in the Sveltia or Decap CMS admin dashboard, add the fields defined in `src/cms/sveltia-fields.yaml` to your `public/admin/config.yml` setup under your collection file fields list.

The template enforces strict Javascript-compatible 24-hour patterns directly on inputs to guarantee valid inputs.

---

## 5. Development & Compilation

To build and compile the TypeScript source files locally (generating exports inside `./dist` folder):

```bash
npm install
npm run build
```

---

## License

MIT License. Feel free to copy and distribute.
