<script setup lang="ts">
import { addListToGroup, createlist, getGroup, removeListFromGroup, updateList } from '@/utils/api';
import type { CreateList } from '@/utils/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { useRoute, useRouter } from 'vue-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ListHeader from "@/components/ListHeader.vue";
import { computed, ref, watch } from 'vue';
import Button from '@/components/ui/button/Button.vue';
import {
    Plus,
    Share2,
    Users,
    ChevronRight,
    ArrowLeft,
    AlertCircle,
    Copy,
    Trash2,
    MoreVertical,
    Pencil,
    Gift,
    Link2,
    Loader2,
    CheckCircle2,
    ClipboardCheck,
    Lock,
    X
} from 'lucide-vue-next';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AddListToGroupModal from '@/components/modals/AddListToGroupModal.vue';
import {
    saveRecentGroup,
    getPersonalChecklist,
    savePersonalChecklist,
    type PersonalChecklistItem
} from '@/utils/storage';
import { useUserStore } from '@/utils/store';
import { cn } from '@/lib/utils';
import { toast } from 'vue-sonner';

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id as string);
const queryClient = useQueryClient();
const store = useUserStore();

const isMyList = (list: { user?: string }) => !!store.username && list.user === store.username;

const hasBoughtInList = (list: { user?: string; wishes?: Array<{ bought_by?: string }> }) => {
    if (!store.username || isMyList(list)) return false;
    return (list.wishes || []).some((w) => w.bought_by === store.username);
};

const getRemainingCount = (list: { wishes?: Array<{ bought_by?: string }> }) => {
    const wishes = list.wishes || [];
    return wishes.filter((w) => !w.bought_by).length;
};

const { data, isLoading, isError } = useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroup(id.value),
});

const sortedLists = computed(() => {
    const lists = data.value?.list ? [...data.value.list] : [];
    return lists.sort((a, b) => {
        const boughtA = hasBoughtInList(a) ? 1 : 0;
        const boughtB = hasBoughtInList(b) ? 1 : 0;
        return boughtA - boughtB;
    });
});

// Personal Checklist (Local to device & per group)
const personalChecklist = ref<PersonalChecklistItem[]>([]);
const newChecklistPerson = ref('');

watch(
    id,
    (newGroupId) => {
        if (newGroupId) {
            personalChecklist.value = getPersonalChecklist(newGroupId);
        }
    },
    { immediate: true }
);

function addChecklistPerson() {
    const name = newChecklistPerson.value.trim();
    if (!name) return;
    personalChecklist.value.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        checked: false,
    });
    savePersonalChecklist(id.value, personalChecklist.value);
    newChecklistPerson.value = '';
}

function toggleChecklistPerson(itemId: string) {
    const item = personalChecklist.value.find((p) => p.id === itemId);
    if (item) {
        item.checked = !item.checked;
        savePersonalChecklist(id.value, personalChecklist.value);
    }
}

function removeChecklistPerson(itemId: string) {
    personalChecklist.value = personalChecklist.value.filter((p) => p.id !== itemId);
    savePersonalChecklist(id.value, personalChecklist.value);
}

// Save to recent groups once loaded
watch(data, (newGroup) => {
    if (newGroup?.id && newGroup?.title) {
        saveRecentGroup({ id: newGroup.id, title: newGroup.title });
    }
});

const addModalOpen = ref(false);
const defaultModalMode = ref<'existing' | 'new'>('new');

const existingListIds = computed(() => {
    return data.value?.list?.map((l) => l.id) || [];
});

function openAddModal(mode: 'existing' | 'new' = 'new') {
    defaultModalMode.value = mode;
    addModalOpen.value = true;
}

// Handler for adding an existing list by URL or ID
async function handleAddExisting(urlOrId: string) {
    const res = await addListToGroup(id.value, urlOrId);
    if (!res.success) {
        toast.error(res.error || "Impossible d'ajouter cette liste.");
        return false;
    }

    await queryClient.invalidateQueries({ queryKey: ['group', id.value] });
    toast.success('Liste ajoutée avec succès au groupe ! 🎉');
    return true;
}

// Handler for creating a new list directly in the group
async function handleCreateNew(listData: CreateList) {
    const newList = await createlist(listData, id.value);
    if (!newList) {
        toast.error('Erreur lors de la création de la liste.');
        return false;
    }

    await queryClient.invalidateQueries({ queryKey: ['group', id.value] });
    toast.success(`Liste « ${newList.title} » créée et ajoutée au groupe ! 🎉`);
    return true;
}

// Detach / remove a list from group
const removeMutation = useMutation({
    mutationFn: (listId: string) => removeListFromGroup(id.value, listId),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['group', id.value] });
        toast.info('Liste retirée du groupe.');
    },
    onError: () => {
        toast.error('Erreur lors du retrait de la liste.');
    },
});

function confirmRemoveList(listId: string, listTitle: string) {
    if (window.confirm(`Voulez-vous retirer la liste « ${listTitle} » de ce groupe ? (Elle ne sera pas supprimée, seulement détachée du groupe).`)) {
        removeMutation.mutate(listId);
    }
}

function goToList(listId: string) {
    router.push(`/list/${listId}`);
}

async function copyListUrl(listId: string) {
    const url = `${window.location.origin}/list/${listId}`;
    try {
        await navigator.clipboard.writeText(url);
        toast.success('Lien de la liste copié ! 📋');
    } catch {
        toast.error('Impossible de copier le lien.');
    }
}

// List Rename Dialog (Only for user's own list)
const editListTitleModalOpen = ref(false);
const selectedListForRename = ref<{ id: string; title: string; user?: string } | null>(null);
const newListTitle = ref('');

function openEditListTitleModal(list: { id: string; title: string; user?: string }) {
    if (!isMyList(list)) {
        toast.error("Vous ne pouvez modifier que votre propre liste.");
        return;
    }
    selectedListForRename.value = list;
    newListTitle.value = list.title;
    editListTitleModalOpen.value = true;
}

const updateListTitleMutation = useMutation({
    mutationFn: ({ listId, title }: { listId: string; title: string }) => updateList(listId, { title }),
    onSuccess: (updated) => {
        if (updated) {
            queryClient.invalidateQueries({ queryKey: ['group', id.value] });
            editListTitleModalOpen.value = false;
            toast.success("Nom de la liste mis à jour !");
        }
    },
    onError: () => {
        toast.error("Impossible de renommer la liste.");
    },
});

function saveNewListTitle() {
    if (!selectedListForRename.value || !isMyList(selectedListForRename.value)) return;
    const trimmed = newListTitle.value.trim();
    if (!trimmed) return;
    if (trimmed === selectedListForRename.value.title) {
        editListTitleModalOpen.value = false;
        return;
    }
    updateListTitleMutation.mutate({ listId: selectedListForRename.value.id, title: trimmed });
}

// Share group link
async function share() {
    const shareUrl = window.location.href;
    const shareData = {
        title: data.value?.title ?? "Groupe d'événement",
        text: `Consultez les listes de souhaits pour « ${data.value?.title ?? ''} » !`,
        url: shareUrl,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return;
        } catch (err: any) {
            if (err.name === 'AbortError') return;
        }
    }

    try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Lien du groupe copié dans le presse-papier ! 📋');
    } catch {
        toast.error('Impossible de copier le lien');
    }
}
</script>

<template>
    <div class="flex min-h-screen w-full flex-col bg-muted/40 pb-24 sm:pb-12">
        <ListHeader />

        <!-- Skeleton Loading -->
        <div v-if="isLoading" class="max-w-[960px] mx-auto px-4 py-6 space-y-4 w-full">
            <div class="h-28 rounded-2xl bg-card border p-6 space-y-3 animate-pulse">
                <div class="h-6 w-48 bg-muted rounded"></div>
                <div class="h-4 w-32 bg-muted/60 rounded"></div>
            </div>
            <div class="space-y-3">
                <div
                    v-for="i in 3"
                    :key="i"
                    class="h-20 rounded-xl bg-card border p-4 flex items-center justify-between animate-pulse"
                >
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-muted"></div>
                        <div class="space-y-2">
                            <div class="h-5 w-32 bg-muted rounded"></div>
                            <div class="h-3 w-20 bg-muted/60 rounded"></div>
                        </div>
                    </div>
                    <div class="h-8 w-16 bg-muted rounded-full"></div>
                </div>
            </div>
        </div>

        <!-- Error / Not found -->
        <div v-else-if="isError || !data" class="max-w-md mx-auto px-4 py-20 text-center flex flex-col items-center">
            <div class="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                <AlertCircle class="w-8 h-8" />
            </div>
            <h2 class="text-xl font-bold mb-2">Événement introuvable</h2>
            <p class="text-sm text-muted-foreground mb-6">
                Ce groupe de listes n'existe pas ou le lien est invalide.
            </p>
            <Button class="rounded-full gap-2" @click="router.push('/')">
                <ArrowLeft class="w-4 h-4" /> Retour à l'accueil
            </Button>
        </div>

        <!-- Content -->
        <div v-else class="flex flex-col sm:gap-4 sm:py-6 px-3 sm:px-6 md:max-w-[960px] md:mx-auto w-full">
            <main class="grid flex-1 items-start gap-4">
                <Card class="border shadow-sm rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm">
                    <!-- Header -->
                    <CardHeader class="p-4 sm:p-6 pb-4 border-b border-border/40">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-start gap-3">
                                <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                    <Users class="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle class="text-xl sm:text-2xl font-extrabold tracking-tight">
                                        {{ data.title }}
                                    </CardTitle>
                                    <CardDescription class="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
                                        <span>
                                            {{ data.list?.length || 0 }}
                                            {{ (data.list?.length || 0) > 1 ? 'listes partagées' : 'liste partagée' }}
                                        </span>
                                        <span v-if="data.created_at" class="text-muted-foreground/50">•</span>
                                        <span v-if="data.created_at" class="hidden sm:inline">
                                            Créé le {{ new Date(data.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) }}
                                        </span>
                                    </CardDescription>
                                </div>
                            </div>

                            <!-- Desktop Actions in Header -->
                            <div class="hidden sm:flex items-center gap-2">
                                <Button variant="outline" size="sm" class="rounded-full px-4 gap-1.5" @click="share">
                                    <Share2 class="w-3.5 h-3.5" /> Partager le groupe
                                </Button>
                                <Button size="sm" class="rounded-full px-4 gap-1.5 shadow-sm" @click="openAddModal('new')">
                                    <Plus class="w-3.5 h-3.5" /> Ajouter une liste
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <!-- Body: List of Lists -->
                    <CardContent class="p-3 sm:p-6 space-y-3">
                        <!-- Empty State -->
                        <div
                            v-if="!data.list || data.list.length === 0"
                            class="py-12 px-4 text-center rounded-xl border border-dashed border-border/80 bg-muted/20 flex flex-col items-center justify-center space-y-4"
                        >
                            <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <Gift class="w-6 h-6" />
                            </div>
                            <div class="max-w-sm space-y-1">
                                <h3 class="font-bold text-base text-foreground">Aucune liste pour le moment</h3>
                                <p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    Cet événement est prêt ! Créez une première liste pour commencer à partager vos idées de cadeaux.
                                </p>
                            </div>
                            <div class="flex flex-col sm:flex-row items-center gap-2 pt-2">
                                <Button class="rounded-full px-5 text-xs font-semibold gap-2 shadow-sm" @click="openAddModal('new')">
                                    <Plus class="w-4 h-4" /> Créer une nouvelle liste
                                </Button>
                                <Button variant="ghost" class="rounded-full px-4 text-xs text-muted-foreground hover:text-foreground gap-1.5" @click="openAddModal('existing')">
                                    <Link2 class="w-3.5 h-3.5" /> Rattacher par URL
                                </Button>
                            </div>
                        </div>

                        <!-- Non-empty lists -->
                        <div
                            v-for="list of sortedLists"
                            :key="list.id"
                            :class="cn(
                                'group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.99] transition-all cursor-pointer',
                                hasBoughtInList(list) && 'opacity-65 bg-muted/30 hover:opacity-95'
                            )"
                            @click="goToList(list.id)"
                        >
                            <div class="flex items-center gap-3.5 min-w-0">
                                <!-- Avatar with initial -->
                                <div
                                    :class="cn(
                                        'w-11 h-11 rounded-xl font-bold flex items-center justify-center text-base shrink-0 transition-colors',
                                        hasBoughtInList(list)
                                            ? 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                                            : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                                    )"
                                >
                                    {{ list.user?.charAt(0).toUpperCase() || '?' }}
                                </div>
                                <div class="min-w-0 space-y-0.5">
                                    <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
                                        <h3 class="font-bold text-sm sm:text-base text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                                            {{ list.title }}
                                        </h3>
                                        <span
                                            v-if="hasBoughtInList(list)"
                                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0"
                                        >
                                            <CheckCircle2 class="w-3 h-3" /> Cadeau pris
                                        </span>
                                        <Button
                                            v-if="isMyList(list)"
                                            variant="ghost"
                                            size="icon"
                                            class="w-6 h-6 rounded-md text-muted-foreground/60 hover:text-foreground opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                            title="Modifier le nom de ma liste"
                                            @click.stop="openEditListTitleModal(list)"
                                        >
                                            <Pencil class="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <div class="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span class="truncate">
                                            Par <strong class="text-foreground font-medium">{{ list.user }}</strong>
                                        </span>
                                        <span>•</span>
                                        <span class="font-medium text-foreground/80">
                                            <template v-if="isMyList(list)">
                                                {{ list.wishes?.length || 0 }} {{ (list.wishes?.length || 0) > 1 ? 'souhaits' : 'souhait' }}
                                            </template>
                                            <template v-else>
                                                {{ getRemainingCount(list) }}/{{ list.wishes?.length || 0 }}
                                                {{ getRemainingCount(list) > 1 ? 'souhaits restants' : 'souhait restant' }}
                                            </template>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex items-center gap-2 shrink-0" @click.stop>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    class="rounded-full text-xs font-semibold gap-1 hidden sm:inline-flex"
                                    @click.stop="goToList(list.id)"
                                >
                                    Voir la liste <ChevronRight class="w-3.5 h-3.5" />
                                </Button>

                                <!-- Dropdown actions per list -->
                                <DropdownMenu>
                                    <DropdownMenuTrigger as-child>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            class="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                                        >
                                            <MoreVertical class="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" class="min-w-[160px] rounded-xl p-1.5 shadow-lg">
                                        <DropdownMenuItem class="rounded-lg text-xs gap-2 cursor-pointer" @click="goToList(list.id)">
                                            <Gift class="w-3.5 h-3.5" />
                                            <span>Ouvrir la liste</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem class="rounded-lg text-xs gap-2 cursor-pointer" @click="copyListUrl(list.id)">
                                            <Copy class="w-3.5 h-3.5" />
                                            <span>Copier le lien</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            v-if="isMyList(list)"
                                            class="rounded-lg text-xs gap-2 cursor-pointer"
                                            @click="openEditListTitleModal(list)"
                                        >
                                            <Pencil class="w-3.5 h-3.5" />
                                            <span>Modifier le nom</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            class="rounded-lg text-xs gap-2 text-destructive focus:text-destructive cursor-pointer"
                                            @click="confirmRemoveList(list.id, list.title)"
                                        >
                                            <Trash2 class="w-3.5 h-3.5" />
                                            <span>Retirer du groupe</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>

                    <!-- Desktop Bottom Actions Footer -->
                    <div
                        v-if="data.list && data.list.length > 0"
                        class="hidden sm:flex items-center justify-between p-4 sm:p-6 pt-0 border-t border-border/40"
                    >
                        <p class="text-xs text-muted-foreground">
                            Chaque participant peut ouvrir sa liste ou consulter celles des autres pour réserver un cadeau.
                        </p>
                        <div class="flex items-center gap-2">
                            <Button variant="outline" class="rounded-full px-4 gap-2 text-xs" @click="share">
                                <Share2 class="w-3.5 h-3.5" /> Partager
                            </Button>
                            <Button class="rounded-full px-5 shadow-sm gap-2 text-xs font-semibold" @click="openAddModal('new')">
                                <Plus class="w-4 h-4" /> Ajouter une liste
                            </Button>
                        </div>
                    </div>
                </Card>

                <!-- Personal Private Checklist Card -->
                <Card class="border shadow-sm rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm">
                    <CardHeader class="p-4 sm:p-6 pb-3 border-b border-border/40">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-start gap-3">
                                <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                    <ClipboardCheck class="w-5 h-5" />
                                </div>
                                <div>
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <CardTitle id="personal-checklist-heading" class="text-base sm:text-lg font-bold tracking-tight">
                                            Mon suivi personnel
                                        </CardTitle>
                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border/60">
                                            <Lock class="w-2.5 h-2.5" /> Privé (sur cet appareil)
                                        </span>
                                    </div>
                                    <CardDescription class="text-xs text-muted-foreground mt-0.5">
                                        Notez les personnes à qui vous devez offrir un cadeau et cochez au fur et à mesure. Visible uniquement par vous.
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent class="p-3 sm:p-6 space-y-3">
                        <form
                            aria-labelledby="personal-checklist-heading"
                            class="flex items-center gap-2"
                            @submit.prevent="addChecklistPerson"
                        >
                            <label for="new-checklist-person" class="sr-only">Nom de la personne</label>
                            <Input
                                id="new-checklist-person"
                                v-model="newChecklistPerson"
                                name="personName"
                                type="text"
                                placeholder="Ajouter une personne (ex: Mamie, Lucas...)"
                                class="h-10 rounded-xl flex-1 text-sm"
                                maxlength="80"
                                enterkeyhint="done"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                class="rounded-xl h-10 px-4 gap-1.5 shrink-0 font-semibold"
                                :disabled="!newChecklistPerson.trim()"
                            >
                                <Plus class="w-4 h-4" />
                                <span>Ajouter</span>
                            </Button>
                        </form>

                        <div v-if="personalChecklist.length > 0" class="divide-y divide-border/40 rounded-xl border bg-background/50">
                            <div
                                v-for="item in personalChecklist"
                                :key="item.id"
                                class="flex items-center justify-between gap-2 px-3 py-1.5 hover:bg-muted/30 transition-colors"
                            >
                                <label
                                    :for="`check-${item.id}`"
                                    class="flex items-center gap-3 flex-1 min-h-[44px] cursor-pointer select-none py-1"
                                >
                                    <input
                                        :id="`check-${item.id}`"
                                        type="checkbox"
                                        :name="`check-${item.id}`"
                                        :checked="item.checked"
                                        class="personal-checkbox shrink-0"
                                        @change="toggleChecklistPerson(item.id)"
                                    />
                                    <span
                                        :class="cn(
                                            'text-sm font-medium transition-all break-all',
                                            item.checked ? 'line-through text-muted-foreground' : 'text-foreground'
                                        )"
                                    >
                                        {{ item.name }}
                                    </span>
                                </label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    class="h-8 w-8 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    :title="`Supprimer ${item.name}`"
                                    @click="removeChecklistPerson(item.id)"
                                >
                                    <X class="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <p v-else class="text-xs text-muted-foreground text-center py-2">
                            Votre liste personnelle est vide. Ajoutez des prénoms ci-dessus pour suivre vos achats !
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>

        <!-- Mobile Bottom Action Bar -->
        <div class="sm:hidden fixed bottom-0 left-0 right-0 z-20 p-3 pb-safe bg-background/90 backdrop-blur-lg border-t border-border/60 shadow-lg">
            <div class="flex items-center gap-2 max-w-md mx-auto">
                <Button
                    variant="outline"
                    class="rounded-full h-11 px-4 gap-1.5 shrink-0 border-border/80"
                    @click="share"
                >
                    <Share2 class="w-4 h-4" />
                    <span class="text-xs font-semibold">Partager</span>
                </Button>

                <Button
                    class="flex-1 rounded-full h-11 font-bold shadow-md gap-2"
                    @click="openAddModal('new')"
                >
                    <Plus class="w-5 h-5" />
                    <span>Ajouter une liste</span>
                </Button>
            </div>
        </div>
    </div>

    <!-- Modal to Add List (Existing URL or New) -->
    <AddListToGroupModal
        v-if="addModalOpen"
        :open="addModalOpen"
        :default-mode="defaultModalMode"
        :existing-list-ids="existingListIds"
        :add-existing="handleAddExisting"
        :create-new="handleCreateNew"
        @close="addModalOpen = false"
    />

    <!-- Edit List Title Modal -->
    <Dialog :open="editListTitleModalOpen" @update:open="editListTitleModalOpen = false">
        <DialogContent class="sm:max-w-[400px] rounded-2xl p-6">
            <DialogHeader class="text-left space-y-1">
                <DialogTitle class="text-lg font-bold">Modifier le nom de la liste</DialogTitle>
                <DialogDescription class="text-xs text-muted-foreground">
                    Modifiez le titre de cette liste de souhaits.
                </DialogDescription>
            </DialogHeader>

            <div class="space-y-3 my-2">
                <Input
                    v-model="newListTitle"
                    type="text"
                    placeholder="Nom de la liste"
                    class="h-11 rounded-xl"
                    maxlength="100"
                    autofocus
                    @keydown.enter.prevent="saveNewListTitle"
                />
            </div>

            <DialogFooter class="flex-col-reverse sm:flex-row gap-2 mt-2">
                <Button variant="outline" class="rounded-xl h-10" @click="editListTitleModalOpen = false">
                    Annuler
                </Button>
                <Button class="rounded-xl h-10 font-semibold" @click="saveNewListTitle" :disabled="!newListTitle.trim() || updateListTitleMutation.isPending.value">
                    <Loader2 v-if="updateListTitleMutation.isPending.value" class="w-4 h-4 mr-2 animate-spin" />
                    Enregistrer
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<style scoped>
.personal-checkbox {
    accent-color: hsl(var(--primary));
    inline-size: 1.25em;
    aspect-ratio: 1;
    margin: 0;
    cursor: pointer;
    border-radius: 0.25rem;
}

.personal-checkbox:focus-visible {
    outline: 2px solid hsl(var(--primary));
    outline-offset: 2px;
}
</style>
