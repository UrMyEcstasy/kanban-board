<template>
  <AppHeader v-if="showHeader" />

  <main>
    <router-view />
<!--    <Neon/  вот же странное название для стартовой страницы :/ >-->
  </main>

  <AppFooter />
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed, ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import AppHeader from './pages/AppHeader.vue'
import AppFooter from './pages/AppFooter.vue'


import Neon from "@/pages/Neon.vue";

const showHeader = computed(() => {
  return !route.meta?.hideHeader
})


const route = useRoute()

const isAuthenticated = ref(false)

const checkAuth = () => {
  isAuthenticated.value = !!localStorage.getItem('token')
}

onMounted(checkAuth)
watch(() => route.path, checkAuth)
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');

body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: rgb(34, 34, 38);
  color: white;
  font-family: "Audiowide", sans-serif;
}

a{
  text-decoration: none;
}

main {
  min-height: calc(100vh - 211px);
}
</style>