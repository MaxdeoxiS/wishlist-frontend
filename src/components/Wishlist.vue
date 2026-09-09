<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { CreateWish, Wishlist, WishlistGroup } from '@/utils/types'
import Wish from "@/components/Wish.vue"
import ListHeader from './ListHeader.vue';
import { computed, ref } from 'vue';
import Button from './ui/button/Button.vue';
import { ChevronDown, Edit, Gift, Plus, Search, Share2, Sparkles, UserCheck } from 'lucide-vue-next';
import CreateWishModal from './modals/CreateWishModal.vue';
import { useUserStore } from '@/utils/store';
import TakeListOwnership from './modals/TakeListOwnership.vue';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from './ui/breadcrumb';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const store = useUserStore()

const props = defineProps<Omit<Wishlist, "id"> & { onBuy: (wishId: number, cancel: boolean) => void, onCreate: (wish: CreateWish) => void, share: () => void, onDelete: (wishId: number) => void, group?: WishlistGroup | null }>()

const filter = ref("")
const filteredWishes = computed(() => props.wishes.filter(w => w.name.toLowerCase().includes(filter.value.toLowerCase())))

const totalCount = computed(() => props.wishes.length)
const boughtCount = computed(() => props.wishes.filter(w => !!w.bought_by).length)
const progressPercent = computed(() => totalCount.value > 0 ? Math.round((boughtCount.value / totalCount.value) * 100) : 0)

const addModalOpen = ref(false)
const ownershipModalOpen = ref(false)

const isAuthor = computed(() => store.username === props.user)

</script>

<template>
    <div class="flex min-h-screen w-full flex-col bg-muted/40 pb-24 sm:pb-12">
        <ListHeader v-model:filter="filter" withList />

        <div class="flex flex-col sm:gap-4 sm:py-6 px-3 sm:px-6 md:max-w-[960px] md:mx-auto w-full">
            <!-- Breadcrumbs if group -->
            <Breadcrumb v-if="group" class="mb-3 px-1">
                <BreadcrumbList class="text-xs sm:text-sm">
                    <BreadcrumbItem>
                        <BreadcrumbLink :href="`/group/${group.id}`" class="hover:text-primary transition-colors font-medium">
                            {{ group?.title }}
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <span class="text-muted-foreground/50">/</span>
                    <BreadcrumbItem>
                        <DropdownMenu v-if="group.list.length > 1">
                            <DropdownMenuTrigger class="flex items-center gap-1 font-semibold text-foreground">
                                {{ props.title }}
                                <ChevronDown class="w-3.5 h-3.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" class="min-w-[180px]">
                                <DropdownMenuItem v-for="list of group?.list" :key="list.id" class="p-2.5 text-sm cursor-pointer">
                                    <a :href="`/list/${list.id}`" class="w-full">
                                        {{ list.title }} {{ list.title.includes(list.user) ? "" : `(${list.user})` }}
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <span v-else class="font-semibold text-foreground">{{ props.title }}</span>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <!-- Main Card Container -->
            <main class="grid flex-1 items-start gap-4">
                <Card class="border shadow-sm rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm">
                    <!-- Header with Title & Stats -->
                    <CardHeader class="p-4 sm:p-6 pb-3 border-b border-border/40">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <div class="flex items-center gap-2 mb-1">
                                    <CardTitle class="text-xl sm:text-2xl font-extrabold tracking-tight">
                                        {{ props.title }}
                                    </CardTitle>
                                    <span v-if="isAuthor" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                        <Sparkles class="w-3 h-3" /> Ma liste
                                    </span>
                                </div>
                                <CardDescription class="text-xs sm:text-sm text-muted-foreground">
                                    Créé par
                                    <span class="font-semibold text-foreground">{{ props.user }}</span> le
                                    {{ new Date(props.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) }}
                                </CardDescription>
                            </div>

                            <!-- Ownership claim button if guest -->
                            <Button
                                v-if="store.username.length === 0"
                                variant="outline"
                                size="sm"
                                class="rounded-full text-xs gap-1.5 h-8 px-3 shrink-0"
                                @click="ownershipModalOpen = true"
                            >
                                <UserCheck class="w-3.5 h-3.5" />
                                <span class="hidden sm:inline">C'est ma liste ?</span>
                            </Button>
                        </div>

                        <!-- Progress / Stats summary if list has items -->
                        <div v-if="totalCount > 0" class="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                            <span>
                                <strong>{{ totalCount }}</strong> {{ totalCount > 1 ? 'idées' : 'idée' }} au total
                            </span>
                            <span v-if="!isAuthor" class="inline-flex items-center gap-1.5 font-medium text-foreground">
                                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                {{ boughtCount }} / {{ totalCount }} déjà {{ boughtCount > 1 ? 'offerts' : 'offert' }}
                            </span>
                        </div>
                    </CardHeader>

                    <!-- Wishes Content -->
                    <CardContent class="p-2.5 sm:p-5">
                        <!-- Wishes list with transition -->
                        <div v-if="filteredWishes.length > 0" class="relative">
                            <TransitionGroup name="wish-list" tag="div" class="space-y-2">
                                <Wish
                                    v-for="w in filteredWishes"
                                    :key="w.id"
                                    v-bind="w"
                                    :isAuthor="isAuthor"
                                    @buy="props.onBuy"
                                    @delete="props.onDelete"
                                />
                            </TransitionGroup>
                        </div>

                        <!-- Filter empty state -->
                        <div v-else-if="filter.length > 0" class="py-12 px-4 flex flex-col items-center justify-center text-center">
                            <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Search class="w-6 h-6 text-muted-foreground" />
                            </div>
                            <h4 class="font-semibold text-base mb-1">Aucun résultat trouvé</h4>
                            <p class="text-sm text-muted-foreground max-w-xs mb-4">
                                Aucun cadeau ne correspond à « {{ filter }} ».
                            </p>
                            <Button variant="outline" size="sm" class="rounded-full" @click="filter = ''">
                                Réinitialiser la recherche
                            </Button>
                        </div>

                        <!-- Empty list state -->
                        <div v-else class="py-14 px-4 flex flex-col items-center justify-center text-center">
                            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/10 to-primary/5 flex items-center justify-center mb-4 text-primary shadow-inner">
                                <Gift class="w-8 h-8" />
                            </div>
                            <h4 class="font-bold text-lg mb-1.5">
                                {{ isAuthor ? "Votre liste est encore vide !" : `${props.user} n'a pas encore ajouté de souhait !` }}
                            </h4>
                            <p class="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                                {{ isAuthor
                                    ? "Ajoutez des idées cadeaux avec des liens, prix et photos pour que vos proches puissent choisir facilement."
                                    : "Revenez bientôt ou partagez-lui ce lien pour qu'il la remplisse !"
                                }}
                            </p>
                            <Button v-if="isAuthor" class="rounded-full shadow-md font-semibold px-6" @click="addModalOpen = true">
                                <Plus class="w-4 h-4 mr-1.5" /> Ajouter mon premier souhait
                            </Button>
                        </div>
                    </CardContent>

                    <!-- Desktop Actions Footer -->
                    <div class="hidden sm:flex items-center justify-end gap-3 p-4 sm:p-6 pt-0 border-t border-border/40">
                        <Button variant="outline" class="rounded-full px-5 gap-2" @click="props.share">
                            <Share2 class="w-4 h-4" /> Partager la liste
                        </Button>
                        <Button v-if="isAuthor" class="rounded-full px-5 shadow-sm gap-2" @click="addModalOpen = true">
                            <Plus class="w-4 h-4" /> Ajouter une idée
                        </Button>
                    </div>
                </Card>
            </main>
        </div>

        <!-- Mobile Floating Bottom Action Bar -->
        <div class="sm:hidden fixed bottom-0 left-0 right-0 z-20 p-3 pb-safe bg-background/90 backdrop-blur-lg border-t border-border/60 shadow-lg">
            <div class="flex items-center gap-2 max-w-md mx-auto">
                <Button
                    variant="outline"
                    class="rounded-full h-11 px-4 gap-1.5 shrink-0 border-border/80"
                    @click="props.share"
                >
                    <Share2 class="w-4 h-4" />
                    <span class="text-xs font-semibold">Partager</span>
                </Button>

                <Button
                    v-if="isAuthor"
                    class="flex-1 rounded-full h-11 font-bold shadow-md gap-2"
                    @click="addModalOpen = true"
                >
                    <Plus class="w-5 h-5" />
                    <span>Ajouter une idée</span>
                </Button>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <CreateWishModal :open="addModalOpen" @close="addModalOpen = false" :add="props.onCreate" />
    <TakeListOwnership :open="ownershipModalOpen" @close="ownershipModalOpen = false" :list-owner="props.user" />
</template>