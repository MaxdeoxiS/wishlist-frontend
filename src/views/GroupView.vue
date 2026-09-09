<script setup lang="ts">
import { createlist, getGroup } from '@/utils/api';
import type { CreateList } from '@/utils/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ListHeader from "@/components/ListHeader.vue";
import { ref } from 'vue';
import Button from '@/components/ui/button/Button.vue';
import { Plus, Share2, Users, ChevronRight, Gift, ArrowLeft, AlertCircle } from 'lucide-vue-next';
import { useUserStore } from '@/utils/store';
import CreateListModal from '@/components/modals/CreateListModal.vue';
import { toast } from 'vue-sonner';

const route = useRoute()
const router = useRouter()
const { id } = route.params
const queryClient = useQueryClient()

const { data, isLoading, isError } = useQuery({
  queryKey: ['group', id],
  queryFn: () => getGroup(id as string)
})

const store = useUserStore()

const createListModalOpen = ref(false)

const addMutation = useMutation({
  mutationFn: (data: CreateList) => createlist(data, id as string),
  onSuccess: (newList) => {
    queryClient.invalidateQueries({ queryKey: ['group'] })
    createListModalOpen.value = false;
    toast.success('Nouvelle liste ajoutée au groupe ! 🎉')
    if (newList?.id) {
      router.push(`/list/${newList.id}`)
    }
  },
})

function onAddList(data: CreateList) {
  addMutation.mutate(data)
}

function goToList(listId: string) {
  router.push(`/list/${listId}`)
}

async function share() {
  const shareUrl = window.location.href;
  const shareData = {
    title: data.value?.title ?? 'Groupe de listes',
    text: `Consultez le groupe de listes « ${data.value?.title ?? ''} » !`,
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

  try {
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Lien copié dans le presse-papier ! 📋');
  } catch {
    toast.error('Impossible de copier le lien');
  }
}
</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-muted/40 pb-24 sm:pb-12">
    <ListHeader />

    <!-- Skeleton Loading -->
    <div v-if="isLoading" class="max-w-[960px] mx-auto px-4 py-6 space-y-4 w-full">
      <div class="h-28 rounded-2xl bg-card border p-6 space-y-3 animate-pulse">
        <div class="h-6 w-48 bg-muted rounded"></div>
        <div class="h-4 w-32 bg-muted/60 rounded"></div>
      </div>
      <div class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-20 rounded-xl bg-card border p-4 flex items-center justify-between animate-pulse">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-muted"></div>
            <div class="space-y-2">
              <div class="h-5 w-32 bg-muted rounded"></div>
              <div class="h-3 w-20 bg-muted/60 rounded"></div>
            </div>
          </div>
          <div class="h-8 w-16 bg-muted rounded-full"></div>
        </div>
      </div>
    </div>

    <!-- Error / Not found -->
    <div v-else-if="isError || !data" class="max-w-md mx-auto px-4 py-20 text-center flex flex-col items-center">
      <div class="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        <AlertCircle class="w-8 h-8" />
      </div>
      <h2 class="text-xl font-bold mb-2">Groupe introuvable</h2>
      <p class="text-sm text-muted-foreground mb-6">Ce groupe de listes n'existe pas ou a été supprimé.</p>
      <Button class="rounded-full gap-2" @click="router.push('/')">
        <ArrowLeft class="w-4 h-4" /> Retour à l'accueil
      </Button>
    </div>

    <!-- Content -->
    <div v-else class="flex flex-col sm:gap-4 sm:py-6 px-3 sm:px-6 md:max-w-[960px] md:mx-auto w-full">
      <main class="grid flex-1 items-start gap-4">
        <Card class="border shadow-sm rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm">
          <CardHeader class="p-4 sm:p-6 pb-4 border-b border-border/40">
            <div class="flex items-center gap-2 mb-1">
              <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users class="w-5 h-5" />
              </div>
              <CardTitle class="text-xl sm:text-2xl font-extrabold tracking-tight">
                {{ data.title }}
              </CardTitle>
            </div>
            <CardDescription class="text-xs sm:text-sm text-muted-foreground">
              {{ data.list?.length || 0 }} {{ (data.list?.length || 0) > 1 ? 'listes partagées' : 'liste partagée' }} dans ce groupe
            </CardDescription>
          </CardHeader>

          <CardContent class="p-3 sm:p-6 space-y-3">
            <div
              v-for="list of data.list"
              :key="list.id"
              class="group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.99] transition-all cursor-pointer"
              @click="goToList(list.id)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <!-- Avatar with initial -->
                <div class="w-11 h-11 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-base shrink-0">
                  {{ list.user?.charAt(0).toUpperCase() || '?' }}
                </div>
                <div class="min-w-0">
                  <h3 class="font-semibold text-base text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                    {{ list.title }}
                  </h3>
                  <p class="text-xs text-muted-foreground truncate">
                    Par <span class="font-medium text-foreground">{{ list.user }}</span>
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" class="rounded-full text-xs font-semibold gap-1 hidden sm:inline-flex">
                  Voir la liste <ChevronRight class="w-3.5 h-3.5" />
                </Button>
                <ChevronRight class="w-5 h-5 text-muted-foreground/40 sm:hidden" />
              </div>
            </div>
          </CardContent>

          <!-- Desktop Actions -->
          <div class="hidden sm:flex items-center justify-end gap-3 p-4 sm:p-6 pt-0 border-t border-border/40">
            <Button variant="outline" class="rounded-full px-5 gap-2" @click="share">
              <Share2 class="w-4 h-4" /> Partager le groupe
            </Button>
            <Button class="rounded-full px-5 shadow-sm gap-2" @click="createListModalOpen = true">
              <Plus class="w-4 h-4" /> Ajouter une liste
            </Button>
          </div>
        </Card>
      </main>
    </div>

    <!-- Mobile Bottom Action Bar -->
    <div class="sm:hidden fixed bottom-0 left-0 right-0 z-20 p-3 pb-safe bg-background/90 backdrop-blur-lg border-t border-border/60 shadow-lg">
      <div class="flex items-center gap-2 max-w-md mx-auto">
        <Button
          variant="outline"
          class="rounded-full h-11 px-4 gap-1.5 shrink-0 border-border/80"
          @click="share"
        >
          <Share2 class="w-4 h-4" />
          <span class="text-xs font-semibold">Partager</span>
        </Button>

        <Button
          class="flex-1 rounded-full h-11 font-bold shadow-md gap-2"
          @click="createListModalOpen = true"
        >
          <Plus class="w-5 h-5" />
          <span>Ajouter une liste</span>
        </Button>
      </div>
    </div>
  </div>

  <CreateListModal
    v-if="createListModalOpen"
    :open="createListModalOpen"
    @close="createListModalOpen = false"
    :create="onAddList"
  />
</template>