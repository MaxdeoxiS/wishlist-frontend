<script setup lang="ts">
import TableCell from '@/components/ui/table/TableCell.vue';
import TableRow from '@/components/ui/table/TableRow.vue';
import { createlist, getGroup } from '@/utils/api';
import type { CreateList } from '@/utils/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
} from '@/components/ui/table'
import ListHeader from "@/components/ListHeader.vue";
import { ref } from 'vue';
import CardFooter from '@/components/ui/card/CardFooter.vue';
import Button from '@/components/ui/button/Button.vue';
import { Plus, Share } from 'lucide-vue-next';
import { useUserStore } from '@/utils/store';
import router from '@/router';
import CreateListModal from '@/components/modals/CreateListModal.vue';

const route = useRoute()
const { id } = route.params
const queryClient = useQueryClient()

const { data } = useQuery({
  queryKey: ['group'],
  queryFn: () => getGroup(id as string)
})

const store = useUserStore()

const createListModalOpen = ref(false)
const loading = ref(false)

const addMutation = useMutation({
  mutationFn: (data: CreateList) => createlist(data, id as string),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['group'] })
  },
})

function onAddList(data: CreateList) {
  loading.value = true;
  addMutation.mutate(data)
  createListModalOpen.value = false;
  loading.value = false;
}

function goToList(id: string) {
  router.push(`/list/${id}`)
}

function share() {
  navigator.share({
    title: 'Check ma liste!',
    text: data.value?.title,
    url: `${window.location.origin}${route.fullPath}`
  })
}

</script>

<template>
  <div class="flex min-h-screen w-full flex-col bg-muted">
    <ListHeader />
    <div class="flex flex-col sm:gap-4 sm:py-4 sm:p-14 md:max-w-[1080px] md:mx-auto">
      <main class="grid flex-1 items-start gap-4 p-0 sm:px-6 sm:py-0 md:gap-8">
        <Card v-if="data" class="rounded-none sm:rounded-md">
          <div class="flex justify-between">
            <CardHeader class="p-4 flex flex-col">
              <CardTitle>
                {{ data.title }}
              </CardTitle>
            </CardHeader>
          </div>
          <CardContent class="p-2 pt-0">
            <Table class="table-fixed w-full">
              <TableBody>
                <TableRow v-for="list of data.list" class="cursor-pointer" @click="goToList(list.id)">
                  <TableCell>
                    <div class="flex text-base font-medium justify-between items-center rounded">
                      <p>{{ list.title }} {{ list.title.includes(list.user) ? "" : `(${list.user})` }}</p>
                      <Button @click="goToList(list.id)">
                        Voir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter class="flex flex-col gap-2 p-2 px-4 mb-2">
            <Button class="w-full" @click="createListModalOpen = !createListModalOpen">
              <Plus class="mr-1.5" /> Ajouter une liste
            </Button>
            <Button @click="share" class="w-full" variant="outline">
              <Share class="mr-1.5" /> Partager
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  </div>
  <CreateListModal v-if="createListModalOpen" :open="createListModalOpen" @close="createListModalOpen = false"
    :create="onAddList" />
</template>