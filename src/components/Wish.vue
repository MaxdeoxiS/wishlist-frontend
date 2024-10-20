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
} from 'lucide-vue-next'
import { type Wish } from '@/utils/types'
import Collapsible from './ui/collapsible/Collapsible.vue';
import CollapsibleContent from './ui/collapsible/CollapsibleContent.vue';
import { ref } from 'vue';

const { id, bought_by, picture, comment, name, price, onClick } = defineProps<Wish & {onClick: (wishId: number) => void }>()
const open = ref(false)

</script>

<template>
    <TableRow>
        <TableCell class="p-0 w-6">
            <span @click="open = !open" v-if="bought_by || picture || comment">
                <ChevronDown class="w-5 h-5" v-if="!open" />
                <ChevronUp class="w-5 h-5" v-else />
            </span>
        </TableCell>
        <TableCell class="font-medium">
            <a>{{ name }}</a>
        </TableCell>
        <TableCell>
            {{ price }}€
        </TableCell>
        <TableCell class="text-end">
            <Button :disabled="bought_by" @click="onClick(id)">
                <Gift class="w-4 h-4 mr-2" /> {{ bought_by ? "Déjà pris" : "Acheter" }}
            </Button>
        </TableCell>
    </TableRow>
    <Collapsible :open="open" class="w-max">
        <CollapsibleContent class="w-full">
            <div class="w-full">
                <p v-show="bought_by">Acheté par {{ bought_by }}</p>
                <p v-show="picture">Image: {{ picture }}</p>
                <p v-show="comment">Commentaire: {{ comment }}</p>
            </div>
        </CollapsibleContent>
    </Collapsible>
</template>