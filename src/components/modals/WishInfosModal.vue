<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import type { Wish } from '@/utils/types';
import { Button } from '../ui/button';
import { Gift, ExternalLink, CheckCircle2, MessageSquare, Trash2, Calendar, Sparkles } from 'lucide-vue-next';
import { computed } from 'vue';

const emit = defineEmits(['close', 'buy', 'delete'])

const props = defineProps<{
    wish: Wish;
    open: boolean;
    onClose: () => void;
    onBuy: () => void;
    isAuthor: boolean;
}>()

const formattedDomain = computed(() => {
    if (!props.wish.url) return null
    try {
        return new URL(props.wish.url).hostname.replace(/^www\./, '')
    } catch {
        return 'Lien web'
    }
})

const hasExtraContent = computed(() => {
    return !!(props.wish.picture || props.wish.url || props.wish.comment)
})

const formattedDate = computed(() => {
    if (!props.wish.created_at) return null
    try {
        return new Date(props.wish.created_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        })
    } catch {
        return null
    }
})
</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent class="sm:max-w-[480px] rounded-2xl p-5 sm:p-6 max-h-[90vh] flex flex-col">
            <!-- Modal Header -->
            <DialogHeader class="text-left space-y-2 pb-3 border-b">
                <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                        <DialogTitle class="text-xl sm:text-2xl font-bold leading-snug tracking-tight">
                            {{ wish.name }}
                        </DialogTitle>
                        <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span v-if="wish.price != null" class="inline-flex items-center font-extrabold text-sm sm:text-base text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                                {{ wish.price }} €
                            </span>
                            <span v-if="formattedDate" class="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar class="w-3 h-3" /> Ajouté le {{ formattedDate }}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogHeader>

            <!-- Scrollable Content -->
            <div class="overflow-y-auto flex-1 space-y-4 py-3 pr-1">
                <!-- Large Image if available -->
                <div v-if="wish.picture" class="w-full max-h-72 rounded-xl overflow-hidden border bg-muted/20 flex items-center justify-center">
                    <img :src="wish.picture" :alt="wish.name" class="w-full h-full object-contain" />
                </div>

                <!-- Web link -->
                <div v-if="wish.url" class="p-3 rounded-xl bg-muted/40 border flex items-center justify-between gap-3">
                    <div class="flex items-center gap-2 text-xs sm:text-sm font-medium truncate text-muted-foreground">
                        <ExternalLink class="w-4 h-4 shrink-0 text-primary" />
                        <span class="truncate">{{ formattedDomain }}</span>
                    </div>
                    <a
                        :href="wish.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="shrink-0"
                    >
                        <Button size="sm" variant="secondary" class="rounded-lg text-xs h-8 gap-1">
                            Visiter <ExternalLink class="w-3 h-3" />
                        </Button>
                    </a>
                </div>

                <!-- Comment / description -->
                <div v-if="wish.comment" class="p-3.5 rounded-xl bg-muted/30 border space-y-1">
                    <div class="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <MessageSquare class="w-3.5 h-3.5" />
                        <span>Commentaire</span>
                    </div>
                    <p class="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {{ wish.comment }}
                    </p>
                </div>

                <!-- When no picture, no url and no comment: clean informational card -->
                <div v-if="!hasExtraContent" class="py-8 px-4 rounded-xl bg-muted/20 border border-dashed flex flex-col items-center justify-center text-center">
                    <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2.5">
                        <Gift class="w-6 h-6" />
                    </div>
                    <p class="text-sm font-semibold text-foreground">Pas de détails supplémentaires</p>
                    <p class="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                        {{ isAuthor
                            ? "Vous n'avez pas ajouté de photo, de lien web ou de description pour cet article."
                            : "Aucune photo, lien ni commentaire particulier n'a été renseigné pour ce cadeau."
                        }}
                    </p>
                </div>

                <!-- Status details if reserved (never shown to author) -->
                <div v-if="wish.bought_by && !isAuthor" class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-medium">
                    <CheckCircle2 class="w-4 h-4 shrink-0" />
                    <span>Réservé par <strong>{{ wish.bought_by }}</strong></span>
                </div>
            </div>

            <!-- Footer actions -->
            <DialogFooter class="pt-3 border-t mt-auto">
                <!-- Author Mode Actions -->
                <template v-if="isAuthor">
                    <div class="flex items-center justify-between w-full gap-2">
                        <Button
                            variant="ghost"
                            class="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl h-11 px-3 gap-1.5 text-xs sm:text-sm font-semibold transition-colors"
                            @click="emit('delete', wish.id)"
                        >
                            <Trash2 class="w-4 h-4" />
                            Supprimer ce souhait
                        </Button>
                        <Button variant="outline" class="rounded-xl h-11 px-5" @click="onClose">
                            Fermer
                        </Button>
                    </div>
                </template>

                <!-- Visitor Mode Actions -->
                <template v-else>
                    <div class="flex flex-col-reverse sm:flex-row items-center justify-end w-full gap-2">
                        <Button variant="outline" class="rounded-xl h-11 w-full sm:w-auto" @click="onClose">
                            Fermer
                        </Button>
                        <Button
                            v-if="!wish.bought_by"
                            class="rounded-xl h-11 w-full sm:w-auto font-semibold shadow-sm gap-2"
                            @click="onBuy"
                        >
                            <Gift class="w-4 h-4" />
                            Je réserve ce cadeau
                        </Button>
                    </div>
                </template>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>