<template>
  <nav class="h-16 dark:bg-gray-800 text-gray-800 dark:text-white flex items-center justify-between px-6 border-b border-gray-900 dark:border-gray-300">
    <div></div>
    <button @click="logout" class="bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md transition-transform transform hover:scale-105">
      Logout
    </button>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
  router.push('/');
};
</script>

<style scoped>
</style>
