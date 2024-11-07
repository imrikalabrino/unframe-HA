<template>
  <li
    @click="selectRepository"
    :class="['repoItem', { 'selected-repo': isSelected }]"
  >
    <img
      :src="repository.avatar_url || defaultIcon"
      :alt="repository.name + ' Avatar'"
      class="repo-avatar"
    />
    <div class="repoItemDetails">
      <h3 class="repo-name" :title="repository.name">{{ repository.name }}</h3>
      <span class="repo-author" :title="repository.author">Author: {{ repository.author }}</span>
      <span class="repo-date">Last Updated: {{ formatDate(repository.last_activity_at) }}</span>
      <span class="repo-description">{{ repository.description }}</span>
    </div>
  </li>
</template>

<script>
import defaultIcon from '../assets/default_repo_icon.png';
import { format } from 'date-fns';
import { useRepositoryStore } from '../stores/repository-store.js';

export default {
  props: {
    repository: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      defaultIcon,
    };
  },
  computed: {
    isSelected() {
      const repositoryStore = useRepositoryStore();
      return this.repository.id === repositoryStore.selectedRepositoryId;
    },
  },
  methods: {
    selectRepository() {
      this.$emit('select', this.repository.id);
    },
    formatDate(dateString) {
      return format(new Date(dateString), 'dd/MM/yy, HH:mm');
    },
  },
};
</script>

<style scoped>
.repoItem {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 1rem;
  background-color: #2d2d2d;
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  transition: border-color 0.3s;

  .repo-avatar {
    width: 3rem;
    height: 3rem;
    margin-right: 1rem;
  }

  .repoItemDetails {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;

    .repo-name {
      margin: 0;
      font-size: 1.5rem;
      color: #0098ff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 80%;
    }

    .repo-author {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 80%;
      font-size: 1rem;
    }

    .repo-date {
      font-size: 0.9rem;
    }

    .repo-description {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      max-height: 3rem;
      white-space: normal;
      max-width: 70%;
    }

    span {
      margin: 0.3rem 0;
      color: #ffffff;
      text-align: left;
    }
  }
}

.selected-repo {
  border: 3px solid #0077ff;
}
</style>
