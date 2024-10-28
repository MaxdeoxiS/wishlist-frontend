<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'
import { useUserStore } from './utils/store';
import { getUser } from './utils/storage';
import { Toaster } from '@/components/ui/sonner'

const store = useUserStore()

onMounted(() => {
  const localUser = getUser()
  if (localUser) {
    store.setUsername(localUser)
  }
})
</script>

<template>
  <Toaster />
  <RouterView />
</template>