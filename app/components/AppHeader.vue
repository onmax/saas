<script setup lang="ts">
const route = useRoute()

const items = computed(() => [{
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
}])
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

      <ClientOnly>
        <BetterAuthState>
          <template #default="{ loggedIn }">
            <UButton
              v-if="loggedIn"
              icon="i-lucide-layout-dashboard"
              color="neutral"
              variant="ghost"
              to="/app"
              class="lg:hidden"
            />
            <UButton
              v-else
              icon="i-lucide-log-in"
              color="neutral"
              variant="ghost"
              to="/login"
              class="lg:hidden"
            />

            <div class="hidden lg:flex items-center justify-end gap-2 min-w-[216px]">
              <UButton
                v-if="loggedIn"
                label="Dashboard"
                color="neutral"
                variant="outline"
                to="/app"
              />
              <UButton
                v-else
                label="Sign in"
                color="neutral"
                variant="outline"
                to="/login"
              />
              <UButton
                v-if="!loggedIn"
                label="Sign up"
                color="neutral"
                variant="solid"
                trailing-icon="i-lucide-arrow-right"
                to="/signup"
              />
            </div>
          </template>

          <template #placeholder>
            <div class="h-8 w-8 rounded-md bg-elevated animate-pulse lg:hidden" />
            <div class="hidden lg:flex items-center justify-end gap-2 min-w-[216px]">
              <div class="h-8 w-[92px] rounded-md bg-elevated animate-pulse" />
              <div class="h-8 w-[108px] rounded-md bg-elevated animate-pulse" />
            </div>
          </template>
        </BetterAuthState>

        <template #fallback>
          <div class="h-8 w-8 rounded-md bg-elevated animate-pulse lg:hidden" />
          <div class="hidden lg:flex items-center justify-end gap-2 min-w-[216px]">
            <div class="h-8 w-[92px] rounded-md bg-elevated animate-pulse" />
            <div class="h-8 w-[108px] rounded-md bg-elevated animate-pulse" />
          </div>
        </template>
      </ClientOnly>
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <ClientOnly>
        <BetterAuthState>
          <template #default="{ loggedIn }">
            <UButton
              v-if="loggedIn"
              label="Dashboard"
              color="neutral"
              to="/app"
              block
            />

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

          <template #placeholder>
            <div class="space-y-3">
              <div class="h-10 rounded-md bg-elevated animate-pulse" />
              <div class="h-10 rounded-md bg-elevated animate-pulse" />
            </div>
          </template>
        </BetterAuthState>

        <template #fallback>
          <div class="space-y-3">
            <div class="h-10 rounded-md bg-elevated animate-pulse" />
            <div class="h-10 rounded-md bg-elevated animate-pulse" />
          </div>
        </template>
      </ClientOnly>
    </template>
  </UHeader>
</template>
