# SparkFluent

Duolingo-style path for learning **SQL** and **PySpark** on your phone. Progress is stored locally in the browser (no account).

**Live:** https://donttakecsmajor.github.io/pyspark_tutor/

## Run locally

```bash
npm install
npm run dev
```

For phone testing on the same Wi‑Fi: `npm run dev -- --host`

## Features

- Tracks: SQL, PySpark, Bridge (SQL ↔ PySpark)
- Path of chapters → steps → untimed checkpoints
- Exercise types: teach, MCQ, fill-blank, match, reorder, bug-find, live SQL (sql.js), PySpark pattern checks
- Placement (untimed), levels, crowns, XP, optional streak
- Practice queue for mistakes
- Glossary reference
- Export / import progress JSON (Profile)

## Stack

Vite + React + TypeScript + Tailwind + PWA (vite-plugin-pwa) + zustand + sql.js
