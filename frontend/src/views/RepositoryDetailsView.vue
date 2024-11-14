<template>
  <div
    class="repository-details-view flex flex-wrap h-full overflow-hidden bg-gray-100 dark:bg-gray-900"
  >
    <!-- Left Side: Repository Details -->
    <div
      class="left-details w-full lg:w-1/2 h-full p-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700"
    >
      <button
        @click="$router.push('/repositories')"
        class="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200"
      >
        ← Back to Repositories
      </button>
      <RepositoryDetails />
    </div>

    <!-- Right Side: Ask AI Component -->
    <div class="right-ai w-full lg:w-1/2 h-full p-4 overflow-hidden">
      <AskAI />
    </div>
  </div>
</template>

<script>
import AskAI from '../components/AskAI.vue';
import RepositoryDetails from '../components/RepositoryDetails.vue';

export default {
  components: {
    RepositoryDetails,
    AskAI,
  },
};
</script>

<style scoped>
</style>
