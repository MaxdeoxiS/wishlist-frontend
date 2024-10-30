<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()

function goHome() {
    router.push("/")
}
</script>

<template>
    <div class="flex gap-x-2 ml-2 items-center cursor-pointer" @click="goHome">
        <img src="/logo.png" width="30px" height="30px" alt="Logo" />
        <span class="hidden lg:inline font-semibold">CheckMaListe</span>
    </div>
</template>