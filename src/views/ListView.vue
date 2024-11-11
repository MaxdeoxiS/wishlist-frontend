<script setup lang="ts">
import Wishlist from '@/components/Wishlist.vue';
import { addWish, deleteWish, getGroup, getList, setBought } from '@/utils/api';
import { useUserStore } from '@/utils/store';
import type { CreateWish } from '@/utils/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue';
import { useRoute } from 'vue-router'

const route = useRoute()
const { id } = route.params
const queryClient = useQueryClient()

const store = useUserStore()

const { data } = useQuery({
  queryKey: ['wishlist'],
  queryFn: () => getList(id as string, store.username)
})

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

const deleteMutation = useMutation({
  mutationFn: (wishId: number) => deleteWish(id as string, wishId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['wishlist'] })
  },
})

function onAddWish(data: CreateWish) {
  addMutation.mutate(data)
}

const groupId = computed(() => data.value?.groupId)
const enabled = computed(() => !!data.value?.groupId)

const { data: group } = useQuery({
  queryKey: ['group',  groupId],
  queryFn: () => getGroup(groupId.value as string),
  enabled
})

function share() {
  navigator.share({
    title: 'Check ma liste!',
    text: data.value?.title,
    url: `${window.location.origin}${route.fullPath}`
  })
}
</script>

<template>
    <Wishlist v-if="data" :title=data.title :user=data.user :wishes="data?.wishes || []" :created_at="data.created_at" :group="group"
      @buy="(wishId, cancel) => mutation.mutate({ wishId, cancel })" @create="onAddWish" @delete="id => deleteMutation.mutate(id)" :share="share" />
</template>
