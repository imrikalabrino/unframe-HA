<template>
  <ul v-if="repositories && repositories.length">
    <RepositoryItem
        v-for="repo in repositories"
        :key="repo.id"
        :repository="repo"
        @select="selectRepository"
    />
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
  methods: {
    selectRepository(repoId) {
      this.$emit('selectRepository', repoId);
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
