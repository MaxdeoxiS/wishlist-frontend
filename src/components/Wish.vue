<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
    Gift,
    ExternalLink,
    Trash2,
    CheckCircle2,
    MessageSquare,
    ChevronRight,
} from 'lucide-vue-next'
import { type Wish } from '@/utils/types'
import { computed, ref } from 'vue';
import BuyModal from './modals/BuyModal.vue';
import { useUserStore } from '@/utils/store';
import WishInfosModal from './modals/WishInfosModal.vue';
import { cn } from '@/lib/utils'

const props = defineProps<Wish & { onBuy: (wishId: number, cancel: boolean) => void; isAuthor: boolean; onDelete: (wishId: number) => void }>()

const buyModalOpen = ref(false)
const infosModalOpen = ref(false)

const store = useUserStore()

const isBuyer = computed(() =>
    props.bought_by === store.username
)

const boughtBySomeoneElse = computed(() =>
    !!props.bought_by && props.bought_by !== store.username
)

function onBuyAction() {
    if (isBuyer.value) {
        props.onBuy(props.id, true)
        return
    }
    props.onBuy(props.id, false)
}

const formattedDomain = computed(() => {
    if (!props.url) return null
    try {
        const host = new URL(props.url).hostname.replace(/^www\./, '')
        return host
    } catch {
        return 'Lien'
    }
})
</script>

<template>
    <div
        :class="cn(
            'group relative flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 active:scale-[0.99] cursor-pointer',
            boughtBySomeoneElse && !props.isAuthor && 'opacity-70 bg-muted/40'
        )"
        @click="infosModalOpen = true"
    >
        <!-- Left: Thumbnail & Content -->
        <div class="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            <!-- Compact thumbnail (44px) -->
            <div class="relative shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-muted/60 border flex items-center justify-center">
                <img
                    v-if="props.picture"
                    :src="props.picture"
                    :alt="props.name"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-muted">
                    <Gift class="w-5 h-5 text-primary/60" />
                </div>
            </div>

            <!-- Content details -->
            <div class="flex-1 min-w-0 flex flex-col justify-center">
                <div class="flex items-center gap-1.5 min-w-0">
                    <h3
                        :class="cn(
                            'font-semibold text-sm sm:text-base text-foreground tracking-tight truncate leading-tight',
                            boughtBySomeoneElse && !props.isAuthor && 'line-through text-muted-foreground'
                        )"
                    >
                        {{ props.name }}
                    </h3>
                </div>

                <!-- Meta row (Price & link) -->
                <div class="flex items-center gap-2 flex-wrap text-xs text-muted-foreground mt-0.5">
                    <!-- Price badge -->
                    <span v-if="props.price != null" class="inline-flex items-center font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] sm:text-xs">
                        {{ props.price }} €
                    </span>

                    <!-- Website link -->
                    <a
                        v-if="props.url"
                        :href="props.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-flex items-center gap-1 hover:text-primary transition-colors underline decoration-dotted font-medium truncate max-w-[120px] sm:max-w-[160px] text-[11px] sm:text-xs"
                        @click.stop
                    >
                        <ExternalLink class="w-3 h-3 shrink-0" />
                        {{ formattedDomain }}
                    </a>

                    <!-- Comment indicator -->
                    <span v-if="props.comment" class="hidden md:inline-flex items-center gap-1 text-muted-foreground text-[11px]">
                        <MessageSquare class="w-3 h-3" />
                        <span class="truncate max-w-[120px]">{{ props.comment }}</span>
                    </span>
                </div>
            </div>
        </div>

        <!-- Right: Actions on the same row -->
        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <!-- Author mode: Delete action icon -->
            <template v-if="props.isAuthor">
                <Button
                    variant="ghost"
                    size="icon"
                    class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg h-8 w-8 sm:h-9 sm:w-9 transition-colors shrink-0"
                    title="Supprimer ce souhait"
                    @click.stop="props.onDelete(props.id)"
                >
                    <Trash2 class="w-4 h-4" />
                </Button>
            </template>

            <!-- Visitor mode -->
            <template v-else>
                <!-- Taken by someone else -->
                <div v-if="boughtBySomeoneElse" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800 shrink-0 max-w-[170px] sm:max-w-[220px]">
                    <CheckCircle2 class="w-3.5 h-3.5 shrink-0" />
                    <span class="truncate">Pris par <strong>{{ props.bought_by }}</strong></span>
                </div>

                <!-- Taken by current user (cancel option) -->
                <Button
                    v-else-if="isBuyer"
                    variant="outline"
                    size="sm"
                    class="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 rounded-full h-8 px-2.5 sm:px-3 text-xs font-semibold transition-all shrink-0 gap-1"
                    @click.stop="buyModalOpen = true"
                >
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    <span class="hidden sm:inline">Réservé (</span>Annuler<span class="hidden sm:inline">)</span>
                </Button>

                <!-- Available: Reserve button (round icon on mobile, with text on desktop) -->
                <Button
                    v-else
                    size="sm"
                    class="rounded-full h-9 w-9 sm:w-auto sm:px-3.5 p-0 sm:py-2 text-xs font-semibold shadow-sm hover:shadow active:scale-95 transition-all gap-1.5 shrink-0"
                    title="Je réserve ce cadeau"
                    @click.stop="buyModalOpen = true"
                >
                    <Gift class="w-4 h-4" />
                    <span class="hidden sm:inline">Réserver</span>
                </Button>
            </template>

            <!-- Mobile details chevron hint -->
            <ChevronRight class="w-4 h-4 text-muted-foreground/30 shrink-0" />
        </div>
    </div>

    <!-- Modals -->
    <WishInfosModal
        v-if="infosModalOpen"
        :open="infosModalOpen"
        :is-author="props.isAuthor"
        :wish="props"
        @close="infosModalOpen = false"
        @buy="infosModalOpen = false; buyModalOpen = true"
        @delete="(id) => { infosModalOpen = false; props.onDelete(id); }"
    />
    <BuyModal
        :open="buyModalOpen"
        :wish-name="props.name"
        :is-reserved="isBuyer"
        @close="buyModalOpen = false"
        @validate="onBuyAction"
    />
</template>