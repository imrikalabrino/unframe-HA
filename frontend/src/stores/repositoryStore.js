import { defineStore } from 'pinia';
import {
    fetchRepositories,
    fetchRepositoryById,
    updateRepository,
    deleteRepository,
    deleteCommit,
    deleteBranch
} from '../services/repositoryService';

export const useRepositoryStore = defineStore('repository', {
    state: () => ({
        repositories: [],
        selectedRepository: null,
        loading: false,
        error: null,
        currentPage: 1,
        searchQuery: '',
    }),

    getters: {
        filteredRepositories(state) {
            return state.searchQuery
                ? state.repositories.filter(repo => repo.name.toLowerCase().includes(state.searchQuery.toLowerCase()))
                : state.repositories;
        },
    },

    actions: {
        async loadRepositories() {
            this.loading = true;
            this.error = null;
            try {
                this.repositories = await fetchRepositories(this.currentPage, 10, this.searchQuery);
            } catch (err) {
                this.error = 'Failed to load repositories';
            } finally {
                this.loading = false;
            }
        },

        async selectRepository(id) {
            this.loading = true;
            this.error = null;
            try {
                this.selectedRepository = await fetchRepositoryById(id);
            } catch (err) {
                this.error = 'Failed to load repository details';
            } finally {
                this.loading = false;
            }
        },

        async updateRepositoryDetails(id, updatedFields) {
            this.loading = true;
            this.error = null;
            try {
                const updatedRepo = await updateRepository(id, updatedFields);
                // Update the local store's selected repository with the updated data
                this.selectedRepository = { ...this.selectedRepository, ...updatedRepo };
            } catch (err) {
                this.error = 'Failed to update repository';
            } finally {
                this.loading = false;
            }
        },

        async deleteRepository(id) {
            this.loading = true;
            this.error = null;
            try {
                await deleteRepository(id);
                // Remove the deleted repository from the list in the local store
                this.repositories = this.repositories.filter(repo => repo.id !== id);
                this.selectedRepository = null;
            } catch (err) {
                this.error = 'Failed to delete repository';
            } finally {
                this.loading = false;
            }
        },

        async deleteCommit(commitId) {
            this.loading = true;
            this.error = null;
            try {
                await deleteCommit(this.selectedRepository.id, commitId);
                // Remove the deleted commit from the selected repository's commits in the store
                this.selectedRepository.commits = this.selectedRepository.commits.filter(commit => commit.id !== commitId);
            } catch (err) {
                this.error = 'Failed to delete commit';
            } finally {
                this.loading = false;
            }
        },

        async deleteBranch(branchId) {
            this.loading = true;
            this.error = null;
            try {
                await deleteBranch(this.selectedRepository.id, branchId);
                // Remove the deleted branch from the selected repository's branches in the store
                this.selectedRepository.branches = this.selectedRepository.branches.filter(branch => branch.id !== branchId);
            } catch (err) {
                this.error = 'Failed to delete branch';
            } finally {
                this.loading = false;
            }
        },

        updateSearchQuery(query) {
            this.searchQuery = query;
            this.currentPage = 1;
            this.loadRepositories();
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
});
