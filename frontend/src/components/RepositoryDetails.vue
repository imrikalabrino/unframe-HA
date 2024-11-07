<template>
  <div v-if="repositoryStore.detailLoading">
    <p>Loading repository details...</p>
  </div>
  <div v-else-if="repositoryStore.detailError">
    <p>{{ repositoryStore.detailError }}</p>
  </div>
  <div v-else-if="repository">
    <div class="ai-container">
      <AskAI :repoId="repositoryStore.selectedRepositoryId" />
    </div>

    <div class="repository-details">
      <div class="details-row">
        <div class="details-label"><strong>Name:</strong></div>
        <div class="details-value">
          <span v-if="!isEditing">{{ repository.name }}</span>
          <input v-else v-model="updatedFields.name" :class="{ 'input-error': nameError }" />
          <span v-if="nameError" class="error-msg">Name is required.</span>
        </div>
      </div>
      <div class="details-row">
        <div class="details-label"><strong>Description:</strong></div>
        <div class="details-value">
          <span v-if="!isEditing">{{ repository.description || '—' }}</span>
          <textarea v-else v-model="updatedFields.description" />
        </div>
      </div>
      <div class="details-row">
        <div class="details-label"><strong>Author:</strong></div>
        <div class="details-value">{{ repository.author }}</div>
      </div>
      <div class="details-row">
        <div class="details-label"><strong>Last Updated:</strong></div>
        <div class="details-value">{{ repository.last_activity_at }}</div>
      </div>
      <div class="details-row">
        <div class="details-label"><strong>Visibility:</strong></div>
        <div class="details-value">
          <span v-if="!isEditing">{{ repository.visibility }}</span>
          <select v-else v-model="updatedFields.visibility">
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>
    </div>

    <div class="button-group">
      <button class="edit-btn" v-if="!isEditing" @click="startEditing">Edit</button>
      <div v-else>
        <button class="save-btn" @click="saveChanges">Save</button>
        <button class="cancel-btn" @click="cancelEditing">Cancel</button>
      </div>
    </div>

    <div class="lists-container">
      <div class="list-section">
        <h3>Branches</h3>
        <div class="scrollable-container">
          <div
            v-for="(branch, index) in repository.branches"
            :key="branch.id"
            class="list-item"
          >
            <span class="list-text">{{ branch.name }}</span>
            <button @click="repositoryStore.deleteBranch(branch.id)" class="delete-button">Delete</button>
            <div v-if="index < repository.branches.length - 1" class="divider"></div>
          </div>
        </div>
      </div>

      <div class="list-section">
        <h3>Commits</h3>
        <div class="scrollable-container">
          <div
            v-for="(commit, index) in repository.commits"
            :key="commit.id"
            class="list-item"
          >
            <span class="list-text">{{ commit.message }}</span>
            <button @click="repositoryStore.deleteCommit(commit.id)" class="delete-button">Delete</button>
            <div v-if="index < repository.commits.length - 1" class="divider"></div>
          </div>
        </div>
      </div>
    </div>

    <button class="delete-btn" @click="repositoryStore.deleteRepository">Delete Repository</button>
  </div>
  <div v-else>
    <p>Select a repository to view its details.</p>
  </div>
</template>

<script>
import { useRepositoryStore } from '../stores/repository-store.js';
import { computed, ref, watch } from 'vue';
import AskAI from '../components/AskAI.vue';

export default {
  components: {
    AskAI,
  },
  setup() {
    const repositoryStore = useRepositoryStore();
    const isEditing = ref(false);
    const updatedFields = ref({
      name: '',
      description: '',
      visibility: ''
    });
    const nameError = ref(false);

    // Watch the selected repository ID and fetch details if it changes
    watch(
      () => repositoryStore.selectedRepositoryId,
      (newId) => {
        if (newId) {
          repositoryStore.selectRepository(newId);
        }
      },
      { immediate: true }
    );

    const repository = computed(() => repositoryStore.selectedRepository);

    const startEditing = () => {
      isEditing.value = true;
      updatedFields.value = {
        name: repository.value.name,
        description: repository.value.description,
        visibility: repository.value.visibility,
      };
      nameError.value = false;
    };

    const cancelEditing = () => {
      isEditing.value = false;
      nameError.value = false;
    };

    const saveChanges = async () => {
      if (!updatedFields.value.name) {
        nameError.value = true;
        return;
      }

      await repositoryStore.updateRepositoryDetails(updatedFields.value);
      isEditing.value = false;
    };

    return {
      repository,
      repositoryStore,
      isEditing,
      updatedFields,
      nameError,
      startEditing,
      cancelEditing,
      saveChanges,
    };
  },
};
</script>

<style scoped>
.ai-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.repository-details {
  display: table;
  width: 100%;
  margin-bottom: 1rem;
}

.details-row {
  display: table-row;
}

.details-label {
  display: table-cell;
  padding: 0.3rem;
  font-weight: bold;
  vertical-align: top;
  text-align: left;
}

.details-value {
  display: table-cell;
  padding: 0.3rem;
  vertical-align: top;
  text-align: left;
}

.details-value input,
.details-value textarea,
.details-value select {
  width: 100%;
  padding: 0.2rem;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.input-error {
  border: 1px solid red;
}

.error-msg {
  color: red;
  font-size: 0.8rem;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.lists-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.list-section {
  flex: 1;
}

h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  color: #fff;
}

.scrollable-container {
  max-height: 150px;
  overflow-y: auto;
  background-color: #424242;
  padding: 0.5rem;
  border-radius: 4px;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.list-text {
  flex: 1;
  text-align: left;
}

.delete-button {
  padding: 0.3rem 0.5rem;
  background-color: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-button:hover {
  background-color: #c0392b;
}

.divider {
  height: 1px;
  background-color: #ffffff;
  margin: 0.5rem 0;
}

.delete-btn {
  width: 100%;
  margin-top: 0.5rem;
  background-color: #c50000;
}

.button-group button {
  font-weight: bold;
}

.edit-btn {
  background-color: #ffffff;
  color: #1e1e1e;
}

.save-btn {
  color: #ffffff;
  background-color: #11d05d;
}

.cancel-btn {
  color: #ffffff;
  background-color: #c0392b;
  margin-left: 15px;
}
</style>
