<script setup lang="ts">
import { useForm } from 'vee-validate';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Textarea } from '../ui/textarea';
import type { CreateWish } from '@/utils/types';

const props = defineProps<{ open: boolean; onClose: () => void, add: (data: CreateWish) => void }>()


const formSchema = toTypedSchema(z.object({
    url: z.union([z.undefined(), z.string().trim().url({ message: "URL incorrecte" })]),
    name: z.string({ message: "Veuillez saisir un nom" }).min(2, { message: "Nom trop court" }).max(140, { message: "Nom trop long" }),
    price: z.number({ message: "Veuillez saisir un prix" }).min(0).max(99999),
    comment: z.optional(z.string())
}))

const { handleSubmit } = useForm({
    validationSchema: formSchema,
})

const onSubmit = handleSubmit((values) => {
    props.add(values)
    props.onClose()
})
</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Nouveau wish</DialogTitle>
            </DialogHeader>
            <form @submit="onSubmit" class="space-y-6">
                <FormField v-slot="{ field }" name="url">
                    <FormItem>
                        <FormLabel>Url (facultatif)</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="http://..." v-bind="field" />
                        </FormControl>
                        <FormDescription>
                            L'adresse internet du produit
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                </FormField>
                <FormField v-slot="{ field }" name="name">
                    <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="Nom du produit" v-bind="field" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
                <FormField v-slot="{ field }" name="price">
                    <FormItem>
                        <FormLabel>Prix</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="20€" v-bind="field" />
                        </FormControl>
                    </FormItem>
                </FormField>
                <FormField v-slot="{ field }" name="comment">
                    <FormItem>
                        <FormLabel>Description (facultatif)</FormLabel>
                        <FormControl>
                            <Textarea v-bind="field" placeholder="Une description pour mon potentiel acheteur" />
                        </FormControl>
                    </FormItem>
                </FormField>
            </form>
            <DialogFooter>
                <Button @click="onSubmit">
                    Valider
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>