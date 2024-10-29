<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import {
    CircleUser,
} from 'lucide-vue-next'
import { useUserStore } from '@/utils/store'
import { deleteUser, setList } from '@/utils/storage';
import { useRouter } from 'vue-router';

const store = useUserStore()
const router = useRouter()

function logout() {
    deleteUser()
    setList("")
    store.setUsername("")
    router.replace("/")
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
        <DropdownMenuContent align="end">
            <DropdownMenuLabel v-if="store.username.length > 0">{{ store.username }}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="logout">Déconnexion</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>