<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
} from '@/components/ui/table'
import type { CreateWish, Wishlist, WishlistGroup } from '@/utils/types'
import Wish from "@/components/Wish.vue"
import ListHeader from './ListHeader.vue';
import { computed, ref } from 'vue';
import CardFooter from './ui/card/CardFooter.vue';
import Button from './ui/button/Button.vue';
import { ChevronDown, Edit, Frown, Plus, Share } from 'lucide-vue-next';
import CreateWishModal from './modals/CreateWishModal.vue';
import { useUserStore } from '@/utils/store';
import TakeListOwnership from './modals/TakeListOwnership.vue';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from './ui/breadcrumb';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const store = useUserStore()

const props = defineProps<Omit<Wishlist, "id"> & { onBuy: (wishId: number, cancel: boolean) => void, onCreate: (wish: CreateWish) => void, share: () => void, onDelete: (wishId: number) => void, group?: WishlistGroup | null }>()

const filter = ref("")
const filteredWishes = computed(() => props.wishes.filter(w => w.name.toLowerCase().includes(filter.value.toLowerCase())))

const addModalOpen = ref(false)
const ownershipModalOpen = ref(false)

const isAuthor = computed(() => store.username === props.user)

</script>

<template>
    <div class="flex min-h-screen w-full flex-col bg-muted">
        <ListHeader v-model:filter="filter" withList />
        <div class="flex flex-col sm:gap-4 sm:py-4 sm:p-14 md:max-w-[1080px] md:mx-auto">
            <Breadcrumb v-if="group" class="ml-2 p-1">
                <BreadcrumbList>
                    <BreadcrumbItem v-if="group">
                        <BreadcrumbLink :href="`/group/${group.id}`">
                            {{ group?.title }}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    /
                    <BreadcrumbItem>
                        <DropdownMenu v-if="group.list.length > 1">
                            <DropdownMenuTrigger class="flex items-center gap-1 font-medium">
                                {{ props.title }}
                                <ChevronDown class="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" class="gap-y-8">
                                <DropdownMenuItem v-for="list of group?.list" class="p-3">
                                    <a :href="`/list/${list.id}`">
                                        {{ list.title }} {{ list.title.includes(list.user) ? "" : `(${list.user})` }}
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <main class="grid flex-1 items-start gap-4 p-0 sm:px-6 sm:py-0 md:gap-8">
                <Card class="rounded-none sm:rounded-md">
                    <div class="flex justify-between">
                        <CardHeader class="p-4 flex flex-col">
                            <CardTitle>
                                {{ props.title }}
                            </CardTitle>
                            <CardDescription>
                                Créé par
                                <span class="font-medium">{{ props.user }}</span> le {{ (new
                                    Date(props.created_at)).toLocaleDateString() }}
                            </CardDescription>
                        </CardHeader>
                        <Button v-if="store.username.length === 0" variant="ghost" class="m-2"
                            @click="ownershipModalOpen = true">
                            <Edit />
                        </Button>
                    </div>
                    <CardContent class="p-2 pt-0">
                        <Table class="table-fixed w-full">
                            <TableBody v-if="filteredWishes.length > 0">
                                <Wish :class="{ 'border-none': i === filteredWishes.length - 1 }" @buy="props.onBuy"
                                    @delete="props.onDelete" v-for="(w, i) in filteredWishes" v-bind="w" :key="w.id"
                                    :isAuthor="isAuthor" />
                            </TableBody>
                            <div v-else class="p-4 flex flex-col items-center justify-center">
                                <Frown class="w-16 h-16" />
                                <p class="text-base font-medium mt-2">{{ props.user }} n'a pas encore rempli sa liste !
                                </p>
                            </div>
                        </Table>
                    </CardContent>
                    <CardFooter class="flex flex-col gap-2 p-2 px-4 mb-2">
                        <Button v-if="isAuthor" class="w-full" @click="addModalOpen = !addModalOpen">
                            <Plus class="mr-1.5" /> Ajouter un wish
                        </Button>
                        <Button @click="props.share" class="w-full" variant="outline">
                            <Share class="mr-1.5" /> Partager
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    </div>
    <CreateWishModal :open="addModalOpen" @close="addModalOpen = false" :add="props.onCreate" />
    <TakeListOwnership :open="ownershipModalOpen" @close="ownershipModalOpen = false" :list-owner="props.user" />
</template>