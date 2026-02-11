<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: 'user'
})

useSeoMeta({
  title: 'Account',
  description: 'Profile and security'
})

const toast = useToast()
const { user, client, signOut } = useUserSession()

type SessionInfo = {
  token: string
  userAgent?: string | null
  createdAt?: string | Date | null
}

type AuthClient = {
  sendVerificationEmail?: (args: { email: string }) => Promise<unknown>
  listSessions?: () => Promise<{ data?: SessionInfo[] }>
  revokeSession?: (args: { token: string }) => Promise<unknown>
}

const authClient = client as unknown as AuthClient

const verifyLoading = ref(false)
async function resendVerification() {
  verifyLoading.value = true
  try {
    await authClient.sendVerificationEmail?.({ email: user.value?.email || '' })
    toast.add({ title: 'Success', description: 'Verification email sent', color: 'success' })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to send email'
    toast.add({ title: 'Error', description: message, color: 'error' })
  }
  verifyLoading.value = false
}

const sessions = ref<SessionInfo[]>([])
const sessionsLoading = ref(false)

async function loadSessions() {
  sessionsLoading.value = true
  try {
    const res = await authClient.listSessions?.()
    sessions.value = res?.data || []
  } catch {
    sessions.value = []
  }
  sessionsLoading.value = false
}

async function revokeSession(token: string) {
  try {
    await authClient.revokeSession?.({ token })
    sessions.value = sessions.value.filter(s => s.token !== token)
    toast.add({ title: 'Success', description: 'Session revoked', color: 'success' })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to revoke session'
    toast.add({ title: 'Error', description: message, color: 'error' })
  }
}

onMounted(() => {
  loadSessions()
})

async function handleSignOut() {
  await signOut()
  await navigateTo('/')
}
</script>

<template>
  <div class="space-y-6">
    <UPageHeader
      title="Account"
      description="Manage your profile and security settings."
    />

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div>
            <div class="font-medium">
              Profile
            </div>
            <div class="text-sm text-muted">
              Basic account information.
            </div>
          </div>

          <UButton
            color="neutral"
            variant="subtle"
            @click="handleSignOut"
          >
            Sign out
          </UButton>
        </div>
      </template>

      <div class="space-y-2">
        <div class="flex items-center justify-between gap-4">
          <div class="text-sm text-muted">
            Name
          </div>
          <div class="text-sm">
            {{ user?.name || '-' }}
          </div>
        </div>

        <div class="flex items-center justify-between gap-4">
          <div class="text-sm text-muted">
            Email
          </div>
          <div class="text-sm">
            {{ user?.email || '-' }}
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <div class="font-medium">
            Email verification
          </div>
          <div class="text-sm text-muted">
            Send a new verification email if needed.
          </div>
        </div>
      </template>

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div class="text-sm text-muted">
          If you did not receive the email, you can resend it.
        </div>
        <UButton
          color="neutral"
          variant="outline"
          :loading="verifyLoading"
          @click="resendVerification"
        >
          Resend verification email
        </UButton>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div>
            <div class="font-medium">
              Sessions
            </div>
            <div class="text-sm text-muted">
              Active sessions for your account.
            </div>
          </div>

          <UButton
            color="neutral"
            variant="outline"
            :loading="sessionsLoading"
            @click="loadSessions"
          >
            Refresh
          </UButton>
        </div>
      </template>

      <div v-if="sessionsLoading" class="text-sm text-muted">
        Loading...
      </div>

      <div v-else-if="!sessions.length" class="text-sm text-muted">
        No sessions found.
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="s in sessions"
          :key="s.token"
          class="flex items-center justify-between gap-4 rounded-md border border-default px-3 py-2"
        >
          <div class="min-w-0">
            <div class="text-sm truncate">
              {{ s.userAgent || 'Unknown device' }}
            </div>
            <div class="text-xs text-muted truncate">
              {{ s.createdAt }}
            </div>
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            @click="revokeSession(s.token)"
          >
            Revoke
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <div class="font-medium">
            Password reset
          </div>
          <div class="text-sm text-muted">
            Request a password reset email.
          </div>
        </div>
      </template>

      <UButton
        to="/forget-password"
        color="neutral"
        variant="outline"
      >
        Request password reset
      </UButton>
    </UCard>
  </div>
</template>
