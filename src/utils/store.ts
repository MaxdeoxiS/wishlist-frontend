import { defineStore } from "pinia"
import { ref } from "vue"
import { getUser, setUser } from "./storage"

export const useUserStore = defineStore('userStore', () => {
    const localUsername = getUser()
    const username = ref(localUsername ?? "")

    function setUsername(newUsername: string) {
      username.value = newUsername;
      setUser(newUsername);
    }

    return { username, setUsername }
  })