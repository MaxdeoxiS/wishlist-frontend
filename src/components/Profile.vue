<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import {
    CircleUser,
} from 'lucide-vue-next'
import { useUserStore } from '@/utils/store'
import { clearLists, deleteUser, getLists } from '@/utils/storage';
import { computed } from 'vue';
import router from '@/router';
import Avatar from './ui/avatar/Avatar.vue';

const store = useUserStore()

const lists = computed(() => getLists())

function goToList() {
    if (lists.value && lists.value.length > 0) {
        router.push(`/list/${lists.value[0]}`)
    }
}

function logout() {
    deleteUser()
    clearLists()
    store.setUsername("")
}

</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="rounded-full w-9 h-9 p-0 hover:bg-muted/80 transition-colors">
                <Avatar v-if="store.username" class="h-9 w-9 bg-primary/10 text-primary font-bold border border-primary/30 flex items-center justify-center text-sm shadow-sm">
                    {{ store.username.charAt(0).toUpperCase() }}
                </Avatar>
                <div v-else class="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground border">
                    <CircleUser class="h-5 w-5" />
                </div>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent v-if="store.username.length > 0" align="end" class="min-w-[170px] rounded-xl p-1.5 shadow-lg">
            <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">Connecté en tant que</DropdownMenuLabel>
            <div class="px-2 py-1 font-bold text-sm text-foreground truncate">{{ store.username }}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem v-if="lists && lists.length > 0" @click="goToList" class="rounded-lg text-sm cursor-pointer">
                Ma liste
            </DropdownMenuItem>
            <DropdownMenuSeparator v-if="lists && lists.length > 0" />
            <DropdownMenuItem @click="logout" class="rounded-lg text-sm text-destructive focus:text-destructive cursor-pointer">
                Déconnexion
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>