<template>
  <div>
    <div class="header-actions">
      <button class="back-button" @click="backToBoards">← Back to Boards</button>

      <button
          v-if="hasPermission(boardId, myId, 'manage-board-statuses')"
          class="add-status-button"
          @click="showAddStatusModal = true"
      >
        + Add Status
      </button>

      <button class="share-button" v-if="hasPermission(boardId, myId, 'manage-board-users')"
              @click="showShareModal = true">
        Share
      </button>
    </div>

    <div class="kanban-board" v-if="boardId && tasksStore.board">
      <section
          v-for="column in tasksStore.columns"
          :key="column.id"
          class="kanban__column"
      >
        <div class="kanban__column__header">
          <h2 class="kanban__title">{{ column.name }}</h2>
          <div class="kanban__actions">
            <a
                v-if="hasPermission(boardId, myId, 'manage-board-statuses')"
                href="#"
                class="header__add"
                @click.prevent="openCreateModal(column.id)"
            >
              <img src="@/assets/tasks/plus-button.svg" class="icon"/>
            </a>

            <img
                v-if="hasPermission(boardId, myId, 'manage-board-statuses')"
                src="@/assets/tasks/edit-button.svg"
                @click.stop="openEditStatusModal(column)"
                class="edit-status-button"
            />

            <img
                v-if="hasPermission(boardId, myId, 'delete-board-statuses')"
                src="@/assets/admin-modal/trash.svg"
                @click.stop="handleDeleteColumn(column.id)"
                class="delete-status-button"
            />
          </div>
        </div>

        <draggable
            :list="filteredTasks(column.id)"
            group="tasks"
            @change="(event) => handleDrag(event, column.id)"
            class="kanban__tasks"
            item-key="id"
        >
          <template #item="{ element: task }">
            <div class="task-card" @click="editTask(task, column.id)">
              <button class="delete-task-btn" @click.stop="deleteTask(task.id)">×</button>
              <div class="task-title">{{ task.title }}</div>
              <div class="task-description">{{ task.description }}</div>
              <div class="task-date">{{ task.formattedDate }}</div>
              <div class="dots">
                <span
                    v-for="n in 3"
                    :key="n"
                    class="dot"
                    :class="[task.dotColor, { active: task.activeDots >= n }]"
                    :title="task.tooltip"
                ></span>
              </div>
            </div>
          </template>
        </draggable>
      </section>
    </div>

    <!-- модалки -->
    <EditStatusModal
        v-if="showEditStatusModal"
        :status="currentColumn"
        @close="showEditStatusModal = false"
        @update-status="updateStatus"
    />
    <TasksModal v-if="showTaskModal" :task="currentTask" @close="showTaskModal = false" @save="saveTask"/>
    <AddStatusModal v-if="showAddStatusModal" @close="showAddStatusModal = false" @add-status="addNewStatus"/>
    <EditTasksModal v-if="editTaskModal" :task="currentTask" @close="editTaskModal = false" @save="saveTask($event)"/>
    <ShareBoardModal v-if="showShareModal" :board-id="boardId" @close="showShareModal = false"/>
    <transition name="fade">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>


<script setup>
import {ref, onMounted, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useAdminStore} from '@/stores/admins'

import {useTasksStore} from '@/stores/tasks'
import draggable from 'vuedraggable'

import TasksModal from './TasksModal.vue'
import AddStatusModal from './AddStatusModal.vue'
import EditTasksModal from './EditTasksModal.vue'
import EditStatusModal from './EditStatusModal.vue'
import ShareBoardModal from './ShareBoardModal.vue'

const showShareModal = ref(false)

const showEditStatusModal = ref(false)
const currentColumn = ref(null)
const route = useRoute()
const router = useRouter()
const tasksStore = useTasksStore()
const showTaskModal = ref(false)
const editTaskModal = ref(false)
const showAddStatusModal = ref(false)
const currentTask = ref(null)
const currentColumnId = ref(null)

const boardId = ref(route.params.boardId)
const myId = localStorage.getItem("userId")
const adminStore = useAdminStore()

const loadBoardData = async () => {
  if (boardId.value) {
    try {
      await tasksStore.initBoard(boardId.value)
      await tasksStore.initColumns(boardId.value)
      await tasksStore.initTasks(boardId.value)
    } catch (error) {
      console.error('Error loading board data:', error)
    }
  }
}


const hasPermission = (boardId, userId, perm) => {
  return (adminStore.userPermissions[boardId]?.[userId] || []).includes(perm)
}


onMounted(async () => {
  await loadBoardData()

  if (myId) {
    await adminStore.fetchPermissions(boardId.value, myId)
  }
})

watch(() => route.params.boardId, async (newId, oldId) => {
  if (newId && newId !== oldId) {
    boardId.value = newId;
    await loadBoardData();
  }
}, {immediate: true});

const openEditStatusModal = (column) => {
  currentColumn.value = column
  showEditStatusModal.value = true
}

const updateStatus = async (formData) => {
  try {
    await tasksStore.editColumn(boardId.value, currentColumn.value.id, formData)
    showEditStatusModal.value = false
  } catch (error) {
    console.error('Update status error:', error)
  }
}


const handleDrag = async (event, newColumnId) => {
  if (event.added) {
    const task = event.added.element
    const taskId = task.id
    const prevColumnId = task.statusId || task.column_id

    try {
      await tasksStore.moveTask(boardId.value, taskId, newColumnId)
    } catch (error) {
      console.error("Move task error:", error)

      tasksStore.updateTaskStatus(taskId, prevColumnId)
    }
  }
}

const getTasksForColumn = (columnId) => {
  if (!tasksStore.tasksByStatus) return []
  const statusObj = tasksStore.tasksByStatus.find(item => item.status.id === columnId)
  return statusObj ? statusObj.tasks : []
}

const filteredTasks = (columnId) => {
  const tasks = getTasksForColumn(columnId)
  return tasks.map(task => {
    const daysLeft = getDaysLeft(task.due_date)
    let tooltip = ''

    if (daysLeft < 0) {
      tooltip = ` ${Math.abs(daysLeft)} day(s) overdue`
    } else if (daysLeft === 0) {
      tooltip = 'Today'
    } else {
      tooltip = ` ${daysLeft} day(s) left`
    }

    let dotColor = 'green'
    if (daysLeft <= 7) dotColor = 'yellow'
    if (daysLeft <= 3) dotColor = 'orange'
    if (daysLeft <= 0) dotColor = 'red'


    return {
      ...task,
      activeDots: getActiveDotsCount(daysLeft),
      formattedDate: formatDate(task.due_date),
      tooltip,
      dotColor
    }
  })
}


function getDaysLeft(dueDate) {
  if (!dueDate) return Infinity
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function getActiveDotsCount(daysLeft) {
  if (daysLeft > 7) return 3    // далеко → все зелёные
  if (daysLeft > 3) return 2    // средне → 2 жёлтые
  if (daysLeft >= 0) return 1   // скоро → 1 оранжевая
  return 3                      // просрочено → 3 красные
}


function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB')
}

const openCreateModal = (columnId) => {
  currentTask.value = null
  currentColumnId.value = columnId
  showTaskModal.value = true
}

const editTask = (task, columnId) => {
  currentTask.value = {...task, column_id: columnId, statusId: columnId}
  currentColumnId.value = columnId
  editTaskModal.value = true
}

const saveTask = async (taskData, taskId) => {
  if (!taskData.title || taskData.title.trim() === '') {
    alert("Please enter task title")
    return
  }
  if (!taskData.due_date) {
    alert("Please select due date")
    return
  }
  try {
    if (taskData.id) {
      await tasksStore.editTask(boardId.value, currentColumnId.value, {
        ...taskData,
        description: taskData.description || '',
        column_id: currentColumnId.value
      })
    } else {
      await tasksStore.createTask(boardId.value, currentColumnId.value, {
        ...taskData,
        description: taskData.description || '',
        column_id: currentColumnId.value
      })
    }
    showTaskModal.value = false
    editTaskModal.value = false
  } catch (error) {
    console.error("Save task error:", error.message || error)
    alert(`Failed to save task: ${error.message || "Please try again"}`)
  }
}

// const deleteTask = async (taskId) => {
//   await tasksStore.deleteTask(boardId.value, taskId)
// }
//
//
//
// const handleDeleteColumn = async (columnId) => {
//   await tasksStore.deleteColumn(boardId.value, columnId)
// }

const backToBoards = () => {
  router.push({name: 'boards'})
}

const addNewStatus = async (newStatus) => {
  try {
    await tasksStore.createColumn(boardId.value, {name: newStatus.title})
    showAddStatusModal.value = false
  } catch (error) {
    console.error('Failed to add status:', error)
  }
}


const deleteTask = async (taskId) => {
  if (confirm("Are you sure you want to delete this task?")) {
    try {
      await tasksStore.deleteTask(boardId.value, taskId)
      showToast("Task deleted successfully")
    } catch (e) {
      console.error("Delete task error:", e)
      showToast("Error while deleting task")
    }
  }
}

const handleDeleteColumn = async (columnId) => {
  if (confirm("Are you sure you want to delete this status?")) {
    try {
      await tasksStore.deleteColumn(boardId.value, columnId)
      await tasksStore.initColumns(boardId.value)
      showToast("Status deleted successfully")
    } catch (e) {
      console.error("Delete column error:", e)
      showToast("Error while deleting status")
    }
  }
}

function showToast(message) {
  toast.value = message
  setTimeout(() => (toast.value = ""), 2000)
}

</script>


<style scoped>


.kanban__column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 3px solid black;
}

.kanban__title {
  flex: 1;
  text-align: center;
  font-size: 30px;
  color: white;
  margin: 0;
}

.kanban__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.header__add,
.edit-status-button {
  cursor: pointer;
}

.header-actions {
  display: flex;
  padding: 20px 20px 0 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.back-button,
.add-status-button,
.share-button {
  margin-bottom: 15px;
  padding: 8px 16px;
  background: linear-gradient(145deg, #171033, #191626);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: box-shadow 0.15s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.edit-status-button {
  width: 37px;
  height: 32px;
  cursor: pointer;
}

.header__add:hover,
.edit-status-button:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.back-button:hover,
.add-status-button:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
}


.share-button:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px 20px 0 20px;
  margin-bottom: 20px;
}

@media (min-width: 650px) {
  .kanban-board {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1000px) {
  .kanban-board {
    grid-template-columns: repeat(3, 1fr);
  }
}

.kanban__column {
  background: #16A085;
  background: linear-gradient(339deg, rgba(22, 160, 133, 1) 23%, rgba(51, 51, 55, 1) 71%);
  border-radius: 12px;
  padding: 16px;
  min-width: 0;
}


.kanban__title {
  font-size: 18px;
  color: white;
  margin: 0;
  flex: 1;
  min-width: 120px;
}

.header__add {
  color: red;
  margin-top: 3px;
  margin-right: 10px;
  cursor: pointer;
  white-space: nowrap;
  background-size: contain;
}

.task-card {
  position: relative;
  //background: #fff;
  background-color: rgba(0, 0, 0, 0.33);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.task-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  word-break: break-word;
}

.task-description {
  font-size: 15px;
  color: white;
  word-break: break-word;
}

.task-date {
  font-size: 12px;
  color: white;
}

.dots {
  display: flex;
  gap: 4px;
}


.dot {
  width: 24px;
  height: 12px;
  border-radius: 6px;
  background: khaki;
  transition: background-color 0.3s;
}

.dot {
  width: 24px;
  height: 12px;
  border-radius: 6px;
  background: khaki;
  transition: background 0.5s ease;
}

/* зелёный → салатовый */
.dot.green.active {
  background: linear-gradient(90deg, #00ff00, #ccff00);
}

/* жёлтый → оранжевый */
.dot.yellow.active {
  background: linear-gradient(90deg, #ffcc00, #ff8800);
}

/* оранжевый → красный */
.dot.orange.active {
  background: linear-gradient(90deg, #ff8800, #ff4444);
}

/* красный → тёмно-красный */
.dot.red.active {
  background: linear-gradient(90deg, #ff0000, #990000);
}


.delete-task-btn {
  position: absolute;
  top: 6px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 18px;
  color: #ea3546;
  cursor: pointer;
}

.delete-task-btn:hover {
  background: rgba(234, 53, 70, 0.1);
  border-radius: 50%;
}

@media (max-width: 500px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }

}

.delete-status-button {
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: filter 0.2s;
}

.delete-status-button:hover {
  filter: brightness(0) invert(1);
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