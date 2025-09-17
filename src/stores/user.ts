import {defineStore} from 'pinia'
import {ref} from 'vue'

export const useUserStore = defineStore('user', () => {
    const user = ref({
        name: "Sergey",
        surname: "Ivanov",
        age: 15,
    })

    const changeName = (newName) => {
        user.value.name = newName
    }

    return {user, changeName}
})