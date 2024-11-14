<template>
  <div class="flex flex-col h-full relative">
    <div class="mb-4 px-2 pt-4 flex justify-between items-center">
      <input
        v-model="searchQuery"
        @input="onSearch"
        type="text"
        placeholder="Search repositories..."
        class="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
    </div>

    <div v-if="listLoading" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-20 mt-20">
      <i class="fas fa-spinner fa-spin fa-3x text-white"></i>
    </div>

    <div class="flex-1 overflow-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 m-2 relative">

      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
          <tr>
            <th class="px-4 py-3"></th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Name
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Author
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Description
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Last Updated
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <template v-if="repositories && repositories.length">
            <tr
              v-for="repo in repositories"
              :key="repo.id"
              @click="$router.push(`/repositories/${repo.id}`)"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              <td class="px-4 py-4 whitespace-nowrap">
                <img
                  :src="repo.avatar_url || defaultAvatar"
                  alt="Repository Avatar"
                  class="w-10 h-10 rounded-full object-cover"
                />
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                <div
                  class="truncate max-w-xs"
                  :title="repo.name && repo.name.length > maxNameLength ? repo.name : ''"
                >
                  {{ truncateText(repo.name, maxNameLength) }}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {{ repo.author || 'Unknown' }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <div
                  class="truncate max-w-md"
                  :title="repo.description && repo.description.length > maxDescriptionLength ? repo.description : ''"
                >
                  {{ truncateText(repo.description, maxDescriptionLength) }}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                {{ formatDate(repo.last_activity_at) }}
              </td>
            </tr>
          </template>
          <template v-else>
            <tr>
              <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
                No data available
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div class="my-4 flex justify-center items-center space-x-2">
      <button
        @click="prevPage"
        :disabled="currentPage === 1 || listLoading"
        class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
      >
        <i class="fas fa-chevron-left text-gray-700 dark:text-gray-300 mx-2"></i>
      </button>

      <button
        @click="nextPage"
        :disabled="repositories.length < pageSize || listLoading"
        class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
      >
        <i class="fas fa-chevron-right text-gray-700 dark:text-gray-300 mx-2"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRepositoryStore } from '../stores/repository-store';
import defaultAvatar from '../assets/default_repo_icon.png';
import { format } from 'date-fns';

const store = useRepositoryStore();

const searchQuery = ref(store.searchQuery);

const onSearch = () => {
  store.updateSearchQuery(searchQuery.value);
};

const repositories = computed(() => store.repositories);
const currentPage = computed(() => store.currentPage);
const listLoading = computed(() => store.listLoading);
const pageSize = computed(() => store.pageSize);

const prevPage = () => {
  if (!listLoading.value && currentPage.value > 1) {
    store.prevPage();
  }
};

const nextPage = () => {
  if (!listLoading.value && repositories.value.length === pageSize.value) {
    store.nextPage();
  }
};

const maxNameLength = 20;
const maxDescriptionLength = 50;

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return format(new Date(dateString), 'dd/MM/yy, HH:mm');
};

onMounted(() => {
  if (!repositories.value.length) {
    store.loadRepositories();
  }
});
</script>

<style scoped>
</style>
