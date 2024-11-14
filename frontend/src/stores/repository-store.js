import { defineStore } from 'pinia';
import {
  fetchRepositories,
  fetchRepositoryById,
  updateRepository,
  deleteRepository,
  deleteCommit,
  deleteBranch,
} from '../services/repository-service.js';
import { debounce } from '../utils/debounce';

export const useRepositoryStore = defineStore('repository', {
  state: () => ({
    repositories: [],
    selectedRepository: null,
    selectedRepositoryId: null,
    listLoading: false,
    listError: null,
    detailLoading: false,
    detailError: null,
    currentPage: 1,
    pageSize: 10,
    searchQuery: '',
  }),

  getters: {
    /**
     * Filters repositories based on the current search query.
     * @returns {Array} - Filtered array of repositories matching the search query.
     */
    filteredRepositories(state) {
      return state.searchQuery
        ? state.repositories.filter((repo) =>
            repo.name.toLowerCase().includes(state.searchQuery.toLowerCase())
          )
        : state.repositories;
    },
  },

  actions: {
    /**
     * Loads a paginated list of repositories from the API.
     * Updates list loading/error state based on response.
     */
    async loadRepositories() {
      this.listLoading = true;
      this.listError = null;
      try {
        const data = await fetchRepositories(this.currentPage, this.pageSize, this.searchQuery);
        this.repositories = data;
      } catch (err) {
        this.listError = 'Failed to load repositories';
        console.error(err);
      } finally {
        this.listLoading = false;
      }
    },

    /**
     * Selects and fetches details of a single repository by ID.
     * Caches repository ID to avoid redundant fetches.
     * @param {number} id - The repository ID.
     */
    async selectRepository(id) {
      if (this.selectedRepositoryId === id) return;
      this.detailLoading = true;
      this.detailError = null;
      this.selectedRepositoryId = id;

      const repository = this.repositories.find((repo) => repo.id === id);
      const lastActivityAt = repository ? repository.last_activity_at : null;

      try {
        this.selectedRepository = await fetchRepositoryById(id, lastActivityAt);
      } catch (err) {
        this.detailError = 'Failed to load repository details';
        console.error(err);
      } finally {
        this.detailLoading = false;
      }
    },

    /**
     * Updates repository details (e.g., name, description, visibility).
     * @param {Object} updatedFields - Fields to update.
     */
    async updateRepositoryDetails(updatedFields) {
      this.detailLoading = true;
      this.detailError = null;
      try {
        const updatedRepo = await updateRepository(this.selectedRepositoryId, updatedFields);
        this.selectedRepository = { ...this.selectedRepository, ...updatedRepo };

        const repoIndex = this.repositories.findIndex(
          (repo) => repo.id === this.selectedRepositoryId
        );
        if (repoIndex !== -1) {
          this.repositories[repoIndex] = { ...this.repositories[repoIndex], ...updatedFields };
        }
      } catch (err) {
        this.detailError = 'Failed to update repository';
        console.error(err);
      } finally {
        this.detailLoading = false;
      }
    },

    /**
     * Deletes a repository by ID and removes it from the state.
     */
    async deleteRepository() {
      this.listLoading = true;
      this.listError = null;
      try {
        await deleteRepository(this.selectedRepositoryId);
        this.repositories = this.repositories.filter(
          (repo) => repo.id !== this.selectedRepositoryId
        );
        this.selectedRepositoryId = null;
        this.selectedRepository = null;
      } catch (err) {
        this.listError = 'Failed to delete repository';
        console.error(err);
      } finally {
        this.listLoading = false;
      }
    },

    /**
     * Deletes a commit within the selected repository.
     * @param {string} commitId - The ID of the commit to delete.
     */
    async deleteCommit(commitId) {
      this.detailLoading = true;
      this.detailError = null;
      try {
        await deleteCommit(this.selectedRepository.id, commitId);
        this.selectedRepository.commits = this.selectedRepository.commits.filter(
          (commit) => commit.id !== commitId
        );
      } catch (err) {
        this.detailError = 'Failed to delete commit';
        console.error(err);
      } finally {
        this.detailLoading = false;
      }
    },

    /**
     * Deletes a branch within the selected repository.
     * @param {string} branchId - The ID of the branch to delete.
     */
    async deleteBranch(branchId) {
      this.detailLoading = true;
      this.detailError = null;
      try {
        await deleteBranch(this.selectedRepository.id, branchId);
        this.selectedRepository.branches = this.selectedRepository.branches.filter(
          (branch) => branch.id !== branchId
        );
      } catch (err) {
        this.detailError = 'Failed to delete branch';
        console.error(err);
      } finally {
        this.detailLoading = false;
      }
    },

    /**
     * Updates the search query and refreshes repository list after debounced delay.
     * @param {string} query - The search query for repositories.
     */
    updateSearchQuery: debounce(function (query) {
      this.searchQuery = query;
      this.currentPage = 1;
      this.loadRepositories();
    }, 300),

    /**
     * Navigates to the previous page and reloads repositories.
     */
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadRepositories();
      }
    },

    /**
     * Navigates to the next page and reloads repositories.
     */
    nextPage() {
      this.currentPage++;
      this.loadRepositories();
    },
  },
});
