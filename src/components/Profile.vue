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
            <Button variant="secondary" size="icon" class="rounded-full">
                <Avatar v-if="store.username" class="border border-2">
                    {{ store.username.charAt(0) }}
                </Avatar>
                <CircleUser v-else class="h-5 w-5" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent v-if="store.username.length > 0" align="end">
            <DropdownMenuLabel>{{ store.username }}</DropdownMenuLabel>
            <DropdownMenuItem v-if="lists" @click="goToList">Ma liste</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="logout">Déconnexion</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>