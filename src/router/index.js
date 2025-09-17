import {createRouter, createWebHistory} from 'vue-router';
import Boards from "../pages/Boards.vue";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import BoardTasks from "../pages/BoardTasks.vue";

const routes = [

    {
        path: '/neon',
        name: 'Neon',
        component: () => import('@/pages/Neon.vue'),
        meta: {
            hideHeader: true
        }
    },


    {
        path: '/register',
        name: 'register',
        component: Register,
        meta: {requiresUnauth: true, hideHeader: true}
    },


    {
        path: '/boards',
        name: 'boards',
        component: Boards,
        meta: {requiresAuth: true},
    },
    {
        path: '/boards/:boardId',
        name: 'boardTasks',
        component: BoardTasks,
        meta: {requiresAuth: true},
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {requiresUnauth: true, hideHeader: true},
    },
    {
        path: '/',
        name: 'startpage',
        component: () => import('@/pages/Neon.vue'),
        meta: {hideHeader: true}
    }
];


const router = createRouter({
    history: createWebHistory(),
    routes: routes,
});

function isAuthenticated() {
    return !!localStorage.getItem('token');
}

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        next({name: 'login'});
    } else if (to.meta.requiresUnauth && isAuthenticated()) {
        next({name: 'boards'});
    } else {
        next();
    }
});

export default router;