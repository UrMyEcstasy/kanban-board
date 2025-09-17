<template>
  <div class="modal" @click.self="emit('close')">
    <div class="modal__container">
      <button class="modal__close" @click="emit('close')">✖</button>

      <h2 class="modal__title">Share</h2>

      <input
          v-model="query"
          @input="search"
          type="text"
          class="modal__input"
          placeholder="email"
      />

      <ul v-if="suggestions.length" class="suggestions">
        <li
            v-for="user in suggestions"
            :key="user.id"
            @click="selectUser(user)"
        >
          {{ user.email }}
        </li>
      </ul>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="loading" class="loading">Search...</p>

      <transition name="fade">
        <div v-if="toast" class="toast">{{ toast }}</div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useAdminStore} from '@/stores/admins'

const props = defineProps({
  boardId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['close'])

const adminStore = useAdminStore()
const query = ref('')
const suggestions = ref([])
const errorMessage = ref('')
const loading = ref(false)
const toast = ref('')
let searchTimeout = null

const search = () => {
  clearTimeout(searchTimeout)
  if (!query.value.trim()) {
    suggestions.value = []
    return
  }

   // сделал тут небольшую задержку, чтобы сервер не спамить запросами, с заботой о серваках так сказать :)
  searchTimeout = setTimeout(async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      suggestions.value = await adminStore.searchUsers(query.value.trim())
    } catch (e) {
      errorMessage.value = 'Oops.. search error'
      suggestions.value = []
    } finally {
      loading.value = false
    }
  }, 400)
}

const selectUser = async (user) => {
  try {
    await adminStore.addUsersToBoard(props.boardId, [user.id])
    showToast('User added successfully')
    query.value = ''
    suggestions.value = []
  } catch (e) {
    errorMessage.value = 'Adding error'
  }
}

function showToast(message) {
  toast.value = message
  setTimeout(() => (toast.value = ''), 2000)
}
</script>
<style scoped>
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal__container {
  background: #1e1e1e;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 255, 200, 0.15);
  width: 100%;
  max-width: 420px;
  position: relative;
  color: #fff;
}

.modal__close {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  background: none;
  border: none;
  color: #ccc;
  font-size: 1.25rem;
  cursor: pointer;
  transition: color 0.2s;
}

.modal__close:hover {
  color: #fff;
}

.modal__title {
  margin-bottom: 1rem;
  font-size: 1.4rem;
  text-align: center;
}

.modal__input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.suggestions {
  margin-top: 10px;
  list-style: none;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  max-height: 150px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.4);
}

.suggestions li {
  padding: 8px;
  cursor: pointer;
}

.suggestions li:hover {
  background: rgba(0, 255, 200, 0.2);
}

.error {
  color: #ff6b6b;
  margin-top: 10px;
  text-align: center;
}

.loading {
  color: #aaa;
  margin-top: 10px;
  text-align: center;
}

.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #108476;
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  z-index: 2100;
}
</style>
