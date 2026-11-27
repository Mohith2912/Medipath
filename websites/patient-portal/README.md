# MediPath Clinic Workspace

An interactive, fictional-data clinic coordination demo built with Next.js App Router, React, TypeScript, Tailwind CSS, Lucide, React Hook Form, and Zod.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js. Use `npm run build` to create the production build and `npm start` to serve it.

## Structure and tokens

- `app/` contains the App Router page and server-rendered metadata.
- `src/App.tsx` contains the interactive role-based workspace and demo flows.
- `src/data.ts` contains fictional records used by the local demo.
- `styles.css` is the shared component library and light/dark theme token source; `tailwind.config.ts` exposes the core palette to utility styles.
- `public/` contains MediPath brand assets.

The public app shell is server-rendered with page metadata. Workspace interactions run in the browser and are not backed by a clinic service.

## Included workflows

Preview admin, doctor, or front-desk access; book an appointment with a conflict check; check in a confirmed visit; take a verified demo payment and print its receipt; edit weekly doctor hours; and switch light/dark themes. Use `Ctrl/Cmd+K` or `/` to focus clinic search.

## Accessibility checklist

- Semantic navigation, headings, tables, labelled controls, and a skip link.
- Keyboard-operable role selection, navigation, dialogs, forms, and visible focus indicators.
- Dialog focus containment and Escape-to-close; toast messages use a live region.
- Statuses include text and an icon, not color alone.
- Responsive layouts, 44px primary controls, and reduced-motion styles.
- Light and dark themes use semantic text/surface tokens.

## Limitations

All records are fictional and changes remain in client memory for the current session. Sign-in is role preview only; there is no authentication, backend, persistence, real payment processing, live calendar, patient notification, or clinical record system. Printed receipts are clearly marked as demo-only and are not tax invoices. Availability hours are a local preview, not published appointment slots.
