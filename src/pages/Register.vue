<template>
  <div class="auth-container">
    <h1 class="form__title">Sign in</h1>
    <form class="auth__form">
      <label for="name" class="label">Your Name</label>
      <input
          type="text"
          id="name"
          placeholder="Name"
          v-model="formData.name"
      >

      <label for="email" class="label">Email</label>
      <input
          type="email"
          id="email"
          placeholder="Your email address"
          v-model="formData.email"
      >

      <label for="password" class="label">Password</label>
      <input
          type="password"
          id="password"
          placeholder="Your password"
          v-model="formData.password"
      >

      <label for="confirm_password" class="label">Password confirm</label>
      <input
          type="password"
          id="confirm_password"
          placeholder="Confirm password"
          v-model="formData.confirm_password"
      >

      <button @click="register" type="button" :disabled="isLoading">
        {{ isLoading ? 'Loading...' : 'Register' }}
      </button>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </form>
  </div>
</template>

<script lang="js" setup>
import axios from "axios";
import {reactive, ref} from "vue";
import {BASE_URL} from "../constants";
import {useRouter} from "vue-router";

const router = useRouter();

const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirm_password: ''
});

const isLoading = ref(false);
const errorMessage = ref('');

const login = () => {
  axios.post(`${BASE_URL}/api/v1/auth/signin`, {
    formData: {
      email: formData.email,
      password: formData.password
    }
  })
      .then(function (response) {
        console.log(response);
        if (response?.data?.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userId', response.data.userId);
          router.push('/login');
        }
      })
      .catch(function (error) {
        console.log(error);
        errorMessage.value = 'Ошибка входа после регистрации';
      });
}

const register = () => {
  console.log(111, formData);

  if (!formData.email || !formData.password ||
      !formData.confirm_password || !formData.name) {
    errorMessage.value = 'Please fill all gaps';
    return;
  }

  if (formData.password !== formData.confirm_password) {
    errorMessage.value = 'Confirm passwords do not match';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  axios.put('/api/v1/auth/signup', {
    formData: formData
  }, {
    baseURL: BASE_URL
  })
      .then(function (response) {
        if (response.status === 200) {
          router.push('/login');
        }
      })
      .catch(function (error) {
        console.log(error);
        errorMessage.value = error.response?.data?.message || 'Oops... registration mistake';
      })
      .finally(() => {
        isLoading.value = false;
      });
}
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
</style>