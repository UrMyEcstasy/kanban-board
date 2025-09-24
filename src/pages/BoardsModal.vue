<template>
  <div class="modal" @click.self="$emit('close')">
    <div class="modal__container">
      <button class="modal__close" @click="$emit('close')">✖</button>

      <h2 class="modal__title">
        {{ form.id ? 'Edit Board' : 'Create Board' }}
      </h2>

      <form @submit.prevent="submit" class="modal__form">
        <div class="form-group">
          <label for="board-name">Board name <span class="required">*</span></label>
          <input
              id="board-name"
              type="text"
              placeholder="Enter board name"
              v-model="form.name"
              class="modal__input"
              required
          />
          <!--   добавил реактивную ошибку и пропадание кнопки, если количество введенных символов в названии и описании меньше 5
          ( и в статусе и в таске и тут)-->

          <p v-if="errorsInBoardName.name" class="error-message">{{ errorsInBoardName.name }}</p>

        </div>

        <div class="form-group ">
          <label for="board-description">Description <span class="required">*</span></label>
          <textarea
              id="board-description"
              placeholder="Enter board description"
              v-model="form.description"
              class="modal__input"
              required
          ></textarea>

          <p v-if="errorsInBoardDescription.name" class="error-message">{{ errorsInBoardDescription.name }}</p>

        </div>

        <div class="modal__buttons">
          <button type="button" class="cancel-btn" @click="$emit('close')">Cancel</button>
          <button v-if="!hasErrors" type="submit" class="submit-btn">
            {{ form.id ? 'Save changes' : 'Create Board' }}
          </button>
        </div>




      </form>
    </div>
  </div>
</template>

<script setup>
import {computed, reactive, watch} from 'vue'


const props = defineProps({
  visible: Boolean,
  board: Object
})

const emit = defineEmits(['close', 'save'])

const initialForm = {
  id: null,
  name: '',
  description: ''
}

const form = reactive({...initialForm})

const errorsInBoardName = reactive({
  name: ''
})

const errorsInBoardDescription = reactive({
  name: ''
})

const validateName = (value) => {
  if (!value) return "Board name is required"
  if (value.length < 5) return "Name must be at least 5 characters long"
  return ""
}

const validateDescription = (value) => {
  if (!value) return "Description is required"
  if (value.length < 5) return "Description must be at least 5 characters long"
  return ""
}

const runValidation = () => {
  errorsInBoardName.name = validateName(form.name)
  errorsInBoardDescription.name = validateDescription(form.description)
}

watch(() => form.name, (newValue) => {
  errorsInBoardName.name = validateName(newValue)
})

watch(() => form.description, (newValue) => {
  errorsInBoardDescription.name = validateDescription(newValue)
})

watch(
    () => props.board,
    (newBoard) => {
      if (newBoard) {
        form.id = newBoard.id
        form.name = newBoard.name
        form.description = newBoard.description
      } else {
        Object.assign(form, {...initialForm})
      }
      runValidation()
    },
    {immediate: true}
)

const hasErrors = computed(() =>
    errorsInBoardName.name || errorsInBoardDescription.name
)



const submit = () => {
  runValidation()
  if (!errorsInBoardName.name && !errorsInBoardDescription){
  emit('save', {...form})
  }
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
  width: 100%;
}

.modal__input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

textarea.modal__input {
  resize: vertical;
  min-height: 100px;
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
