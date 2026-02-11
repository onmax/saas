<script setup lang="ts">
const route = useRoute()

const items = computed(() => [
  { label: 'Overview', to: '/app', active: route.path === '/app' },
  { label: 'Billing', to: '/app/billing', active: route.path.startsWith('/app/billing') },
  { label: 'Account', to: '/app/account', active: route.path.startsWith('/app/account') }
])
</script>

<template>
  <div>
    <AppHeader />

    <UMain>
      <UContainer class="py-8">
        <div class="flex gap-8">
          <aside class="hidden lg:block w-56 shrink-0">
            <UNavigationMenu
              :items="items"
              orientation="vertical"
              variant="link"
            />
          </aside>

          <div class="min-w-0 flex-1">
            <slot />
          </div>
        </div>
      </UContainer>
    </UMain>

    <AppFooter />
  </div>
</template>
