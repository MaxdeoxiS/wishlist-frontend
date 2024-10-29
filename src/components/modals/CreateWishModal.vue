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
import { ref } from 'vue';

const props = defineProps<{ open: boolean; onClose: () => void, add: (data: CreateWish) => void }>()

const picture = ref()
const fileUrl = ref<string>("")

const formSchema = toTypedSchema(z.object({
    url: z.union([z.undefined(), z.string().trim().url({ message: "URL incorrecte" })]),
    name: z.string({ message: "Veuillez saisir un nom" }).min(2, { message: "Nom trop court" }).max(140, { message: "Nom trop long" }),
    price: z.number({ message: "Veuillez saisir un prix" }).min(0).max(99999),
    comment: z.optional(z.string()),
}))

const { handleSubmit } = useForm({
    validationSchema: formSchema,
})

const onUploadPicture = async () => {
    if (!picture.value) {
        return
    }

    const formData = new FormData()
    formData.append("file", picture.value)

    try {
        // Use fetch to send the file to the backend
        const response = await fetch("http://localhost:8080/list/file", {
            method: "POST",
            body: formData,
        })

        // Check if the response was successful
        if (!response.ok) {
            throw new Error(`Error uploading file: ${response.statusText}`)
        }

        const data = await response.json()
        fileUrl.value = data.fileUrl // Store the URL of the uploaded file

        console.log("File uploaded successfully:", data)
    } catch (error) {
        console.error("Error uploading file:", error)
        alert("File upload failed.")
    }

}

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    picture.value = target.files ? target.files[0] : null
}

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
                <Input type="file" @change="handleFileChange" />
                <Button @click="onUploadPicture">
                    Uploader
                </Button>
                <div v-if="fileUrl">
                    <p>File uploaded successfully! <a :href="fileUrl" target="_blank">View File</a></p>
                </div>
            </form>
            <DialogFooter>
                <Button @click="onSubmit">
                    Valider
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>