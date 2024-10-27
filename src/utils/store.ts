import { defineStore } from "pinia"
import { ref } from "vue"
import { getUser } from "./storage"

export const useUserStore = defineStore('counter', () => {
    const localUsername = getUser()
    const username = ref(localUsername ?? "")

    function setUsername(newUsername: string) {
      username.value = newUsername
    }
    return { username, setUsername }
  })