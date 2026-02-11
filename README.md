# Nuxt SaaS Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Fully built SaaS application to launch your next project with a landing page, a pricing page, a documentation and a blog powered by [Nuxt UI](https://ui.nuxt.com) components.

- [Live demo](https://saas-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/docs/getting-started/installation/nuxt)

<a href="https://saas-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/saas-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/saas-light.png">
    <img alt="Nuxt SaaS Template" src="https://ui.nuxt.com/assets/templates/nuxt/saas-light.png">
  </picture>
</a>

## Quick Start

```bash [Terminal]
npm create nuxt@latest -- -t github:nuxt-ui-templates/saas
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=saas&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fsaas&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fsaas-dark.png&demo-url=https%3A%2F%2Fsaas-template.nuxt.dev%2F&demo-title=Nuxt%20SaaS%20Template&demo-description=A%20SaaS%20template%20with%20landing%2C%20pricing%2C%20docs%20and%20blog%20powered%20by%20Nuxt%20Content.)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Auth + Billing

This starter ships with:

- Auth: [Better Auth](https://better-auth.com) (core) via [`@onmax/nuxt-better-auth`](https://www.npmjs.com/package/@onmax/nuxt-better-auth) ([module docs](https://better-auth.onmax.me), [core docs](https://www.better-auth.com))
- Database/KV: [NuxtHub](https://hub.nuxt.com/)
- Billing: [Polar](https://polar.sh/)
- Emails: [Resend](https://resend.com/) (verification + password reset)

### How it works

- Server auth config lives in `server/auth.config.ts` (providers, emails, Better Auth plugins).
- Client auth config lives in `app/auth.config.ts` (client-side plugin counterparts).
- Route protection is enforced via `routeRules` and `definePageMeta({ auth: ... })` in `nuxt.config.ts` / pages.

### Environment variables

Copy `.env.example` to `.env` and fill in required values.

Notes:

- `BETTER_AUTH_SECRET` must be at least 32 chars.
- `POLAR_PRODUCT_*_ID` variables are **Polar product IDs** used by the Better Auth Polar plugin.

### Better Auth version pin

This template is intentionally pinned to `better-auth@1.5.0-beta.13` and `@onmax/nuxt-better-auth@0.0.2-alpha.21` for the current migration workflow.

When Better Auth `1.5` is stable, update both packages together and re-run `pnpm nuxt db generate` before deploying.

### Polar webhooks

Configure a Polar webhook pointing to:

- `POST /api/auth/polar/webhooks` (Better Auth base path defaults to `/api/auth`)

Set `POLAR_WEBHOOK_SECRET` to the webhook secret from Polar.

To set secrets on Cloudflare (Workers):

```bash
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put RESEND_API_KEY
wrangler secret put RESEND_FROM
wrangler secret put POLAR_ACCESS_TOKEN
wrangler secret put POLAR_WEBHOOK_SECRET
wrangler secret put POLAR_PRODUCT_BASIC_ID
wrangler secret put POLAR_PRODUCT_STANDARD_ID
wrangler secret put POLAR_PRODUCT_PREMIUM_ID
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.
