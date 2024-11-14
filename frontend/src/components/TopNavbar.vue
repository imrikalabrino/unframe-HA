<template>
  <nav class="h-16 dark:bg-gray-800 text-gray-800 dark:text-white flex items-center justify-between px-6 border-b border-gray-900 dark:border-gray-300">
    <div></div>
    <div class="flex gap-2.5 relative">
      <div
        class="flex flex-col justify-center gap-1.5 cursor-pointer relative"
        @click="toggleTooltip"
      >
        <div
          class="p-1.5 rounded-full border border-gray-900 bg-green-300"
        ></div>
        <div
          :class="[
            'p-1.5 rounded-full border border-gray-900',
            hasApiKey ? 'bg-blue-400' : 'bg-orange-400',
          ]"
        ></div>
        <div
          v-if="tooltipVisible"
          class="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm rounded-lg shadow-lg p-3 z-50 w-56"
        >
          <p>Session token status: Active</p>
          <p>OpenAI key status: {{ hasApiKey ? 'Active' : 'Inactive' }}</p>
        </div>
      </div>
      <button
        @click="logout"
        class="border border-black dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-2 rounded-2xl transition-transform transform hover:scale-105"
      >
        Logout
      </button>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAiStore } from '../stores/ai-store';

const router = useRouter();
const aiStore = useAiStore();

const tooltipVisible = ref(false);

const hasApiKey = computed(() => aiStore.apiKey && aiStore.apiKey.trim() !== '');

const logout = () => {
  router.push('/');
};

const toggleTooltip = () => {
  tooltipVisible.value = !tooltipVisible.value;
};

</script>

<style scoped>
</style>
