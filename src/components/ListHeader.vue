<script setup lang="ts">
import { Input } from '@/components/ui/input'
import {
    Search,
} from 'lucide-vue-next'
import Logo from './Logo.vue'
import Profile from './Profile.vue'
import { defineEmits } from 'vue'

const emit = defineEmits(['update:filter'])

function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    emit('update:filter', target.value);
}
</script>

<template>
    <header
        class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Logo />
        <div class="relative ml-auto flex-1 md:grow-0">
            <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Rechercher dans la liste..."
                class="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                @input="handleInput" />
        </div>
        <Profile />
    </header>
</template>