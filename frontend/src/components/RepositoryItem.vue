<template>
  <li @click="selectRepository" class="repoItem">
    <img
        :src="repository.avatar_url || defaultIcon"
        :alt="repository.name + ' Avatar'"
        class="repo-avatar"
    />
    <div class="repoItemDetails">
      <h3>{{ repository.name }}</h3>
      <p>Author: {{ repository.author }}</p>
      <p>Last Updated: {{ repository.last_activity_at }}</p>
      <p>{{ repository.description }}</p>
    </div>
  </li>
</template>

<script>
import defaultIcon from '../assets/default_repo_icon.png';

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
  methods: {
    selectRepository() {
      this.$emit('select', this.repository.id);
    },
  },
};
</script>

<style scoped lang="scss">
.repoItem {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 1rem;
  background-color: #ffffff;
  display: flex;
  align-items: start;

  .repo-avatar {
    width: 3rem;
    height: 3rem;
  }

  .repoItemDetails {
    display: flex;
    flex-direction: column;
    align-items: start;

    h3 {
      margin: 0;
      font-size: 1.5rem;
      color: #007acc;
    }

    p {
      margin: 0.5rem 0;
      color: #666;
    }
  }
}
</style>
