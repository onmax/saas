<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: 'user'
})

useSeoMeta({
  title: 'Billing',
  description: 'Manage your subscription'
})

const route = useRoute()
const toast = useToast()
const { client } = useUserSession()

type PlanKey = 'basic' | 'standard' | 'premium'

const { data: customerState, pending, refresh } = await useAsyncData('polar:customer-state', async () => {
  if (!client) return null
  const res = await client.customer.state()
  return res.data ?? null
}, { server: false })

const checkoutLoading = ref(false)
const portalLoading = ref(false)
const autoStarted = ref(false)
const syncingAfterCheckout = ref(false)
const lastSyncedCheckoutId = ref<string | null>(null)

function parsePlan(plan: unknown): PlanKey | null {
  if (plan === 'basic' || plan === 'standard' || plan === 'premium') return plan
  return null
}

const hasActiveSubscription = computed(() => {
  return Boolean(customerState.value?.activeSubscriptions?.length)
})

const activeSubscription = computed(() => {
  return customerState.value?.activeSubscriptions?.[0] || null
})

function getSubscriptionPlan(subscription: unknown) {
  if (!subscription || typeof subscription !== 'object') return null
  const metadata = (subscription as Record<string, unknown>).metadata
  if (!metadata || typeof metadata !== 'object') return null
  const plan = (metadata as Record<string, unknown>).plan
  return typeof plan === 'string' ? plan : null
}

const activePlan = computed(() => {
  return getSubscriptionPlan(activeSubscription.value)
})

async function startCheckout(plan: PlanKey) {
  checkoutLoading.value = true
  try {
    if (!client) throw new Error('Billing is only available on client-side')
    await client.checkout({ slug: plan, metadata: { plan } })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to start checkout'
    toast.add({ title: 'Error', description: message, color: 'error' })
  } finally {
    checkoutLoading.value = false
  }
}

async function openPortal() {
  portalLoading.value = true
  try {
    if (!client) throw new Error('Billing is only available on client-side')
    await client.customer.portal()
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to open portal'
    toast.add({ title: 'Error', description: message, color: 'error' })
  } finally {
    portalLoading.value = false
  }
}

async function syncCustomerStateAfterCheckout(checkoutId: string | null) {
  if (!checkoutId) return
  if (lastSyncedCheckoutId.value === checkoutId) return
  lastSyncedCheckoutId.value = checkoutId

  syncingAfterCheckout.value = true
  try {
    // The redirect can happen before Polar state is fully visible. Poll briefly.
    for (let i = 0; i < 12; i++) {
      await refresh()
      if (hasActiveSubscription.value) break
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    if (hasActiveSubscription.value) {
      toast.add({ title: 'Subscription updated', description: 'Your plan is now active.', color: 'success' })
    } else {
      toast.add({ title: 'Payment received', description: 'Still syncing subscription. Try refresh in a moment.', color: 'neutral' })
    }
  } finally {
    syncingAfterCheckout.value = false
  }
}

watchEffect(() => {
  const plan = parsePlan(route.query.plan)
  if (!plan) return
  if (hasActiveSubscription.value) return
  if (autoStarted.value) return

  autoStarted.value = true
  startCheckout(plan)
})

watchEffect(() => {
  const checkoutId = typeof route.query.checkout_id === 'string' ? route.query.checkout_id : null
  const success = route.query.success === '1' || route.query.success === 'true'
  if (!success) return
  syncCustomerStateAfterCheckout(checkoutId)
})
</script>

<template>
  <div class="space-y-6">
    <UPageHeader
      title="Billing"
      description="Manage your subscription and payment method."
    />

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-4">
          <div>
            <div class="font-medium">
              Subscription
            </div>
            <div class="text-sm text-muted">
              Your current plan and status.
            </div>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="outline"
              :loading="pending"
              @click="refresh()"
            >
              Refresh
            </UButton>

            <UButton
              color="neutral"
              variant="subtle"
              :loading="portalLoading"
              @click="openPortal"
            >
              Manage billing
            </UButton>
          </div>
        </div>
      </template>

      <div v-if="pending" class="text-sm text-muted">
        Loading...
      </div>

      <div v-else class="space-y-2">
        <div v-if="syncingAfterCheckout" class="text-sm text-muted">
          Syncing subscription...
        </div>

        <div class="flex items-center justify-between gap-4">
          <div class="text-sm text-muted">
            Status
          </div>
          <UBadge
            :color="hasActiveSubscription ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ hasActiveSubscription ? 'active' : 'none' }}
          </UBadge>
        </div>

        <div class="flex items-center justify-between gap-4">
          <div class="text-sm text-muted">
            Plan
          </div>
          <div class="text-sm">
            {{ activePlan || (hasActiveSubscription ? activeSubscription?.productId : 'Free') }}
          </div>
        </div>

        <div v-if="hasActiveSubscription" class="flex items-center justify-between gap-4">
          <div class="text-sm text-muted">
            Billing interval
          </div>
          <div class="text-sm">
            {{ activeSubscription?.recurringInterval || 'unknown' }}
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <div class="font-medium">
            Start a subscription
          </div>
          <div class="text-sm text-muted">
            Choose a plan to checkout with Polar.
          </div>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <UButton
          color="neutral"
          variant="outline"
          :loading="checkoutLoading"
          @click="startCheckout('basic')"
        >
          Basic
        </UButton>

        <UButton
          color="neutral"
          variant="outline"
          :loading="checkoutLoading"
          @click="startCheckout('standard')"
        >
          Standard
        </UButton>

        <UButton
          color="neutral"
          variant="outline"
          :loading="checkoutLoading"
          @click="startCheckout('premium')"
        >
          Premium
        </UButton>
      </div>
    </UCard>
  </div>
</template>
