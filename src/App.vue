<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'
import { useUserStore } from './utils/store';
import { getUser } from './utils/storage';

const store = useUserStore()

onMounted(() => {
  const localUser = getUser()
  if (localUser) {
    store.setUsername(localUser)
  }
})
</script>

<template>
  <RouterView />
</template>