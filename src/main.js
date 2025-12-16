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

if (window.location.port === "5173") {
    // создаём функцию ym (то, чего у тебя не хватает)
    (function(m, e, t, r, i, k, a) {
        m[i] = m[i] || function() {
            (m[i].a = m[i].a || []).push(arguments)
        };
        m[i].l = 1 * new Date();
        k = e.createElement(t),
            a = e.getElementsByTagName(t)[0],
            k.async = 1,
            k.src = r,
            a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=105520667", "ym");
    ym(105520667, "init", {
        webvisor: true,
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true
    });

    console.log("Метрика включена только на порту 5173");
}
else {
    console.log("Метрика отключена: порт не 5173");
}


