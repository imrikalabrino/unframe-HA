import { createRouter, createWebHistory } from 'vue-router';
import RepositoriesView from '../views/RepositoriesView.vue';
import LoginView from '../views/LoginView.vue';

const routes = [
    { path: '/', component: LoginView },
    { path: '/repositories', component: RepositoriesView },
    { path: '/login', component: LoginView },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
