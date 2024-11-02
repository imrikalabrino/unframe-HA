<template>
  <div class="repositories-view">
    <!-- Repository List (Left Sidebar) -->
    <div class="repository-list-section">
      <h1>Repositories</h1>
      <SearchBar v-model="searchQuery" />
      <div v-if="loading">Loading...</div>
      <div v-if="error">{{ error }}</div>
      <RepositoryList
          v-if="!loading && repositories.length"
          :repositories="repositories"
          @selectRepository="openRepository"
      />
      <Pagination v-if="!loading" :currentPage="currentPage" @prevPage="prevPage" @nextPage="nextPage" />
    </div>

    <!-- Repository Details (Right Section) -->
    <div class="repository-details-section">
      <RepositoryDetails
          v-if="selectedRepositoryId"
          :repositoryId="selectedRepositoryId"
          @repositoryDeleted="onRepositoryDeleted"
          @close="closeRepository"
      />
      <div v-else class="placeholder-message">
        <p>Select a repository to view its details.</p>
      </div>
    </div>
  </div>
</template>

<script>
import RepositoryList from '../components/RepositoryList.vue';
import Pagination from '../components/Pagination.vue';
import SearchBar from '../components/SearchBar.vue';
import RepositoryDetails from '../components/RepositoryDetails.vue';
import { fetchRepositories } from '../services/repositoryService.js';
import { debounce } from '../utils/debounce';

export default {
  components: {
    RepositoryList,
    Pagination,
    SearchBar,
    RepositoryDetails
  },
  data() {
    return {
      repositories: [],
      searchQuery: '',
      currentPage: 1,
      loading: false,
      error: null,
      selectedRepositoryId: null
    };
  },
  watch: {
    searchQuery() {
      if (this.searchQuery) {
        this.debouncedSearch();
      } else {
        this.loadRepositories();
      }
    }
  },
  created() {
    this.debouncedSearch = debounce(this.loadRepositories, 300);
  },
  async mounted() {
    await this.loadRepositories();
  },
  methods: {
    async loadRepositories() {
      this.loading = true;
      try {
        this.repositories = await fetchRepositories(this.currentPage, 10, this.searchQuery);
      } catch (err) {
        this.error = 'Failed to load repositories';
      } finally {
        this.loading = false;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadRepositories();
      }
    },
    nextPage() {
      this.currentPage++;
      this.loadRepositories();
    },
    openRepository(id) {
      this.selectedRepositoryId = id;
    },
    closeRepository() {
      this.selectedRepositoryId = null;
    },
    onRepositoryDeleted() {
      this.selectedRepositoryId = null;
      this.loadRepositories();
    }
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
  flex: 1;
  padding: 1rem;
  border-right: 1px solid #ccc;
  overflow-y: auto;
}

.repository-details-section {
  flex: 2;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-message {
  font-size: 1.2rem;
  color: #777;
  text-align: center;
}
</style>
