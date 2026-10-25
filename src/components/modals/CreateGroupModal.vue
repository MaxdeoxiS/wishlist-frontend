<script setup lang="ts">
import { useForm } from 'vee-validate';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { ref } from 'vue';
import { Loader2, Users } from 'lucide-vue-next';

const props = defineProps<{
    open: boolean;
    onClose: () => void;
    create: (data: { title: string }) => void | Promise<void>;
}>();

const loading = ref(false);

const formSchema = toTypedSchema(
    z.object({
        title: z
            .string({ message: "Veuillez renseigner un titre d'événement" })
            .min(2, { message: "Titre trop court (minimum 2 caractères)" })
            .max(80, { message: "80 caractères maximum" }),
    })
);

const { handleSubmit, resetForm } = useForm({
    validationSchema: formSchema,
    initialValues: {
        title: '',
    },
});

const onSubmit = handleSubmit(async (values) => {
    loading.value = true;
    try {
        await props.create({
            title: values.title.trim(),
        });
        resetForm();
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent class="sm:max-w-[440px] rounded-2xl p-6">
            <DialogHeader class="text-left space-y-1">
                <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                    <Users class="w-5 h-5" />
                </div>
                <DialogTitle class="text-xl font-bold">Créer un événement / groupe</DialogTitle>
                <DialogDescription class="text-xs sm:text-sm text-muted-foreground">
                    Rassemblez plusieurs listes de souhaits pour un même événement (Noël en famille, anniversaire partagé, vacances...).
                </DialogDescription>
            </DialogHeader>

            <form @submit="onSubmit" class="space-y-4 my-2">
                <FormField v-slot="{ componentField }" name="title">
                    <FormItem>
                        <FormLabel class="text-xs font-semibold">Nom de l'événement ou groupe *</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                placeholder="ex: Noël 2026, Anniversaire de Sophie, Secret Santa..."
                                class="h-11 rounded-xl"
                                maxlength="80"
                                autofocus
                                v-bind="componentField"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
            </form>

            <DialogFooter class="flex-col-reverse sm:flex-row gap-2 mt-4">
                <Button variant="outline" class="rounded-xl h-11" @click="onClose" :disabled="loading">
                    Annuler
                </Button>
                <Button class="rounded-xl h-11 font-semibold shadow-sm" @click="onSubmit" :disabled="loading">
                    <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                    Créer l'événement
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
