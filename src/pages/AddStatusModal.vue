<script setup>
import {ref} from 'vue'

const emit = defineEmits(['close', 'add-status'])

const form = ref({
  title: '',
  id: ''
})

const generateId = (title) => {
  return title.toLowerCase().replace(/\s+/g, '_')
}

const submit = async () => {
  if (!form.value.title.trim()) {
    alert('New status')
    return
  }

  form.value.id = generateId(form.value.title)

  try {
    emit('add-status', {
      title: form.value.title,
      id: form.value.id
    })
    emit('close')
  } catch (error) {
    console.error('Oops.. creation mistake:', error)
    alert('Не удалось создать статус. Подробности в консоли.')
  }
}
</script>

<template>
  <div class="modal" @click.self="emit('close')">
    <div class="modal__container">
      <button class="modal__close" @click="emit('close')">✖</button>

      <form @submit.prevent="submit" class="modal__form">
        <h2 class="modal__title">Add new status</h2>

        <input
            v-model="form.title"
            id="status-title"
            type="text"
            class="modal__input"
            placeholder="New status"
            required
        />

        <div class="modal__buttons">
          <button type="submit" class="submit-btn">Enter</button>
          <button type="button" class="cancel-btn" @click="emit('close')">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>


.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
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

.modal__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal__input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.75rem;
  border-radius: 6px;
  font-family: inherit;
}

.modal__input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}


.modal__buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 15px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn {
  background-color: #108476;
  color: white;
}

.submit-btn:hover {
  background-color: #08af9d;
}

.cancel-btn {
  background-color: #d55a5a;
  color: white;
}

.cancel-btn:hover {
  background-color: #db1010;
}
</style>
