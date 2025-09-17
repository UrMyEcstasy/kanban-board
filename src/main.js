import {createApp} from 'vue'
import App from './App.vue'
import {createPinia} from 'pinia'
import router from "./router/index.js"
import './assets/style.css';

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
