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

<style scoped lang="scss">
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    background-color: #007acc;
    color: #fff;
    cursor: pointer;
    transition: background 0.3s ease;

    &:disabled {
      background-color: #ddd;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background-color: #005fa3;
    }
  }
}
</style>
