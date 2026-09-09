<script setup lang="ts">
import { useForm } from 'vee-validate';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Textarea } from '../ui/textarea';
import type { CreateWish } from '@/utils/types';
import { ref } from 'vue';
import { uploadPicture } from '@/utils/api';
import { Loader2, Plus, Sparkles, UploadCloud, X, ImageIcon, LinkIcon } from 'lucide-vue-next'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"]

const props = defineProps<{ open: boolean; onClose: () => void, add: (data: CreateWish) => void }>()

const picture = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const pictureError = ref<string | null>(null)
const loading = ref(false)

const formSchema = toTypedSchema(z.object({
    url: z.union([z.undefined(), z.string().trim().url({ message: "URL invalide (doit commencer par http:// ou https://)" })]),
    name: z.string({ message: "Veuillez saisir un nom" }).min(2, { message: "Nom trop court" }).max(140, { message: "Nom trop long" }),
    price: z.optional(z.number({ invalid_type_error: "Le prix doit être un nombre" }).min(0).max(99999)),
    comment: z.optional(z.string().max(500, { message: "Description trop longue" })),
}))

const { handleSubmit, resetForm } = useForm({
    validationSchema: formSchema,
})

const onUploadPicture = async () => {
    if (!picture.value) {
        return null
    }

    const res = await uploadPicture(picture.value)
    return res?.url
}

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    const selectedFile = target.files ? target.files[0] : null

    if (!selectedFile) {
        return
    }

    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
        pictureError.value = "Formats acceptés : .jpg, .png, .webp"
        picture.value = null
        previewUrl.value = null
        return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
        pictureError.value = `L'image doit faire moins de ${MAX_FILE_SIZE / (1024 * 1024)} Mo.`
        picture.value = null
        previewUrl.value = null
        return
    }

    pictureError.value = null
    picture.value = selectedFile
    previewUrl.value = URL.createObjectURL(selectedFile)
}

function removePicture() {
    picture.value = null
    previewUrl.value = null
    pictureError.value = null
}

const onSubmit = handleSubmit(async (values) => {
    if (pictureError.value) {
        return
    }
    loading.value = true
    try {
        const fileUrl = await onUploadPicture()
        const data = { ...values, picture: fileUrl ?? undefined }
        props.add(data)
        resetForm()
        removePicture()
        props.onClose()
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent class="sm:max-w-[480px] rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader class="text-left space-y-1">
                <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                    <Sparkles class="w-5 h-5" />
                </div>
                <DialogTitle class="text-xl font-bold">Nouvelle idée cadeau</DialogTitle>
                <DialogDescription class="text-xs sm:text-sm text-muted-foreground">
                    Ajoutez un article pour guider vos proches.
                </DialogDescription>
            </DialogHeader>

            <form @submit="onSubmit" class="space-y-4 my-2">
                <FormField v-slot="{ field }" name="name">
                    <FormItem>
                        <FormLabel class="text-xs font-semibold">Nom de l'article *</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                placeholder="ex: Casque audio Bluetooth, Livre..."
                                class="h-11 rounded-xl"
                                autofocus
                                v-bind="field"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField v-slot="{ field }" name="price">
                        <FormItem>
                            <FormLabel class="text-xs font-semibold">Prix indicatif (€)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="29.99"
                                    class="h-11 rounded-xl"
                                    v-bind="field"
                                />
                            </FormControl>
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ field }" name="url">
                        <FormItem>
                            <FormLabel class="text-xs font-semibold">Lien web (facultatif)</FormLabel>
                            <FormControl>
                                <Input
                                    type="url"
                                    placeholder="https://..."
                                    class="h-11 rounded-xl"
                                    v-bind="field"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>
                </div>

                <FormField v-slot="{ field }" name="comment">
                    <FormItem>
                        <FormLabel class="text-xs font-semibold">Commentaire / Précisions</FormLabel>
                        <FormControl>
                            <Textarea
                                rows="2"
                                placeholder="Taille, couleur, préférence d'achat..."
                                class="rounded-xl resize-none text-sm"
                                v-bind="field"
                            />
                        </FormControl>
                    </FormItem>
                </FormField>

                <!-- Image Upload with live preview -->
                <div class="space-y-1.5">
                    <label class="text-xs font-semibold text-foreground">Photo du produit (facultatif)</label>

                    <div v-if="previewUrl" class="relative w-full h-36 rounded-xl overflow-hidden border bg-muted/30 flex items-center justify-center group">
                        <img :src="previewUrl" alt="Aperçu" class="w-full h-full object-contain" />
                        <button
                            type="button"
                            @click="removePicture"
                            class="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-destructive hover:text-white backdrop-blur shadow transition-colors"
                        >
                            <X class="w-4 h-4" />
                        </button>
                    </div>

                    <label
                        v-else
                        class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all p-3 text-center"
                    >
                        <UploadCloud class="w-6 h-6 text-muted-foreground mb-1" />
                        <span class="text-xs font-medium text-foreground">Cliquez pour ajouter une photo</span>
                        <span class="text-[10px] text-muted-foreground mt-0.5">JPG, PNG ou WebP (max 5 Mo)</span>
                        <input type="file" accept="image/*" class="hidden" @change="handleFileChange" />
                    </label>

                    <p v-if="pictureError" class="text-xs text-destructive font-medium">
                        {{ pictureError }}
                    </p>
                </div>
            </form>

            <DialogFooter class="flex-col-reverse sm:flex-row gap-2 mt-4 pt-2 border-t">
                <Button variant="outline" class="rounded-xl h-11" @click="onClose" :disabled="loading">
                    Annuler
                </Button>
                <Button class="rounded-xl h-11 font-semibold shadow-sm gap-2" @click="onSubmit" :disabled="loading">
                    <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
                    <Plus v-else class="w-4 h-4" />
                    Ajouter à ma liste
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>