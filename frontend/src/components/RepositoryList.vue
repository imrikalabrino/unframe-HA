<template>
  <ul v-if="repositories && repositories.length">
    <RepositoryItem v-for="repo in repositories" :key="repo.id" :repository="repo" />
  </ul>
</template>

<script>
import RepositoryItem from './RepositoryItem.vue';

export default {
  components: {
    RepositoryItem,
  },
  props: {
    repositories: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
</style>
