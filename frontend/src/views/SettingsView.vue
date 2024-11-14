<template>
  <div class="p-6 max-w-lg mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md mt-10">
    <h1 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Settings</h1>
    <label for="apiKey" class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">OpenAI API Key:</label>
    <input
      id="apiKey"
      v-model="apiKey"
      placeholder="Enter your API key"
      type="text"
      class="w-full p-3 border rounded-md text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring focus:border-blue-500 dark:focus:border-blue-400 mb-4"
    />
    <button
      @click="saveKey"
      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-all duration-300 dark:bg-blue-500 dark:hover:bg-blue-600"
    >
      Save
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAiStore } from '../stores/ai-store';
import { triggerToast } from '../App.vue';

export default {
  setup() {
    const aiStore = useAiStore();
    const apiKey = ref(aiStore.apiKey);

    const saveKey = () => {
      aiStore.saveApiKey(apiKey.value);

      triggerToast({
        message: 'API Key saved successfully!',
        type: 'success',
      });
    };

    return {
      apiKey,
      saveKey,
    };
  },
};
</script>
