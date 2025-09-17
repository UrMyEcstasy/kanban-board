<!--карточки досок на домашней странице-->

<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else class="board-container">
      <div
          v-for="board in boards"
          :key="board.id"
          class="board-item"
      >
        <router-link
            :to="{ name: 'boardTasks', params: { boardId: board.id } }"
            class="board-link"
        >
          <div class="board-name">{{ board.name }}</div>
          <div class="board-description">{{ board.description }}</div>
        </router-link>

        <div class="board-actions">
          <button
              v-if="hasPermission(board.id, myId, 'manage-board')"
              @click.stop="openEdit(board)"
              class="edit-btn"
          >
            Edit board
          </button>

          <button
              v-if="hasPermission(board.id, myId, 'delete-board')"
              @click.stop="confirmDelete(board.id)"
              class="delete-btn"
          >
            Delete
          </button>
        </div>

      </div>
    </div>

    <BoardsModal
        v-if="showBoardModal"
        :visible="showBoardModal"
        :board="currentBoard"
        @close="closeBoardModal"
        @save="saveBoard"
    />

    <!--    тост, товарищи. -->
    <transition name="fade">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import {useBoardsStore} from '@/stores/boards'
import {ref, onMounted} from 'vue'
import {storeToRefs} from 'pinia'
import {useAdminStore} from '@/stores/admins'
import BoardsModal from '@/pages/BoardsModal.vue'

const boardsStore = useBoardsStore()
const {boards, isLoading} = storeToRefs(boardsStore)

const adminStore = useAdminStore()
const myId = localStorage.getItem("userId")
const showBoardModal = ref(false)
const currentBoard = ref(null)

const hasPermission = (boardId, userId, perm) => {
  return (adminStore.userPermissions[boardId]?.[userId] || []).includes(perm)
}

onMounted(async () => {
  await boardsStore.initBoards()

  if (myId && boards.value.length) {
    await adminStore.fetchMyPermissionsForBoards(boards.value, myId)
    console.log("all permissions:", adminStore.userPermissions)
  }
})


const openEdit = (board) => {
  currentBoard.value = board
  showBoardModal.value = true
}


const closeBoardModal = () => {
  showBoardModal.value = false
  currentBoard.value = null
}
const confirmDelete = async (id) => {
  if (confirm("Are you sure you want to delete this board?")) {
    try {
      await boardsStore.deleteBoard(id)
      showToast("Board deleted successfully")
    } catch (error) {
      console.error('Oops.. there is a mistake:', error)
      showToast("Error while deleting board")
    }
  }
}

const saveBoard = async (data) => {
  try {
    await boardsStore.editBoard(data.id, data)
    closeBoardModal()
  } catch (error) {
    console.error("Oops.. edit failed:", error)
  }
}

function showToast(message) {
  toast.value = message
  setTimeout(() => (toast.value = ""), 2000)
}
</script>

<style scoped>

.board-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
  justify-content: center;
}

.board-item {
  width: 250px;
  background: linear-gradient(to right, #232526, #414345);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 30px rgba(0, 255, 200, 0.1);
  transition: background 0.3s, transform 0.2s;
  cursor: pointer;
}

.board-item:hover {
  background: linear-gradient(to right, #3a3a3a, #5c5c5c);
  transform: translateY(-2px);
}


.board-name {
  color: white;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  word-break: break-word;
}

.board-description {
  color: #555;
  word-break: break-word;
  min-height: 60px;
}

.board-actions {
  display: flex;
  width: 100%;
  margin-top: 16px;
  justify-content: space-between;
  align-items: flex-end;
  font-size: 14px;
}

.edit-btn {
  background: #030a2b;
  background: radial-gradient(circle, rgba(3, 10, 43, 1) 0%, rgba(110, 0, 161, 1) 100%);
  border: none;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: opacity 0.3s;
  color: #fff;
}

.delete-btn {
  background: #e02847;
  background: radial-gradient(circle, rgba(224, 40, 71, 1) 0%, rgba(41, 33, 33, 1) 100%);
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.edit-btn:hover,
.delete-btn:hover {
  opacity: 1.9;
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