<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth',
  auth: 'guest'
})

useSeoMeta({
  title: 'Reset password',
  description: 'Set a new password'
})

const route = useRoute()
const toast = useToast()
const { client } = useUserSession()

const token = computed(() => route.query.token as string | undefined)

const fields = [{
  name: 'password',
  label: 'New password',
  type: 'password' as const,
  placeholder: 'Enter a new password',
  required: true
}, {
  name: 'confirmPassword',
  label: 'Confirm password',
  type: 'password' as const,
  placeholder: 'Confirm your new password',
  required: true
}]

const schema = z.object({
  password: z.string().min(8, 'Must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Must be at least 8 characters')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  if (!token.value) {
    toast.add({ title: 'Error', description: 'Invalid or missing reset token', color: 'error' })
    return
  }

  const res = await client!.resetPassword({
    token: token.value,
    newPassword: payload.data.password
  })

  if (res.error) {
    toast.add({ title: 'Error', description: res.error.message || 'Failed to reset password', color: 'error' })
    return
  }

  toast.add({ title: 'Success', description: 'Password reset successfully', color: 'success' })
  navigateTo('/login')
}
</script>

<template>
  <div v-if="!token" class="space-y-6">
    <UAlert
      title="Invalid reset link"
      description="The reset token is missing or invalid."
      color="error"
      variant="subtle"
    />

    <UButton
      to="/forget-password"
      color="neutral"
      variant="outline"
      block
    >
      Request a new reset link
    </UButton>
  </div>

  <UAuthForm
    v-else
    :fields="fields"
    :schema="schema"
    title="Reset password"
    icon="i-lucide-key-round"
    :submit="{ label: 'Reset password' }"
    @submit="onSubmit"
  >
    <template #description>
      <ULink
        to="/login"
        class="text-primary font-medium"
      >Back to login</ULink>.
    </template>
  </UAuthForm>
</template>
