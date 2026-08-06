# astro-progress-tracker

A standalone, highly customizable, and domain-neutral customer progress and ticket tracker dashboard component for **Astro**. 

Perfect for local repair shops (electronics, tailor, dry cleaning, watches, bikes) to let customers search and check the live progress of their orders using order numbers or customer names.

---

## Features

- 🔍 **Real-Time Client Filtering**: Instant client-side search across ticket numbers, names, descriptions, or status keywords.
- 📱 **Fully Responsive Layout**: Displays as an elegant data table on desktop screens and shifts to card grids on mobile viewports.
- 🎨 **Modular CSS Themes**: Designed with configurable CSS Custom Properties (variables) for visual matching.
- 📝 **CMS Configuration Ready**: Neutral database structure with preconfigured fields.

---

## Installation

Install the package via npm:

```bash
npm install astro-progress-tracker
```

---

## 1. Content Collections Schema (Zod)

Define your content collections schema in your Astro project's `src/content/config.ts` using our prebuilt validator:

```typescript
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { ticketSchema } from 'astro-progress-tracker';

const ticketsCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/tickets' }),
  schema: ticketSchema
});

export const collections = {
  tickets: ticketsCollection
};
```

---

## 2. Astro UI Component Usage

To render the ticket search dashboard inside your page:

```astro
---
import { getCollection } from 'astro:content';
import TicketTracker from 'astro-progress-tracker/TicketTracker.astro';

// Fetch ticket entries
const ticketEntries = await getCollection('tickets');
const tickets = ticketEntries.map(entry => entry.data);
---

<main>
  <h2>Live Progress Tracker</h2>
  
  <TicketTracker 
    tickets={tickets} 
    labels={{
      searchPlaceholder: "Search your order details...",
      noResultsText: "No active orders match that ticket number."
    }}
  />
</main>
```

### Component Props API

| Prop | Type | Default | Description |
|---|---|---|---|
| `tickets` | `Ticket[]` | *Required* | Array of ticket objects matching Zod schema. |
| `classes` | `object` | `{}` | Inject direct styling classes into elements. |
| `labels` | `object` | `{}` | Customize text labels for headers, placeholders, and error boxes. |

---

## 3. Styling & Customization

The component uses a standard CSS class structure (`pt-container`, `pt-search-input`, `pt-badge`, etc.) and inherits styles via **CSS Custom Properties (Variables)**.

### Customizing Themes (CSS Variables)

Define these variables in your global style sheets or wrapping elements:

```css
:root {
  /* Fonts & Text Colors */
  --pt-font-sans: 'Outfit', sans-serif;
  --pt-color-text: #0f172a;
  --pt-color-text-muted: #64748b;
  
  /* Status Badges */
  --pt-badge-waiting-bg: #fef3c7;
  --pt-badge-waiting-text: #d97706;
  --pt-badge-working-bg: #dbeafe;
  --pt-badge-working-text: #2563eb;
  --pt-badge-ready-bg: #d1fae5;
  --pt-badge-ready-text: #059669;

  /* Card & Borders */
  --pt-card-bg: #ffffff;
  --pt-border-color: #e2e8f0;
  
  /* Focus Glow */
  --pt-focus-color: #4f46e5;
  --pt-focus-glow: rgba(79, 70, 229, 0.15);
}

/* Dark Mode Variables Mapping */
@media (prefers-color-scheme: dark) {
  :root {
    --pt-color-text-dark: #f8fafc;
    --pt-color-text-muted-dark: #94a3b8;
    --pt-card-bg-dark: #1e293b;
    --pt-border-color-dark: #334155;
    
    --pt-badge-waiting-bg-dark: rgba(217, 119, 6, 0.15);
    --pt-badge-waiting-text-dark: #fbbf24;
    --pt-badge-working-bg-dark: rgba(37, 99, 235, 0.15);
    --pt-badge-working-text-dark: #60a5fa;
    --pt-badge-ready-bg-dark: rgba(5, 150, 105, 0.15);
    --pt-badge-ready-text-dark: #34d399;
  }
}
```

---

## 4. Sveltia / Decap CMS Fields Setup

Copy the fields configuration defined in `src/cms/sveltia-fields.yaml` and paste them into your Sveltia CMS collection definition configuration inside `public/admin/config.yml`.

---

## License

MIT License. Feel free to copy and distribute.
