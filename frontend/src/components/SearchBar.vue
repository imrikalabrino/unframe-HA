<template>
  <div class="search-bar">
    <input type="text" :value="modelValue" placeholder="Search by repository name" @input="$emit('update:modelValue', $event.target.value)" />
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  }
};
</script>

<style scoped lang="scss">
.search-bar {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;

  input[type="text"] {
    padding: 0.5rem;
    font-size: 1rem;
    width: 100%;
    max-width: 300px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
}

</style>
