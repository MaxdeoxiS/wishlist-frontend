<script setup lang="ts">
import { Input } from '@/components/ui/input'
import {
    Search,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import Logo from './Logo.vue'
import Profile from './Profile.vue'

const emit = defineEmits(['update:filter'])

const props = defineProps<{ withList?: boolean }>()

function handleInput(event: Event) {
    if (!props.withList) {
        return
    }
    const target = event.target as HTMLInputElement;
    emit('update:filter', target.value);
}
</script>

<template>
    <header
        :class="cn('sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-muted p-4 sm:h-auto sm:bg-background sm:px-6', !withList ? 'justify-between' : '')">
        <Logo />
        <div v-if="props.withList" class="relative ml-auto flex-1 md:grow-0">
            <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Rechercher dans la liste..."
                class="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                @input="handleInput" />
        </div>
        <Profile />
    </header>
</template>