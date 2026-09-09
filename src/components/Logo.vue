<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()

function goHome() {
    router.push("/")
}
</script>

<template>
    <div class="flex gap-2 items-center cursor-pointer select-none active:scale-95 transition-transform" @click="goHome">
        <img src="/logo.png" width="32px" height="32px" alt="Logo" class="rounded-lg shadow-sm" />
        <span class="font-bold text-base sm:text-lg tracking-tight text-foreground">CheckMaListe</span>
    </div>
</template>