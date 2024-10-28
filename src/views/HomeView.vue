<script setup lang="ts">
import ListHeader from '@/components/ListHeader.vue';
import CreateListModal from '@/components/modals/CreateListModal.vue';
import { Button } from '@/components/ui/button';
import { createlist } from '@/utils/api';
import { setList, setUser } from '@/utils/storage';
import { useUserStore } from '@/utils/store';
import type { CreateList } from '@/utils/types';
import { useMutation } from '@tanstack/vue-query';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const createListModalOpen = ref(false)

const router = useRouter()

const store = useUserStore()

const createListeMutation = useMutation({
  mutationFn: (data: CreateList) => createlist(data),
  onSuccess: (data) => {
    if (data) {
      setList(data.id);
      setUser(data.user);
      store.setUsername(data.user)
      router.push(`/list/${data.id}`)
    }
  },
})

function onCreateList(data: CreateList) {
  createListeMutation.mutate(data)
}
</script>

<template>
  <ListHeader />
  <section class="bg-muted -mt-20">
    <div class="mx-auto max-w-screen-xl px-4 py-32 lg:flex lg:h-screen lg:items-center">
      <div class="mx-auto max-w-xl text-center">
        <h1 class="text-3xl font-extrabold sm:text-5xl">
          Understand User Flow.
          <strong class="font-extrabold text-red-700 sm:block"> Increase Conversion. </strong>
        </h1>

        <p class="mt-4 sm:text-xl/relaxed">
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nesciunt illo tenetur fuga ducimus
          numquam ea!
        </p>

        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <Button @click="createListModalOpen = true" size="lg">Créer une liste</Button>
        </div>
      </div>
    </div>
  </section>
  <CreateListModal :open="createListModalOpen" @close="createListModalOpen = false" :create="onCreateList" />
</template>
