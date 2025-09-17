<template>
  <div class="page-container">

    <h1 class="neon-text">ToDo List Master</h1>

    <div class="kanban__column full-width">
      <div class="column-content">
        <!-- Левая часть: Текст -->
        <div class="text-section">
          <div class="task-card">
            <p
                class="cursor"
                v-for="(line, index) in displayed"
                :key="index"
            >
              {{ line }}
            </p>
          </div>
        </div>

        <!-- Правая часть: Кнопка -->
        <div class="button-section">
          <button
              v-if="showButton"
              class="go-btn"
              @click="goToLogin"
          >
            Let's Go!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'

const router = useRouter()
const showButton = ref(false)

const steps = ref([
  '1. Create your own tasks list',
  '2. Enter your tasks',
  '3. Manage your list',
  '4. Share it!'
])

const currentLine = ref(0)
const displayed = ref([''])

onMounted(() => {
  typeNextLine()
})

function typeNextLine() {
  if (currentLine.value >= steps.value.length) {
    showButton.value = true
    return
  }

  const text = steps.value[currentLine.value]
  let i = 0
  displayed.value[currentLine.value] = ''

  const interval = setInterval(() => {
    displayed.value[currentLine.value] += text[i]
    i++
    if (i >= text.length) {
      clearInterval(interval)
      currentLine.value++
      displayed.value.push('')
      setTimeout(typeNextLine, 600)
    }
  }, 45)
}

function goToLogin() {
  router.push('/login')
}
</script>


<style scoped>

.page-container {
  padding-bottom: 120px;
}


.kanban__column.full-width {
  width: 100%;
  max-width: 1300px;
  margin: 40px auto;
  padding: 40px 40px 40px 40px;

  border-radius: 20px;
  background: linear-gradient(339deg, rgba(22, 160, 133, 1) 23%, rgba(51, 51, 55, 1) 71%);
}

.column-content {
  display: flex;
  gap: 20px;
}

.text-section {
  flex: 0 0 80%;
}

.button-section {
  flex: 0 0 20%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10px;
}


.go-btn {
  padding: 40px 30px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 18px;
  background: linear-gradient(to right, #000000 0%, #53346D 51%, #000000 100%);
  transition: 0.5s;
  background-size: 200% auto;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.8);
  transform: translateY(-1px);


  color: white;
}

.go-btn:hover {
  background-position: right center;
  color: #fff;
  text-decoration: none;
}


.task-card {
  background-color: rgba(0, 0, 0, 0.33);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 0px 16px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Курсорный эффект */
.cursor {
  font-size: 30px;
  border-right: 2px solid rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  overflow: hidden;
  animation: blinkingCursor 0.7s steps(1) infinite;
}


@keyframes blinkingCursor {
  0%, 100% {
    border-color: rgba(255, 255, 255, 0.75);
  }
  50% {
    border-color: transparent;
  }
}


.neon-text {
  padding-top: 50px;
  margin: 0;
  flex: 1;
  min-width: 120px;
  text-align: center;
  color: #fff;
  text-shadow: 0 0 5px #ff005e, 0 0 10px #ff005e, 0 0 20px #ff005e;
  animation: glow 5s infinite alternate;
}


.neon-text {
  width: 100%;
  height: 100%;
  font-size: 4rem;
  color: #fff;
  text-shadow: 0 0 5px #ff005e, 0 0 10px #ff005e, 0 0 20px #ff005e, 0 0 40px #ff005e, 0 0 80px #ff005e;
  animation: glow 5.5s infinite alternate;
}

@keyframes glow {
  0% {
    text-shadow: 0 0 5px rgba(110, 0, 161, 1), 0 0 10px rgba(110, 0, 161, 1), 0 0 20px rgba(110, 0, 161, 1), 0 0 40px rgba(110, 0, 161, 1), 0 0 80px rgba(110, 0, 161, 1);
  }

  50% {
    text-shadow: 0 0 5px #ff005e, 0 0 10px #ff005e, 0 0 20px rgb(109, 26, 54), 0 0 40px rgb(109, 26, 54), 0 0 80px rgba(41, 33, 33, 1);
  }
  100% {
    text-shadow: 0 0 10px rgba(22, 160, 133, 1), 0 0 20px rgba(22, 160, 133, 1), 0 0 40px rgba(22, 160, 133, 1), 0 0 80px rgba(22, 160, 133, 1), 0 0 160px rgba(22, 160, 133, 1);
  }
}


</style>