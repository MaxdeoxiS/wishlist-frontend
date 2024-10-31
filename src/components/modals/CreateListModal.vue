<script setup lang="ts">
import { useForm } from 'vee-validate';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { CreateList } from '@/utils/types';
import { useUserStore } from '@/utils/store';
import { ref } from 'vue';

const props = defineProps<{ open: boolean; onClose: () => void, create: (data: CreateList) => void }>()

const loading = ref(false)

const store = useUserStore()

const formSchema = toTypedSchema(z.object({
    title: z.string().min(3, { message: "Titre trop court" }).max(100, { message: "Titre trop long" }).optional(),
    username: z.string({ message: "Veuillez saisir votre nom" }).min(2, { message: "Nom trop court" }).max(140, { message: "Nom trop long" }),
}))

const { handleSubmit } = useForm({
    validationSchema: formSchema,
    initialValues: {
        username: store.username,
    },
})

const onSubmit = handleSubmit((values) => {
    loading.value = true
    const { title, username } = values
    props.create({
        user: username,
        title: title ?? `Liste de souhait de ${username}`
    })
    loading.value = false
})
</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Nouvelle liste</DialogTitle>
            </DialogHeader>
            <form @submit="onSubmit" class="space-y-6">
                <FormField v-slot="{ componentField }" name="title">
                    <FormItem>
                        <FormLabel>Titre de la liste (facultatif)</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="Ma liste de souhait" v-bind="componentField" />
                        </FormControl>
                    </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="username">
                    <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                            <Input :disabled="store.username.length > 0" type="text" placeholder="Votre nom"
                                v-bind="componentField" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
            </form>
            <DialogFooter>
                <Button @click="onSubmit">
                    <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                    Valider
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>