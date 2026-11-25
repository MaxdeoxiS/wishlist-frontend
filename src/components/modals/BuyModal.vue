<script setup lang="ts">
import { computed } from 'vue';
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
import { Gift, HeartHandshake, UserCheck, X } from 'lucide-vue-next';

const props = defineProps<{
    open: boolean;
    onClose: () => void;
    onValidate: () => void;
    wishName: string;
    isReserved?: boolean;
    boughtBy?: string;
}>()

const formSchema = toTypedSchema(z.object({
    name: z.string({ message: "Veuillez saisir votre nom" }).min(2, { message: "Nom trop court" }).max(16, { message: "16 caractères maximum" }),
}))

const store = useUserStore()

const isOtherBuyer = computed(() =>
    !!props.boughtBy && props.boughtBy !== store.username
)

const isCancelMode = computed(() =>
    !!props.isReserved || isOtherBuyer.value
)

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

const onFormSubmit = handleSubmit((values) => {
    if (!store.username && values.name) {
        store.setUsername(values.name.trim())
    }
    fireConfetti()
    props.onValidate()
    props.onClose()
})

function handleConfirm() {
    if (isOtherBuyer.value && props.boughtBy) {
        store.setUsername(props.boughtBy)
        props.onValidate()
        props.onClose()
        return
    }
    if (props.isReserved) {
        props.onValidate()
        props.onClose()
        return
    }
    if (store.username) {
        fireConfetti()
        props.onValidate()
        props.onClose()
        return
    }
    onFormSubmit()
}

</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent class="sm:max-w-[425px] rounded-2xl p-6">
            <DialogHeader class="text-left space-y-2">
                <div
                    :class="[
                        'w-12 h-12 rounded-2xl flex items-center justify-center mb-1',
                        isCancelMode ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                    ]"
                >
                    <UserCheck v-if="isOtherBuyer" class="w-6 h-6" aria-hidden="true" />
                    <X v-else-if="props.isReserved" class="w-6 h-6" aria-hidden="true" />
                    <HeartHandshake v-else class="w-6 h-6" aria-hidden="true" />
                </div>
                <DialogTitle class="text-xl font-bold">
                    <template v-if="isOtherBuyer">
                        Annuler la réservation de {{ props.boughtBy }} ?
                    </template>
                    <template v-else-if="props.isReserved">
                        Annuler la réservation ?
                    </template>
                    <template v-else>
                        Réserver ce cadeau
                    </template>
                </DialogTitle>
                <DialogDescription class="text-sm text-muted-foreground leading-relaxed">
                    <template v-if="isOtherBuyer && store.username">
                        Confirmez-vous que vous êtes <strong>{{ props.boughtBy }}</strong> ? En validant, la réservation de <strong>« {{ props.wishName }} »</strong> sera annulée. Vous serez déconnecté de <strong>{{ store.username }}</strong> et connecté en tant que <strong>{{ props.boughtBy }}</strong>.
                    </template>
                    <template v-else-if="isOtherBuyer">
                        Confirmez-vous que vous êtes <strong>{{ props.boughtBy }}</strong> ? En validant, la réservation de <strong>« {{ props.wishName }} »</strong> sera annulée et vous serez connecté en tant que <strong>{{ props.boughtBy }}</strong>.
                    </template>
                    <template v-else-if="props.isReserved">
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

            <form v-if="!isCancelMode && !store.username" @submit="onFormSubmit" class="space-y-4 my-2">
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
                <Button
                    type="button"
                    variant="outline"
                    class="rounded-xl h-11"
                    :autofocus="isCancelMode"
                    @click="onClose"
                >
                    {{ isCancelMode ? "Retour" : "Annuler" }}
                </Button>
                <Button
                    type="button"
                    :variant="isCancelMode ? 'destructive' : 'default'"
                    class="rounded-xl h-11 font-semibold shadow-sm"
                    @click="handleConfirm"
                >
                    <Gift v-if="!isCancelMode" class="w-4 h-4 mr-1.5" aria-hidden="true" />
                    <template v-if="isOtherBuyer">
                        Oui, je suis {{ props.boughtBy }}
                    </template>
                    <template v-else-if="props.isReserved">
                        Confirmer l'annulation
                    </template>
                    <template v-else>
                        C'est moi qui l'offre !
                    </template>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>