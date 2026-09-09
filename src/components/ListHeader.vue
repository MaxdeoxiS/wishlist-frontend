<script setup lang="ts">
import { Input } from '@/components/ui/input'
import {
    Search,
    X,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import Logo from './Logo.vue'
import Profile from './Profile.vue'
import { ref, watch } from 'vue';

const emit = defineEmits(['update:filter'])

const props = defineProps<{ withList?: boolean }>()

const searchValue = ref("")

function handleInput(event: Event) {
    if (!props.withList) {
        return
    }
    const target = event.target as HTMLInputElement;
    searchValue.value = target.value;
    emit('update:filter', target.value);
}

function clearSearch() {
    searchValue.value = "";
    emit('update:filter', "");
}
</script>

<template>
    <header
        :class="cn('sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 backdrop-blur-md px-4 sm:px-6 transition-all', !withList ? 'justify-between' : '')">
        <Logo />

        <div v-if="props.withList" class="relative ml-auto flex-1 max-w-[280px] sm:max-w-[340px]">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
                type="search"
                :value="searchValue"
                placeholder="Rechercher..."
                class="w-full h-10 rounded-full bg-muted/50 focus:bg-background pl-9 pr-8 text-sm transition-all border-border/60"
                @input="handleInput"
            />
            <button
                v-if="searchValue.length > 0"
                type="button"
                @click="clearSearch"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
                <X class="w-3.5 h-3.5" />
            </button>
        </div>

        <Profile />
    </header>
</template>