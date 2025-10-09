<template>
  <div class="auth-container">
    <h1 class="form__title">Sign up</h1>

    <form class="auth__form">
      <label>Name</label>
      <input type="text" v-model="formData.name" placeholder="Your name" />

      <label>Email</label>
      <input type="email" v-model="formData.email" placeholder="Your email" />

      <label>Password</label>
      <input type="password" v-model="formData.password" placeholder="Your password" />

      <label>Confirm password</label>
      <input type="password" v-model="formData.confirm_password" placeholder="Repeat password" />

      <button @click="register" type="button" :disabled="isLoading">
        {{ isLoading ? 'Loading...' : 'Register' }}
      </button>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </form>

    <transition name="fade">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup lang="js">
import axios from "axios";
import { reactive, ref } from "vue";
import { BASE_URL } from "../constants";
import { useRouter } from "vue-router";
import { useBoardsStore } from '@/stores/boards'
import { useAdminStore } from '@/stores/admins'

const boardsStore = useBoardsStore()
const adminStore = useAdminStore()

const router = useRouter();

const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirm_password: ''
});

const isLoading = ref(false);
const errorMessage = ref('');
const toast = ref('');

const showToast = (message) => {
  toast.value = message;
  setTimeout(() => (toast.value = ''), 2500);
};

const register = async () => {
  if (!formData.email || !formData.password || !formData.confirm_password || !formData.name) {
    errorMessage.value = 'Please fill all fields';
    return;
  }

  if (formData.password !== formData.confirm_password) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await axios.put(`${BASE_URL}/api/v1/auth/signup`, { formData });

    if (response.status === 200) {
      const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/signin`, {
        formData: {
          email: formData.email,
          password: formData.password
        }
      });

      if (loginResponse?.data?.token) {
        localStorage.setItem('token', loginResponse.data.token);
        localStorage.setItem('userId', loginResponse.data.userId);

        showToast(`Welcome, ${formData.name}! Redirecting...`);

        // немного задержал тут пользователя, чтобы тостик было видно
        setTimeout(() => router.push('/boards'), 1500);
      } else {
        router.push('/login');
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
    errorMessage.value =
        error.response?.data?.message || 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  margin: 0;
  font-size: 16px;
  background: radial-gradient(circle, rgba(3, 10, 43, 1) 0%, rgba(110, 0, 161, 1) 100%);
  color: #FFFFFF;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth__form {
  width: 100%;
  max-width: 400px;
}

.form__title {
  margin-top: 250px;
  text-align: center;
  font-size: 45px;
  color: #F4F2FF;
}

.label {
  display: inline-block;
  font-size: 14px;
  color: #F4F2FF;
  margin-top: 12px;
  margin-left: 12px;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  background-color: #D5CCFF;
  border-radius: 10px;
  font-size: 14px;
  box-sizing: border-box;
  border: none;
  min-height: 45px;
  padding: 5px 15px;
  margin-top: 3px;
  outline: none;
}

button {
  background-color: #7a7c;
  width: 100%;
  border: none;
  color: #fff;
  margin-top: 24px;
  border-radius: 10px;
  padding: 13px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 16px;
}

button:hover {
  background-color: #4a4c;
}

button:disabled {
  background-color: #7a7c;
  cursor: not-allowed;
}

.error-message {
  color: #ff6b6b;
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
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
  z-index: 999;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>