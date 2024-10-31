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

<style scoped lang="scss">
li {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fff;

  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #007acc;
  }

  p {
    margin: 0.5rem 0;
    color: #666;
  }
}
</style>
