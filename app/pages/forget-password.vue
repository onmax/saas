<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth',
  auth: 'guest'
})

useSeoMeta({
  title: 'Forgot password',
  description: 'Request a password reset link'
})

const toast = useToast()
const { client } = useUserSession()

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}]

const schema = z.object({
  email: z.email('Invalid email')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const res = await client!.requestPasswordReset({
    email: payload.data.email,
    redirectTo: '/reset-password'
  })

  if (res.error) {
    toast.add({ title: 'Error', description: res.error.message || 'Failed to request reset', color: 'error' })
    return
  }

  toast.add({ title: 'Success', description: 'If that email exists, a reset link has been sent.', color: 'success' })
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    title="Forgot password"
    icon="i-lucide-mail"
    :submit="{ label: 'Send reset link' }"
    @submit="onSubmit"
  >
    <template #description>
      Remembered it? <ULink
        to="/login"
        class="text-primary font-medium"
      >Back to login</ULink>.
    </template>
  </UAuthForm>
</template>
