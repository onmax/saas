<script setup lang="ts">
const { data: page } = await useAsyncData('pricing', () => queryCollection('pricing').first())
const toast = useToast()
const { loggedIn, client } = useUserSession()

type PlanKey = 'basic' | 'standard' | 'premium'
type PricingPlan = {
  key: PlanKey
  title: string
  description: string
  price: { month: string, year: string }
  billing_period?: string
  billing_cycle?: string
  button: Record<string, unknown>
  features: string[]
  highlight?: boolean
  scale?: boolean
}

type PricingPlanView = Omit<PricingPlan, 'key'> & { planKey: PlanKey }

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImageComponent('Saas')

const isYearly = ref('0')
const checkoutLoading = ref<PlanKey | null>(null)

const items = ref([
  {
    label: 'Monthly',
    value: '0'
  },
  {
    label: 'Yearly',
    value: '1'
  }
])

async function startCheckout(planKey: PlanKey) {
  checkoutLoading.value = planKey
  try {
    if (!client) throw new Error('Billing is only available on client-side')
    await client.checkout({
      slug: planKey,
      // Saved on checkout/order/subscription in Polar. Useful for UI without exposing product IDs.
      metadata: { plan: planKey }
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed to start checkout'
    toast.add({ title: 'Error', description: message, color: 'error' })
  } finally {
    checkoutLoading.value = null
  }
}

const plans = computed<PricingPlanView[]>(() => {
  const pricing = page.value as unknown as { plans: PricingPlan[] } | null
  if (!pricing) return []

  return pricing.plans.map(({ key, ...plan }): PricingPlanView => {
    const redirect = `/app/billing?plan=${key}`

    return {
      ...plan,
      planKey: key,
      button: {
        ...plan.button,
        ...(loggedIn.value
          ? {
              onClick: () => startCheckout(key),
              loading: checkoutLoading.value === key
            }
          : {
              to: `/signup?redirect=${encodeURIComponent(redirect)}`
            })
      }
    }
  })
})
</script>

<template>
  <div v-if="page">
    <UPageHero
      :title="page.title"
      :description="page.description"
    >
      <template #links>
        <UTabs
          v-model="isYearly"
          :items="items"
          color="neutral"
          size="xs"
          class="w-48"
          :ui="{
            list: 'ring ring-accented rounded-full',
            indicator: 'rounded-full',
            trigger: 'w-1/2'
          }"
        />
      </template>
    </UPageHero>

    <UContainer>
      <UPricingPlans scale>
        <UPricingPlan
          v-for="plan in plans"
          :key="plan.planKey"
          v-bind="plan"
          :price="isYearly === '1' ? plan.price.year : plan.price.month"
          :billing-cycle="isYearly === '1' ? '/year' : '/month'"
        />
      </UPricingPlans>
    </UContainer>

    <UPageSection>
      <UPageLogos>
        <UIcon
          v-for="icon in page.logos.icons"
          :key="icon"
          :name="icon"
          class="w-12 h-12 flex-shrink-0 text-muted"
        />
      </UPageLogos>
    </UPageSection>

    <UPageSection
      :title="page.faq.title"
      :description="page.faq.description"
    >
      <UAccordion
        :items="page.faq.items"
        :unmount-on-hide="false"
        :default-value="['0']"
        type="multiple"
        class="max-w-3xl mx-auto"
        :ui="{
          trigger: 'text-base text-highlighted',
          body: 'text-base text-muted'
        }"
      />
    </UPageSection>
  </div>
</template>
