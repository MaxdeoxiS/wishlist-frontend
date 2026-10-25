<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    CircleUser,
    Gift,
    Users,
    Plus,
    LogOut,
} from 'lucide-vue-next';
import { useUserStore } from '@/utils/store';
import { clearGroups, clearLists, deleteUser, getLists, getRecentGroups, saveRecentGroup } from '@/utils/storage';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from './ui/avatar/Avatar.vue';
import CreateGroupModal from './modals/CreateGroupModal.vue';
import { createGroup } from '@/utils/api';
import type { CreateGroup } from '@/utils/types';
import { useMutation } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

const router = useRouter();
const store = useUserStore();

const lists = computed(() => getLists());
const recentGroups = computed(() => getRecentGroups());

const createGroupModalOpen = ref(false);

function goToList() {
    if (lists.value && lists.value.length > 0) {
        router.push(`/list/${lists.value[0]}`);
    }
}

function goToGroup(id: string) {
    router.push(`/group/${id}`);
}

const createGroupMutation = useMutation({
    mutationFn: (data: CreateGroup) => createGroup(data),
    onSuccess: (data) => {
        if (data) {
            saveRecentGroup({ id: data.id, title: data.title });
            createGroupModalOpen.value = false;
            toast.success(`Événement « ${data.title} » créé ! 🎉`);
            router.push(`/group/${data.id}`);
        }
    },
    onError: () => {
        toast.error('Erreur lors de la création du groupe.');
    },
});

function onCreateGroup(data: CreateGroup) {
    createGroupMutation.mutate(data);
}

function logout() {
    deleteUser();
    clearLists();
    clearGroups();
    store.setUsername('');
    toast.info('Session réinitialisée.');
}
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button
                variant="ghost"
                size="icon"
                class="rounded-full w-9 h-9 p-0 hover:bg-muted/80 transition-colors"
            >
                <Avatar
                    v-if="store.username"
                    class="h-9 w-9 bg-primary/10 text-primary font-bold border border-primary/30 flex items-center justify-center text-sm shadow-sm"
                >
                    {{ store.username.charAt(0).toUpperCase() }}
                </Avatar>
                <div
                    v-else
                    class="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground border"
                >
                    <CircleUser class="h-5 w-5" />
                </div>
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" class="min-w-[210px] rounded-xl p-1.5 shadow-lg">
            <template v-if="store.username.length > 0">
                <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">
                    Connecté en tant que
                </DropdownMenuLabel>
                <div class="px-2 py-1 font-bold text-sm text-foreground truncate">
                    {{ store.username }}
                </div>
                <DropdownMenuSeparator />
            </template>

            <!-- List shortcuts -->
            <DropdownMenuItem
                v-if="lists && lists.length > 0"
                @click="goToList"
                class="rounded-lg text-sm gap-2 cursor-pointer"
            >
                <Gift class="w-4 h-4 text-primary" />
                <span>Ma liste</span>
            </DropdownMenuItem>

            <!-- Group shortcuts -->
            <template v-if="recentGroups && recentGroups.length > 0">
                <DropdownMenuSeparator v-if="lists && lists.length > 0" />
                <DropdownMenuLabel class="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-2 py-1">
                    Mes événements
                </DropdownMenuLabel>
                <DropdownMenuItem
                    v-for="group of recentGroups"
                    :key="group.id"
                    @click="goToGroup(group.id)"
                    class="rounded-lg text-sm gap-2 cursor-pointer truncate"
                >
                    <Users class="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span class="truncate">{{ group.title }}</span>
                </DropdownMenuItem>
            </template>

            <DropdownMenuSeparator />

            <!-- Action: Create new group -->
            <DropdownMenuItem
                @click="createGroupModalOpen = true"
                class="rounded-lg text-sm gap-2 cursor-pointer font-medium text-foreground hover:text-primary"
            >
                <Plus class="w-4 h-4" />
                <span>Créer un événement / Noël</span>
            </DropdownMenuItem>

            <!-- Logout if logged in -->
            <template v-if="store.username.length > 0">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    @click="logout"
                    class="rounded-lg text-sm gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                    <LogOut class="w-4 h-4" />
                    <span>Déconnexion</span>
                </DropdownMenuItem>
            </template>
        </DropdownMenuContent>
    </DropdownMenu>

    <CreateGroupModal
        v-if="createGroupModalOpen"
        :open="createGroupModalOpen"
        @close="createGroupModalOpen = false"
        :create="onCreateGroup"
    />
</template>
