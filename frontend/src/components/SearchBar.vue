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

<style scoped>
.search-bar {
  margin-bottom: 1rem;
}
</style>
