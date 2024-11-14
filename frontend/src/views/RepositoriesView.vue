<template>
  <div class="flex flex-col h-full">
    <RepositoriesTable />
  </div>
</template>

<script>
import RepositoriesTable from '../components/RepositoriesTable.vue';

export default {
  components: {
    RepositoriesTable,
  },
};
</script>

<style scoped>
</style>
