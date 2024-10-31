<template>
  <div id="app">
    <RepositoriesView />
  </div>
</template>

<script>
import RepositoriesView from './views/RepositoriesView.vue';

export default {
  components: {
    RepositoriesView,
  },
};
</script>

<style scoped lang="scss">
#app {
  padding: 2rem;
  font-family: Arial, sans-serif;
  color: #333;
  background-color: #f9f9f9;
}
</style>
