<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import {
    CircleUser,
} from 'lucide-vue-next'
import { useUserStore } from '@/utils/store'
import { clearLists, deleteUser } from '@/utils/storage';

const store = useUserStore()

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
                <CircleUser class="h-5 w-5" />
                <span class="sr-only">Toggle user menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent v-if="store.username.length > 0" align="end">
            <DropdownMenuLabel>{{ store.username }}</DropdownMenuLabel>
            <!-- <DropdownMenuItem>Mes listes</DropdownMenuItem> -->
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="logout">Déconnexion</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>