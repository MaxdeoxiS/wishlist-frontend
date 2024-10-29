<script setup lang="ts">
import { useForm } from 'vee-validate';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Textarea } from '../ui/textarea';
import type { CreateWish } from '@/utils/types';
import { ref } from 'vue';
import { uploadPicture } from '@/utils/api';
import { Loader2 } from 'lucide-vue-next'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"]

const props = defineProps<{ open: boolean; onClose: () => void, add: (data: CreateWish) => void }>()

const picture = ref()
const pictureError = ref<string | null>(null)
const loading = ref(false)

const formSchema = toTypedSchema(z.object({
    url: z.union([z.undefined(), z.string().trim().url({ message: "URL incorrecte" })]),
    name: z.string({ message: "Veuillez saisir un nom" }).min(2, { message: "Nom trop court" }).max(140, { message: "Nom trop long" }),
    price: z.optional(z.number().min(0).max(99999)),
    comment: z.optional(z.string()),
}))

const { handleSubmit } = useForm({
    validationSchema: formSchema,
})

const onUploadPicture = async () => {
    if (!picture.value) {
        return
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
        pictureError.value = "Formats acceptés: .jpeg, .jpg, .png"
        picture.value = null
        return
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
        pictureError.value = `Le fichier doit faire moins de ${MAX_FILE_SIZE / (1024 * 1024)} MB.`
        picture.value = null
        return
    }

    pictureError.value = null

    picture.value = selectedFile
}

const onSubmit = handleSubmit(async (values) => {
    if (pictureError.value) {
        return
    }
    loading.value = true
    const fileUrl = await onUploadPicture()
    const data = { ...values, picture: fileUrl ?? undefined }
    props.add(data)
    props.onClose()
    loading.value = false
})
</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Nouveau wish</DialogTitle>
            </DialogHeader>
            <form @submit="onSubmit" class="space-y-6">
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
                <FormField v-slot="{ field }" name="url">
                    <FormItem>
                        <FormLabel>Url (facultatif)</FormLabel>
                        <FormControl>
                            <Input type="text" placeholder="https://..." v-bind="field" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </FormField>
                <FormField v-slot="{ field }" name="comment">
                    <FormItem>
                        <FormLabel>Description (facultatif)</FormLabel>
                        <FormControl>
                            <Textarea rows="1" v-bind="field"
                                placeholder="Une description pour mon potentiel acheteur" />
                        </FormControl>
                    </FormItem>
                </FormField>
                <FormField name="picture">
                    <FormItem>
                        <FormLabel>Image (facultatif)</FormLabel>
                        <FormControl>
                            <Input type="file" @change="handleFileChange" />
                        </FormControl>
                        <span class="text-sm text-red-500 font-medium">
                            {{ pictureError }}
                        </span>
                    </FormItem>
                </FormField>
            </form>
            <DialogFooter>
                <Button @click="onSubmit" :disabled="loading">
                    <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
                    Valider
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>