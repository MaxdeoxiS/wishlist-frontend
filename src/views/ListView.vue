<script setup lang="ts">
import Wishlist from '@/components/Wishlist.vue';
import { addWish, getList, setBought } from '@/utils/api';
import { useUserStore } from '@/utils/store';
import type { CreateWish, Wish } from '@/utils/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'

const route = useRoute()
const { id } = route.params
const queryClient = useQueryClient()

const { isPending, isError, data, error } = useQuery({
  queryKey: ['wishlist'],
  queryFn: () => getList(id as string)
})

const store = useUserStore()

const mutation = useMutation({
  mutationFn: ({ wishId, cancel }: { wishId: number, cancel: boolean }) => setBought(id as string, wishId, cancel ? null : store.username),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['wishlist'] })
  },
})

const addMutation = useMutation({
  mutationFn: (data: CreateWish) => addWish(id as string, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['wishlist'] })
  },
})

function onAddWish(data: CreateWish) {
  addMutation.mutate(data)
}
</script>

<template>
  <main>
    <Wishlist v-if="data" :title=data.title :user=data.user :wishes="data?.wishes || []" :created_at="data.created_at"
      @buy="(wishId, cancel) => mutation.mutate({ wishId, cancel })" :addWish="onAddWish" />
  </main>
</template>
