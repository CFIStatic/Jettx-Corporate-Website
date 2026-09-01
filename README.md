# Jettx Corporate Website

The public corporate website for Jettx. It is a static site — plain HTML, CSS and a
small amount of vanilla JavaScript — with no build step, no framework and no
dependencies to install.

## Running it locally

Any static file server works. With Python installed:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Opening `index.html` directly from the
filesystem also works, since every asset is referenced with a relative path.

## Project structure

```
.
├── index.html            # Home page
├── pages/
│   ├── about.html
│   ├── careers.html
│   ├── contact.html
│   └── services.html
├── assets/
│   ├── css/styles.css    # Design tokens, layout primitives, components
│   ├── js/main.js        # Mobile nav, current year, contact form validation
│   └── img/              # Site imagery (currently empty)
├── robots.txt
└── 404.html
```

### Styling

`assets/css/styles.css` starts with a block of custom properties (`:root`) that
control colour, type scale, spacing and shape. Changing the brand palette should
mean editing those tokens, not hunting through rules.

### JavaScript

`assets/js/main.js` is progressive enhancement only. With JavaScript disabled the
navigation is still visible, every link works, and the contact form falls back to
native browser behaviour.

## Before this goes public

The copy is a working scaffold, not approved marketing text. Replace the
following:

- [ ] Company statistics on the home page (founding year, headcount, availability)
- [ ] The client quote on the home page — only publish with written approval
- [ ] Leadership names, roles and bios on the About page
- [ ] Live vacancies on the Careers page, and confirm the hiring process described
- [ ] `hello@example.com` and the placeholder office address, everywhere they appear
- [ ] Service level figures on the Services page

Search for `example.com` and `Placeholder` to find the remaining stubs.

## Wiring up the contact form

The form at `pages/contact.html` validates on the client and then stops — it does
not submit anywhere. To connect a backend, either:

1. Point the `<form>` at an endpoint with `action` and `method="post"` and delete
   the `event.preventDefault()` branch in `assets/js/main.js`; or
2. Replace that branch with a `fetch()` call to your API or form provider.

Whichever you choose, validate and rate-limit on the server as well — the
client-side checks are for usability, not security.

## Deployment

The site is a folder of static files, so it can be served by GitHub Pages,
Netlify, Cloudflare Pages, S3 + CloudFront or any web server. There is no build
command; the publish directory is the repository root.
