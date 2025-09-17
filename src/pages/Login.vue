<template>
  <div class="auth-container">
    <div class="square">
      <!-- три анимированных рамки -->
      <i style="--clr:#19194d;"></i>
      <i style="--clr:#bf00ff;"></i>
      <i style="--clr:#00ffbf;"></i>

      <div class="authorisation">
        <h2>Authorization</h2>

        <div class="inputBx">
          <input
              type="email"
              placeholder="Your email"
              v-model="email"
          />
        </div>

        <div class="inputBx">
          <input
              type="password"
              placeholder="Your password"
              v-model="password"
          />
        </div>

        <div class="inputBx">
          <input
              type="submit"
              :value="isLoading ? 'Loading...' : 'Log in'"
              :disabled="isLoading"
              @click.prevent="login"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="links">
          <a @click.prevent="router.push('/register')">Register</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import {ref} from "vue";
import {BASE_URL} from "../constants";
import {useRouter} from "vue-router";
import {useBoardsStore} from "@/stores/boards";

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const router = useRouter();
const boardsStore = useBoardsStore();

const login = () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please, fill all fields';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  axios.post(`${BASE_URL}/api/v1/auth/signin`, {
    formData: {
      email: email.value,
      password: password.value
    }
  })
      .then(async (response) => {
        if (response?.data?.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('userId', response.data.userId);

          await boardsStore.initBoards();
          router.push('/boards');
        }
      })
      .catch((error) => {
        errorMessage.value = error.response?.data?.message || 'Oops.. try again';
      })
      .finally(() => {
        isLoading.value = false;
      });
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');

* {
  font-family: 'Audiowide', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  background: linear-gradient(339deg, rgba(22, 160, 133, 1) 13%, rgba(51, 51, 55, 1) 61%);
  padding: 40px 20px;
}

.square {
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 800px;
  padding: 60px 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.square i {
  position: absolute;
  inset: 0;
  border: 2px solid #fff;
  transition: 0.5s;
}

.square i:nth-child(1) {
  border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%;
  animation: animate 6s linear infinite;
}

.square i:nth-child(2) {
  border-radius: 41% 44% 56% 59%/38% 62% 63% 37%;
  animation: animate 4s linear infinite;
}

.square i:nth-child(3) {
  border-radius: 41% 44% 56% 59%/38% 62% 63% 37%;
  animation: animate2 10s linear infinite;
}

.square:hover i {
  border: 6px solid var(--clr);
  filter: drop-shadow(0 0 20px var(--clr));
}

@keyframes animate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes animate2 {
  0% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.authorisation {
  position: absolute;
  width: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 20px;
}

.authorisation h2 {
  font-size: 3em;
  color: #fff;
}

.inputBx {
  position: relative;
  width: 100%;
}

.inputBx input {
  width: 100%;
  padding: 12px 20px;
  background: transparent;
  border: 2px solid #fff;
  border-radius: 20px;
  font-size: 1.2em;
  color: #fff;
  outline: none;
}

.inputBx input[type="submit"] {
  background: radial-gradient(circle, rgba(3, 10, 43, 1) 0%, rgba(110, 0, 161, 1) 100%);
  border: none;
  cursor: pointer;
}

.inputBx input::placeholder {
  color: rgba(255, 255, 255, 0.75);
}

.links {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 20px;
}

.links a {
  color: #D5CCFF;
  text-decoration: underline;
  cursor: pointer;
}

.links a:hover {
  color: #ffffff;
}

.error-message {
  color: #ff6b6b;
  margin-top: -10px;
  font-size: 14px;
}
</style>
