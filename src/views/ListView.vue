<script setup lang="ts">
import Wishlist from '@/components/Wishlist.vue';
import { addWish, getList, setBought } from '@/utils/api';
import { useUserStore } from '@/utils/store';
import type { CreateWish, Wish } from '@/utils/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner';

const route = useRoute()
const { id } = route.params
const queryClient = useQueryClient()

const { isPending, data, error } = useQuery({
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

function share() {
  navigator.share({
    title: 'Check ma liste!',
    text: data.value?.title,
    url: `${window.location.origin}${route.fullPath}`
  })
  // navigator.clipboard.writeText(`${window.location.origin}${route.fullPath}`)
  // toast('La liste a été copiée')
}
</script>

<template>
    <Wishlist v-if="data" :title=data.title :user=data.user :wishes="data?.wishes || []" :created_at="data.created_at"
      @buy="(wishId, cancel) => mutation.mutate({ wishId, cancel })" :addWish="onAddWish" :share="share" />
</template>
