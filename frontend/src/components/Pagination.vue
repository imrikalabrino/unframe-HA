<template>
  <div class="pagination">
    <button @click="$emit('prevPage')" :disabled="currentPage === 1">Previous</button>
    <button @click="$emit('nextPage')">Next</button>
  </div>
</template>

<script>
export default {
  props: {
    currentPage: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style scoped>
</style>
