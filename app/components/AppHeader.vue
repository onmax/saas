<script setup lang="ts">
const route = useRoute()
const { loggedIn } = useUserSession()

const items = computed(() => {
  const base = [{
    label: 'Docs',
    to: '/docs',
    active: route.path.startsWith('/docs')
  }, {
    label: 'Pricing',
    to: '/pricing'
  }, {
    label: 'Blog',
    to: '/blog'
  }, {
    label: 'Changelog',
    to: '/changelog'
  }]

  if (!loggedIn.value) return base

  return [{
    label: 'Dashboard',
    to: '/app',
    active: route.path.startsWith('/app')
  }, ...base]
})
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
      <TemplateMenu />
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    />

    <template #right>
      <UColorModeButton />

      <BetterAuthState>
        <template #default="{ loggedIn: isLoggedIn, user, signOut }">
          <template v-if="isLoggedIn">
            <UButton
              label="Dashboard"
              color="neutral"
              variant="outline"
              to="/app"
              class="hidden lg:inline-flex"
            />

            <UDropdownMenu
              :items="[
                [
                  { label: 'Account', icon: 'i-lucide-user', to: '/app/account' },
                  { label: 'Billing', icon: 'i-lucide-credit-card', to: '/app/billing' }
                ],
                [
                  { label: 'Sign out', icon: 'i-lucide-log-out', onSelect: async () => { await signOut(); await navigateTo('/') } }
                ]
              ]"
            >
              <UButton
                color="neutral"
                variant="ghost"
                class="rounded-full"
                :label="user?.name || user?.email || 'Account'"
                icon="i-lucide-user-circle"
              />
            </UDropdownMenu>
          </template>

          <template v-else>
            <UButton
              icon="i-lucide-log-in"
              color="neutral"
              variant="ghost"
              to="/login"
              class="lg:hidden"
            />

            <UButton
              label="Sign in"
              color="neutral"
              variant="outline"
              to="/login"
              class="hidden lg:inline-flex"
            />

            <UButton
              label="Sign up"
              color="neutral"
              trailing-icon="i-lucide-arrow-right"
              class="hidden lg:inline-flex"
              to="/signup"
            />
          </template>
        </template>
      </BetterAuthState>
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <BetterAuthState>
        <template #default="{ loggedIn: isLoggedIn, signOut }">
          <template v-if="isLoggedIn">
            <UButton
              label="Dashboard"
              color="neutral"
              variant="subtle"
              to="/app"
              block
              class="mb-3"
            />
            <UButton
              label="Sign out"
              color="neutral"
              variant="outline"
              block
              @click="async () => { await signOut(); await navigateTo('/') }"
            />
          </template>

          <template v-else>
            <UButton
              label="Sign in"
              color="neutral"
              variant="subtle"
              to="/login"
              block
              class="mb-3"
            />
            <UButton
              label="Sign up"
              color="neutral"
              to="/signup"
              block
            />
          </template>
        </template>
      </BetterAuthState>
    </template>
  </UHeader>
</template>
