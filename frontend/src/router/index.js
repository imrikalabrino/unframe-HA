import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layout/MainLayout.vue';
import LoginView from '../views/LoginView.vue';
import RepositoryDetailsView from "../views/RepositoryDetailsView.vue";
import RepositoriesView from "../views/RepositoriesView.vue";
import SettingsView from "../views/SettingsView.vue";
import DatabaseView from "../views/DatabaseView.vue";

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/repositories',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'repositories',
        component: RepositoriesView,
      },
      {
        path: ':id',
        name: 'RepositoryDetails',
        component: RepositoryDetailsView,
      },
    ],
  },
  {
    path: '/settings',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'settings',
        component: SettingsView,
      },
    ],
  },
  {
    path: '/database',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'database',
        component: DatabaseView, // Placeholder for database page
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
