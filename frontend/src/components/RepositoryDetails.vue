<template>
  <div v-if="repositoryStore.detailLoading" class="p-4">
    <p class="text-gray-700 dark:text-gray-200">Loading repository details...</p>
  </div>
  <div v-else-if="repository">
    <div class="h-full flex flex-col overflow-hidden">
      <div class="flex items-center justify-between flex-none p-4">
        <div>
          <img
            :src="repository.avatar_url || defaultAvatar"
            alt="Repository Image"
            class="w-20 h-20 rounded-full object-cover"
          />
        </div>
        <div class="relative">
          <button @click="toggleMenu" class="text-gray-600 dark:text-gray-300 focus:outline-none">
            <i class="fas fa-ellipsis-vertical h-6 w-6 text-xl"></i>
          </button>

          <div
            v-if="showMenu"
            class="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10"
          >
            <ul>
              <li>
                <button
                  @click="enterEditMode"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
                >
                  Edit
                </button>
              </li>
              <li>
                <button
                  @click="confirmDelete"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Delete
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="isEditing" class="mb-4">
          <input
            v-model="editableName"
            placeholder="Repository name"
            class="text-2xl font-bold mb-2 w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          />
          <p class="text-lg mb-1 text-gray-700 dark:text-gray-200">
            Author: {{ repository.author }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Last updated: {{ repository.last_activity_at }}
          </p>
          <select
            v-model="editableVisibility"
            class="text-md mb-4 w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <textarea
            v-model="editableDescription"
            placeholder="Description"
            class="text-md mb-6 w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          ></textarea>
          <button
            @click="saveChanges"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
          >
            Save
          </button>
          <button
            @click="cancelEdit"
            class="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-black dark:text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
        <div v-else>
          <h2 class="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">{{ repository.name }}</h2>
          <p class="text-lg mb-1 text-gray-700 dark:text-gray-200">
            Author: {{ repository.author }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Last updated: {{ repository.last_activity_at }}
          </p>
          <p class="text-md mb-4 text-gray-700 dark:text-gray-200">
            Visibility: {{ repository.visibility }}
          </p>
          <p class="text-md mb-6 text-gray-700 dark:text-gray-200">{{ repository.description }}</p>
        </div>

        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Commits</h3>
            <button
              @click="toggleDeleteModeCommits"
              class="text-sm text-blue-500 dark:text-blue-400 focus:outline-none"
            >
              {{ isDeleteModeCommits ? 'Exit Delete Mode' : 'Delete Mode' }}
            </button>
          </div>
          <div
            class="border rounded-md p-2 max-h-60 overflow-y-auto bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          >
            <div
              v-for="(commit, index) in repository.commits"
              :key="commit.id"
              class="flex justify-between items-center border-b pb-2 mb-2 last:border-none last:pb-0 last:mb-0 border-gray-300 dark:border-gray-600"
            >
              <p class="text-gray-800 dark:text-gray-200">{{ commit.message }}</p>
              <button
                v-if="isDeleteModeCommits"
                @click="deleteCommit(commit.id)"
                class="text-red-600 dark:text-red-400 hover:underline focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Branches</h3>
            <button
              @click="toggleDeleteModeBranches"
              class="text-sm text-blue-500 dark:text-blue-400 focus:outline-none"
            >
              {{ isDeleteModeBranches ? 'Exit Delete Mode' : 'Delete Mode' }}
            </button>
          </div>
          <div
            class="border rounded-md p-2 max-h-60 overflow-y-auto bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          >
            <div
              v-for="(branch, index) in repository.branches"
              :key="branch.id"
              class="flex justify-between items-center border-b pb-2 mb-2 last:border-none last:pb-0 last:mb-0 border-gray-200 dark:border-gray-600"
            >
              <p class="text-gray-800 dark:text-gray-200">{{ branch.name }}</p>
              <button
                v-if="isDeleteModeBranches"
                @click="deleteBranch(branch.id)"
                class="text-red-600 dark:text-red-400 hover:underline focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="p-4">
    <p class="text-gray-700 dark:text-gray-200">Select a repository to view its details.</p>
  </div>
</template>

<script>
import { useRepositoryStore } from '../stores/repository-store.js';
import { computed, onMounted, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import defaultAvatar from '../assets/default_repo_icon.png';

export default {
  computed: {
    defaultAvatar() {
      return defaultAvatar;
    },
  },
  setup() {
    const repositoryStore = useRepositoryStore();
    const route = useRoute();
    const router = useRouter();
    const repository = computed(() => repositoryStore.selectedRepository);

    const showMenu = ref(false);
    const isEditing = ref(false);
    const editableName = ref('');
    const editableDescription = ref('');
    const editableVisibility = ref('');

    // Delete modes for commits and branches
    const isDeleteModeCommits = ref(false);
    const isDeleteModeBranches = ref(false);

    // Fetch repository details when component mounts or when route changes
    const fetchRepositoryDetails = async () => {
      const repositoryId = route.params.id;
      if (repositoryId) {
        await repositoryStore.selectRepository(repositoryId);
      }
    };

    const toggleMenu = () => {
      showMenu.value = !showMenu.value;
    };

    const enterEditMode = () => {
      isEditing.value = true;
      showMenu.value = false;
      editableName.value = repository.value.name;
      editableDescription.value = repository.value.description;
      editableVisibility.value = repository.value.visibility;
    };

    const saveChanges = async () => {
      const updatedFields = {
        name: editableName.value,
        description: editableDescription.value,
        visibility: editableVisibility.value,
      };
      await repositoryStore.updateRepositoryDetails(updatedFields);
      isEditing.value = false;
    };

    const cancelEdit = () => {
      isEditing.value = false;
    };

    const confirmDelete = async () => {
      showMenu.value = false;
      if (confirm('Are you sure you want to delete this repository?')) {
        await repositoryStore.deleteRepository();
        router.push('/repositories');
      }
    };

    const toggleDeleteModeCommits = () => {
      isDeleteModeCommits.value = !isDeleteModeCommits.value;
    };

    const toggleDeleteModeBranches = () => {
      isDeleteModeBranches.value = !isDeleteModeBranches.value;
    };

    const deleteCommit = async (commitId) => {
      await repositoryStore.deleteCommit(commitId);
    };

    const deleteBranch = async (branchId) => {
      await repositoryStore.deleteBranch(branchId);
    };

    watch(route, fetchRepositoryDetails, { immediate: true });
    onMounted(fetchRepositoryDetails);

    return {
      repository,
      repositoryStore,
      showMenu,
      toggleMenu,
      isEditing,
      editableName,
      editableDescription,
      editableVisibility,
      enterEditMode,
      saveChanges,
      cancelEdit,
      confirmDelete,
      isDeleteModeCommits,
      isDeleteModeBranches,
      toggleDeleteModeCommits,
      toggleDeleteModeBranches,
      deleteCommit,
      deleteBranch,
    };
  },
};
</script>

<style scoped>
</style>
