<script setup lang="ts">
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog';
import type { Wish } from '@/utils/types';
import DialogTitle from '../ui/dialog/DialogTitle.vue';
import DialogFooter from '../ui/dialog/DialogFooter.vue';
import { Button } from '../ui/button';
import { Gift, LinkIcon } from 'lucide-vue-next';

const props = defineProps<{ wish: Wish, open: boolean; onClose: () => void; onBuy: () => void; isAuthor: boolean }>()
</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent hide-close>
            <DialogHeader>
                <DialogTitle class="flex justify-between">{{ wish.name }} <span>{{ wish.price ?? "-" }}€</span>
                </DialogTitle>
            </DialogHeader>
            <div class="overflow-auto flex flex-col max-h-[50vh]">
                <a class="underline mb-4 flex gap-x-2 items-center" :href="wish.url" v-if="wish.url"><LinkIcon class="w-4 h-4" />{{ wish.url.slice(0, 50) }}...</a>
                <span v-if="wish.comment">{{ wish.comment }}</span>
                <img v-if="wish.picture" :src="wish.picture" />
            </div>
            <DialogFooter v-if="!isAuthor">
                <Button v-if="!wish.bought_by" @click="onBuy">
                    <Gift class="mr-1.5" />Prendre
                </Button>
                <div v-else>
                    Cadeau déjà pris par <b>{{ wish.bought_by }}</b>
                </div>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>