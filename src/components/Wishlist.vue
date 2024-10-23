<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
} from '@/components/ui/table'
import type { Wishlist } from '@/utils/types'
import Wish from "@/components/Wish.vue"
import ListHeader from './ListHeader.vue';
import { computed, ref } from 'vue';
import CardFooter from './ui/card/CardFooter.vue';
import Button from './ui/button/Button.vue';
import { ImagePlus, Plus } from 'lucide-vue-next';
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';

const props = defineProps<Omit<Wishlist, "hash"> & { onClick: (wishId: number) => void }>()

const filter = ref("")
const filteredWishes = computed(() => props.wishes.filter(w => w.name.toLowerCase().includes(filter.value.toLowerCase())))

</script>

<template>
    <div class="flex min-h-screen w-full flex-col bg-muted">
        <div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <ListHeader v-model:filter="filter" />
            <main class="grid flex-1 items-start gap-4 p-2 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {{ props.title }}</CardTitle>
                        <CardDescription>
                            Créé par
                            <span class="font-medium">{{ props.user }}</span> le {{ (new
                                Date(props.created_at)).toLocaleDateString() }}
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="p-4 pt-0">
                        <Table class="table-fixed w-full">
                            <TableBody>
                                <Wish :class="{ 'border-none': i === filteredWishes.length - 1 }"
                                    :onClick="props.onClick" v-for="(w, i) in filteredWishes" v-bind="w" :key="w.id" />
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter class="flex gap-x-2">
                        <Dialog>
                            <DialogTrigger class="w-full">
                                <Button class="w-full">
                                    <Plus class="mr-1.5" /> Ajouter un wish
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Ajouter</DialogTitle>
                                </DialogHeader>
                                <form @submit="">
                                    <FormField v-slot="{ componentField }" name="username">
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="shadcn" v-bind="componentField" />
                                            </FormControl>
                                            <FormDescription>
                                                This is your public display name.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    </FormField>
                                </form>
                                <DialogFooter>
                                    <Button>
                                        Valider
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button class="">
                            <ImagePlus />
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    </div>
</template>