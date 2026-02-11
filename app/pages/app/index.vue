<script setup lang="ts">
definePageMeta({
  layout: 'app',
  auth: 'user'
})

useSeoMeta({
  title: 'Dashboard',
  description: 'Overview'
})

const { user } = useUserSession()
</script>

<template>
  <div class="space-y-6">
    <UPageHeader
      title="Dashboard"
      :description="user?.name ? `Welcome back, ${user.name}.` : 'Welcome back.'"
    />

    <UPageGrid>
      <UPageCard
        title="Billing"
        description="Manage your subscription."
        icon="i-lucide-credit-card"
        to="/app/billing"
      />
      <UPageCard
        title="Account"
        description="Update your profile and security settings."
        icon="i-lucide-user"
        to="/app/account"
      />
    </UPageGrid>
  </div>
</template>
