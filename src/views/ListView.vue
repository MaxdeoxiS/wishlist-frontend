<script setup lang="ts">
import Wishlist from '@/components/Wishlist.vue';
import { getList, setBought } from '@/utils/api';
import { useUserStore } from '@/utils/store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'

const route = useRoute()
const { hash } = route.params
const queryClient = useQueryClient()

const { isPending, isError, data, error } = useQuery({
  queryKey: ['wishlist'],
  queryFn: () => getList(hash as string)
})

const store = useUserStore()

const mutation = useMutation({
  mutationFn: (id: number) => setBought(hash as string, id, store.username),
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['wishlist'] })
  },
})
</script>

<template>
  <main>
    <Wishlist v-if="data" :title=data.title :user=data.user :wish="data?.wish || []" :created_at="data.created_at"
      :onClick="(id) => mutation.mutate(id)" />
  </main>
</template>
