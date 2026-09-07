# Jettx

Minimal corporate homepage: the JETTX wordmark, centered, with light and dark themes. No marketing copy, no navigation.

## Files

```
.
├── index.html
├── assets/
│   ├── logo-light.png
│   └── logo-dark.png
└── README.md
```

## Theme

- Defaults to the system `prefers-color-scheme`.
- The top-right toggle stores `theme` (`light` | `dark`) in `localStorage`.
- Light: page `#ffffff` and `assets/logo-light.png`.
- Dark: page `#0a0a0a` and `assets/logo-dark.png`.

## Local

Open `index.html` in a browser, or serve the repo root as static files.

## Deploy

Railway Railpack detects `index.html` at the repo root as an HTML/Staticfile site. Deploy the root directory — no build step or framework required.
