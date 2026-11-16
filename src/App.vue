<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'
import { useUserStore } from './utils/store';
import { getUser } from './utils/storage';
import { warmupBackend } from './utils/api';
import { Toaster } from '@/components/ui/sonner'

const store = useUserStore()

onMounted(() => {
  warmupBackend()
  const localUser = getUser()
  if (localUser) {
    store.setUsername(localUser)
  }
})
</script>

<template>
  <Toaster position="top-center" :close-button="true" :duration="3500" />
  <RouterView />
</template>