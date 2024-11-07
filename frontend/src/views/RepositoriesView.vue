<template>
  <div class="repositories-view">
    <div class="repository-list-section">
      <h1>Repositories</h1>
      <SearchBar/>
      <div v-if="repositoryStore.listLoading">Loading...</div>
      <div v-if="repositoryStore.listError">{{ repositoryStore.listError }}</div>

      <!-- Wrapper for scrollable RepositoryList -->
      <div class="repository-list-wrapper">
        <RepositoryList
            v-if="!repositoryStore.listLoading && repositoryStore.filteredRepositories.length"
            :repositories="repositoryStore.filteredRepositories"
            @selectRepository="repositoryStore.selectRepository"
        />
      </div>

      <Pagination
          v-if="!repositoryStore.listLoading"
          :currentPage="repositoryStore.currentPage"
          @prevPage="repositoryStore.prevPage"
          @nextPage="repositoryStore.nextPage"
      />
    </div>

    <div class="repository-details-section">
      <RepositoryDetails
          v-if="repositoryStore.selectedRepository"
          :repositoryId="repositoryStore.selectedRepository.id"
          @repositoryDeleted="repositoryStore.loadRepositories"
      />
      <div v-else class="placeholder-message">
        <p>Select a repository to view its details.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useRepositoryStore } from '../stores/repository-store.js';
import RepositoryList from '../components/RepositoryList.vue';
import Pagination from '../components/Pagination.vue';
import SearchBar from '../components/SearchBar.vue';
import RepositoryDetails from '../components/RepositoryDetails.vue';

export default {
  components: {
    RepositoryList,
    Pagination,
    SearchBar,
    RepositoryDetails
  },
  setup() {
    const repositoryStore = useRepositoryStore();
    repositoryStore.loadRepositories();

    return { repositoryStore };
  }
};
</script>

<style scoped>
.repositories-view {
  display: flex;
  height: 100%;
  width: 80vw;
}

.repository-list-section {
  flex: 1 1 30%;
  max-width: 30%;
  min-width: 0;
  padding: 0 1rem;
  border-right: 1px solid #ccc;
  display: flex;
  flex-direction: column;
}

.repository-list-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: 1rem;
  padding-right: 0.5rem;
}

.repository-details-section {
  flex: 2;
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.placeholder-message {
  font-size: 1.2rem;
  color: #777;
  text-align: center;
  margin-top: auto;
}
</style>
