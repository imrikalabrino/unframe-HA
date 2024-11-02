<template>
  <ul v-if="repositories && repositories.length">
    <RepositoryItem
      v-for="repo in repositories"
      :key="repo.id"
      :repository="repo"
      @select="selectRepository"
    />
  </ul>
</template>

<script>
import { useRepositoryStore } from '../stores/repository-store.js';
import RepositoryItem from './RepositoryItem.vue';

export default {
  components: {
    RepositoryItem,
  },
  setup() {
    const repositoryStore = useRepositoryStore();
    const selectRepository = (repoId) => repositoryStore.selectRepository(repoId);

    return {
      repositories: repositoryStore.filteredRepositories,
      selectRepository,
    };
  }
};
</script>

<style scoped>
ul {
  list-style-type: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
