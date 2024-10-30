<template>
  <div>
    <h1>Repositories</h1>

    <SearchBar v-model="searchQuery" />

    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>

    <RepositoryList :repositories="repositories" />
    <Pagination :currentPage="currentPage" @prevPage="prevPage" @nextPage="nextPage" />
  </div>
</template>

<script>
import RepositoryList from '../components/RepositoryList.vue';
import Pagination from '../components/Pagination.vue';
import SearchBar from '../components/SearchBar.vue';
import { fetchRepositories } from '../services/repositoryService.js';
import { debounce } from '../utils/debounce';

export default {
  components: {
    RepositoryList,
    Pagination,
    SearchBar,
  },
  data() {
    return {
      repositories: [],
      searchQuery: '',
      currentPage: 1,
      loading: false,
      error: null,
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
  },
};
</script>

<style scoped>
</style>
