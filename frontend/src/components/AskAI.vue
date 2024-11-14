<template>
  <div
    class="flex flex-col h-full w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4"
  >
    <!-- Chat History -->
    <div ref="chatContainer" class="flex-1 overflow-y-auto pb-4">
      <!-- If Conversation History is Empty -->
      <div
        v-if="conversationHistory.length === 0"
        class="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
      >
        <i class="fa-regular fa-comments fa-5x mb-4"></i>
        <p class="text-lg">Start conversing with an AI model</p>
      </div>

      <div v-else class="flex flex-col space-y-4">
        <template v-for="(msg, index) in conversationHistory" :key="index">
          <div :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div
              :class="[
                'px-4 py-2 rounded-lg max-w-md break-words',
                msg.role === 'user'
                  ? 'bg-blue-100 dark:bg-blue-700 text-gray-800 dark:text-gray-100'
                  : msg.role === 'error'
                  ? 'bg-red-100 dark:bg-red-700 text-gray-800 dark:text-gray-100'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100',
              ]"
            >
              {{ msg.message }}
            </div>
          </div>
        </template>

        <div v-if="loading" class="flex justify-start">
          <div class="animate-pulse h-10 w-2/3 rounded-md bg-gray-300 dark:bg-gray-600"></div>
        </div>
      </div>
    </div>

    <!-- Input Box and Send Button -->
    <div v-if="!hasApiKey" class="mt-4">
      <p class="text-red-500">
        No API key found. Please go to
        <router-link to="/settings" class="underline text-blue-600 dark:text-blue-400">Settings</router-link>
        and enter your API key.
      </p>
    </div>

    <div v-else class="flex items-center mt-4 border-t pt-4 border-gray-300 dark:border-gray-600">
      <input
        ref="inputRef"
        v-model="question"
        placeholder="Ask a question about this repository..."
        @keydown.enter="askAI"
        class="flex-1 border rounded-md p-3 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring focus:border-blue-500 dark:focus:border-blue-400"
      />
      <button
        class="ml-2 p-3 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-all duration-300"
        @click="askAI"
        :disabled="loading"
      >
        <i class="fas fa-paper-plane h-5 w-5"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, nextTick, computed } from 'vue';
import { useRepositoryStore } from '../stores/repository-store.js';
import { useAiStore } from '../stores/ai-store.js';
import axios from 'axios';

export default {
  setup() {
    const repositoryStore = useRepositoryStore();
    const aiStore = useAiStore();

    const question = ref('');
    const conversationHistory = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const inputRef = ref(null);
    const chatContainer = ref(null);

    const hasApiKey = computed(() => !!aiStore.apiKey);

    const scrollToBottom = () => {
      const container = chatContainer.value;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    };

    const askAI = async () => {
      if (!hasApiKey.value) {
        conversationHistory.value.push({
          role: 'error',
          message: 'API key is missing. Please set it in Settings.',
        });
        return;
      }

      if (!question.value || !repositoryStore.selectedRepositoryId) {
        conversationHistory.value.push({
          role: 'error',
          message: 'Missing required information to send the request.',
        });
        return;
      }

      loading.value = true;

      try {
        conversationHistory.value.push({ role: 'user', message: question.value });

        question.value = '';

        inputRef.value?.focus();

        await nextTick();
        scrollToBottom();

        const response = await axios.post(
          'http://localhost:3000/ask-ai',
          {
            question: conversationHistory.value[conversationHistory.value.length - 1].message,
            repoId: repositoryStore.selectedRepositoryId,
          },
          {
            headers: {
              apiKey: aiStore.apiKey,
            },
          }
        );

        conversationHistory.value.push({
          role: 'assistant',
          message: response.data.response,
        });

    await nextTick();
    scrollToBottom();
  } catch (err) {
    console.error(err);

    // Extract the error message
    const errorMessage = err.response?.data?.error || err.message || 'An unknown error occurred.';

    // Push the error message to the conversation history
    conversationHistory.value.push({
      role: 'error',
      message: `Error: ${errorMessage.message}`,
    });

    await nextTick();
    scrollToBottom();
  } finally {
    loading.value = false;
  }
};


    const fetchConversationHistory = async () => {
      if (!repositoryStore.selectedRepositoryId) return;

      loading.value = true;

      try {
        const response = await axios.get(
          `http://localhost:3000/ask-ai/history/${repositoryStore.selectedRepositoryId}`
        );
        conversationHistory.value = Array.isArray(response.data.history)
          ? response.data.history
          : [];

        await nextTick();

        scrollToBottom();
      } catch (err) {
        console.error('Failed to fetch conversation history:', err);
      } finally {
        loading.value = false;
      }
    };

    watch(
      () => conversationHistory.value.length,
      async () => {
        await nextTick();
        scrollToBottom();
      }
    );

    watch(
      () => repositoryStore.selectedRepositoryId,
      (newRepoId) => {
        if (newRepoId) {
          fetchConversationHistory();
        }
      },
      { immediate: true }
    );

    onMounted(() => {
      if (repositoryStore.selectedRepositoryId) {
        fetchConversationHistory();
      }
    });

    return {
      question,
      conversationHistory,
      loading,
      error,
      askAI,
      inputRef,
      chatContainer,
      hasApiKey,
    };
  },
};
</script>

<style scoped>
</style>
