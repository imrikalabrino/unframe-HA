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

<style scoped lang="scss">
ul {
  list-style-type: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
