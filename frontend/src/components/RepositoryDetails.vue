<template>
  <div v-if="repository">
    <h2>{{ repository.name }}</h2>
    <p>{{ repository.description }}</p>
    <p><strong>Author:</strong> {{ repository.author }}</p>
    <p><strong>Last Updated:</strong> {{ repository.last_activity_at }}</p>
    <p><strong>Visibility:</strong> {{ repository.visibility }}</p>

    <h3>Commits</h3>
    <ul>
      <li v-for="commit in repository.commits" :key="commit.id">
        <p>{{ commit.message }}</p>
        <button @click="removeCommit(commit.id)">Delete Commit</button>
      </li>
    </ul>

    <h3>Branches</h3>
    <ul>
      <li v-for="branch in repository.branches" :key="branch.id">
        <p>{{ branch.name }}</p>
        <button @click="removeBranch(branch.id)">Delete Branch</button>
      </li>
    </ul>

    <h3>Edit Repository</h3>
    <input v-model="updatedFields.name" placeholder="Name" />
    <input v-model="updatedFields.description" placeholder="Description" />
    <input v-model="updatedFields.visibility" placeholder="Visibility" />
    <button @click="editRepository">Update Repository</button>

    <button @click="removeRepository">Delete Repository</button>

    <AskAI :repoId="repositoryId" />
  </div>
  <div v-else>
    <p>Select a repository to view its details.</p>
  </div>
</template>

<script>
import { useRepositoryStore } from '../stores/repositoryStore';
import { computed, ref, watch } from 'vue';
import AskAI from '../components/AskAI.vue';

export default {
  components: {
    AskAI,
  },
  props: {
    repositoryId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const repositoryStore = useRepositoryStore();

    watch(() => props.repositoryId, () => {
      repositoryStore.selectRepository(props.repositoryId);
    }, { immediate: true });

    const repository = computed(() => repositoryStore.selectedRepository);
    const updatedFields = ref({ name: '', description: '', visibility: '' });

    watch(repository, (newRepo) => {
      if (newRepo) {
        updatedFields.value = {
          name: newRepo.name || '',
          description: newRepo.description || '',
          visibility: newRepo.visibility || ''
        };
      }
    }, { immediate: true });

    const editRepository = async () => {
      await repositoryStore.updateRepositoryDetails(props.repositoryId, updatedFields.value);
    };
    const removeRepository = async () => {
      await repositoryStore.deleteRepository(props.repositoryId);
    };
    const removeCommit = async (commitId) => {
      await repositoryStore.deleteCommit(commitId);
    };
    const removeBranch = async (branchId) => {
      await repositoryStore.deleteBranch(branchId);
    };

    return {
      repository,
      updatedFields,
      editRepository,
      removeRepository,
      removeCommit,
      removeBranch,
    };
  },
};
</script>
