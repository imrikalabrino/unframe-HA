<template>
  <div class="w-64 h-full text-gray-800 dark:text-white flex flex-col border-r border-gray-900 dark:border-gray-500">
    <!-- Logo -->
    <div class="p-6 flex items-center">
      <i class="fas fa-cube text-3xl"></i>
      <span class="ml-2 text-xl font-bold">unframe</span>
    </div>

    <!-- Menu Items -->
    <div class="flex-grow p-4">
      <ul class="gap-3 flex flex-col">
        <li @click="$router.push('/repositories')" :class="['flex items-center p-2 cursor-pointer transition-transform transform hover:scale-105 rounded-lg', isActive('repositories') ? 'bg-gray-300 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700']">
          <i class="fas fa-list mr-3 ml-1"></i>
          <span class="font-semibold">Repositories</span>
        </li>

        <li @click="$router.push('/database')" :class="['flex items-center p-2 cursor-pointer transition-transform transform hover:scale-105 rounded-lg', isActive('database') ? 'bg-gray-300 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700']">
          <i class="fas fa-database mr-3 ml-1"></i>
          <span class="font-semibold">Database</span>
        </li>

        <li @click="$router.push('/settings')" :class="['flex items-center p-2 cursor-pointer transition-transform transform hover:scale-105 rounded-lg', isActive('settings') ? 'bg-gray-300 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700']">
          <i class="fas fa-cog mr-3 ml-1"></i>
          <span class="font-semibold">Settings</span>
        </li>
      </ul>
    </div>

    <!-- Dark/Light Theme Toggle Button -->
    <div class="p-6 flex justify-between mx-10">
      <span class="text-2xl">🌞</span>
      <Toggle :value="isDark" @toggled="toggleTheme"/>
      <span class="text-2xl">🌜</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Toggle from "./Toggle.vue";

const router = useRouter();
const route = useRoute();

const activeMenu = ref('repositories');
const isDark = ref(localStorage.getItem('theme') === 'dark');

const isActive = (menu) => activeMenu.value === menu;

const setActiveMenu = (menu) => {
  activeMenu.value = menu;
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

onMounted(() => {
  setActiveMenu(route.name || 'repositories');
});

watch(route, (newRoute) => {
  setActiveMenu(newRoute.name);
});
</script>

<style scoped>
</style>
