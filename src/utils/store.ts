import { defineStore } from "pinia"
import { ref } from "vue"
import { getUser } from "./storage"

export const useUserStore = defineStore('counter', () => {
    const localUsername = getUser() ?? "Jean eude"
    const username = ref(localUsername)

    return { username }
  })