<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()

function goHome() {
    router.push("/")
}
</script>

<template>
    <div class="flex gap-x-2 ml-2 items-center" @click="goHome">
        <img src="../assets/images/logo3.png" width="30px" height="30px" alt="Logo" />
        <span class="hidden lg:inline">CheckMaListe</span>
    </div>
</template>