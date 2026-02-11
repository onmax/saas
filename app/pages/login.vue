<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { getSafeRedirect } from '../utils/safe-redirect'

definePageMeta({
  layout: 'auth',
  auth: 'guest'
})

useSeoMeta({
  title: 'Login',
  description: 'Login to your account to continue'
})

const route = useRoute()
const { signIn } = useUserSession()
const toast = useToast()

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
}, {
  name: 'remember',
  label: 'Remember me',
  type: 'checkbox' as const
}]

const providers = [{
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: async () => {
    try {
      await signIn.social({ provider: 'github', callbackURL: getSafeRedirect(route.query.redirect, '/app') })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'GitHub sign in failed'
      toast.add({ title: 'Error', description: message, color: 'error' })
    }
  }
}]

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
  remember: z.boolean().optional()
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  await signIn.email(
    {
      email: payload.data.email,
      password: payload.data.password,
      rememberMe: Boolean(payload.data.remember)
    },
    {
      onSuccess: () => {
        toast.add({ title: 'Success', description: 'Logged in successfully', color: 'success' })
        navigateTo(getSafeRedirect(route.query.redirect, '/app'))
      },
      onError: (ctx) => {
        toast.add({ title: 'Error', description: ctx.error.message || 'Login failed', color: 'error' })
      }
    }
  )
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    title="Welcome back"
    icon="i-lucide-lock"
    @submit="onSubmit"
  >
    <template #description>
      Don't have an account? <ULink
        to="/signup"
        class="text-primary font-medium"
      >Sign up</ULink>.
    </template>

    <template #password-hint>
      <ULink
        to="/forget-password"
        class="text-primary font-medium"
        tabindex="-1"
      >Forgot password?</ULink>
    </template>

    <template #footer>
      By signing in, you agree to our <ULink
        to="/"
        class="text-primary font-medium"
      >Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
