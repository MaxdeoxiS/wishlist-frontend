<script setup>
import { getLists } from '@/utils/api';
import { useQueryClient, useQuery, useMutation } from '@tanstack/vue-query'
import { Button } from "@/components/ui/button"

// Access QueryClient instance
const queryClient = useQueryClient()

// Query
const { isPending, isError, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: getLists
})

// Mutation
const mutation = useMutation({
    mutationFn: () => { },
    onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
})

function onButtonClick() {
    mutation.mutate({
        id: Date.now(),
        title: 'Do Laundry',
    })
}
</script>

<template>

    <Button>Coucou</Button>
    <span v-if="isPending">Loading...</span>
    <span v-else-if="isError">Error: {{ error.message }}</span>
    <!-- We can assume by this point that `isSuccess === true` -->
    <ul v-else>
        <li v-for="todo in data" :key="todo.id">{{ todo.user }}</li>
    </ul>
    <button @click="onButtonClick">Add Todo</button>
</template>