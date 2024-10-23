<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
    TableCell,
    TableRow,
} from '@/components/ui/table'
import {
    ChevronDown,
    ChevronUp,
    Gift,
    Slash,
} from 'lucide-vue-next'
import { type Wish } from '@/utils/types'
import Collapsible from './ui/collapsible/Collapsible.vue';
import CollapsibleContent from './ui/collapsible/CollapsibleContent.vue';
import { ref } from 'vue';

const { id, bought_by, picture, url, comment, name, price, onClick } = defineProps<Wish & { onClick: (wishId: number) => void }>()
const open = ref(false)

</script>

<template>
    <TableRow :class="$attrs.class">
        <TableCell class="hidden lg:table-cell p-0 w-6">
            <span @click="open = !open" v-if="bought_by || picture || comment">
                <ChevronDown class="w-5 h-5" v-if="!open" />
                <ChevronUp class="w-5 h-5" v-else />
            </span>
        </TableCell>
        <TableCell class="flex-1">
            <div class="flex flex-col gap-y-1">
                <a :href="url" target="_blank" :class="['font-medium', url ? 'underline' : '']">{{ name }}
                </a>
                <span class="text-xs">{{ price }}€</span>
            </div>
        </TableCell>
        <TableCell class="w-1/3 lg:pl-4">
            <Button :disabled="bought_by" class="w-full" @click="onClick(id)">
                <Gift class="lg:w-4 lg:h-4 lg:mr-2" /> 
                <Slash v-if="bought_by" class="absolute" />
                <span class="hidden lg:inline">{{ bought_by ? "Déjà pris" : "Acheter" }}</span>
            </Button>
        </TableCell>
    </TableRow>
    <Collapsible :open="open" class="w-max hidden lg:block">
        <CollapsibleContent class="w-full">
            <div class="w-full">
                <p v-show="bought_by">Acheté par {{ bought_by }}</p>
                <p v-show="picture">Image: {{ picture }}</p>
                <p v-show="comment">Commentaire: {{ comment }}</p>
            </div>
        </CollapsibleContent>
    </Collapsible>
</template>