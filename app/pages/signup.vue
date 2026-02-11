<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { getSafeRedirect } from '../utils/safe-redirect'

definePageMeta({
  layout: 'auth',
  auth: 'guest'
})

useSeoMeta({
  title: 'Sign up',
  description: 'Create an account to get started'
})

const route = useRoute()
const { signIn, signUp } = useUserSession()
const toast = useToast()

const fields = [{
  name: 'name',
  type: 'text' as const,
  label: 'Name',
  placeholder: 'Enter your name'
}, {
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email'
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
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
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  await signUp.email(
    {
      name: payload.data.name,
      email: payload.data.email,
      password: payload.data.password
    },
    {
      onSuccess: () => {
        toast.add({ title: 'Success', description: 'Account created', color: 'success' })
        navigateTo(getSafeRedirect(route.query.redirect, '/app'))
      },
      onError: (ctx) => {
        toast.add({ title: 'Error', description: ctx.error.message || 'Sign up failed', color: 'error' })
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
    title="Create an account"
    :submit="{ label: 'Create account' }"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account? <ULink
        to="/login"
        class="text-primary font-medium"
      >Login</ULink>.
    </template>

    <template #footer>
      By signing up, you agree to our <ULink
        to="/"
        class="text-primary font-medium"
      >Terms of Service</ULink>.
    </template>
  </UAuthForm>
</template>
