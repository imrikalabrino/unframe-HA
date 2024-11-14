<template>
  <div class="flex h-screen dark:bg-gray-900">
    <SideMenu />

    <div class="flex-1 flex flex-col">
      <TopNavbar />

      <!-- Page Content -->
      <main class="flex-1 overflow-hidden">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import SideMenu from '../components/SideMenu.vue';
import TopNavbar from '../components/TopNavbar.vue';
</script>

<style scoped>
</style>
