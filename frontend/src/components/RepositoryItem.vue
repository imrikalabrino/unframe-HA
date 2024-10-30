<template>
  <li>
    <h3>{{ repository.name }}</h3>
    <p>Author: {{ repository.author }}</p>
    <p>Last Updated: {{ repository.last_activity_at }}</p>
    <p>{{ repository.description }}</p>
  </li>
</template>

<script>
export default {
  props: {
    repository: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
</style>
