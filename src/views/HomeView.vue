<script setup lang="ts">
import ListHeader from '@/components/ListHeader.vue';
import CreateListModal from '@/components/modals/CreateListModal.vue';
import CreateGroupModal from '@/components/modals/CreateGroupModal.vue';
import { Button } from '@/components/ui/button';
import { createlist, createGroup } from '@/utils/api';
import { getLists, setList, getRecentGroups, saveRecentGroup } from '@/utils/storage';
import { useUserStore } from '@/utils/store';
import type { CreateList, CreateGroup } from '@/utils/types';
import { useMutation } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Gift, Sparkles, Share2, CheckCircle2, ArrowRight, Users, ChevronRight } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const createListModalOpen = ref(false);
const createGroupModalOpen = ref(false);

const router = useRouter();
const store = useUserStore();

const existingListId = computed(() => {
    const lists = getLists();
    return lists.length > 0 ? lists[0] : null;
});

const recentGroups = computed(() => getRecentGroups());

const createListMutation = useMutation({
    mutationFn: (data: CreateList) => createlist(data),
    onSuccess: (data) => {
        if (data) {
            setList(data.id);
            createListModalOpen.value = false;
            store.setUsername(data.user);
            toast.success('Liste créée avec succès ! 🎉');
            router.push(`/list/${data.id}`);
        }
    },
});

function onCreateList(data: CreateList) {
    createListMutation.mutate(data);
}

const createGroupMutation = useMutation({
    mutationFn: (data: CreateGroup) => createGroup(data),
    onSuccess: (data) => {
        if (data) {
            saveRecentGroup({ id: data.id, title: data.title });
            createGroupModalOpen.value = false;
            toast.success(`Événement « ${data.title} » créé ! 🎉`);
            router.push(`/group/${data.id}`);
        }
    },
    onError: () => {
        toast.error('Erreur lors de la création du groupe.');
    },
});

function onCreateGroup(data: CreateGroup) {
    createGroupMutation.mutate(data);
}
</script>

<template>
    <div class="min-h-screen flex flex-col bg-gradient-to-b from-background via-muted/20 to-muted/50">
        <ListHeader />

        <main class="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20 relative overflow-hidden">
            <!-- Background Ambient Glow -->
            <div class="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

            <div class="max-w-2xl mx-auto text-center relative z-10">
                <!-- Floating festive badge -->
                <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs sm:text-sm font-semibold mb-6 shadow-sm animate-fade-in">
                    <Sparkles class="w-4 h-4 text-primary animate-pulse" />
                    <span>Simple, rapide & sans inscription</span>
                </div>

                <!-- Main Title -->
                <h1 class="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-5">
                    La liste de souhaits <br />
                    <span class="bg-gradient-to-r from-primary via-rose-500 to-amber-500 bg-clip-text text-transparent">
                        qui simplifie les cadeaux
                    </span>
                </h1>

                <!-- Subtitle -->
                <p class="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
                    Partagez vos envies en un clic. En solo ou à plusieurs pour Noël ou un anniversaire, vos proches réservent leurs idées pour éviter les doublons tout en gardant la surprise.
                </p>

                <!-- CTA Buttons -->
                <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                    <Button
                        size="lg"
                        class="w-full sm:w-auto rounded-full h-12 px-7 text-base font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all gap-2"
                        @click="createListModalOpen = true"
                    >
                        <Gift class="w-5 h-5" />
                        Créer ma liste gratuite
                    </Button>

                    <Button
                        variant="secondary"
                        size="lg"
                        class="w-full sm:w-auto rounded-full h-12 px-6 text-base font-semibold shadow-sm hover:shadow active:scale-95 transition-all gap-2 border border-border/60"
                        @click="createGroupModalOpen = true"
                    >
                        <Users class="w-5 h-5 text-primary" />
                        Créer un groupe / Noël
                    </Button>
                </div>

                <!-- Resumption Bar (Existing List / Groups) -->
                <div
                    v-if="existingListId || recentGroups.length > 0"
                    class="flex flex-wrap items-center justify-center gap-2 mb-12 p-2 rounded-2xl bg-card/60 border border-border/50 max-w-lg mx-auto"
                >
                    <Button
                        v-if="existingListId"
                        variant="ghost"
                        size="sm"
                        class="rounded-xl text-xs font-semibold gap-1.5 h-8 hover:bg-primary/10 hover:text-primary"
                        @click="router.push(`/list/${existingListId}`)"
                    >
                        <Gift class="w-3.5 h-3.5" />
                        <span>Reprendre ma liste</span>
                        <ArrowRight class="w-3 h-3 ml-0.5" />
                    </Button>

                    <Button
                        v-if="recentGroups.length > 0"
                        variant="ghost"
                        size="sm"
                        class="rounded-xl text-xs font-semibold gap-1.5 h-8 hover:bg-primary/10 hover:text-primary"
                        @click="router.push(`/group/${recentGroups[0].id}`)"
                    >
                        <Users class="w-3.5 h-3.5 text-primary" />
                        <span>{{ recentGroups[0].title }}</span>
                        <ArrowRight class="w-3 h-3 ml-0.5" />
                    </Button>
                </div>

                <div v-else class="mb-10"></div>

                <!-- Features Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left max-w-xl mx-auto">
                    <div class="p-4 rounded-2xl bg-card/80 border border-border/60 shadow-sm backdrop-blur-sm flex items-start gap-3">
                        <div class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Gift class="w-5 h-5" />
                        </div>
                        <div>
                            <h3 class="font-bold text-sm text-foreground">Photos & liens</h3>
                            <p class="text-xs text-muted-foreground mt-0.5">Ajoutez photos, prix et boutiques en ligne.</p>
                        </div>
                    </div>

                    <div class="p-4 rounded-2xl bg-card/80 border border-border/60 shadow-sm backdrop-blur-sm flex items-start gap-3">
                        <div class="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <Users class="w-5 h-5" />
                        </div>
                        <div>
                            <h3 class="font-bold text-sm text-foreground">Groupes & Noël</h3>
                            <p class="text-xs text-muted-foreground mt-0.5">Regroupez les listes de toute la famille sous un seul lien.</p>
                        </div>
                    </div>

                    <div class="p-4 rounded-2xl bg-card/80 border border-border/60 shadow-sm backdrop-blur-sm flex items-start gap-3">
                        <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 class="w-5 h-5" />
                        </div>
                        <div>
                            <h3 class="font-bold text-sm text-foreground">Zéro doublon</h3>
                            <p class="text-xs text-muted-foreground mt-0.5">Chacun réserve sans gâcher la surprise.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <CreateListModal
        v-if="createListModalOpen"
        :open="createListModalOpen"
        @close="createListModalOpen = false"
        :create="onCreateList"
    />

    <CreateGroupModal
        v-if="createGroupModalOpen"
        :open="createGroupModalOpen"
        @close="createGroupModalOpen = false"
        :create="onCreateGroup"
    />
</template>
