# bformat.dev

Personal portfolio of **Seungmin Jeon (bformat)** — founder, educator, and
competitive programmer.

[Live site](https://bformat-dev.smjun04303829.chatgpt.site)

## About

The site introduces the work behind Foundry and LinearSolve, high-school AI
education, algorithm competitions, and security research. Its visual system is
minimal and editorial, with a particle-based binary intro and a dedicated
terminal-inspired Security & CTF section.

## Highlights

- Interactive `0 / 1` reconstruction intro rendered on Canvas
- Responsive editorial layout from 320px mobile to wide desktop screens
- Korean typography tuned for natural word-level line breaking
- Motion, hover, and pointer interactions with reduced-motion support
- Portfolio sections for products, education, achievements, and security

## Stack

- React 19 + TypeScript
- Next.js-compatible routing through [Vinext](https://github.com/cloudflare/vinext)
- Vite and Cloudflare runtime tooling
- Plain CSS for the visual system and responsive motion

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm ci
npm run dev
```

Build and validate the production artifact:

```bash
npm run build
```

## Project structure

```text
app/page.tsx              Main page, content, and interactions
app/globals.css           Visual system, motion, and responsive rules
public/bformat-penguin.png
worker/index.ts           Cloudflare-compatible runtime entry
```

## Links

- [GitHub profile](https://github.com/bFormat)
- [LinkedIn](https://www.linkedin.com/in/%EC%8A%B9%EB%AF%BC-%EC%A0%84-588023348/)
- [Dreamhack](https://dreamhack.io/users/35607)
- [Foundry](https://foundry.linearsolve.com/)
- [LinearSolve](https://www.linearsolve.com/)

---

Personal content and brand assets © Seungmin Jeon.
