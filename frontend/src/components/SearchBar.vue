<template>
  <div class="search-bar">
    <input
      type="text"
      v-model="repositoryStore.searchQuery"
      placeholder="Search by repository name"
    />
  </div>
</template>

<script>
import { useRepositoryStore } from '../stores/repository-store.js';
import { watch } from 'vue';

export default {
  setup() {
    const repositoryStore = useRepositoryStore();

    watch(
      () => repositoryStore.searchQuery,
      (newQuery) => {
        repositoryStore.updateSearchQuery(newQuery);
      }
    );

    return {
      repositoryStore,
    };
  },
};
</script>

<style scoped>
.search-bar {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;

  input[type="text"] {
    padding: 0.5rem;
    font-size: 1rem;
    width: 100%;
    max-width: 300px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
}
</style>
