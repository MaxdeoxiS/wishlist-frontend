<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
    TableCell,
    TableRow,
} from '@/components/ui/table'
import {
    Ban,
    Gift,
    Slash,
} from 'lucide-vue-next'
import { type Wish } from '@/utils/types'
import { computed, ref } from 'vue';
import BuyModal from './modals/BuyModal.vue';
import { useUserStore } from '@/utils/store';

const { id, bought_by, picture, url, comment, name, price, onBuy } = defineProps<Wish & { onBuy: (wishId: number, cancel: boolean) => void; isAuthor: boolean }>()

const buyModalOpen = ref(false)

const store = useUserStore()

const isBuyer = computed(() =>
    bought_by === store.username
)

const boughtBySomeoneElse = computed(() =>
    bought_by && bought_by !== store.username
)

function onBuyAction() {
    if (isBuyer.value) {
        onBuy(id, true)
        return
    }
    onBuy(id, false)
}

</script>

<template>
    <TableRow :class="$attrs.class">
        <TableCell class="flex-1">
            <div class="flex flex-col gap-y-1">
                <a :href="url" target="_blank" :class="['font-medium', url ? 'underline' : '']">{{ name }}
                </a>
                <span class="text-xs">{{ price }}€</span>
            </div>
        </TableCell>
        <TableCell v-if="!isAuthor" class="w-1/3 lg:pl-4">
            <Button :disabled="boughtBySomeoneElse" class="w-fit float-right" size="lg" :variant="isBuyer ? 'secondary' : 'default'"
                @click.stop="buyModalOpen = true">
                <template v-if="isBuyer">
                    <span>Annuler</span>
                </template>
                <template v-else>
                    <Gift class="lg:w-4 lg:h-4 lg:mr-2" />
                    <Slash v-if="bought_by" class="absolute lg:hidden" />
                    <span class="hidden lg:inline">{{ bought_by ? "Déjà pris" : "Acheter" }}</span>
                </template>
            </Button>
        </TableCell>
    </TableRow>
    <!-- TODO: turn this into a modal -->

    <!-- <PopoverContent v-if="comment || bought_by || picture">
            <div>
                <p v-show="bought_by">Acheté par {{ bought_by }}</p>
                <p v-show="picture">Image: {{ picture }}</p>
                <p v-show="comment">Commentaire: {{ comment }}</p>
            </div>
        </PopoverContent> -->
    <BuyModal :open="buyModalOpen" @close="buyModalOpen = false" @validate="onBuyAction" :wish-name="name" />
</template>