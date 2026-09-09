<script setup lang="ts">
import { useForm } from 'vee-validate';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/dialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useUserStore } from '@/utils/store';
import FormDescription from '../ui/form/FormDescription.vue';
import confetti from 'canvas-confetti';
import { Gift, HeartHandshake, X } from 'lucide-vue-next';

const props = defineProps<{
    open: boolean;
    onClose: () => void;
    onValidate: () => void;
    wishName: string;
    isReserved?: boolean;
}>()

const formSchema = toTypedSchema(z.object({
    name: z.string({ message: "Veuillez saisir votre nom" }).min(2, { message: "Nom trop court" }).max(16, { message: "16 caractères maximum" }),
}))

const store = useUserStore()

const { handleSubmit } = useForm({
    validationSchema: formSchema,
    initialValues: {
        name: store.username ?? ""
    },
})

function fireConfetti() {
    try {
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
        })
    } catch {
        // Safe fallback if canvas is not supported
    }
}

const onSubmit = handleSubmit((values) => {
    if (!store.username && values.name) {
        store.setUsername(values.name)
    }
    if (!props.isReserved) {
        fireConfetti()
    }
    props.onValidate()
    props.onClose()
})

</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent class="sm:max-w-[425px] rounded-2xl p-6">
            <DialogHeader class="text-left space-y-2">
                <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                    <component :is="props.isReserved ? X : HeartHandshake" class="w-6 h-6" />
                </div>
                <DialogTitle class="text-xl font-bold">
                    {{ props.isReserved ? "Annuler la réservation ?" : "Réserver ce cadeau" }}
                </DialogTitle>
                <DialogDescription class="text-sm text-muted-foreground">
                    <template v-if="props.isReserved">
                        Souhaitez-vous libérer <strong>« {{ props.wishName }} »</strong> afin que quelqu'un d'autre puisse l'offrir ?
                    </template>
                    <template v-else-if="store.username">
                        Voulez-vous réserver <strong>« {{ props.wishName }} »</strong> au nom de <strong>{{ store.username }}</strong> ?
                    </template>
                    <template v-else>
                        Entrez votre nom pour que les autres personnes sachent que ce cadeau est déjà pris.
                    </template>
                </DialogDescription>
            </DialogHeader>

            <form v-if="!props.isReserved && !store.username" @submit="onSubmit" class="space-y-4 my-2">
                <FormField v-slot="{ field }" name="name">
                    <FormItem>
                        <FormLabel class="text-xs font-semibold">Votre prénom ou nom</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                placeholder="ex: Sophie, Thomas..."
                                class="h-11 rounded-xl"
                                maxlength="16"
                                autofocus
                                v-bind="field"
                            />
                        </FormControl>
                        <FormDescription class="text-xs">Ce nom sera mémorisé pour vos prochaines visites.</FormDescription>
                        <FormMessage />
                    </FormItem>
                </FormField>
            </form>

            <DialogFooter class="flex-col-reverse sm:flex-row gap-2 mt-4">
                <Button variant="outline" class="rounded-xl h-11" @click="onClose">
                    Annuler
                </Button>
                <Button
                    :variant="props.isReserved ? 'destructive' : 'default'"
                    class="rounded-xl h-11 font-semibold shadow-sm"
                    @click="onSubmit"
                >
                    <Gift v-if="!props.isReserved" class="w-4 h-4 mr-1.5" />
                    {{ props.isReserved ? "Confirmer l'annulation" : "C'est moi qui l'offre !" }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>