<template>
  <header class="header">
    <div class="header__container">
      <h1 class="header__title">{{ headerTitle }}</h1>

      <div class="header__btns">

        <button
            v-if="route.name === 'boards'"
            class="add-project-btn"
            @click="openCreateModal"
        >
          New Board
        </button>

        <button
            v-if="route.name === 'boardTasks'"
            class="admin-btn"
            @click="openAdminModal"
        >
          Administrator
        </button>
        <button class="logout-btn" @click="confirmLogout">
          <img src="@/assets/header/exit.svg" alt="Logout"/>
        </button>
      </div>
    </div>
  </header>

  <!-- модалки -->
  <RoleManagementModal
      v-if="showAdminModal"
      :show="showAdminModal"
      :board-id="currentBoardId"
      @close="showAdminModal = false"
  />

  <BoardsModal
      v-if="showBoardModal"
      :visible="showBoardModal"
      :board="currentBoard"
      @close="closeBoardModal"
      @save="saveBoard"
  />
  <transition name="fade">
    <div v-if="toast" class="toast">{{ toast }}</div>
  </transition>
</template>


<script setup>
import {ref, computed} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAdminStore} from '@/stores/admins'
import {useBoardsStore} from '@/stores/boards'
import {useTasksStore} from '@/stores/tasks'

import RoleManagementModal from '@/pages/RoleManagementModal.vue'
import BoardsModal from '@/pages/BoardsModal.vue'

const route = useRoute()
const router = useRouter()

const adminStore = useAdminStore()
const boardsStore = useBoardsStore()
const tasksStore = useTasksStore()

const showAdminModal = ref(false)
const showBoardModal = ref(false)
const currentBoardId = ref(null)
const currentBoard = ref(null)

const headerTitle = computed(() => {
  if (route.name === 'boardTasks' && tasksStore.board) {
    return tasksStore.board.name
  }
  return 'Kanban Board'
})

const openAdminModal = async () => {
  const boardId = route.params.boardId
  if (!boardId) return

  currentBoardId.value = boardId
  await adminStore.fetchUsers(currentBoardId.value)
  showAdminModal.value = true
}

const openCreateModal = () => {
  currentBoard.value = null
  showBoardModal.value = true
}

const closeBoardModal = () => {
  showBoardModal.value = false
  currentBoard.value = null
}

const saveBoard = async (data) => {
  try {
    if (data.id) {
      await boardsStore.editBoard(data.id, data)
    } else {
      const newBoard = await boardsStore.createBoard(data)
      if (newBoard?.id) {
        router.push({name: 'boardTasks', params: {boardId: newBoard.id}})
      }
    }
    closeBoardModal()
  } catch (error) {
    console.error('Oops.. there is a mistake:', error)
  }
}

const confirmLogout = () => {
  if (confirm("Are you sure you want to log out?")) {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    router.push({name: 'login'})
    showToast("Logged out successfully")
  }
}

function showToast(message) {
  toast.value = message
  setTimeout(() => (toast.value = ""), 2000)
}

</script>


<style scoped>
.header {
  padding: 30px 0;
}

.header__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 25px;
  background-color: #333337;
  border-radius: 12px;
}

.header__title {
  margin: 0;
  padding: 10px 0;
  color: white;
}

.header__btns {
  display: flex;
  gap: 15px;
  align-items: center;
}

.add-project-btn,
.admin-btn {
  padding: 12px 18px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 14px;
  background: linear-gradient(to right, #000000 0%, #53346D 51%, #000000 100%);
  transition: 0.5s;
  background-size: 200% auto;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.8);
  transform: translateY(-1px);
  color: white;
}

.add-project-btn:hover,
.admin-btn:hover {
  background-position: right center;
}

.logout-btn {
  background: #d9d9d9;
  border: none;
  padding: 8px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn img {
  width: 20px;
  height: 20px;
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
