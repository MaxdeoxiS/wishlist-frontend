<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { Button } from '../ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '../ui/dialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { useUserStore } from '@/utils/store';
import { getLists } from '@/utils/storage';
import { extractListId } from '@/utils/api';
import type { CreateList } from '@/utils/types';
import { Loader2, Link2, PlusCircle, Sparkles } from 'lucide-vue-next';

const props = withDefaults(
    defineProps<{
        open: boolean;
        onClose: () => void;
        addExisting: (urlOrId: string) => Promise<boolean | void>;
        createNew: (data: CreateList) => Promise<boolean | void>;
        defaultMode?: 'existing' | 'new';
        existingListIds?: string[];
    }>(),
    {
        defaultMode: 'new',
        existingListIds: () => [],
    }
);

const mode = ref<'existing' | 'new'>(props.defaultMode);
const loading = ref(false);
const store = useUserStore();

watch(() => props.defaultMode, (newVal) => {
    mode.value = newVal;
});

// --- Form for Existing List ---
const existingUrlOrId = ref('');
const existingError = ref('');

const localLists = computed(() => {
    const listIds = getLists();
    return listIds.filter(id => !props.existingListIds.includes(id));
});

function selectLocalList(id: string) {
    existingUrlOrId.value = id;
    existingError.value = '';
}

async function onSubmitExisting() {
    existingError.value = '';
    const trimmed = existingUrlOrId.value.trim();
    if (!trimmed) {
        existingError.value = "Veuillez renseigner l'URL ou l'identifiant de la liste.";
        return;
    }

    const cleanId = extractListId(trimmed);
    if (!cleanId) {
        existingError.value = "Format d'identifiant ou d'URL non reconnu.";
        return;
    }

    if (props.existingListIds.includes(cleanId)) {
        existingError.value = "Cette liste est déjà présente dans ce groupe !";
        return;
    }

    loading.value = true;
    try {
        const success = await props.addExisting(cleanId);
        if (success !== false) {
            existingUrlOrId.value = '';
            props.onClose();
        }
    } finally {
        loading.value = false;
    }
}

// --- Form for New List ---
const formSchema = toTypedSchema(
    z.object({
        title: z.string().min(3, { message: "Titre trop court" }).max(100, { message: "Titre trop long" }).optional(),
        username: z.string({ message: "Veuillez saisir un prénom ou pseudo" }).min(2, { message: "Nom trop court" }).max(20, { message: "20 caractères maximum" }),
    })
);

const { handleSubmit, resetForm } = useForm({
    validationSchema: formSchema,
    initialValues: {
        username: store.username || '',
        title: '',
    },
});

watch(() => props.open, (isOpen) => {
    if (isOpen) {
        mode.value = props.defaultMode;
        existingUrlOrId.value = '';
        existingError.value = '';
        resetForm({
            values: {
                username: store.username || '',
                title: '',
            },
        });
    }
});

const onSubmitNew = handleSubmit(async (values) => {
    loading.value = true;
    try {
        const { title, username } = values;
        const success = await props.createNew({
            user: username.trim(),
            title: title?.trim() || `Liste de souhaits de ${username.trim()}`,
        });
        if (success !== false) {
            resetForm();
            props.onClose();
        }
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent class="sm:max-w-[480px] rounded-2xl p-6">
            <DialogHeader class="text-left space-y-1">
                <DialogTitle class="text-xl font-bold">Ajouter une liste au groupe</DialogTitle>
                <DialogDescription class="text-xs sm:text-sm text-muted-foreground">
                    Créez une nouvelle liste pour cet événement ou rattachez une liste existante.
                </DialogDescription>
            </DialogHeader>

            <!-- Mode Selector / Segmented Tabs -->
            <div class="flex items-center gap-1.5 p-1 bg-muted/50 rounded-xl text-xs mt-3 mb-2">
                <button
                    type="button"
                    class="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all"
                    :class="mode === 'new' ? 'bg-background text-foreground font-semibold shadow-sm' : 'text-muted-foreground hover:text-foreground font-medium'"
                    @click="mode = 'new'"
                >
                    <PlusCircle class="w-3.5 h-3.5" :class="mode === 'new' ? 'text-primary' : ''" />
                    <span>Nouvelle liste</span>
                </button>
                <button
                    type="button"
                    class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all"
                    :class="mode === 'existing' ? 'bg-background text-foreground font-medium shadow-sm' : 'text-muted-foreground/60 hover:text-muted-foreground font-normal'"
                    @click="mode = 'existing'"
                    title="Rattacher une liste existante via son URL"
                >
                    <Link2 class="w-3 h-3 opacity-60" />
                    <span class="text-[11px]">Par URL</span>
                </button>
            </div>

            <!-- Mode 1: Create Brand New List in Group (Primary / Default) -->
            <form v-if="mode === 'new'" @submit="onSubmitNew" class="space-y-4 py-1">
                <FormField v-slot="{ componentField }" name="username">
                    <FormItem>
                        <FormLabel class="text-xs font-semibold">Prénom ou pseudo de la personne *</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                placeholder="ex: Lucas, Maman, Thomas..."
                                class="h-11 rounded-xl"
                                maxlength="20"
                                autofocus
                                v-bind="componentField"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="title">
                    <FormItem>
                        <FormLabel class="text-xs font-semibold">Titre de la liste (facultatif)</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                placeholder="ex: Liste de Lucas pour Noël"
                                class="h-11 rounded-xl"
                                maxlength="100"
                                v-bind="componentField"
                            />
                        </FormControl>
                        <p class="text-[11px] text-muted-foreground">
                            Par défaut : « Liste de souhaits de [Prénom] »
                        </p>
                    </FormItem>
                </FormField>

                <div class="text-center pt-1">
                    <button
                        type="button"
                        class="text-[11px] text-muted-foreground/60 hover:text-muted-foreground hover:underline transition-colors"
                        @click="mode = 'existing'"
                    >
                        Vous avez déjà une liste créée ? La rattacher par son lien
                    </button>
                </div>

                <DialogFooter class="flex-col-reverse sm:flex-row gap-2 pt-2">
                    <Button variant="outline" class="rounded-xl h-11" @click="onClose" :disabled="loading">
                        Annuler
                    </Button>
                    <Button class="rounded-xl h-11 font-semibold shadow-sm" @click="onSubmitNew" :disabled="loading">
                        <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                        Créer et ajouter
                    </Button>
                </DialogFooter>
            </form>

            <!-- Mode 2: Existing List via URL/ID (Secondary) -->
            <div v-else class="space-y-4 py-1">
                <div class="space-y-2">
                    <label class="text-xs font-semibold text-foreground">
                        Lien ou identifiant de la liste *
                    </label>
                    <Input
                        v-model="existingUrlOrId"
                        type="text"
                        placeholder="ex: https://.../list/c288d... ou c288d..."
                        class="h-11 rounded-xl"
                        autofocus
                        @keydown.enter.prevent="onSubmitExisting"
                    />
                    <p v-if="existingError" class="text-xs text-destructive font-medium">
                        {{ existingError }}
                    </p>
                    <p v-else class="text-[11px] text-muted-foreground leading-relaxed">
                        Collez l'URL de partage complète ou l'identifiant de la liste à rattacher à cet événement.
                    </p>
                </div>

                <!-- Quick Pick for My Local List -->
                <div v-if="localLists.length > 0" class="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
                    <div class="flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <Sparkles class="w-3.5 h-3.5" />
                        <span>Votre liste récente détectée</span>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-xs font-mono text-muted-foreground truncate">
                            {{ localLists[0] }}
                        </span>
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            class="h-7 text-xs rounded-lg shrink-0"
                            @click="selectLocalList(localLists[0])"
                        >
                            Utiliser celle-ci
                        </Button>
                    </div>
                </div>

                <div class="text-center pt-1">
                    <button
                        type="button"
                        class="text-[11px] text-muted-foreground/70 hover:text-foreground hover:underline transition-colors"
                        @click="mode = 'new'"
                    >
                        ← Revenir à la création d'une nouvelle liste
                    </button>
                </div>

                <DialogFooter class="flex-col-reverse sm:flex-row gap-2 pt-2">
                    <Button variant="outline" class="rounded-xl h-11" @click="onClose" :disabled="loading">
                        Annuler
                    </Button>
                    <Button
                        class="rounded-xl h-11 font-semibold shadow-sm"
                        @click="onSubmitExisting"
                        :disabled="loading || !existingUrlOrId.trim()"
                    >
                        <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                        Ajouter au groupe
                    </Button>
                </DialogFooter>
            </div>
        </DialogContent>
    </Dialog>
</template>
