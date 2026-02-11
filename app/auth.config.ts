import { adminClient } from 'better-auth/client/plugins'
import { defineClientAuth } from '@onmax/nuxt-better-auth/config'
import { polarClient } from '@polar-sh/better-auth'

export default defineClientAuth({
  plugins: [
    adminClient(),
    polarClient()
  ]
})
