<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal__container">
      <button class="modal__close" @click="$emit('close')">✖</button>

      <h2 class="modal__title">
        {{ isEditMode ? 'Edit Task' : 'Add Task' }}
      </h2>

      <form @submit.prevent="submit" class="modal__form">
        <input type="hidden" v-model="form.column_id">

        <div class="form-group">
          <label for="title">Title <span class="required">*</span></label>
          <input
              id="title"
              type="text"
              placeholder="Enter task title"
              v-model="form.title"
              required
              class="modal__input"
          />
          <p v-if="errorsInTaskTitle.name" class="error-message">{{ errorsInTaskTitle.name }}</p>
        </div>

        <div class="form-group">
          <label for="due">Due date <span class="required">*</span></label>
          <input
              id="due"
              type="date"
              v-model="form.due_date"
              required
              class="modal__input"
          />
          <p v-if="errorsInDate.name" class="error-message">{{ errorsInDate.name }}</p>
        </div>

        <div class="form-group">
          <label for="description">Description <span class="required">*</span></label>
          <textarea
              id="description"
              placeholder="Enter task description"
              v-model="form.description"
              required
              class="modal__input"
          ></textarea>
          <p v-if="errorsInTaskDescription.name" class="error-message">{{ errorsInTaskDescription.name }}</p>
        </div>

        <div class="modal__buttons">
          <button type="button" class="cancel-btn" @click="$emit('close')">Cancel</button>
          <button v-if="!hasErrors" type="submit" class="submit-btn">
            {{ isEditMode ? 'Save changes' : 'Save task' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>


<script setup>
import {ref, watch, computed, reactive} from 'vue'

const props = defineProps({
  task: Object,
  currentColumnId: [Number, String]
})

const emit = defineEmits(['close', 'save'])

const initialForm = {
  id: null,
  title: '',
  description: '',
  due_date: '',
  status: 'TODO',
  column_id: props.currentColumnId || null
}

const form = ref({...initialForm})

const isEditMode = computed(() => !!form.value.id)


const errorsInTaskTitle = reactive({
  name: ''
})

const errorsInDate = reactive({
  name: ''
})

const errorsInTaskDescription = reactive({
  name: ''
})

const validateTitle = (value) => {
  if (!value) return "Title is required"
  if (value.length < 5) return "Title must be at least 5 characters long"
  return ""
}

const validateDescription = (value) => {
  if (!value) return "Description is required"
  if (value.length < 5) return "Description must be at least 5 characters long"
  return ""
}
const validateDate = (value) => {
  if (!value) return "Date is required"
  return ""
}

const runValidation = () => {
  errorsInTaskTitle.name = validateTitle(form.value.title)
  errorsInTaskDescription.name = validateDescription(form.value.description)
  errorsInDate.name = validateDate(form.value.due_date)
}

watch(() => form.value.title, (newValue) => {
  errorsInTaskTitle.name = validateTitle(newValue)
})

watch(() => form.value.description, (newValue) => {
  errorsInTaskDescription.name = validateDescription(newValue)
})

watch(() => form.value.due_date, (newValue) => {
  errorsInDate.name = validateDate(newValue)
})




watch(() => props.task, (task) => {
  runValidation()
  if (task) {
    form.value = {
      ...task,
      due_date: task.due_date ? task.due_date.substring(0, 10) : '',
      column_id: task.column_id || props.currentColumnId
    }
  } else {
    resetForm()
  }
}, {immediate: true})

watch(() => props.currentColumnId, (newId) => {
  runValidation()
  if (!isEditMode.value) {
    form.value.column_id = newId
  }
})

function resetForm() {
  form.value = {
    ...initialForm,
    column_id: props.currentColumnId
  }
}

const hasErrors = computed(() =>
    errorsInTaskTitle.name || errorsInTaskDescription.name || errorsInDate.name
)


const submit = () => {
  runValidation()
  const taskData = {...form.value}
  emit('save', taskData)
}
</script>


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
  max-width: 480px;
  position: relative;
  color: #fff;
  max-height: 85vh;
  overflow-y: auto;
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

/* форма */
.modal__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* input и textarea */
.modal__input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.75rem;
  border-radius: 6px;
  font-family: inherit;
  width: 100%;
}

.modal__input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

textarea.modal__input {
  resize: vertical;
  min-height: 100px;
}

/* кнопки */
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

.required {
  color: red;
}

.error-message {
  color: red;
  font-size: 13px;
  margin-top: 4px;
}
.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
