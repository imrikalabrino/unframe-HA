<template>
  <div>
    <h1>Repositories</h1>
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>
    <ul v-if="repositories.length">
      <li v-for="repo in repositories" :key="repo.id">
        <h3>{{ repo.name }}</h3>
        <p>Author: {{ repo.author }}</p>
        <p>Last Updated: {{ repo.last_activity_at }}</p>
        <p>{{ repo.description }}</p>
      </li>
    </ul>

    <div v-if="repositories.length">
      <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
      <button @click="nextPage">Next</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      repositories: [],
      loading: false,
      error: null,
      currentPage: 1,
      limit: 10,
    };
  },
  async mounted() {
    await this.fetchRepositories();
  },
  methods: {
    async fetchRepositories() {
      this.loading = true;
      try {
        const response = await axios.get(`http://localhost:3000/repositories?limit=${this.limit}&page=${this.currentPage}`, {
          withCredentials: true,
        });
        this.repositories = response.data;
      } catch (err) {
        this.error = 'Failed to fetch repositories';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchRepositories();
      }
    },
    nextPage() {
      this.currentPage++;
      this.fetchRepositories();
    }
  },
};
</script>
