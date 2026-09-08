# Jettx

Minimal corporate homepage: the JETTX wordmark, full-bleed on a dark plate. No marketing copy, no navigation, no theme toggle.

## Files

```
.
├── index.html
├── assets/
│   └── logo-dark.png
└── README.md
```

## Page

- Background `#0a0a0a`, `theme-color` `#0a0a0a`.
- `assets/logo-dark.png` covers the viewport (`100vw` × `100vh` / `100dvh`, `object-fit: cover`).

## Local

Open `index.html` in a browser, or serve the repo root as static files.

## Deploy

Railway Railpack detects `index.html` at the repo root as an HTML/Staticfile site. Deploy the root directory — no build step or framework required.
