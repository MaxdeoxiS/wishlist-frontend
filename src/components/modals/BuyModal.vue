<script setup lang="ts">
import { useForm } from 'vee-validate';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogDescription } from '../ui/dialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useUserStore } from '@/utils/store';
import FormDescription from '../ui/form/FormDescription.vue';
import { setUser } from '@/utils/storage';

const props = defineProps<{ open: boolean; onClose: () => void, onValidate: () => void; wishName: string }>()

const formSchema = toTypedSchema(z.object({
    name: z.string({ message: "Veuillez saisir votre nom" }).min(2, { message: "Nom trop court" }).max(20, { message: "Nom trop long" }),
}))

const store = useUserStore()

const { handleSubmit } = useForm({
    validationSchema: formSchema,
    initialValues: {
        name: store.username ?? ""
    },
})

const onSubmit = handleSubmit((values) => {
    if (!store.username) {
        setUser(values.name)
        store.setUsername(values.name)
    }
    props.onValidate()
    props.onClose()
})

</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent hide-close>
            <DialogHeader />
            <form @submit="onSubmit" class="space-y-6">
                <div v-if="store.username">
                    <DialogDescription>Voulez-vous prendre <b>{{ props.wishName }}</b> au nom de <b>{{ store.username }}</b> ?</DialogDescription>
                </div>
                <FormField v-else v-slot="{ field }" name="name">
                    <FormItem>
                        <FormLabel>Votre nom</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="Jean" v-bind="field" />
                        </FormControl>
                        <FormDescription>Saisissez votre nom pour valider</FormDescription>
                        <FormMessage />
                    </FormItem>
                </FormField>
            </form>
            <DialogFooter class="gap-2">
                <Button variant="secondary" @click="onClose">
                    Annuler
                </Button>
                <Button @click="onSubmit">
                    Valider
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>