<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import {
    CircleUser,
} from 'lucide-vue-next'
import { useUserStore } from '@/utils/store'

const store = useUserStore()

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
            <DropdownMenuLabel>{{ store.username }}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Déconnexion</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>