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
    LogIn,
    UserPlus,
} from 'lucide-vue-next';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/utils/store';
import { clearGroups, clearLists, deleteUser, getLists, getRecentGroups, saveRecentGroup } from '@/utils/storage';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Avatar from './ui/avatar/Avatar.vue';
import CreateGroupModal from './modals/CreateGroupModal.vue';
import { createGroup } from '@/utils/api';
import type { CreateGroup, WishlistGroup } from '@/utils/types';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';

const props = defineProps<{ suggestedUsers?: string[] }>();

const router = useRouter();
const store = useUserStore();
const queryClient = useQueryClient();

const lists = computed(() => getLists());
const recentGroups = computed(() => getRecentGroups());

const createGroupModalOpen = ref(false);
const loginModalOpen = ref(false);
const customUsername = ref('');
const customUsernameError = ref('');

function loginAs(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    store.setUsername(trimmed);
    queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    toast.success(`Connecté en tant que ${trimmed}`);
}

function openLoginModal() {
    customUsername.value = '';
    customUsernameError.value = '';
    loginModalOpen.value = true;
}

function submitCustomUsername() {
    const trimmed = customUsername.value.trim();
    if (trimmed.length < 2) {
        customUsernameError.value = 'Veuillez saisir au moins 2 caractères.';
        return;
    }
    if (trimmed.length > 16) {
        customUsernameError.value = '16 caractères maximum.';
        return;
    }
    loginAs(trimmed);
    loginModalOpen.value = false;
}

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
        if (!data) {
            toast.error('Erreur lors de la création du groupe.');
            return;
        }
        saveRecentGroup({ id: data.id, title: data.title });
        queryClient.setQueryData<WishlistGroup>(['group', data.id], {
            ...data,
            list: data.list ?? [],
        });
        createGroupModalOpen.value = false;
        toast.success(`Événement « ${data.title} » créé ! 🎉`);
        router.push(`/group/${data.id}`);
    },
    onError: () => {
        toast.error('Erreur lors de la création du groupe.');
    },
});

async function onCreateGroup(data: CreateGroup) {
    try {
        await createGroupMutation.mutateAsync(data);
    } catch {
        // Error handled by mutation onError
    }
}

function logout() {
    deleteUser();
    clearLists();
    clearGroups();
    store.setUsername('');
    queryClient.invalidateQueries({ queryKey: ['wishlist'] });
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
                :aria-label="store.username ? `Profil de ${store.username}` : 'Se connecter ou ouvrir le menu'"
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
                    <CircleUser class="h-5 w-5" aria-hidden="true" />
                </div>
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" class="min-w-[220px] rounded-xl p-1.5 shadow-lg">
            <template v-if="store.username.length > 0">
                <DropdownMenuLabel class="text-xs text-muted-foreground font-normal">
                    Connecté en tant que
                </DropdownMenuLabel>
                <div class="px-2 py-1 font-bold text-sm text-foreground truncate">
                    {{ store.username }}
                </div>
                <DropdownMenuSeparator />
            </template>

            <template v-else>
                <template v-if="props.suggestedUsers && props.suggestedUsers.length > 0">
                    <DropdownMenuLabel class="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-2 py-1">
                        Se connecter en tant que
                    </DropdownMenuLabel>
                    <div class="max-h-52 overflow-y-auto">
                        <DropdownMenuItem
                            v-for="user in props.suggestedUsers"
                            :key="user"
                            @click="loginAs(user)"
                            class="rounded-lg text-sm gap-2 cursor-pointer"
                        >
                            <span class="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                                {{ user.charAt(0).toUpperCase() }}
                            </span>
                            <span class="truncate font-medium">{{ user }}</span>
                        </DropdownMenuItem>
                    </div>
                    <DropdownMenuItem
                        @click="openLoginModal"
                        class="rounded-lg text-sm gap-2 cursor-pointer text-muted-foreground hover:text-foreground mt-0.5"
                    >
                        <UserPlus class="w-4 h-4 shrink-0" aria-hidden="true" />
                        <span>Saisir mon prénom...</span>
                    </DropdownMenuItem>
                </template>
                <DropdownMenuItem
                    v-else
                    @click="openLoginModal"
                    class="rounded-lg text-sm gap-2 cursor-pointer font-medium text-primary focus:text-primary"
                >
                    <LogIn class="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>Saisir mon prénom</span>
                </DropdownMenuItem>
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

            <DropdownMenuSeparator v-if="(lists && lists.length > 0) || (recentGroups && recentGroups.length > 0)" />

            <!-- Action: Create new group -->
            <DropdownMenuItem
                @click="createGroupModalOpen = true"
                class="rounded-lg text-sm gap-2 cursor-pointer font-medium text-foreground hover:text-primary"
            >
                <Plus class="w-4 h-4" />
                <span>Créer un événement</span>
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

    <Dialog :open="loginModalOpen" @update:open="(val) => { loginModalOpen = val }">
        <DialogContent class="sm:max-w-[400px] rounded-2xl p-6">
            <DialogHeader class="text-left space-y-2">
                <div class="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                    <LogIn class="w-5 h-5" aria-hidden="true" />
                </div>
                <DialogTitle class="text-lg font-bold">Qui êtes-vous ?</DialogTitle>
                <DialogDescription class="text-xs sm:text-sm text-muted-foreground">
                    Saisissez votre prénom pour réserver des cadeaux ou retrouver votre liste.
                </DialogDescription>
            </DialogHeader>

            <form @submit.prevent="submitCustomUsername" class="space-y-3 my-2">
                <div class="space-y-1.5">
                    <label for="login-first-name" class="text-xs font-semibold text-foreground">
                        Votre prénom
                    </label>
                    <Input
                        id="login-first-name"
                        v-model="customUsername"
                        type="text"
                        placeholder="ex: Sophie, Thomas..."
                        class="h-11 rounded-xl"
                        maxlength="16"
                        autofocus
                        @input="customUsernameError = ''"
                    />
                    <p v-if="customUsernameError" class="text-xs text-destructive font-medium">
                        {{ customUsernameError }}
                    </p>
                </div>

                <DialogFooter class="flex-col-reverse sm:flex-row gap-2 pt-2">
                    <Button type="button" variant="outline" class="rounded-xl h-10" @click="loginModalOpen = false">
                        Annuler
                    </Button>
                    <Button type="submit" class="rounded-xl h-10 font-semibold" :disabled="!customUsername.trim()">
                        Se connecter
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>
