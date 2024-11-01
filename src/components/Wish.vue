<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
    TableCell,
    TableRow,
} from '@/components/ui/table'
import {
    Edit,
    Gift,
    Slash,
    Trash2,
} from 'lucide-vue-next'
import { type Wish } from '@/utils/types'
import { computed, ref } from 'vue';
import BuyModal from './modals/BuyModal.vue';
import { useUserStore } from '@/utils/store';
import WishInfosModal from './modals/WishInfosModal.vue';
import { cn } from '@/lib/utils'

const { id, bought_by, picture, url, comment, name, price, onBuy } = defineProps<Wish & { onBuy: (wishId: number, cancel: boolean) => void; isAuthor: boolean; onDelete: (wishId: number) => void }>()

const buyModalOpen = ref(false)
const infosModalOpen = ref(false)

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
    <TableRow :class="$attrs.class" @click="infosModalOpen = true">
        <TableCell class="flex-1">
            <div :class="cn('flex flex-col gap-y-1', bought_by && !isAuthor && 'line-through')">
                <a :href="url" target="_blank" :class="['font-medium w-fit', url ? 'underline' : '']">
                    {{ name }}
                </a>
                <span class="text-xs">{{ price ?? "-" }}€</span>
            </div>
        </TableCell>
        <TableCell class="w-1/3 lg:pl-4">
            <div v-if="isAuthor" class="flex gap-x-2  float-right">
                <Button class="w-fit" @click.stop="onDelete(id)">
                    <Trash2 class="lg:w-4 lg:h-4 lg:mr-2" />
                    <span class="hidden lg:inline">Supprimer</span>
                </Button>
            </div>
            <Button v-else :disabled="boughtBySomeoneElse" class="w-fit float-right" size="lg"
                :variant="isBuyer ? 'secondary' : 'default'" @click.stop="buyModalOpen = true">
                <template v-if="isBuyer">
                    <span>Annuler</span>
                </template>
                <template v-else>
                    <Gift class="lg:w-4 lg:h-4 lg:mr-2" />
                    <Slash v-if="bought_by" class="absolute lg:hidden" />
                    <span class="hidden lg:inline">{{ bought_by ? "Déjà pris" : "Prendre" }}</span>
                </template>
            </Button>
        </TableCell>
    </TableRow>

    <WishInfosModal v-if="infosModalOpen" :open="infosModalOpen" :is-author="isAuthor"
        :wish="{ id, bought_by, picture, url, comment, name, price }" @close="infosModalOpen
            = false" @buy="infosModalOpen = false; buyModalOpen = true" />
    <BuyModal :open="buyModalOpen" @close="buyModalOpen = false" @validate="onBuyAction" :wish-name="name" />
</template>