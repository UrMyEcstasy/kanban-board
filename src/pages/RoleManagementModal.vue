<template>
  <div v-if="show" class="modal" @click.self="emit('close')">
    <div class="modal__container">
      <button class="modal__close" @click="emit('close')">✖</button>

      <h2 class="modal__title">Members</h2>

      <div class="users-list">
        <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="user-card"
        >
          <div class="user-main" @click="openPermissions(user.id)">
            <div class="avatar">
              {{ user.name[0] }}{{ user.name.split(' ')[1]?.[0] || '' }}
            </div>
            <div class="user-info">
              <div class="user-name">
                {{ user.email }}
                <span v-if="user.id == myId" class="you-label">(you)</span>
              </div>
            </div>


            <div v-if="hasPermission(boardId, myId, 'manage-board-users') && user.id != myId" class="menu-icon">⋮</div>

            <button
                v-if="hasPermission(boardId, myId, 'manage-board-users') && user.id != myId"
                class="delete-btn"
                @click.stop="confirmDelete(user.id)"
                title="Remove user"
            >
              <img
                  src="@/assets/admin-modal/trash.svg"
                  alt="delete"
                  class="delete-icon"
              />
            </button>
          </div>

          <div
              v-if="hasPermission(boardId, myId, 'manage-board-users') && selectedUserId === user.id && user.id != myId"
              class="permissions"
          >
            <label
                class="perm-row"
                v-for="(label, key) in PERMISSIONS"
                :key="key"
            >
              <span>{{ label }}</span>
              <label class="switch">
                <input
                    type="checkbox"
                    :checked="hasPermission(boardId, user.id, key)"
                    @change="togglePermission(user.id, key, $event.target.checked)"
                />
                <span class="slider round"></span>
              </label>
            </label>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="toast" class="toast">{{ toast }}</div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, watch} from "vue";
import {useAdminStore, PERMISSIONS} from "@/stores/admins";

const props = defineProps({
  show: Boolean,
  boardId: [String, Number],
});
const emit = defineEmits(["close"]);

const adminStore = useAdminStore();
const selectedUserId = ref(null);
const searchQuery = ref("");
const toast = ref("");

const myId = localStorage.getItem("userId");

watch(
    () => props.show,
    async (val) => {
      if (val) {
        await adminStore.fetchUsers(props.boardId);
        if (myId) {
          await adminStore.fetchPermissions(props.boardId, myId);
        }
      }
    }
);

const filteredUsers = computed(() => {
  return adminStore.users.filter(
      (user) =>
          user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const hasPermission = (boardId, userId, perm) => {
  return (adminStore.userPermissions[boardId]?.[userId] || []).includes(perm)
}

const openPermissions = async (userId) => {
  selectedUserId.value = userId;
  await adminStore.fetchPermissions(props.boardId, userId);
};

const togglePermission = async (userId, perm, checked) => {
  if (checked) {
    await adminStore.grantPermission(props.boardId, userId, perm);
  } else {
    await adminStore.revokePermission(props.boardId, userId, perm);
  }
  await adminStore.fetchPermissions(props.boardId, userId);
};

const confirmDelete = async (userId) => {
  if (confirm("Are you sure you want to delete this user?")) {
    try {
      await adminStore.removeUserFromBoard(props.boardId, userId);
      showToast("User removed successfully");
    } catch (e) {
      showToast("Error while removing user");
    }
  }
};

function showToast(message) {
  toast.value = message;
  setTimeout(() => (toast.value = ""), 2000);
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
  z-index: 2000;
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
  max-height: 80vh;
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

.you-label {
  font-size: 12px;
  color: #aaa;
  margin-left: 6px;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.user-main {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
}

.avatar {
  background: #108476;
  color: #fff;
  font-weight: bold;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.user-name {
  font-size: 14px;
}

.menu-icon {
  margin-left: auto;
  font-size: 18px;
  color: #aaa;
}

.permissions {
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
}

.perm-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px 0;
  font-size: 14px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #666;
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #108274;
}

input:checked + .slider:before {
  transform: translateX(16px);
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  width: 20px;
  height: 20px;
  transition: filter 0.2s;
}

.delete-btn:hover .delete-icon {
  filter: brightness(0) invert(1);
}


.toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #1e1e1e;
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  z-index: 2100;
}

</style>
