<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  auth: false
})

useSeoMeta({
  title: 'Verify email',
  description: 'Verify your email address'
})

const route = useRoute()
const toast = useToast()
const { user, client } = useUserSession()

type AuthClient = {
  verifyEmail?: (args: { token: string }) => Promise<{ error?: { message?: string } } | unknown>
  sendVerificationEmail?: (args: { email: string }) => Promise<unknown>
}

const authClient = client as unknown as AuthClient

function getResultError(res: unknown) {
  if (!res || typeof res !== 'object') return null
  const record = res as Record<string, unknown>
  const err = record.error
  if (!err || typeof err !== 'object') return null
  const msg = (err as Record<string, unknown>).message
  if (typeof msg !== 'string') return {}
  return { message: msg }
}

const token = computed(() => route.query.token as string | undefined)
const status = ref<'idle' | 'verifying' | 'success' | 'error'>('idle')
const errorMessage = ref<string>('')

async function verify() {
  if (!token.value) return

  if (!authClient.verifyEmail) return

  status.value = 'verifying'
  try {
    const res = await authClient.verifyEmail({ token: token.value })
    const error = getResultError(res)
    if (error) {
      status.value = 'error'
      errorMessage.value = error.message || 'Verification failed'
      return
    }
    status.value = 'success'
  } catch (e: unknown) {
    status.value = 'error'
    errorMessage.value = e instanceof Error ? e.message : 'Verification failed'
  }
}

async function resend() {
  try {
    await authClient.sendVerificationEmail?.({ email: user.value?.email || '' })
    toast.add({ title: 'Success', description: 'Verification email sent', color: 'success' })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to send email'
    toast.add({ title: 'Error', description: message, color: 'error' })
  }
}

onMounted(() => {
  verify()
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="status === 'verifying'" class="text-center text-sm text-muted">
      Verifying your email...
    </div>

    <UAlert
      v-else-if="status === 'success'"
      title="Email verified"
      description="Your email has been verified successfully."
      color="success"
      variant="subtle"
    />

    <UAlert
      v-else-if="status === 'error'"
      title="Verification failed"
      :description="errorMessage || 'Please request a new verification email.'"
      color="error"
      variant="subtle"
    />

    <UAlert
      v-else
      title="Check your email"
      description="Open the verification link we sent you to finish setting up your account."
      color="neutral"
      variant="subtle"
    />

    <UButton
      v-if="user?.email"
      color="neutral"
      variant="outline"
      block
      @click="resend"
    >
      Resend verification email
    </UButton>

    <UButton
      to="/login"
      color="neutral"
      variant="subtle"
      block
    >
      Back to login
    </UButton>
  </div>
</template>
