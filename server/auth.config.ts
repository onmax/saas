import { createRequire } from 'node:module'
import { admin } from 'better-auth/plugins'
import { defineServerAuth } from '@onmax/nuxt-better-auth/config'
import { Polar } from '@polar-sh/sdk'

const require = createRequire(import.meta.url)

async function sendResendEmail(apiKey: string, payload: { from: string, to: string, subject: string, text: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`[resend] Failed to send email (${res.status}): ${body}`)
  }
}

export default defineServerAuth(({ runtimeConfig }) => {
  const resendApiKey = runtimeConfig.resend?.apiKey || process.env.RESEND_API_KEY || ''
  const resendFrom = runtimeConfig.resend?.from || process.env.RESEND_FROM || ''
  const siteUrl = (runtimeConfig.public?.siteUrl || process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000') as string
  const siteUrlNoSlash = siteUrl.replace(/\/$/, '')

  const polarAccessToken = runtimeConfig.polar?.accessToken || process.env.POLAR_ACCESS_TOKEN || ''
  if (!polarAccessToken) {
    console.warn('[polar] Missing POLAR_ACCESS_TOKEN. Checkout/portal calls will fail until it is set.')
  }

  const polarServer = runtimeConfig.polar?.server || (process.env.POLAR_SERVER === 'sandbox' ? 'sandbox' : 'production')
  if (polarServer !== 'production' && polarServer !== 'sandbox') {
    throw new Error(`[polar] Invalid POLAR_SERVER: ${String(polarServer)}`)
  }

  const checkoutProducts = [
    { productId: process.env.POLAR_PRODUCT_BASIC_ID || '', slug: 'basic' },
    { productId: process.env.POLAR_PRODUCT_STANDARD_ID || '', slug: 'standard' },
    { productId: process.env.POLAR_PRODUCT_PREMIUM_ID || '', slug: 'premium' }
  ].filter((p): p is { productId: string, slug: string } => Boolean(p.productId))
  if (checkoutProducts.length === 0) {
    console.warn('[polar] Missing POLAR_PRODUCT_*_ID. Slug-based checkout will fail until they are set.')
  }

  const polarWebhookSecret = runtimeConfig.polar?.webhookSecret || process.env.POLAR_WEBHOOK_SECRET || ''
  if (!polarWebhookSecret) {
    console.warn('[polar] Missing POLAR_WEBHOOK_SECRET. Webhook signature verification will fail until it is set.')
  }

  const polarClient = new Polar({
    accessToken: polarAccessToken,
    server: polarServer
  })

  const sendEmail = async (args: { to: string, subject: string, text: string }) => {
    if (!resendApiKey) throw new Error('[auth] Missing RESEND_API_KEY')
    if (!resendFrom) throw new Error('[auth] Missing RESEND_FROM')

    await sendResendEmail(resendApiKey, {
      from: resendFrom,
      to: args.to,
      subject: args.subject,
      text: args.text
    })
  }

  const plugins: any[] = [admin()]
  try {
    const polarAuth = require('@polar-sh/better-auth') as {
      checkout: typeof import('@polar-sh/better-auth').checkout
      polar: typeof import('@polar-sh/better-auth').polar
      portal: typeof import('@polar-sh/better-auth').portal
      webhooks: typeof import('@polar-sh/better-auth').webhooks
    }

    plugins.push(
      polarAuth.polar({
        client: polarClient,
        createCustomerOnSignUp: true,
        use: [
          polarAuth.checkout({
            ...(checkoutProducts.length ? { products: checkoutProducts } : {}),
            successUrl: '/app/billing?success=1&checkout_id={CHECKOUT_ID}',
            authenticatedUsersOnly: true,
            returnUrl: `${siteUrlNoSlash}/app/billing`
          }),
          polarAuth.portal({
            returnUrl: `${siteUrlNoSlash}/app/billing`
          }),
          polarAuth.webhooks({
            secret: polarWebhookSecret,
            onPayload: async (payload) => {
              const type = (() => {
                if (!payload || typeof payload !== 'object') return null
                if (!('type' in payload)) return null
                const value = (payload as { type?: unknown }).type
                return typeof value === 'string' ? value : null
              })()

              console.log('[polar] webhook received', type || 'unknown')
            }
          })
        ]
      })
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.warn(`[polar] Failed to load @polar-sh/better-auth. Billing plugin disabled: ${message}`)
  }

  return {
    emailAndPassword: {
      enabled: true,
      async sendResetPassword({ user, url }) {
        await sendEmail({ to: user.email, subject: 'Reset your password', text: `Reset your password: ${url}` })
      }
    },
    session: {
      storeSessionInDatabase: true
    },
    verification: {
      storeInDatabase: true
    },

    socialProviders: {
      github: {
        clientId: runtimeConfig.github?.clientId || '',
        clientSecret: runtimeConfig.github?.clientSecret || ''
      }
    },

    databaseHooks: {
      user: {
        create: {
          async after(user) {
            if (!user.email) return
            await sendEmail({
              to: user.email,
              subject: 'Welcome',
              text: `Welcome!\n\nGet started here: ${siteUrl}/app\n\nIf you just signed up, make sure to verify your email address too.`
            })
          }
        }
      }
    },

    plugins,

    emailVerification: {
      async sendVerificationEmail({ user, url }) {
        await sendEmail({ to: user.email, subject: 'Verify your email', text: `Verify your email: ${url}` })
      }
    }
  }
})
