<script setup lang="ts">
import { useForm } from 'vee-validate';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { CreateList } from '@/utils/types';
import { useUserStore } from '@/utils/store';
import { ref } from 'vue';
import { Loader2, Sparkles } from 'lucide-vue-next';

const props = defineProps<{ open: boolean; onClose: () => void; create: (data: CreateList) => void | Promise<unknown> }>()

const loading = ref(false)

const store = useUserStore()

const formSchema = toTypedSchema(z.object({
    title: z.union([
        z.literal(''),
        z.string().trim().min(3, { message: "Titre trop court" }).max(100, { message: "Titre trop long" })
    ]).optional(),
    username: z.string({ message: "Veuillez saisir votre nom" }).trim().min(2, { message: "Nom trop court" }).max(16, { message: "16 caractères maximum" }),
}))

const { handleSubmit } = useForm({
    validationSchema: formSchema,
    initialValues: {
        username: store.username,
        title: '',
    },
})

const onSubmit = handleSubmit(async (values) => {
    if (loading.value) return
    loading.value = true
    try {
        const trimmedTitle = values.title?.trim()
        const trimmedUser = values.username.trim()
        await props.create({
            user: trimmedUser,
            title: trimmedTitle || `Liste de souhaits de ${trimmedUser}`
        })
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent class="sm:max-w-[425px] rounded-2xl p-6">
            <DialogHeader class="text-left space-y-1">
                <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                    <Sparkles class="w-5 h-5" />
                </div>
                <DialogTitle class="text-xl font-bold">Créer une liste de souhaits</DialogTitle>
                <DialogDescription class="text-xs sm:text-sm text-muted-foreground">
                    Donnez un titre à votre liste et renseignez votre prénom pour commencer.
                </DialogDescription>
            </DialogHeader>
            <form @submit="onSubmit" class="space-y-4 my-2">
                <FormField v-slot="{ componentField }" name="title">
                    <FormItem>
                        <FormLabel class="text-xs font-semibold">Titre de la liste (facultatif)</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="ex: Mon Anniversaire, Liste de Noël..." class="h-11 rounded-xl" v-bind="componentField" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="username">
                    <FormItem>
                        <FormLabel class="text-xs font-semibold">Votre prénom ou pseudo *</FormLabel>
                        <FormControl>
                            <Input :disabled="store.username.length > 0" type="text" placeholder="ex: Sophie" class="h-11 rounded-xl"
                                maxlength="16"
                                v-bind="componentField" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
            </form>
            <DialogFooter class="flex-col-reverse sm:flex-row gap-2 mt-4">
                <Button type="button" variant="outline" class="rounded-xl h-11" @click="onClose" :disabled="loading">
                    Annuler
                </Button>
                <Button type="submit" class="rounded-xl h-11 font-semibold shadow-sm" @click="onSubmit" :disabled="loading">
                    <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Créer ma liste
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>