<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
} from '@/components/ui/table'
import {
    CircleUser,
    Search,
} from 'lucide-vue-next'
import type { Wishlist } from '@/utils/types'
import Wish from "@/components/Wish.vue"
import { useUserStore } from '@/utils/store'

const props = defineProps<Omit<Wishlist, "hash"> & { onClick: (wishId: number) => void }>()
const store = useUserStore()

</script>

<template>
    <div class="flex min-h-screen w-full flex-col bg-muted">
        <div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <header
                class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <div class="relative ml-auto flex-1 md:grow-0">
                    <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Rechercher dans la liste..."
                        class="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]" />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <Button variant="secondary" size="icon" class="rounded-full">
                            <CircleUser class="h-5 w-5" />
                            <span class="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{{ store.username }}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Déconnexion</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <!-- <div class="flex items-center">
          <div class="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" class="h-7 gap-1">
              <File class="h-3.5 w-3.5" />
              <span class="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button size="sm" class="h-7 gap-1">
              <PlusCircle class="h-3.5 w-3.5" />
              <span class="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Product
              </span>
            </Button>
          </div>
        </div> -->
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {{ props.title }}</CardTitle>
                        <CardDescription>
                            Créé par
                            {{ props.user }} le {{ (new Date(props.created_at)).toLocaleDateString() }}
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="p-4 pt-0">
                        <Table class="table-fixed w-full">
                            <TableBody>
                                <Wish :onClick="props.onClick" v-for="w in props.wish" v-bind="w" :key="w.id" />
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                    </CardFooter>
                </Card>
            </main>
        </div>
    </div>
</template>