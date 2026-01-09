import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '../types'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const loading = ref(false)

  const addUser = (user: User) => {
    users.value.push(user)
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    const user = users.value.find((u) => u.id === id)
    if (user) {
      Object.assign(user, updates)
    }
  }

  const removeUser = (id: string) => {
    users.value = users.value.filter((u) => u.id !== id)
  }

  const fetchUsers = async () => {
    loading.value = true
    try {
      // TODO: Call API to fetch users
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    loading,
    addUser,
    updateUser,
    removeUser,
    fetchUsers,
  }
})
