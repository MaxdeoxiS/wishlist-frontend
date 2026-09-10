<script setup lang="ts">
import Wishlist from '@/components/Wishlist.vue';
import ListHeader from '@/components/ListHeader.vue';
import { addWish, deleteWish, getGroup, getList, setBought } from '@/utils/api';
import { useUserStore } from '@/utils/store';
import type { CreateWish, Wish, Wishlist as WishlistData } from '@/utils/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-vue-next';

const route = useRoute()
const router = useRouter()
const { id } = route.params
const queryClient = useQueryClient()

const store = useUserStore()

const { data, isLoading, isError } = useQuery({
  queryKey: ['wishlist', id],
  queryFn: () => getList(id as string, store.username)
})

const mutation = useMutation({
  mutationFn: ({ wishId, cancel }: { wishId: number, cancel: boolean }) => setBought(id as string, wishId, cancel ? null : store.username),
  onSuccess: (_, variables) => {
    queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    if (variables.cancel) {
      toast.info('Réservation annulée')
    } else {
      toast.success('Cadeau réservé avec succès ! 🎉')
    }
  },
})

const addMutation = useMutation({
  mutationFn: (data: CreateWish) => addWish(id as string, data),
  onMutate: async (newWish: CreateWish) => {
    await queryClient.cancelQueries({ queryKey: ['wishlist', id] })
    const previousWishlist = queryClient.getQueryData<WishlistData>(['wishlist', id])

    if (previousWishlist) {
      const optimisticWish: Wish = {
        id: -Date.now(),
        name: newWish.name,
        price: newWish.price,
        url: newWish.url,
        comment: newWish.comment,
        picture: newWish.picture,
        created_at: new Date().toISOString(),
      }
      queryClient.setQueryData<WishlistData>(['wishlist', id], {
        ...previousWishlist,
        wishes: [...previousWishlist.wishes, optimisticWish]
      })
    }

    return { previousWishlist }
  },
  onError: (_err, _newWish, context) => {
    if (context?.previousWishlist) {
      queryClient.setQueryData(['wishlist', id], context.previousWishlist)
    }
    toast.error("Erreur lors de l'ajout de l'idée cadeau")
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['wishlist', id] })
  },
  onSuccess: () => {
    toast.success('Idée cadeau ajoutée ! ✨')
  },
})

const deleteMutation = useMutation({
  mutationFn: (wishId: number) => deleteWish(id as string, wishId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    toast.info('Souhait supprimé de la liste')
  },
})

function onAddWish(data: CreateWish) {
  addMutation.mutate(data)
}

const groupId = computed(() => data.value?.groupId)
const enabled = computed(() => !!data.value?.groupId)

const { data: group } = useQuery({
  queryKey: ['group', groupId],
  queryFn: () => getGroup(groupId.value as string),
  enabled
})

async function share() {
  const shareUrl = window.location.href;
  const shareData = {
    title: data.value?.title ?? 'Liste de souhaits',
    text: `Consultez la liste de souhaits « ${data.value?.title ?? ''} » !`,
    url: shareUrl,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
    }
  }

  // Fallback to clipboard copy
  try {
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Lien copié dans le presse-papier ! 📋');
  } catch {
    toast.error('Impossible de copier le lien');
  }
}
</script>

<template>
  <!-- Loading Skeleton -->
  <div v-if="isLoading" class="min-h-screen bg-muted/40 pb-12">
    <ListHeader />
    <div class="max-w-[960px] mx-auto px-4 py-6 space-y-4">
      <!-- Header Skeleton -->
      <div class="h-32 rounded-2xl bg-card border p-6 space-y-3 animate-pulse">
        <div class="h-6 w-48 bg-muted rounded-lg"></div>
        <div class="h-4 w-32 bg-muted rounded-md"></div>
        <div class="h-4 w-full bg-muted/60 rounded-md mt-4"></div>
      </div>
      <!-- Cards Skeletons -->
      <div class="space-y-2">
        <div v-for="i in 4" :key="i" class="h-16 rounded-xl bg-card border p-2.5 flex items-center gap-2.5 animate-pulse">
          <div class="w-11 h-11 rounded-lg bg-muted shrink-0"></div>
          <div class="flex-1 space-y-1.5">
            <div class="h-4 w-36 bg-muted rounded"></div>
            <div class="h-3 w-16 bg-muted/60 rounded-full"></div>
          </div>
          <div class="h-9 w-9 bg-muted rounded-full shrink-0"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Error / Not found -->
  <div v-else-if="isError || !data" class="min-h-screen bg-muted/40">
    <ListHeader />
    <div class="max-w-md mx-auto px-4 py-20 text-center flex flex-col items-center">
      <div class="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        <AlertCircle class="w-8 h-8" />
      </div>
      <h2 class="text-xl font-bold mb-2">Liste introuvable</h2>
      <p class="text-sm text-muted-foreground mb-6">
        Cette liste de souhaits n'existe pas ou a été supprimée.
      </p>
      <Button class="rounded-full gap-2" @click="router.push('/')">
        <ArrowLeft class="w-4 h-4" /> Retour à l'accueil
      </Button>
    </div>
  </div>

  <!-- Loaded Wishlist -->
  <Wishlist
    v-else
    :title="data.title"
    :user="data.user"
    :wishes="data?.wishes || []"
    :created_at="data.created_at"
    :group="group"
    @buy="(wishId, cancel) => mutation.mutate({ wishId, cancel })"
    @create="onAddWish"
    @delete="id => deleteMutation.mutate(id)"
    :share="share"
  />
</template>

